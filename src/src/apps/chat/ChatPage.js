/**
 * 咨询接待页面
 * 单例
 * */
import React from 'react'
import { Map as ImmutableMap, is } from "immutable";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import AsideNav from './view/aside/AasideNav'
import Toolbar from './view/send/Toolbar'
import TextEditor from './view/send/TextEditor'
import ChatMessage from './view/ChatMessage'
import ConsultInfoView from './view/ConsultInfoView'
import UserTabs from './view/UserTabs';
import '../../public/styles/chatpage/chatPage.scss';
import '../../public/styles/chatpage/chatMessage.scss';
import { setProperty, callComponentMethod, getLangTxt, get, sendT2DEvent } from '../../utils/MyUtil';
import { requestCooperateAction } from './redux/reducers/eventsReducer';
import { chatDataChanged, chatDataClear, connectStatus } from "./redux/reducers/chatPageReducer";
import CooperateUI from "./view/CooperateUI";
import Keyboard from "../../utils/Keyboard";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import KeyboardEvent from "../event/KeyboardEvent";
import NIMCode from "../../im/error/NIMCode";
import { Modal, Button } from "antd";
import EnterFrameComp from "../../components/EnterFrameComp";
import Model from "../../utils/Model";
import NtalkerListRedux from "../../model/chat/NtalkerListRedux";
import NtalkerEvent from "../event/NtalkerEvent";
import ConnectStatus from "../../im/connect/ConnectStatus";
import { logoutUser } from "../login/redux/loginReducer";
import TranslateProxy from "../../model/chat/TranslateProxy";
import KFsView from "./view/KFsView";
import { ntalkerListRedux } from "../../utils/ConverUtils";
import { getQueryString } from "../../utils/StringUtils";
import SessionEvent from "../event/SessionEvent";
import UserInfo from "../../model/vo/UserInfo";

class ChatPage extends EnterFrameComp {

	static instance = function() {
		return _instance;
	};

	constructor(props)
	{
		super(props);

		this.state = {
			isOpenFontTool: false
		};

		_instance = this;

		this.shortcut = ["ctrl", "q"];

		this._onOpenFontTool = this._onOpenFontTool.bind(this);
		this._insertImage = this._insertImage.bind(this);
		this.onChatDataChange = this.onChatDataChange.bind(this);

		GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_CHANGE, this.onChatDataChange);
	}

	static getRobotID()
	{
		let view = ChatPage.instance();
		return view.robotId;
	}

	get robotId()
	{
		const chatData = this.props.chatData || {},
			chatDataVo = chatData.chatDataVo || {},
			{robotId} = chatDataVo;

		return robotId || "";
	}

	componentWillUnmount()
	{
		super.componentWillUnmount();

		GlobalEvtEmitter.removeListener(NtalkerEvent.CHAT_DATA_CHANGE, this.onChatDataChange);
	}

	onChatDataChange()
	{
		this.setState({updateTime: new Date().getTime()});
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		if(!is(nextProps.intelligent, this.props.intelligent))
		{
			let intelData = nextProps.intelligent.get("data") || {},
				intelStr = intelData.intelligent || "ctrl+q";

			intelStr = intelStr.toLowerCase();

			this.shortcut = intelStr.split("+");
		}

		return super.shouldComponentUpdate(nextProps, nextState);
	}

	_onOpenFontTool()
	{
		this.setState({
			isOpenFontTool: !this.state.isOpenFontTool
		});
	}

	set emoji(value)
	{
		setProperty.call(this, "textEditor", "emoji", value);
	}

	set color(value)
	{
		setProperty.call(this, "textEditor", "color", value);
	}

	get inputMessage()
	{
		return this.refs.textEditor.inputMessage;
	}

	setInputMessage(value)
	{
		this.refs.textEditor.setInputMessage(value, true);
	}

	_getCooperateUI(cooperateData)
	{
		if(!cooperateData)
			return null;

		return (
			<CooperateUI cooperateData={cooperateData}
			             requestCooperateAction={this.props.requestCooperateAction}/>
		);
	}

	_insertImage(url)
	{
		callComponentMethod.call(this, "textEditor", "insertImage", [url]);
	}

	onKeyboardChange(event)
	{
		const {ctrlKey, altKey, keyCode, key} = event;

		if(keyCode === Keyboard.ENTER)
		{
			this.emit(KeyboardEvent.Enter, {ctrlKey});
		}
		else if(keyCode === Keyboard.ESC)
		{
			this.emit(KeyboardEvent.ESC);
		}
		else if(ctrlKey)
		{
			let lowKey = key.toLowerCase();
			if(this.shortcut.includes("ctrl") && this.shortcut.includes(lowKey))
			{
				this.emit(KeyboardEvent.SWITCH_CONVER);
			}

			if(keyCode === Keyboard.C || keyCode === Keyboard.V || keyCode === Keyboard.X)
			{
				this.emit(KeyboardEvent.COPY, keyCode);
			}
		}
		else if(altKey)
		{
			if(this.shortcut.includes("alt") && this.shortcut.indexOf(key.toLowerCase()) === 1)
			{
				this.emit(KeyboardEvent.SWITCH_CONVER);
			}
		}
	}

	handleOk()
	{
		this.props.chatDataClear();
		this.props.logoutUser();

		this._modal = null;
	}

	emit(eventType, data)
	{
		GlobalEvtEmitter.emit(eventType, data);
	}

	getNtalkerList()
	{
		return Model.retrieveProxy(NtalkerListRedux.NAME);
	}

	getWarnComp()
	{
		let {connectData: {connectStatus, errorCode, show}} = this.props,
			src = require("../../public/images/chatPage/user_onLine.png");

		if(connectStatus === ConnectStatus.ST_CONNECTED
			|| (connectStatus === ConnectStatus.ST_CONNECTING && errorCode !== NIMCode.RECONNECT_FAILED_ERROR)
			|| connectStatus === ConnectStatus.ST_MQTT_CONNECTED || !show)
		{
			if(this._modal)
			{
				this._modal.destroy();
				this._modal = null;
			}

			return null;
		}

		let content = "", btnTxt = "确认";
		if(connectStatus === ConnectStatus.ST_DISCONNECT)
		{
			if(errorCode === NIMCode.KICK_OFF)
			{
				content = getLangTxt("20004");
				btnTxt = getLangTxt("relogin");
			}
			else
			{
				return;
				//content = "网络已经断开，请稍后重试！";
				//btnTxt = "确定";
			}
		}
		else if(connectStatus === ConnectStatus.ST_CONNECTING && errorCode === NIMCode.RECONNECT_FAILED_ERROR)
		{
			content = getLangTxt("20038");
			btnTxt = getLangTxt("sure");
		}

		if(!this._modal)
		{
			this._modal = Modal.error({
				title: getLangTxt("tip"),
				width: '320px',
				iconType: 'exclamation-circle',
				className: 'warnTip',
				content: <div>
					<p>{content}</p>
				</div>,
				okText: btnTxt,
				onOk: this.handleOk.bind(this)
			});
		}
	}

	componentDidUpdate(prevProps)
	{
		let location = this.props.location,
			{state, search} = location;

		if(!state && !search)
			return;

		let query = getQueryString(search) || state && state.query || {},
			{ntid, cid, tid} = query;

		if(!ntid || !cid || !tid)
			return;

		let ntalkerList = ntalkerListRedux();
		if(ntalkerList && ntalkerList.getTabDataByUserId(ntid))
		{
			let href = get(["location", "href"], window);

			if(href)
			{
				let index = href.indexOf("?");
				window.location = href.substr(0, index);
			}
			return;
		}

		let userInfo = new UserInfo(),
			sessionInfo = {converid: cid, customerid: ntid},
			members = new Map();

		members.set(ntid, userInfo);
		userInfo.userId = ntid;
		userInfo.userName = ntid;
		userInfo.type = 1;

		location.state = {};

		sendT2DEvent({
			listen: SessionEvent.REQUEST_CHAT,
			params: [ntid, cid, 1, sessionInfo, members, tid] //干系人ID, 会话ID, type会话类型
		});
	}

	render()
	{
		const guestInfo = {},
			isConversation = this.props.hasConver,
			chatData = isConversation ? (this.props.chatData || {}) : {},
			chatDataVo = chatData.chatDataVo || {},
			{
				rosterUser = {}, predictMessage, cooperateData
			} = chatDataVo,
			sendBoxClsName = TranslateProxy.Enabled ? "send-box" : "send-box send-without-trans";

		if(rosterUser)
		{
			guestInfo.userId = rosterUser.userId;
		}

		this.getWarnComp();

		return (
			<div className="chatpage" tabIndex={1} onKeyDown={this.onKeyboardChange.bind(this)}>

				<div className="infoLeft user-select-disable"
				     style={isConversation ? {background: 'rgba(255,255,255,0.5)'} : {}}>
					<UserTabs/>
				</div>

				<div className="infoRight">

					<div className="ConsultInfoView">
						<ConsultInfoView ref="consultInfoView" chatDataVo={chatDataVo}
						                 updateTime={this.state.updateTime}/>
					</div>

					<ChatMessage ref="chatMessage" chatData={chatData} isConversation={isConversation}/>
					{
						this._getCooperateUI(cooperateData)
					}
					<div className={sendBoxClsName} style={isConversation ? {
						background: 'rgba(255,255,255,0.5)', display: 'block'
					} : {display: 'none'}}>
						<KFsView kfs={chatDataVo.kfMembers}/>
						<Toolbar click={this._onOpenFontTool} getChooseEmiji={this._insertImage}
						         openType={chatData && chatData.openType}
						         chatDataVo={chatDataVo} updateTime={this.state.updateTime}/>

						<TextEditor ref="textEditor" chatDataVo={chatDataVo} chatData={chatData}
						            inputtingMessage={predictMessage}
						            isOpenTool={this.state.isOpenFontTool}
						            openFontTool={this._onOpenFontTool.bind(this)}/>
					</div>
				</div>

				<div className="infoAside" style={isConversation ? {background: 'rgba(255,255,255,0.5)'} : {}}>
					<AsideNav ref="asideNav" guestInfo={guestInfo} chatDataVo={chatDataVo} chatData={chatData}
					          isConversation={isConversation}/>
				</div>
			</div>
		);
	}
}

let _instance;

export function getRobotID()
{
	if(_instance)
	{
		return _instance.robotId || "";
	}

	return "";
}

function mapStateToProps(state)
{
	let {
			chatPageReducer,
			personalReducer
		} = state,
		intelligent = personalReducer.get("intelligent") || ImmutableMap(),
		chatData = chatPageReducer.get("chatData") || {},
		hasConver = chatPageReducer.get("hasConver") || false,
		connectData = chatPageReducer.get("connectData") || {};

	return {chatData, intelligent, connectData, hasConver};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		requestCooperateAction, logoutUser,
		connectStatus, chatDataChanged, chatDataClear
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatPage);
