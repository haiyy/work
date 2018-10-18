import { Entity } from "draft-js";
import TranslateProxy from "../model/chat/TranslateProxy";

/**
 * 计算中英文长度
 * 英文.length === 1
 * 中文.length === 2
 * */
export function bglen(str)
{
	if(!str)
		return 0;
	
	var len = 0;
	for(var i = 0; i < str.length; i++)
	{
		if(str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94)
		{
			len += 2;
		}
		else
		{
			len++;
		}
	}
	
	return len;
}

/**
 * 计算中英文并返回最终可用长度
 * */
export function stringLen(str)
{
	if(!str)
		return 0;
	
	return Math.round(bglen(str) / 2);
}

export function substr(str, substrLen)
{
	if(!str)
		return str;
	
	substrLen = substrLen * 2;
	
	var len = 0, substring = "";
	for(var i = 0; i < str.length; i++)
	{
		substring += str.charAt(i);
		
		if(str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94)
		{
			len += 2;
		}
		else
		{
			len++;
		}
		
		if(len >= substrLen)
		{
			return substring;
		}
	}
	
	return str;
}

export function replaceLinkForText(text)
{
	if(!text)
		return "";
	
	return text.replace(/((\w+):\/\/)?([\w-]+\.)([\w-]+\.)([a-zA-Z\-_\.]+)([^$\s,\"\u4E00-\u9FA5]*)?/ig, function() {
		if(arguments.length <= 2)
			return arguments[0];
		
		let oldurl = arguments[0],
			index = oldurl.indexOf("http");
		
		if(index <= -1)
		{
			oldurl = "http://" + oldurl;
		}
		else if(index > 0)
		{
			oldurl = oldurl.substring(index);
		}
		
		return "<a href='" + oldurl + "' target='_blank'>" + arguments[0] + "</a>";
	});
}

/**
 * 截短字符串
 * @param {String} str 被截短的字符串
 * @param {int} len 截短长度(不包含[替换值]长度)
 * @param {String} replaceValue 替换值
 * */
export function truncateToFit(str, len, replaceValue = "...")
{
	let strLen = bglen(str);
	
	if(strLen <= len)
		return str;
	
	return str.substr(0, len) + replaceValue;
}

export function replaceLink(block, raw)
{
	let text = block.text;
	
	if(!text)
		return raw;
	
	let entityMap = raw.entityMap,
		entityRanges = block.entityRanges;
	
	text.replace(/((\w+):\/\/)?([\w-]+\.)([\w-]+\.)([a-zA-Z\-_\.]+)([^$\s,\"\u4E00-\u9FA5]*)?/ig, function() {
		if(arguments.length <= 2)
			return arguments[0];
		
		let oldurl = arguments[0];
		
		if(oldurl.indexOf("http") <= -1)
		{
			oldurl = "http://" + oldurl;
		}
		
		let url = oldurl,
			offset = arguments[arguments.length - 2],
			entityKey = Entity.create("LINK", "MUTABLE", {url, target: "_blank"}),
			entityRange = {key: entityKey, length: url.length, offset};
		
		entityMap[entityKey] = Entity.get(entityKey);
		entityRanges.push(entityRange);
		
		return url;
	});
}

export function getQueryString(search)
{
	var url = search; //获取url中"?"符后的字串
	var theRequest = new Object(), strs;
	
	if(url.indexOf("?") != -1)
	{
		var str = url.substr(1);
		strs = str.split("&");
		for(var i = 0; i < strs.length; i++)
		{
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
		}
	}
	
	return theRequest;
}

/**
 * 截短字符串返回pop对象
 * @param String value 字符串
 * @param int width 显示宽度
 * @param int fontsize 字体大小
 * @return Object {popString, show, content}
 * */
export function truncateToPop(value, width, fontsize = 12)
{
	if(!value)
		return value;
	
	let fontNum = Math.floor(width / fontsize),
		len = bglen(value),
		content = value,
		popString = value,
		show = false;
	
	if(fontNum * 2 < len)
	{
		content = substr(value, fontNum - 2) + "...";
		show = true;
	}

	//console.log("truncateToPop = ", value, width, fontsize, {popString, show, content})
	return {popString, show, content};
}

export function parseSearch(str)
{
	if(str == undefined) return
	str = str.substr(1)
	var arr = str.split("&"),
		obj = {},
		newArr = [];
	
	arr.map(function(value, index, arr) {
		newArr = value.split("=")
		if(newArr[0] != undefined)
		{
			obj[newArr[0]] = newArr[1]
		}
	})
	return obj;
}

const delTag = /<\/?.+?>/g;

export function delHTMLTag(value)
{
	if(!value)
		return value;
	
	return value.replace(delTag, "");
}

/**
 * form::validator
 * 根据中英文验证长度
 * @param {int} limit 限制最大长度
 * @param {?} rule 限制最大长度
 * @param {String} value 字符串
 * @param {Function} callback
 * */
export function ruleForLenght(limit, rule, value, callback)
{
	if(bglen(value) <= limit)
	{
		callback();
		return;
	}
	
	callback(" ");
}

export function getHelp(curStr, limit)
{
	if(TranslateProxy.LANGUAGE === "zh-cn")
	{
		return stringLen(curStr) + "/" + parseInt(limit / 2);
	}
	
	return bglen(curStr) + "/" + limit;
}

/**
 * format_int 类型处理.
 * @param length==3 join(".")
 * */
export function formatint(n)
{
	if(isNaN(n))
		return "";
	
	let intval = parseInt(n)
		.toString(),
		intlength = intval.length;
	
	if(intlength <= 3)
		return intval;
	
	let newintval = intlength % 3;
	
	return newintval > 0 ?
		intval.slice(0, newintval) + " " + intval.slice(newintval, intlength)
		.match(/\d{3}/g)
		.join(" ") :
		intval.slice(newintval, intlength)
		.match(/\d{3}/g)
		.join(" ");
}

export function phonetype(val)
{
	if(!val)
		return "未知";
	
	if(typeof val !== String)
	{
		val = val.toString()
	}
	var newval = val.substr(0, 3) + "****" + val.substr(7);
	return newval;
}

export function generateSiteId(siteId)
{
	siteId = siteId.trim();
	
	if(!siteId)
		return "";
	
	let underlineIndex = siteId.indexOf("_");
	if(underlineIndex >= 0)
	{
		return siteId;
	}
	else
	{
		let numberRegexp = /[0-9]{1,20}/i;
		let result = siteId.match(numberRegexp);
		if(result)
		{
			if(result[0] == siteId)
			{
				return "kf_" + siteId;
			}
			else
			{
				let alphabetRegexp = /[a-zA-Z]{0,12}/i;
				result = siteId.match(alphabetRegexp);
				if(result)
				{
					let matchResult = result[0];
					if(matchResult)
					{
						return matchResult + "_" + siteId.substring(matchResult.length);
					}
					return "";
				}
			}
		}
	}
	
	return "";
}

/**
 * phone 电话号码
 * 验证手机号固话400电话正则
 */
export function checkPhone(phone)
{
	let reg = /((\+86)?-?(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])(\d{8})$)|(^(0[1|2]\d{1}|0[3-9]\d{2})?-?([2-9][0-9]{6,7})-?(([0-9]{1,4})$)?)|(((95|96)(\d{3,6})|(400\d{7})|400-\d{4}-\d{3}))/;
	return reg.test(phone);
}

