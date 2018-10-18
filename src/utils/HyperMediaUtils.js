import { loginUserProxy } from "./MyUtil";
import { version } from '../../package.json';
import HyperMediaProxy from "../model/proxy/HyperMediaProxy";
import Model from "./Model";
import MessageType from "../im/message/MessageType";

//参数
const paramReg = /\[[^\[|^\]]+\]/g;

//超媒体
//const hyperMediaReg = /##[\u4e00-\u9fa5_a-zA-Z0-9]{1,50}(\[[\u4e00-\u9fa5_a-zA-Z0-9]+:[\u4e00-\u9fa5_a-zA-Z0-9]+\])*##/;
const hyperMediaReg = /##[\s\S]{1,50}\s*(\s*\[[\s\S]+\s*:\s*[\s\S]+\]\s*)*##/i;

export function hasHyperMedia(value)
{
	return value && hyperMediaReg.test(value);
}

export function equalHyperMedia(value, name)
{
	var reg = new RegExp("##" + name + "[\\[]*");
	return value && reg.test(value);
}

//获取并拆分复杂超媒体字符串
export function getMessages(value)
{
	if(!hasHyperMedia(value))
		return value;

	let str = value.trim(),
		match = hyperMediaReg.exec(str);

	if(match)
	{
		let message = match[0].replace(/[ ]/g, "")
		.replace(/[\r\n]/g, "");

		return [
			str.substr(match.index + match[0].length),
			message,
			str.substr(0, match.index)
		].filter(item => item);
	}

	return value;
}

//function ()
//{
//
//}

//获取多媒体里的参数
export function getParams(value)
{
	var str = value,
		params = str.match(paramReg) || [],
		paramsObject = {},
		index = -1;

	params.forEach(item => {
		index = item.indexOf(":");

		if(index > 1)
		{
			paramsObject[item.substr(1, index - 1)] = item.substring(index + 1, item.length - 1);
		}
	});

	return paramsObject;
}

const guestParamsMap = {
	xn_devicetype: "tml",
	xn_ntid: "userId",
};

const kfParamsMap = {
	//"token": "ntoken",
	"xn_waiterid": "userId",
	//"userid": "loginid",
	//"username": "username",
};

const otherParamsMap = {
	"xn_version": "version",
	"xn_userrole": "xn_userrole"
};

//固定字段
//"xn_cmtname":"xn_cmtname",
//"xn_msgid":"xn_msgid",
//"xn_cmtid":"xn_cmtid",
/*
* 将参数换为有效值，返回有效参数对象
* */
export function getWorkParamObject(value, userInfo = null, chatData = null)
{
	if(!value)
		return value;

	value = replaceForWorkObject(value, kfParamsMap, loginUserProxy());

	if(userInfo)
	{
		value = replaceForWorkObject(value, guestParamsMap, userInfo);
	}

	if(value.hasOwnProperty("xn_userrole"))
	{
		value["xn_userrole"] = 0;
	}

	if(value.hasOwnProperty("xn_version"))
	{
		value["xn_version"] = version;
	}

	if(value.hasOwnProperty("xn_devicetype"))
	{
		value["xn_devicetype"] = "web";
	}

	return value;
}

function replaceForWorkObject(value, map, data)
{
	for(let key in map)
	{
		let param = map[key];

		if(data[param] && value.hasOwnProperty(key))
		{
			value[key] = data[param];
		}
	}

	return value;
}

export function getQueryStr(value)
{
	if(!value)
		return "";

	let keys = Object.keys(value);

	return keys.reduce((accumulator, currentValue) => {
		let tempStr = currentValue + "=" + value[currentValue];

		if(currentValue === "custome")
			return accumulator + (value[currentValue] || "");

		return accumulator ? (accumulator + "&" + tempStr) : tempStr;
	}, "")
}

export function hashCode(s)
{
	return s.split("")
	.reduce(function(a, b) {
		a = ((a << 5) - a) + b.charCodeAt(0);
		return a & a
	}, 0);
}

/**
 *  根据字符串获取超媒体对象
 *  @param {String} message ##超媒体[p:1]##
 *  @return {JSON}
 *  {
			message: "##消息内容##",
			msgtype: "", //消息类型(int) = 15 or 19
			params: {},
			position: 0 //int
	}
* */
export function getHyperMessageForJSON(message, msgtype = 19)
{
	//初始化超媒体消息
	let hyperMessageJSON = {
		message,
		msgtype
	};

	//是否满足超媒体基本格式
	if(!hasHyperMedia(message) || !message)
		return hyperMessageJSON;

	let _hyperMediaProxy = Model.retrieveProxy(HyperMediaProxy.NAME),
		messages = getMessages(message);

	if(messages.length <= 0)
		return hyperMessageJSON;

	if(messages.length === 3)
		messages.pop();

	let hyperMsg = messages.length && messages.pop();

	//是否有包含在超媒体模版里
	if(!_hyperMediaProxy.hasMedia(hyperMsg))
		return hyperMessageJSON;

	//设置超媒体JSON信息
	let hyperMediaData = _hyperMediaProxy.getParam(message),
		{position, params = {}} = hyperMediaData,
		tempParam = {...params, custome: ""},
		customParam = getParams(hyperMsg);

	for(let key in customParam)
	{
		if(tempParam.hasOwnProperty(key))
		{
			tempParam[key] = customParam[key];
		}
		else
		{
			tempParam["custome"] += "&" + key + "=" + customParam[key];
		}
	}

	hyperMessageJSON.msgtype = 15;
	hyperMessageJSON.params = tempParam;
	hyperMessageJSON.position = position;

	return hyperMessageJSON;
}

/*检查内容是否是json格式*/
export function isJsonString(str)
{
    try
    {
        if(typeof JSON.parse(str) == "object")
        {
            return true;
        }
    }catch(e)
    {
    }
    return false;
}

