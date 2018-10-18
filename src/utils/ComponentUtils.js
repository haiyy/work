import React from 'react';
import Bundle from "../components/Bundle";
import ErrorBoundary from "../components/ErrorBoundary";
import { getLangTxt } from "./MyUtil";
import { truncateToPop } from "./StringUtils";
import { Popover } from 'antd';
import LoadProgressConst from "../model/vo/LoadProgressConst";
import Loading from "../components/xn/loading/Loading";

//搜索无结果
export function getNullDataComp(className = "noDataComp")
{
	return <div className={className}
	            style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -15%)"}}>
		<img src={require("../public/images/nullData.png")}/>
		<p>{getLangTxt("noData")}</p>
	</div>;
}

//数据为空
export function getNoDataComp(className = "noDataComp")
{
	return <div className={className}
	            style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -15%)"}}>
		<img src={require("../public/images/dataNo.png")}/>
		<p>{getLangTxt("noData")}</p>
	</div>;
}

//系统崩溃
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

//数据提交状态组件
export function _getProgressComp(progress, className = "submitStatus")
{
	console.log("progress: "+progress);
	if(progress === LoadProgressConst.SAVING_FAILED) //保存失败
	{
		return <div className={className} style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -15%)"}}>
			<img src={require("../public/images/saveFailure.png")}/>
			<span>{getLangTxt("save_failed")}</span>
		</div>;
	}
	else if(progress === LoadProgressConst.SAVING_SUCCESS) //保存成功
	{
		return <div className={className} style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -15%)"}}>
			<img src={require("../public/images/saveSuccess.png")}/>
			<span>{getLangTxt("save_success")}</span>
		</div>;
	}
	else if(progress === LoadProgressConst.SAVING || progress === LoadProgressConst.LOADING)//正在保存 || 正在加载
	{
		return (
			<div className="la-square-jelly-background">
				<Loading style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					zIndex:10
				}}/>
			</div>
		);
	}
	
	return null;
}

/**
 * ��Ԫ����ʾ����
 * @param content ��ʾ�ַ���
 * @param popString �������ַ���
 * @param show �Ƿ���ʾ����
 * */

//显示长度
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
