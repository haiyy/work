import React from 'react';
import { Select, Button, Popover } from 'antd';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createSentence, formatTimestamp, getLangTxt } from "../../../utils/MyUtil";
import MessageType from "../../../im/message/MessageType";
import { bglen, truncateToPop } from "../../../utils/StringUtils";
import SystemSentence from "../../../model/vo/sentence/SystemSentence";
import '../../../public/styles/chatpage/retweet.scss';
import UserInfo from "../../../model/vo/UserInfo";
import { getConverHistory, getConverList, clearData } from "../redux/historyListReducer";
import { Map } from "immutable"
import ImageMessage from "../../chat/view/message/ImageMessage";
import { getNoDataComp } from "../../../utils/ComponentUtils";
import TextMessage from "../../chat/view/message/TextMessage";
import VideoMessage from "../../chat/view/message/VideoMessage";
import HyperMediaMessage from "../../chat/view/message/HyperMediaMessage";
import AudioMessage from "../../chat/view/message/AudioMessage";
import ReactDOM from "react-dom";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import NTImageView from "../../../components/NTImageView";
import "../css/bgColor.scss";

const Option = Select.Option;

class HistoryList extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {isOpen: false};
		
		let {chatDataVo = {}} = this.props,
			{sessionId, rosterUser = {}} = chatDataVo,
			userId = rosterUser.userId || "";
		
		this.onShowImageView = this.onShowImageView.bind(this);
		
		this.loadData(userId, sessionId);
		
		this.converID = sessionId;
		
		GlobalEvtEmitter.on("show_all_img", this.onShowImageView);
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {chatDataVo: {sessionId}} = nextProps;
		
		if(this.props.chatDataVo.sessionId !== sessionId)
		{
			let {sessionId, rosterUser = {}} = nextProps.chatDataVo,
				userId = rosterUser.userId || "";
			
			this.loadData(userId, sessionId);
			
			this.converID = sessionId;
		}
	}

	loadData(userId, sessionId)
	{
		if(userId)
		{
			this.props.getConverHistory(sessionId);
			this.props.getConverList(userId);
		}
		else
		{
			this.props.clearData();
		}
	}
	
	fileTypeArr = [".DOCX", ".PDF", ".JPG", ".PNG", ".PPT", ".RAR", ".ZIP", ".XLSX", ".TXT"];
	
	/*判断文件类型*/
	getFileTypeImgSrc(suffixName)
	{
		if(!suffixName)
			return require("../../../public/images/chatPage/unknown.png");
		
		if(suffixName === ".DOCX" || suffixName === ".DOC")
		{
			suffixName = ".DOCX";
		}
		
		if(this.fileTypeArr.indexOf(suffixName) === -1)
			return null;
		
		let fileUrl = require("../../../public/images/chatPage/" + suffixName.substring(1) + ".png");
		
		return fileUrl;
	}
	
	get clientWidth()
	{
		if(!document)
			return -1;
		
		let width = -1;
		
		if(document.getElementById("app").clientWidth < 1024)
		{
			width = 1024;
		}
		else if(document.getElementById("app").clientWidth > 1390)
		{
			width = 1390;
		}
		else
		{
			width = document.getElementById("app").clientWidth;
		}
		
		return width || -1;
	}
	
	onShowImageView(currentSrc, isHistory)
	{
		if(!isHistory)
			return;
		
		let imageBox = ReactDOM.findDOMNode(this.refs["scrollArea"]),
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
	
	getMessageComp(sentence, ind, fromuser)
	{
		if(!sentence)
			return null;

		let bodyComp,
			userName = sentence.userName,
			createTime = formatTimestamp(sentence.createTime),
			styleColor = UserInfo.isCustomer(sentence.userInfo.type) ? "#11cd6e" : "#0177d7",
			sentenceID = sentence.sentenceID,
			userNameWidth = this.clientWidth * 100 / 1024 * 2.45 - 158,
			backgroundStyle = {},
			nameTruncate = truncateToPop(userName, userNameWidth);


		if(fromuser){
			console.log(fromuser.type);
			if(fromuser.type==1){
				backgroundStyle = {
					background: 'url(' + require('../../../public/images/CustomerService.png') + ') center no-repeat',
					width: "12px",
					height: "14px"
				};
			}else if(fromuser.type==2){
				backgroundStyle = {
					background: 'url(' + require('../../../public/images/Tourist.png') + ') center no-repeat',
					width: "12px",
					height: "14px"
				};
			};
		};
		
		switch(sentence.messageType)
		{
			case MessageType.MESSAGE_DOCUMENT_TXT:
			case MessageType.MESSAGE_DOCUMENT_RICH_MEDIA:
				bodyComp = <TextMessage sentence={sentence}/>;
				break;
			
			case MessageType.MESSAGE_DOCUMENT_IMAGE:
				bodyComp = <ImageMessage message={sentence} index={this.props.index} isHistory/>;
				break;
			
			case MessageType.MESSAGE_DOCUMENT_FILE:
				let fileName = sentence.fileName,
					name = /\.[^\.]+$/.exec(fileName),
					suffix = (name && name.length > 0) ? name["0"].toUpperCase() : "",
					url = sentence.url,
					imgSrc = this.getFileTypeImgSrc(suffix);
				
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
					background: 'url(' + require('../../../public/images/receptionConsultation/red.png') + ') center no-repeat',
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
		if(ind % 2 == 0){
			return (
				<div key={sentenceID} className="retweetHistoryList bgColor">
					<div>
						<span className="retweetImg" style={backgroundStyle}></span>
						{
							nameTruncate.show ?
								<Popover
									content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>{userName}</div>}
									placement="topLeft">
									<span className="retweetUserName" style={{color: styleColor}}>
										{
											nameTruncate.content
										}
									</span>
								</Popover>
								:
								<span className="retweetUserName" style={{color: styleColor}}>
									{userName}
								</span>
						}
						{/*<span className="retweetUserName" style={{color: styleColor}}>
							{userName}
						</span>*/}
						<span className="retweetCreateTime">
							{createTime}
						</span>
					</div>
					
					<p>
						{bodyComp}
					</p>
				</div>
			);
		}else{
			return (
				<div key={sentenceID} className="retweetHistoryList">
					<div>
						<span className="retweetImg" style={backgroundStyle}></span>
						{
							nameTruncate.show ?
								<Popover
									content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>{userName}</div>}
									placement="topLeft">
									<span className="retweetUserName" style={{color: styleColor}}>
										{
											nameTruncate.content
										}
									</span>
								</Popover>
								:
								<span className="retweetUserName" style={{color: styleColor}}>
									{userName}
								</span>
						}
						{/*<span className="retweetUserName" style={{color: styleColor}}>
							{userName}
						</span>*/}
						<span className="retweetCreateTime">
							{createTime}
						</span>
					</div>
					
					<p>
						{bodyComp}
					</p>
				</div>
			);
		}
	}
	
	getConverListComp(converList)
	{
		return converList.map(converData => {
			let {converid, type, starttime} = converData,
				title = type === 1 ? getLangTxt("rightpage_session") : getLangTxt("setting_msgset_leavemsg"),
				startTimeStr = formatTimestamp(starttime * 1000, true);
			
			return (
				<Option key={converid}>
					{title + " " + startTimeStr}
				</Option>
			);
		});
		
	}
	
	onSelect(value)
	{
		if(value)
			this.props.getConverHistory(value);
		
		this.converID = value;
	}
	
	onRefresh()
	{
		let {rosterUser = {}} = this.props.chatDataVo,
			userId = rosterUser.userId || "";
		
		this.loadData(userId, this.converID);
	}
	
	_onClose()
	{
		this.setState({isOpen: false});
	}
	
	getSelectedDefaultValue(converList)
	{
		if(!this.converID || !converList || converList.length <= 0)
			return "";
		
		let index = converList.findIndex(data => data.converid === this.converID);
		
		if(index > 0)
			return this.converID;
		
		return converList[0].converid;
	}
	
	render()
	{
		let {history = Map(), chatDataVo = {}} = this.props,
			historyArr = history.get("history") || [],
			converList = history.get("converList") || [],
			{isOpen, images, currentImage} = this.state;
		
		if(converList.length <= 0 && historyArr.length <= 0)
		{
			return getNoDataComp();
		}
		
		return (
			<div className="chatHistoryListWrapper">
				<ScrollArea ref="scrollArea" style={{height: 'calc(100% - 42px)'}} speed={1} className="area"
				            horizontal={false} smoothScrolling>
					<div className="historyListInteraction">
						{
							historyArr.length > 0 ?
								historyArr.map((message, index) => {
									let fromuser = message.fromuser;
									if(!message || !message.hasOwnProperty("msgtype"))
										return null;
									
									let sentence = createSentence(message, message.msgtype);
									return this.getMessageComp(sentence, index, fromuser);
								})
								: getNoDataComp()
							
						}
					</div>
				</ScrollArea>
				{
					converList.length > 0 ?
						<Select className="converListSelected"
						        getPopupContainer={() => document.querySelector(".ant-layout-aside")}
						        onSelect={this.onSelect.bind(this)} value={this.getSelectedDefaultValue(converList)}>
							{
								this.getConverListComp(converList)
							}
						</Select>
						: null
				}
				{
					isOpen ?
						<NTImageView
							images={images}
							currentImage={currentImage}
							_onClose={this._onClose.bind(this)}
						/> : null
				}
				<Button className="refreshBtn" type="primary" shape="circle" size="small"
				        onClick={this.onRefresh.bind(this)}>
					<i className="icon-shuaxin iconfont"/>
				</Button>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	return {history: state.historyListReducer || Map()};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getConverHistory, getConverList, clearData}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryList);
