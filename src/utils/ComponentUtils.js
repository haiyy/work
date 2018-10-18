import React from 'react';
import Bundle from "../components/Bundle";
import ErrorBoundary from "../components/ErrorBoundary";
import { getLangTxt } from "./MyUtil";
import { truncateToPop } from "./StringUtils";
import { Popover } from 'antd';

export function getNullDataComp(className = "noDataComp")
{
	return <div className={className}
	            style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -15%)"}}>
		<img src={require("../public/images/nullData.png")}/>
		<p>{getLangTxt("noData")}</p>
	</div>;
}

export function getNoDataComp(className = "noDataComp")
{
	return <div className={className}
	            style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -15%)"}}>
		<img src={require("../public/images/dataNo.png")}/>
		<p>{getLangTxt("noData")}</p>
	</div>;
}

export function getComponent(value)
{
	return (props) => (
		<Bundle load={value}>
			{
				(Component) =>
					<ErrorBoundary>
						<Component {...props}/>
					</ErrorBoundary>
			}
		</Bundle>
	)
}

/**
 * ��Ԫ����ʾ����
 * @param content ��ʾ�ַ���
 * @param popString �������ַ���
 * @param show �Ƿ���ʾ����
 * */
export function getCellToPopover(content, popString, show)
{
	let spanContent = <span style={{"white-space": "nowrap"}}>{content}</span>;
	
	return show ?
		(
			<Popover content={
				<div style={{maxWidth: "150px", height: "auto", wordBreak: "break-word"}}>
					{popString}
				</div>
			} placement="top" getPopupContainer={() => document.querySelector(".ant-layout-aside")}>{content}</Popover>
		)
		:
		spanContent;
}

export function getATag(url, title, clsName = "", width)
{
	if(!url && !title)
		return null;
	
	title = title ? title : url;
	
	let {popString, show, content} = truncateToPop(title, width);
	
	if(!url || url.indexOf("http") <= -1)
	{
		return getCellToPopover(content, popString, show);
	}
	
	return <a className={clsName} href={url + ""} target="_blank">{getCellToPopover(content, popString, show)}</a>
}

/**
 *
 * @param {string} content ��ʾ����
 * @param {float} realWidth ��ǰ�е�ʵ�ʿ��
 * @param {float} fontsize �����С
 */
export function getTableTdContent(content, realWidth, fontsize = 12)
{
	if(!content || content == "" || !realWidth)
	{
		return content;
	}
	let json = truncateToPop(content, realWidth, fontsize);
	if(json && json.popString)
	{
		if(!json.show)
		{
			return <p style={{minWidth: realWidth}}>{content}</p>;
		}
		
		return getCellToPopover(json.content, json.popString, json.show);
	}
	else
	{
		return content;
	}
}
