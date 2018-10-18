import React from 'react';
import MessageType from '../../../../im/message/MessageType';
import { formatTimestamp, getSourceUrl, shallowEqual } from '../../../../utils/MyUtil';
import Logo from '../../../../components/Logo'
import ImageMessage from './ImageMessage'
import VideoMessage from './VideoMessage'
import AudioMessage from './AudioMessage'
import SystemPromptMessage from './SystemPromptMessage'
import SeparationMessage from './SeparationMessage'
import FileTransMessage from './FileTransMessage'
import '../../../../public/styles/chatpage/message/message.scss';
import VersionControl from "../../../../utils/VersionControl";
import SessionEvent from "../../../../apps/event/SessionEvent";
import TextMessage from "./TextMessage";
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";
import HyperMediaMessage from "./HyperMediaMessage";

class Message extends React.Component {

	constructor(props)
	{
		super(props);
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		let {message} = nextProps;

		if(message.status === MessageType.STATUS_MESSAGE_SEND_FAILED || message.transfer)
		{
			return true;
		}

		return !shallowEqual(nextProps.message, this.props.message);
	}

	render()
	{
		const message = this.props.message;

		return (
			<div className="directionMessage">
				{
					this.createMessageLabel(message)
				}
			</div>
		);
	}

	resendMessage(sentence)
	{
		GlobalEvtEmitter.emit(SessionEvent.RESEND_MESSAGE, sentence.sentenceID);

		sentence.status = -1;

		this.forceUpdate();
	}

	createMessageLabel(sentence)
	{
		if(!sentence)
			return null;

		let message = null;
		let {isKF, isRobot, status, createTime, userName, portrait, userInfo, messageType, error} = sentence,
			url, link, divClassName, timeClassName,
			statusIcon, style, username;

		if(status === MessageType.STATUS_MESSAGE_SEND_FAILED && !error)
		{
			statusIcon =
				<i className="iconfont icon-011tishi status" onClick={this.resendMessage.bind(this, sentence)}/>;
		}

		if(isKF || isRobot)
		{
			url = portrait || require("../../../../public/images/kfPortrait.png");

			divClassName = "SelfMessage maxImg draf_div_h";
			link = "self";
			timeClassName = "comment_timeu";
			username = "comment_nameu";
		}
		else
		{
			divClassName = "UserMessage maxImg draf_div_h";
			link = "visitor";
			timeClassName = "comment_timev";
			username = "comment_namev";
			style = VersionControl.VISITOR_FONT_STYLE.style;
			url = getSourceUrl(userInfo);
		}

        switch(messageType)
		{
			case MessageType.MESSAGE_DOCUMENT_TXT:
	        case MessageType.MESSAGE_DOCUMENT_RICH_MEDIA:
				let htmlMessage = sentence.htmlMessage;

				if(htmlMessage)
				{
					message = <div style={{overflow: "hidden"}}>
						<div className={divClassName}>
							<TextMessage sentence={sentence} style={style}/>
							<Logo url={url} link={link}/>
							{statusIcon}
						</div>
						<span className={username}> {userName} </span>
						<span className={timeClassName}> {formatTimestamp(createTime)} </span>
					</div>;
				}
				break;

			case MessageType.MESSAGE_DOCUMENT_IMAGE:
				message = <div style={{overflow: "hidden"}}>
					<div className={divClassName}>
						<div className="comment_bubble bubble">
							<ImageMessage message={sentence} index={this.props.index}/>
						</div>
						<Logo url={url} link={link}/>
						{statusIcon}
					</div>

					<span className={username}> {userName} </span>
					<span className={timeClassName}> {formatTimestamp(createTime)} </span>
				</div>;
				break;

			case MessageType.MESSAGE_DOCUMENT_FILE:
				message = (
					<div style={{overflow: "hidden"}}>
						<div className={divClassName}>
							<div className="comment_bubble file">
								<FileTransMessage message={sentence}/>
							</div>
							<Logo url={url} link={link}/>
							{statusIcon}
						</div>
						<span className={username}> {userName} </span>
						<span className={timeClassName}> {formatTimestamp(createTime)} </span>
					</div>
				);
				break;

			case MessageType.MESSAGE_DOCUMENT_AUDIO:
				message = (
					<div style={{overflow: "hidden"}}>
						<div className={divClassName}>
                            <AudioMessage message={sentence}/>
							<Logo url={url} link={link}/>
							{statusIcon}
						</div>
						<span className={username}> {userName} </span>
						<span className={timeClassName}> {formatTimestamp(createTime)} </span>
					</div>
				);
				break;

			case MessageType.MESSAGE_DOCUMENT_VIDEO:
				message = (
					<div style={{overflow: "hidden"}}>
						<div className={divClassName}>
							<div style={{width: '272px', height: '144px', marginLeft: '10px'}}>
								<VideoMessage message={sentence}/>
							</div>
							<Logo url={url} link={link}/>
							{statusIcon}
						</div>
						<span className={username}> {userName} </span>
						<span className={timeClassName}> {formatTimestamp(createTime)} </span>
					</div>
				);
				break;

			case MessageType.MESSAGE_DOCUMENT_COMMAND:
				message = <SystemPromptMessage message={sentence}/>;
				break;

			case MessageType.MESSAGE_DOCUMENT_HYPERMEDIA:
				message = <div style={{overflow: "hidden"}}>
					<div className={divClassName}>
						<HyperMediaMessage message={sentence}/>
						<Logo url={url} link={link}/>
						{statusIcon}
					</div>
					<span className={username}> {userName} </span>
					<span className={timeClassName}> {formatTimestamp(createTime)} </span>
				</div>;
				break;

			case MessageType.MESSAGE_DOCUMENT_SEPARATION:
				message = <SeparationMessage message={sentence}/>;
				break;
		}

		return message;
	}
}

export default Message;
