import React from 'react';
import Draft from 'draft-js';
import { shallowEqual, upload, UPLOAD_IMAGE_ACTION } from '../../../../utils/MyUtil';
import '../../../../public/styles/chatpage/send/textEditor.scss';
import Keyboard from "../../../../utils/Keyboard";
import '../../../../public/styles/chatpage/send/sendText.scss';
import SendType from './SendType';
import MessageType from '../../../../im/message/MessageType';
import { CLOSE, SMART_INPUT } from "../../../event/TabEvent";
import Lang from "../../../../im/i18n/Lang";
import Immutable from "immutable";
import TextEditorBase from "./TextEditorBase";
import SmartInputView from "./SmartInputView";
import UsualTips from "../../view/aside/UsualTips";
import { sendFile } from "./ToolUpload";
import InputMessage from "../../../../model/vo/InputMessage";
import { stateToHTML } from 'draft-js-export-html';
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";
import APPEvent from "../../../event/APPEvent";
import NtalkerEvent from "../../../event/NtalkerEvent";
import LogUtil from "../../../../lib/utils/LogUtil";
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { getMessages, getWorkParamObject, hasHyperMedia, getParams } from "../../../../utils/HyperMediaUtils";
import HyperMediaChatSentence from "../../../../model/vo/sentence/HyperMediaChatSentence";
import { createMessageId } from "../../../../lib/utils/Utils";
import HyperMediaProxy from "../../../../model/proxy/HyperMediaProxy";
import Model from "../../../../utils/Model";
import { sendMessageWithChatData, serverTimeGap } from "../../../../utils/ConverUtils";
import OpenConverType from "../../../../model/vo/OpenConverType";
import TranslateProxy from "../../../../model/chat/TranslateProxy";

const {Editor, EditorState, Modifier, ContentState, convertFromHTML, RichUtils, convertFromRaw} = Draft;

let colorStyleMap = {};
let _shieldedFunction = Immutable.Map();

class TextEditor extends TextEditorBase {
	
	constructor(props)
	{
		super(props);
		
		this.focus = this.focus.bind(this);
		this.onPaste = this.onPaste.bind(this);
		this._onSmartInput = this._onSmartInput.bind(this);
		this._onAppHandle = this._onAppHandle.bind(this);
		
		GlobalEvtEmitter.on("focus", this.focus);
		GlobalEvtEmitter.on(SMART_INPUT, this._onSmartInput);
		GlobalEvtEmitter.on(NtalkerEvent.APP, this._onAppHandle);
		
		this.handleKeyCommand = this._handleKeyCommand.bind(this);
		
		_shieldedFunction.clear();
	}
	
	_handleKeyCommand(command, editorState)
	{
		let newState = RichUtils.handleKeyCommand(editorState, command);
		
		if(newState)
		{
			if(editorState.getCurrentContent()
				.getBlockMap().size === newState.getCurrentContent()
				.getBlockMap().size)
			{
				return false;
			}
			
			this.onChange(newState);
			return true;
		}
		
		return false;
	}
	
	_onAppHandle(data)
	{
		if(!data || !data.listen) return;
		
		if(data.listen === APPEvent.SHORT_CUT && data.sourceurl)
		{
			this.insertImage(data.sourceurl);
		}
	}
	
	popupWith = "0px";
	
	componentDidUpdate()
	{
		super.componentDidUpdate();
		
		let editor = document.getElementsByClassName('RichEditor-root')[0];
		
		if(editor)
		{
			this.popupWith = editor.clientWidth + "px";
			
			editor.removeEventListener("paste", this.onPaste);
			
			editor.addEventListener("paste", this.onPaste);
		}
	}
	
	onPaste(e)
	{
		let clipboardData = e.clipboardData || {},
			{items = [], files = []} = clipboardData;
		
		if(files.length > 0 && items.length > 0 && items[0].type === "image/png")
		{
			this.uploadImage(files[0]);
		}
	}
	
	uploadImage(file)
	{
		if(file && file instanceof File)
		{
			upload(file, UPLOAD_IMAGE_ACTION)
			.then((res) => {
				//log("handleChange upload res = " + JSON.stringify(res));
				
				var {jsonResult = {data: {}}} = res,
					{data = {srcFile: {}, thumbnailImage: {}}, code} = jsonResult,
					success = code === 200,
					{srcFile: {url: sourceurl}} = data;
				
				if(!success)
				{
					//未知错误
					return;
				}
				
				if(success)
				{
					this.insertImage(sourceurl);
				}
			});
		}
		
	}
	
	componentWillUnmount()
	{
		GlobalEvtEmitter.removeListener(SMART_INPUT, this._onSmartInput);
	}
	
	shouldComponentUpdate(nextProps, nextState)
	{
		if(nextProps.chatDataVo !== this.props.chatDataVo)
		{
			setTimeout(this.focus.bind(this), 100);
		}
		
		return !Immutable.is(_shieldedFunction, _shieldedFunction = this._refreshSheildFn(nextProps.chatDataVo)) ||
			!Immutable.is(nextState.editorState, this.state.editorState) ||
			!shallowEqual(nextProps, this.props, true, 2) || !shallowEqual(nextState, this.state, true, 2);
	}
	
	_refreshSheildFn(chatDataVo)
	{
		let preEnabled = _shieldedFunction.get("enabled") || false;
		
		if(!chatDataVo || !chatDataVo.rosterUser)
		{
			if(!preEnabled)
				return _shieldedFunction;
			
			return _shieldedFunction.set("enabled", false);
		}
		
		let coopData = chatDataVo.cooperateData,
			enabled = !coopData || coopData.isSponsor;
		
		if(enabled === preEnabled)
			return _shieldedFunction;
		
		return _shieldedFunction.set("enabled", enabled);
	}
	
	_onSmartInput(word)
	{
		this.hasSmartInput = Boolean(word);  //是否显示智能输入面板
		this.smarInputWord = null;
		
		if(word)
		{
			let {response = "", type, forceSend = false} = word,
				inputMessage = InputMessage.getPooled(type, response, forceSend);
			
			if(forceSend)
			{
				//setTimeout(() =>
				//{
				this.focus();
				
				this.state.currentText = "";
				this.state.upDown = SmartInputView.NULL;
				//}, 0);
			}
			
			this.setInputMessage(inputMessage);
			
			if(type === UsualTips.FILE_TYPE)
			{
				this.smarInputWord = inputMessage;
			}
		}
		else
		{
			this.smarInputWord = null;
		}
	}
	
	_maxInputingTime = 5000;
	_inputTimeId = -1;
	
	_sendInputing()
	{
		clearTimeout(this._inputTimeId);
		this._inputTimeId = -1;
	}
	
	sendMessage(messageBody, messageType, translate = "")
	{
		let {chatData} = this.props;
		if(Object.keys(chatData).length)
		{
			sendMessageWithChatData(chatData, messageBody, messageType, translate);
		}
	}
	
	_setInputingTimeout()
	{
		if(this._inputTimeId === -1)
		{
			this.sendMessage(["inputting"]);
			this._inputTimeId = setTimeout(this._sendInputing.bind(this), this._maxInputingTime);
		}
	}
	
	preInput = "";
	
	hasAtomic(blockMap)
	{
		let has = false;
		blockMap && blockMap.forEach(value => {
			if(value.getType() === "atomic") has = true;
		})
		
		return has;
	}
	
	onChange(editorState)
	{
		super.onChange(editorState);
		
		const content = editorState.getCurrentContent(),
			currentText = content.getPlainText()
			.trim(),
			hasAtomic = this.hasAtomic(content.blockMap);
		
		//翻译
		if(typeof this.chatData.addTranslate && currentText.trim() !== this.preInput.trim())
		{
			this.chatData.inputtingTranslate = "";
			
			if(!hasAtomic)
			{
				this.chatData.addTranslate({messageid: -1, message: currentText});
			}
		}
		
		if(this.smarInputWord && this.smarInputWord.fileName === currentText)
			return;
		
		currentText && this._setInputingTimeout();
		
		if(!this.preInput || (!hasAtomic && (!currentText || this.curTextIsChanged(currentText, this.preInput))))
		{
			this.preInput = currentText;
			
			this.setState({currentText, upDown: SmartInputView.NULL});
		}
	}
	
	get chatData()
	{
		let {chatData = {}} = this.props;
		
		return chatData;
	}
	
	curTextIsChanged(currentText, preInput)
	{
		if(currentText == preInput)
			return false;
		
		if(currentText.length < preInput.length)
		{
			let str = currentText;
			currentText = preInput;
			preInput = str;
		}
		
		return currentText.substr(0, currentText.length - 1) == preInput;
	}
	
	get inputMessage()
	{
		let sendTexts = this.logState();
		
		if(this._checkEmpty(sendTexts.blocks))
			return "";
		
		let draftJson = JSON.stringify(sendTexts);
		
		return draftJson;
	}
	
	sendFileMessage(value)
	{
		this.sendMessage(...sendFile(null, 1, MessageType.MESSAGE_DOCUMENT_FILE, "", {
			url: value.fileUrl, size: value.size, oldfile: value.fileName, type: 4
		}));
		
		this.editorEmp();
	}
	
	/**
	 * 输入内容
	 * @param {HTML} value
	 * */
	setInputMessage(value, force = false)
	{
		if(value.type === UsualTips.FILE_TYPE)
		{
			if(value.forceSend)
			{
				this.sendFileMessage(value);
				return;
			}
			
			this.setInputNoChange(value.fileName);
		}
		else if(value.type === UsualTips.IMG_TYPE)
		{
			let {imgUrl, imgName} = value.content;
			this.insertImage([imgUrl, imgName], true);
		}
		else
		{
			this.setInputNoChange(value.content, force);
		}
		
		InputMessage.release(value);
		
		clearTimeout(this.timeoutId);
		
		this.timeoutId = setTimeout(() => this.focus(), 100);
	}
	
	setInputNoChange(content, force = false)
	{
		if(!content && !force)
			return;
		
		try
		{
			let notJson = typeof content === "string" && (content.indexOf("{") <= -1 || content.lastIndexOf("}") <= -1) || typeof content === "object";
			if(!notJson)
			{
				content = stateToHTML(convertFromRaw(JSON.parse(content)));
			}
			else
			{
				content = this.getHtmlContentWithStyle(content);
			}
		}
		catch(e)
		{
			content = this.getHtmlContentWithStyle(content);
		}
		
		let blocksFromHTML = convertFromHTML(content),
			newEditorState;
		
		if(blocksFromHTML.contentBlocks)
		{
			let state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
			newEditorState = EditorState.createWithContent(state);
		}
		else
		{
			
			newEditorState = EditorState.createEmpty();
		}
		
		if(this.refs.kfTool)
		{
			this.fontSize = this.refs.kfTool.style;
		}
		
		if(RichUtils.getCurrentBlockType(newEditorState) !== this.fontSize)
		{
			newEditorState = RichUtils.toggleBlockType(newEditorState, this.fontSize);
		}
		
		this._replayColor(newEditorState);
		
		Object.assign(this.state, {editorState: newEditorState, response: content});
		
		this.preInput = newEditorState.getCurrentContent()
		.getPlainText()
		.trim();
		
		this.forceUpdate();
	}
	
	getHtmlContentWithStyle(content)
	{
		let color = this.state.kfBoxStyle.backgroundColor || "",
			html = content;
		
		if(this.inlineStyles.get("BOLD"))
		{
			html = '<strong style="color: BOLD">' + html + '</strong>';
		}
		
		if(this.inlineStyles.get("ITALIC"))
		{
			html = '<em style="color: ITALIC">' + html + '</em>';
		}
		
		if(this.inlineStyles.get("UNDERLINE"))
		{
			html = '<u style="color: UNDERLINE">' + html + '</u>';
		}
		
		if(color)
		{
			html = '<span style="' + color + '">' + html + '</span>';
		}
		else
		{
			html = '<span>' + html + '</span>';
		}
		
		return html;
	}
	
	set emoji(value)
	{
		this.setState({emoji: value});
	}
	
	set color(value)
	{
		this.setState({color: value});
	}
	
	editorColor(name)
	{
		this.setState({nameColor: name});
	}
	
	// 整合插件中传递的数据
	setColor(value)
	{
		this.setState({kfBoxStyle: {backgroundColor: value}});
		
		// kfBoxStyle
		colorStyleMap[value] = {color: value};
		this.toggleColor(value, colorStyleMap);
	}
	
	_replayColor(editorState)
	{
		const currentStyle = editorState.getCurrentInlineStyle(),
			color = this.state.kfBoxStyle.backgroundColor;
		
		if(!currentStyle.has(color))
		{
			const selection = editorState.getSelection(),
				nextContentState = Object.keys(colorStyleMap)
				.reduce((contentState, color) => {
					return Modifier.removeInlineStyle(contentState, selection, color)
				}, editorState.getCurrentContent());
			
			let nextEditorState = EditorState.push(
				editorState,
				nextContentState,
				'change-inline-style'
			);
			
			if(selection.isCollapsed())
			{
				nextEditorState = currentStyle.reduce((state, color) => {
					return RichUtils.toggleInlineStyle(state, color);
				}, nextEditorState);
			}
			
			nextEditorState = RichUtils.toggleInlineStyle(
				nextEditorState,
				color
			);
			
			return nextEditorState;
		}
		
		return editorState;
	}
	
	onTab(e)
	{
		e.preventDefault();
		const maxDepth = 4;
		this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
	}
	
	_onKeyEnter(proxy)
	{
		const shortCut = localStorage.getItem("sendMsgShortcut") || "Enter";
		if(proxy)
		{
			if(proxy.keyCode === Keyboard.ENTER)
			{
				if(this.smarInputWord && this.smarInputWord.type === UsualTips.FILE_TYPE)
				{
					this.sendFileMessage(this.smarInputWord);
					return;
				}
				
				if((shortCut === "Ctrl+Enter" && proxy.ctrlKey) || (shortCut === "Enter" && !proxy.ctrlKey))
				{
					this._onSubmit();
				}
				
				if(this.hasSmartInput)
				{
					this.setState({currentText: "", upDown: SmartInputView.NULL});
				}
			}
			else if(proxy.keyCode === Keyboard.UP)
			{
				this._onUpArrow();
			}
			else if(proxy.keyCode === Keyboard.DOWN)
			{
				this._onDownArrow();
			}
		}
	}
	
	_sendText = null;
	get sendText()
	{
		if(!this._sendText)
		{
			this._sendText = this.refs["sendText"];
		}
		
		return this._sendText;
	}
	
	_onSubmit()
	{
		let {chatData = {}} = this.props;
		
		let sendTexts = this.logState();
		
		let hasAtomic = this._clearBlocks(sendTexts);
		
		if(this._checkEmpty(sendTexts.blocks))
			return;
		
		let draftJson = JSON.stringify(sendTexts);
		
		this.dealSendMessage(this.preInput, draftJson, chatData.inputtingTranslate, hasAtomic);
		
		this.state.response = "";
		
		if(chatData && chatData.getRobotList)
		{
			chatData.getRobotList(true)
		}
		
		this.editorEmp();
		
		setTimeout(() => {
			chatData.inputtingTranslate = "";
			this.focus();
		}, 0);
		
		this.props.isOpenTool && this.props.openFontTool();  //发送消息时，若字体设置面板打开，则主动关闭·
	}
	
	dealSendMessage(text, draftJson, inputtingTranslate = "", hasAtomic)
	{
		if(!hasHyperMedia(text))
		{
			//let messageType = hasAtomic ?  MessageType.MESSAGE_DOCUMENT_RICH_MEDIA : MessageType.MESSAGE_DOCUMENT_TXT;
			let messageType = MessageType.MESSAGE_DOCUMENT_TXT;
			this.sendMessage(draftJson, messageType, inputtingTranslate);
		}
		else
		{
			let messages = getMessages(text),
				message,
				messageid = createMessageId();
			
			if(messages.length <= 0)
				return;
			
			if(messages.length === 3)
				this.sendMessage(messages.pop(), MessageType.MESSAGE_DOCUMENT_TXT, inputtingTranslate);
			
			message = messages.length && messages.pop();
			
			if(!this.hyperMediaProxy.hasMedia(message))
			{
				this.sendMessage(draftJson, MessageType.MESSAGE_DOCUMENT_TXT, inputtingTranslate);
				return;
			}
			
			let hyperTimeout = setTimeout(() => {
				let createat = new Date().getTime() - serverTimeGap(),
					hyperMediaMessage = {messageid, createat},
					hyperMediaData = this.hyperMediaProxy.getParam(message),
					{position, params = {}} = hyperMediaData,
					tempParam = {...params, xn_msgid: messageid, custome: ""},
					customParam = getParams(message);
				
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
				
				hyperMediaMessage.message = message;
				hyperMediaMessage.progress = HyperMediaChatSentence.GETTED_PARAMS;
				hyperMediaMessage.position = position;
				
				let {chatDataVo = {}} = this.props,
					userInfo = chatDataVo.rosterUser && chatDataVo.rosterUser.userInfo;
				
				hyperMediaMessage.params = getWorkParamObject(tempParam, userInfo);
				
				this.sendMessage(hyperMediaMessage, MessageType.MESSAGE_DOCUMENT_HYPERMEDIA);
				
				if(messages.length)
				{
					let timeoutID = setTimeout(() => {
						this.sendMessage(messages.pop(), MessageType.MESSAGE_DOCUMENT_TXT);
						
						clearTimeout(timeoutID);
					}, 0)
				}
				
				clearTimeout(hyperTimeout);
			}, 0)
		}
	}
	
	get hyperMediaProxy()
	{
		if(!this._hyperMediaProxy)
		{
			this._hyperMediaProxy = Model.retrieveProxy(HyperMediaProxy.NAME);
		}
		
		return this._hyperMediaProxy;
	}
	
	_onClose(e)
	{
		e.stopPropagation();
		
		GlobalEvtEmitter.emit(CLOSE, ["-1"]);
	}
	
	_onUpArrow()
	{
		this.setState({upDown: 1});
	}
	
	_onDownArrow()
	{
		this.setState({upDown: 2});
	}
	
	get smartInputOn()
	{
		let smartInput = localStorage.getItem("smartInput");
		
		return smartInput != 0;
	}
	
	render()
	{
		let {
				chatDataVo = {},
				chatData = {}
			} = this.props,
			{openType, inputtingTranslate} = chatData || {},
			isPassive = openType === OpenConverType.VISITOR_PASSIVE_REQUEST;
		
		let {editorState, upDown = -1, currentText = ""} = this.state,
			robotList = chatData.getRobotList && chatData.getRobotList(false) || [],
			[list = [], question = ""] = robotList;
		
		this.state.upDown = -2;
		
		let enabled = _shieldedFunction.get("enabled"),
			inputProps = {
				placeholder: Lang.getLangTxt("placeholder"),
				editorState: editorState,
				onChange: () => {
					if(this.refs.editor)
					{
						this.refs.editor.blur();
					}
				},
			},
			inputContainerProps = {},
			sendProps = {className: "sendtButton"},
			closeProps = {className: "closeButton"};
		
		if(enabled)
		{
			Object.assign(inputProps, {
				customStyleMap: colorStyleMap,
				placeholder: Lang.getLangTxt("placeholder"),
				editorState: editorState,
				onChange: this.onChange.bind(this),
				blockRendererFn: this.mediaBlockRenderer.bind(this),
				onTab: this.onTab.bind(this),
				handleKeyCommand: this.handleKeyCommand
			});
			
			Object.assign(inputContainerProps, {
				onKeyDown: this._onKeyEnter.bind(this),
				onClick: this.focus.bind(this)
			});
			
			sendProps.onClick = this._onSubmit.bind(this);
			closeProps.onClick = this._onClose.bind(this);
			this.style = {};
		}
		else
		{
			sendProps.className = sendProps.className + " " + "sendEnable";
			closeProps.className = closeProps.className + " " + "closeEnable";
			this.style = {
				color: '#ccc'
			};
			
			Object.assign(this.state, {editorState: EditorState.createEmpty()});
			Object.assign(inputProps, {editorState: this.state.editorState});
		}
		
		list.length && this.focus();
		
		return (
			<div>
				{
					this._getColorComp()
				}
				{
					this._getEditorTool()
				}
				
				{
					TranslateProxy.Enabled ?
						<div className="inputtingTranslate">
							<div className="transBg"></div>
							<div className="inputText scrollBarStyle">
								{
									inputtingTranslate
								}
							</div>
						</div> : null
				}
				
				
				<Trigger popupPlacement="top" popupVisible={!!this.preInput || list.length}
				         builtinPlacements={{top: {points: ['bc', 'tc'],}}}
				         popup={
					         <SmartInputView search={currentText} upDown={upDown}
					                         popupStyle={{width: this.popupWith}}
					                         smartInputOn={this.smartInputOn} robotList={list}
					                         question={question}/>
				         }>
					<div className="RichEditor-root scrollBarStyle">
						<div className="RichEditor-editor" {...inputContainerProps}>
							<Editor ref="editor" {...inputProps}/>
						</div>
					</div>
				</Trigger>
				
				<div className="sendSide user-select-disable">
					{
						this.props.inputtingMessage ?
							<div>
								<span className="consultPhone">
								{
									this.props.inputtingMessage
								}
								</span>
								
								<i className="sendSideIcon iconfont icon-bianji1" style={this.style}/>
							</div>
							: null
					}
					<div className="sendSideBth">
						<SendType enabled={enabled}/>
						
						<button {...sendProps} style={this.style}>
							{
								Lang.getLangTxt("sendMessage")
							}
						</button>
						{
							isPassive ? null : (
								<button {...closeProps} style={this.style}>
									{
										Lang.getLangTxt("endConver")
									}
								</button>
							)
						}
					</div>
				</div>
			</div>
		);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("TextEditor", info, log);
}

export default TextEditor;
