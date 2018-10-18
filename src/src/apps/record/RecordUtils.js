import React from 'react';
import { bglen, substr } from "../../utils/StringUtils";
import { Popover } from 'antd';

export function startPageComp(startpage, startpagetitle)
{
	if(!startpage && !startpagetitle)
		return null;

	if(!startpagetitle)
	{
		startpagetitle = startpage;
	}

	if(!startpage)
		return bglen(startpagetitle || '') > 14 ?
            <Popover content={<div style={{maxWidth: "500px", wordBreak:'break-word'}}>{startpagetitle}</div>} placement="topLeft" trigger="hover">
                <span>{ substr(startpagetitle, 7)+'...' }</span>
            </ Popover>
            :
            <span>{ startpagetitle }</span>;

	return bglen(startpagetitle || '') > 14 ?
        <Popover content={<div style={{maxWidth: "500px", wordBreak:'break-word'}}>{startpagetitle}</div>} placement="topLeft" trigger="hover">
            <a href={startpage} target="_blank" onClick={onAClick.bind(this)}>{substr(startpagetitle, 7)+'...'} </a>
        </ Popover>
        :
		<a href={startpage} target="_blank" onClick={onAClick.bind(this)}>{startpagetitle} </a>;
}

function onAClick(e)
{
	e.stopPropagation();
}


export function removeInvalidData(searchObj)
{
	let keys = Object.keys(searchObj);

	keys.forEach(key =>
	{
		if(searchObj.hasOwnProperty(key))
		{
			let value = searchObj[key];

			if(Array.isArray(value) && value.length > 0)
			{
				searchObj[key] = value.filter(v => v !== null && v !== undefined);

				removeInvalidData(value);
				return;
			}

			if((typeof value === "string" && !value) || (Array.isArray(value) && value.length <= 0))
			{
				delete searchObj[key];
			}
		}
	});
}

/**
 * 空字符串返回默认
 * */
export function noopStrToDefault(value, defaultStr = "")
{
	if(!value || !value.trim())
		return defaultStr;

	return value;
}
