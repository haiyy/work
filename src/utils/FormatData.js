/*表格格式化某一列数据*/

import React, { Component, PropTypes } from 'react';
import { Popover } from 'antd'
import { bglen, substr } from "./StringUtils"
import GlobalEvtEmitter from "../lib/utils/GlobalEvtEmitter";
export function formatData(col)
{
	//百分比
	if(col.dataType === 'Percent')
	{
		col["render"] = percentage;
	}else if(col.hasOwnProperty('format') && col.format === 'thousands')
	{
		//千分位
		col["render"] = toThousands;
	}else if (col.dataType === 'time_client')
    {
        col["render"] = convertInterval;
    }
    else
	{
		//内容过长显示
		col["render"] = text => {
			if(bglen(text) >= 18)
			{
				return(
						<Popover
							content={
								<div style={{width:'150px',height:'auto',wordWrap: 'break-word'}}>
									{text}
								</div>
							}>
							<div className="td_main">{text}</div>
						</Popover>
				)
			}
			return(
				<div className="td_main">{text}</div>
			)

		}

	}
	//链接
	//if(col.hasOwnProperty('linkUrl') && col.linkUrl !== '')
	//{
	//	col["render"] = linkUrl.bind(null, col.dataIndex);
	//	if(col.hasOwnProperty('format') && col.format === 'thousands')
	//	{
	//		col["render"] = toThousandsUrl.bind(null, col.dataIndex);;
	//	}
	//}
	return col;
}

//小数转百分比显示
function percentage(text, record, index)
{
	let ret = pointChange(text, 2);
	ret = ret+"%";
	return (<span name={record.rowKey}>{ret}</span>);
}

function click(key)
{
	GlobalEvtEmitter.emit('ShowDetail', key);
}

//数字转千分位
function toThousands(text, record, index)
{
	let number = (text || 0).toString(), result = '';
	while (number.length > 3)
	{
		result = ',' + number.slice(-3) + result;
		number = number.slice(0, number.length - 3);
	}
	if (number) { result = number + result; }
	return result;
}

//转url链接
function linkUrl(key, text, record, index)
{
	key = `${key}_linkurl`;
	if(record[key] && text != 0)
	{
		return (<span name={key} onClick={click.bind(this, record[key])} style={{color: '#2db7f5', cursor: 'pointer'}}>{text}</span>);
	}
	return (<span>{text}</span>);
}

//千分位数据为链接
function toThousandsUrl(key, text, record, index)
{
	let number = (text || 0).toString(), result = '';
	while (number.length > 3)
	{
		result = ',' + number.slice(-3) + result;
		number = number.slice(0, number.length - 3);
	}
	if (number) { result = number + result; }
	key = `${key}_linkurl`;
	if(record[key] && text != 0)
	{
		return (<span name={key} onClick={click.bind(this, record[key])} style={{color: '#2db7f5', cursor: 'pointer'}}>{result}</span>);
	}
	return (<span>{result}</span>);

}

function pointChange(num, a) {
	if (!num) return "0";

	if (/^-?\d+$/.test(num)) return num * Math.pow(10, a);

	if (a <= 0) return num;

	let str = num + "";

	let arr = str.split(".");

	if (arr.length === 2) {
		let zhengshu = arr[0].replace(/0/g, "").split("");
		let xiaoshu = arr[1].split("");
		if (xiaoshu.length < a) {
			for (let i = 0; i < a - arr[1].length; i++) {
				xiaoshu.push(0);
			}
		}
		let i = 0;
		if(xiaoshu[0] === "0")
		{
			i = 1;
		}
		for (i; i < a; i++) {
			zhengshu.push(xiaoshu[i]);
		}

		xiaoshu = xiaoshu.slice(a);

		xiaoshu = xiaoshu.length > 0 ? ["."].concat(xiaoshu) : xiaoshu;

		return zhengshu.concat(xiaoshu).join("");
	}
}

//timestamp convert into interval
function convertInterval(text, record, index){

    let testSec = parseInt(text/1000),
        res = formatTime(testSec);

    return (res);
}

export function formatTime(interval, sep = false, omit = false)
{
    if(interval <= -1 || typeof interval !== "number")
        return "";

    let days = Math.floor(interval / (3600 * 24)),
        hours = Math.floor((interval - days * 3600 * 24) / 3600),  //取得剩余小时数 60 * 60
        minutes = parseInt(interval / 60) % 60,  //取得剩余分钟数
        seconds = interval % 60,  //取得剩余秒数
        dsep = "d",
        hsep = "h",
        msep = "m",
        ssep = "s";

    if(days > 0)
    {

        return days + dsep + hours + hsep + minutes + msep + seconds + ssep;
    }
    else if(hours > 0)
    {

        return hours + hsep + minutes + msep + seconds + ssep;
    }
    else
    {
        if(minutes <= 0)
        {
            return seconds + ssep;
        }

        return minutes+ msep +seconds + ssep;
    }
}
