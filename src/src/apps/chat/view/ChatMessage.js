import React from 'react';
import { Icon } from 'antd';
import Message from './message/Message';
import ScrollArea from 'react-scrollbar';
import '../../../public/styles/chatpage/message.scss';
import { createSentence, getLangTxt, reoperation } from "../../../utils/MyUtil";
import MessageType from "../../../im/message/MessageType";
import Timer from "../../../components/Timer";
import SystemMessageView from "./SystemMessageView";
import SessionEvent from "../../event/SessionEvent";
import ReactDOM from "react-dom";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import NTImageView from "../../../components/NTImageView";
import OpenConverType from "../../../model/vo/OpenConverType";
import TranslateProxy from "../../../model/chat/TranslateProxy";

class ChatMessage extends React.Component {
	
	_scrollArea = null;
	
	constructor(props)
	{
		super(props);
		
		this._preMessageComp = new Map();
		this._curMessageComp = new Map();
		
		this.state = {isOpen: false, smoothScrolling: false};
		
		this.onShowImageView = this.onShowImageView.bind(this);
		
		this._isToBottom = true;
		
		this._onResendMessage = this._onResendMessage.bind(this);
		this._scrollBottom = reoperation(this._scrollBottom.bind(this), 100);
		this.onScrollBottom = this.onScrollBottom.bind(this);
		
		GlobalEvtEmitter.on(SessionEvent.RESEND_MESSAGE, this._onResendMessage);
		GlobalEvtEmitter.on("show_all_img", this.onShowImageView);
		GlobalEvtEmitter.on("scrollBottom", this.onScrollBottom);
		
		window.chatMessage = this;
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.chatData !== this.props.chatData)
		{
			this._scrollBottom();
		}
	}
	
	onShowImageView(currentSrc, isHistory)
	{
		if(isHistory)
			return;
		
		let imageBox = ReactDOM.findDOMNode(this.refs["content"]),
			currentImage = 0;
		
		if(imageBox)
		{
			let images = imageBox.getElementsByTagName("img") || [];
			
			if(images.length > 0)
			{
				images = Array.from(images);
				
				currentImage = images.findIndex(value => value.currentSrc === currentSrc);
				
				currentImage = currentImage < 0 ? 0 : currentImage;
				
				images = images.map(value => {
					if(value.alt && value.alt.indexOf("http") > -1)
					{
						return value.alt;
					}
					else
					{
						return value.currentSrc;
					}
				});
			}
			else
			{
				images = [currentSrc];
			}
			
			this.setState({isOpen: true, currentImage, images});
		}
	}
	
	componentWillUnmount()
	{
		GlobalEvtEmitter.removeAllListeners(SessionEvent.RESEND_MESSAGE, this._onResendMessage);
		GlobalEvtEmitter.removeAllListeners("show_all_img", this.onShowImageView);
		GlobalEvtEmitter.removeAllListeners("scrollBottom");
	}
	
	_onResendMessage(messageId)
	{
		const chatData = this.props.chatData || {},
			chatDataVo = chatData.chatDataVo;
		
		if(chatDataVo && typeof chatDataVo.getMessage === "function")
		{
			let sentence = chatDataVo.getMessage(messageId);
			
			chatData.sendMessage(sentence);
		}
	}
	
	componentDidUpdate()
	{
		this._rendering = false;
		
		let {chatData = {}} = this.props;
		
		if(this._isToBottom || chatData.lastMessageSender === 1)
		{
			this._scrollBottom();
			chatData.lastMessageSender = -1;
		}
	}
	
	onScrollBottom()
	{
		let {chatData = {}} = this.props;
		
		if(!this._isToBottom && chatData.lastMessageSender !== 1)
			return;
		
		this._scrollBottom();
	}
	
	_scrollBottom()
	{
		try
		{
			if(!this._scrollArea)
				this._scrollArea = this.refs["scrollArea"];
			
			if(this._scrollArea)
			{
				this._scrollArea.scrollBottom();
				
				clearTimeout(this.scrollId);
				
				//修复滚动条不置底
				this.scrollId = setTimeout(() => {
					this._scrollArea && this._scrollArea.scrollBottom();
					clearTimeout(this.scrollId)
				}, 1000);
			}
		}
		catch(e)
		{
		
		}
	}
	
	_messages(converList, outputMessages)
	{
		if(outputMessages.length <= 0 || !Array.isArray(converList))
			return null;
		
		let messages = [];
		
		converList = converList.filter(converId => {  //过滤会话没有消息
			let converOutMsges = outputMessages[converId];
			return converOutMsges && converOutMsges.length > 0;
		});
		
		if(!converList)
			return null;
		
		converList.forEach((converId, index, arr) => {  //添加会话分割线
			let converOutMsges = outputMessages[converId];
			if(index !== 0 && index <= arr.length - 1)
			{
				
				if(converOutMsges[0].messageType !== MessageType.MESSAGE_DOCUMENT_SEPARATION)
				{
					let sentence = this.getSeparationSentence(converOutMsges);
					converOutMsges.unshift(sentence);
				}
			}
			
			messages.push(this.getConverMessages(converOutMsges));
		});
		
		this._preMessageComp.clear();
		this._preMessageComp = this._curMessageComp;
		this._curMessageComp = new Map();
		
		return messages;
	}
	
	getSeparationSentence(converOutMsges)
	{
		let lastSentence = converOutMsges[0];
		
		return createSentence(
			{
				converid: lastSentence.sessionID,
				messageid: new Date().getTime(),
				createat: lastSentence.createTime
			}, MessageType.MESSAGE_DOCUMENT_SEPARATION
		);
	}
	
	getConverMessages(value)
	{
		if(!Array.isArray(value) || value.length <= 0)
			return null;
		
		return value.map(this._getMessage.bind(this));
	}
	
	_getMessage(item)
	{
		let key = item.sentenceID,
			message = this._preMessageComp.get(key);
		
		if(!message || message.props.message !== item)
		{
			message = <Message key={key} index={key} message={item}/>;
		}
		
		this._curMessageComp.set(key, message);
		
		return message;
	}
	
	_onGetMoreMsg()
	{
		const chatData = this.props.chatData;
		if(chatData && chatData.requestHistoryMore)
		{
			chatData.requestHistoryMore();
		}
	}
	
	_onScrollHandler({containerHeight, topPosition, realHeight})
	{
		if(!this._rendering && containerHeight && realHeight && topPosition)
		{
			this._isToBottom = Math.abs(containerHeight + topPosition - realHeight) < 20;
		}
		
		!this.state.smoothScrolling && this.setState({smoothScrolling: true});
	}
	
	_getWaitComp(unreadCountTime)
	{
		let {chatData} = this.props;
		
		if(chatData && chatData.openType === OpenConverType.VISITOR_PASSIVE_REQUEST)
			return null;
		
		unreadCountTime = unreadCountTime !== undefined ? unreadCountTime : -1;
		
		if(unreadCountTime > 0)
		{
			unreadCountTime = Math.floor((new Date().getTime() - unreadCountTime) / 1000);
		}
		
		return unreadCountTime <= -1 ? null :
			<div className="fixedTime">
				{getLangTxt("fk_wait_tip")}
				<Timer style={{cursor: "default"}} date={unreadCountTime}/>
			</div>;
	}
	
	_onClose()
	{
		this.setState({isOpen: false});
	}
	
	render()
	{
		this._rendering = true;
		
		const {hasMoreMsg} = this.props.chatData,
			chatDataVo = this.props.chatData.chatDataVo || {},
			{sessionId = "", destroyedConvers, outputMessages = [], unreadCountTime, systemMessage} = chatDataVo,
			{isConversation} = this.props,
			infosClsName = TranslateProxy.Enabled ? "infos" : "infos infos-without-trans";
		
		let converList = [],
			{isOpen, images, currentImage} = this.state;
		
		if(destroyedConvers)
		{
			converList = destroyedConvers;
		}
		
		if(sessionId && !converList.includes(sessionId))
		{
			converList.push(sessionId);
		}
		
		return (
			<div className={infosClsName} style={isConversation ? {background: 'rgba(255, 255, 255, 0.5)'} : {}}>
				
				<div className="info-con" ref="messageArea">
					<div className="info-conDiv">
						<ScrollArea ref="scrollArea" speed={this.state.smoothScrolling ? 1 : 2000}
						            className="info-conScrollArea"
						            smoothScrolling={this.state.smoothScrolling}
						            onScroll={this._onScrollHandler.bind(this)}>
							<div className="content" ref="content">
								{
									hasMoreMsg ?
										<div className="getMoreMessage" style={{marginTop:"10px"}}>
											<Icon type="clock-circle" style={{marginRight: '4px'}}/>
											<span
												onClick={this._onGetMoreMsg.bind(this)}>{getLangTxt("more_messege")}</span>
										</div>
										: null
								}
								{
									this._messages(converList, outputMessages)
								}
							</div>
						</ScrollArea>
						{
							this._getWaitComp(unreadCountTime)
						}
					</div>
					{
						systemMessage ? <SystemMessageView systemMessage={systemMessage}/> : null
					}
					{
						isOpen ?
							<NTImageView images={images} currentImage={currentImage} _onClose={this._onClose.bind(this)}/> : null
					}
				</div>
			</div>
		);
	}
}

export default ChatMessage;
