import Draft from "draft-js"
import React, { Component } from 'react';
import { stateToHTML } from "draft-js-export-html";
import Model from "./Model";
import NtalkerListRedux from "../model/chat/NtalkerListRedux";
import { createSentence, formatTimestamp, getFileTypeImgSrc, getLangTxt } from "./MyUtil";
import UserInfo from "../model/vo/UserInfo";
import MessageType from "../im/message/MessageType";
import ImageMessage from "../apps/chat/view/message/ImageMessage";
import TextMessage from "../apps/chat/view/message/TextMessage";
import SystemSentence from "../model/vo/sentence/SystemSentence";
import { bglen } from "./StringUtils";
import { createMessageId } from "../lib/utils/Utils";
import ConclusionViewWrapper from "../apps/chat/view/send/toolbar/ConclusionViewWrapper";
import VideoMessage from "../apps/chat/view/message/VideoMessage";
import Portal from "../components/Portal";
import HyperMediaMessage from "../apps/chat/view/message/HyperMediaMessage";
import AudioMessage from "../apps/chat/view/message/AudioMessage";
import LogUtil from "../lib/utils/LogUtil";

export function sendMessageWithChatData(chatData, messageBody, messageType, translate = "")
{
	log(["sendMessageWithChatData messageBody = ", messageBody, ", messageType = " + messageType]);
	
	if(chatData && chatData.isCurrentView)
	{
		if(Array.isArray(messageBody) && messageBody[0] === "inputting")
		{
			chatData.requestUserInputing();
			return;
		}
		
		let sentence = createSentence(messageBody, messageType, null, translate);
		
		if(messageType === MessageType.MESSAGE_DOCUMENT_IMAGE ||
			messageType === MessageType.MESSAGE_DOCUMENT_FILE)
		{
			if(messageBody.error === 20031 || messageBody.error === 20032)
			{
				log("sendMessageWithChatData messageBody.error = " + `上传${messageType === MessageType.MESSAGE_DOCUMENT_IMAGE ? "图片" : "文件"}失败`);
				
				sentence.status = MessageType.STATUS_MESSAGE_SEND_FAILED;
				
				chatData.addSentenceToOutput(sentence, true);
				return;
			}
			
			if(!messageBody.loadData)
			{
				chatData.addSentenceToOutput(sentence, true);
				return;
			}
		}
		
		chatData.sendMessage(sentence);
	}
}

const {convertFromRaw} = Draft;

let closeStatus = [2, 3, 5, -1];  //对方已关闭会话, 对方已经退出会话, 对方已离线
/**
 * 是否是已结束会话
 * */
export function chatIsClose(status)
{
	return closeStatus.includes(status);
}

let onlineStatus = [1, 2, 3, 4];  //对方已经退出会话, 对方已离线
/**
 * 是否是已离开会话
 * */
export function isOnline(status)
{
	return onlineStatus.includes(status);
}

/**
 * 过滤消息
 * @param {String} id 消息ID
 * @param {Immutable.List} list 消息列表
 * @return {Immutable.List}
 * */
export function filterNotMessage(sentenceID, list)
{
	if(!list || list.size <= 0)
		return list;
	
	return list.filterNot(item => {
		return item.sentenceID === sentenceID;
	});
}

let messageTips = {
	12: "这是一条图片消息",
	13: "这是一条语音消息",
	14: "这是一条视频消息",
	15: "这是一条超媒体消息",
}

/**
 * 清除消息Draf格式
 * */
export function clearStyleForMessage(message)
{
	try
	{
		if(!message)
			return "";
		
		if(typeof message === "string")
		{
			return message;
		}
		
		let raw = JSON.parse(message.messageBody);
		
		if(raw && Array.isArray(raw.blocks))
		{
			raw.blocks.forEach(block => {
				block.inlineStyleRanges = [];
				block.type = "unstyle";
			});
		}
		
		return stateToHTML(convertFromRaw(raw));
	}
	catch(e)
	{
		if(message && messageTips[message.messageType])
		{
			return messageTips[message.messageType];
		}
		
		return message.messageBody;
	}
}

let _serverTimeGap = 0;

/**
 * 与服务器时间差值
 * */
export function serverTimeGap()
{
	return _serverTimeGap;
}

export function updateServerTime(value)
{
	_serverTimeGap = new Date().getTime() - value;
	
	_serverTimeGap = isNaN(_serverTimeGap) ? 0 : _serverTimeGap;
}

let _ntalkerListRedux = null;

export function ntalkerListRedux()
{
	if(!_ntalkerListRedux)
	{
		_ntalkerListRedux = Model.retrieveProxy(NtalkerListRedux.NAME)
	}
	
	return _ntalkerListRedux;
};

export function getTabDataByUserId(userId)
{
	if(!_ntalkerListRedux)
	{
		_ntalkerListRedux = Model.retrieveProxy(NtalkerListRedux.NAME)
	}
	
	return _ntalkerListRedux.getTabDataByUserId(userId);
}

export function sendSystemPromptSentence(userId, msg, errorType = 1, msgTime = 0)
{
	let tagData = getTabDataByUserId(userId);
	if(tagData)
	{
		tagData.sendSystemPromptSentence(msg, createMessageId(), errorType, msgTime);
	}
}

export function getUserName(nickname, showname)
{
	if(nickname && showname)
	{
		if(!showname)
		{
			return showname;
		}
		else if(!nickname)
		{
			return nickname;
		}
		
		return nickname + "(" + showname + ")";
	}
	
	return "";
}

/**
 * first to do: import '../public/styles/chatpage/retweet.scss';
 * */
export function getMessageComp(sentence)
{
	if(!sentence)
		return null;
	
	let bodyComp,
		userName = sentence.userName,
		createTime = formatTimestamp(sentence.createTime),
		styleColor = UserInfo.isCustomer(sentence.userInfo.type) ? "#11cd6e" : "#0177d7",
		backgroundStyle = {
			background: 'url(' + require('../public/images/receptionConsultation/blue.png') + ') center no-repeat',
			width: "12px",
			height: "14px"
		},
		sentenceID = sentence.sentenceID;
	
	switch(sentence.messageType)
	{
		case MessageType.MESSAGE_DOCUMENT_TXT:
		case MessageType.MESSAGE_DOCUMENT_RICH_MEDIA:
			bodyComp = <TextMessage sentence={sentence}/>;
			break;
		
		case MessageType.MESSAGE_DOCUMENT_IMAGE:
			bodyComp = <ImageMessage message={sentence}/>;
			break;
		
		case MessageType.MESSAGE_DOCUMENT_FILE:
			let fileName = sentence.fileName,
				name = /\.[^\.]+$/.exec(fileName),
				suffix = (name && name.length > 0) ? name["0"].toUpperCase() : "",
				url = sentence.url,
				imgSrc = getFileTypeImgSrc(suffix);
			
			if(bglen(fileName) > 13 && fileName.length > 10)
			{
				let string1 = fileName.slice(0, 4),
					string2 = fileName.slice(-6);
				
				fileName = string1 + "..." + string2;
			}
			
			bodyComp = (
				<div className='fileMessage'>
					<div className="suffix"
					     style={imgSrc ? {background: "url(" + imgSrc + ") no-repeat center"} : {background: '#999'}}>
						{imgSrc ? null : suffix}
					</div>
					<div className="fileMsgBox">
						<p>{fileName}</p>
						<p className="size">{sentence.size}</p>
					</div>
					<div className="downloadBox">
						<a href={url}>下载</a>
					</div>
				</div>
			);
			
			break;
		
		case MessageType.MESSAGE_DOCUMENT_AUDIO:
			bodyComp = (
				<AudioMessage message={sentence}/>
			);
			break;
		
		case MessageType.MESSAGE_DOCUMENT_VIDEO:
			bodyComp = (
				<VideoMessage message={sentence}/>
			);
			break;
		
		case MessageType.MESSAGE_DOCUMENT_COMMAND:
			userName = getLangTxt("sys_msg");
			styleColor = '#666';
			backgroundStyle = {
				background: 'url(' + require('../public/images/receptionConsultation/red.png') + ') center no-repeat',
				width: "14px",
				height: "14px"
			};
			if(sentence.systemType === SystemSentence.STARTPAGE_TYPE && sentence.message)
			{
				let startPage = sentence.message;
				bodyComp = (
					<div className="systemPrompt">
						<a href={startPage.url} target="_blank">{startPage.pagetitle}</a>
					</div>
				);
			}
			else
			{
				bodyComp = (
					<div className="systemPrompt">
						{
							sentence.messageBody
						}
					</div>
				);
			}
			
			break;
		
		case MessageType.MESSAGE_DOCUMENT_HYPERMEDIA:
			bodyComp = <HyperMediaMessage message={sentence}/>;
			break;
		
	}
	return (
		<div key={sentenceID} className="retweetHistoryList">
			<span className="retweetImg" style={backgroundStyle}></span>
			<span className="retweetUserName" style={{color: styleColor}}>
                {userName}
            </span>
			<span className="retweetCreateTime">
                {createTime}
            </span>
			<div className="retweetHistoryListContent">
				{bodyComp}
			</div>
		</div>
	);
}

export function getSummaryModal(props)
{
	return (
		<Portal key="summary">
			<ConclusionViewWrapper {...props}/>
		</Portal>
	);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('ConverUtis', info, log);
}