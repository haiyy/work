import { v4 } from "uuid"

let deviceType = "IM";
export function setDeviceType(value)
{
	if(value && value.length > 0)
	{
		deviceType = value.charAt(0);
	}
}

export function createMessageId(type = "")
{
	let head = type ? type : deviceType;
	return head + new Date().getTime() + v4()
		.replace("-", "")
		.substr(0, 9)
}

/*
 *将obj2合并到obj1，相同属性忽略
 */
export function mergeObject(obj1, obj2)
{
	for(var key in obj2)
	{
		if(obj1.hasOwnProperty(key))
			continue;//有相同的属性则略过
		
		obj1[key] = obj2[key];
	}
	
	return obj1;
}

export function format(error, substitutions)
{
	if(!error)
		return '';
	
	var text = error, field, start;
	
	substitutions = substitutions || [];
	
	for(var i = 0, len = substitutions.length; i < len; i++)
	{
		field = "{" + i + "}";
		start = text.indexOf(field);
		
		if(start >= 0)
		{
			var part1 = text.substring(0, start);
			var part2 = text.substring(start + field.length);
			text = part1 + substitutions[i] + part2;
		}
	}
	
	return text;
}

/**
 * 0补位
 * @param {int} number 需要补位的数字
 * @param {int} number 补位的长度
 * @param {Boolean} forceSign
 * @return
 * @example
 * zeroFill(1, 2, true) //==>+01
 * */
export function zeroFill(number, targetLength, forceSign = false)
{
	var absNumber = '' + Math.abs(number),
		zerosToFill = targetLength - absNumber.length,
		sign = number >= 0;
	return (sign ? (forceSign ? '+' : '') : '-') +
		Math.pow(10, Math.max(0, zerosToFill))
		.toString()
		.substr(1) + absNumber;
};

/*Array 去重*/
export let unique = function()
{
	let res = [], json = {};
	
	for(var i = 0, len = this.length; i < len; i++)
	{
		if(!json[this[i]])
		{
			res.push(this[i]);
			json[this[i]] = 1;
		}
	}
	
	return res;
};

let r = {
	protocol: /([^\/]+:)\/\/(.*)/i,
	host: /(^[^\:\/]+)((?:\/|:|$)?.*)/,
	port: /\:?([^\/]*)(\/?.*)/,
};

/**
 * 解析Url
 * @param {String} url
 * @example
 * parseUrl("tcp://xiaoneng.com:8080")
 * {protocol: "tcp:", host: "xiaoneng.com", port: "8080"}
 * @return {Object}
 * */
export function parseUrl(url)
{
	if(!url)
		return {};
	
	let tmp, res = {};
	
	for(let p in r)
	{
		tmp = r[p].exec(url);
		res[p] = tmp[1];
		url = tmp[2];
	}
	
	return res;
}