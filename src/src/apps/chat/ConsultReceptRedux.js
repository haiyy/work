import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import NtalkerEvent from "../event/NtalkerEvent";
import LogUtil from "../../lib/utils/LogUtil";
import TabDataManager from "../../utils/TabDataManager";
import NtalkerListRedux from "../../model/chat/NtalkerListRedux";
import Model from "../../utils/Model";
import { loginUser } from "../../utils/MyUtil";
import UserInfo from "../../model/vo/UserInfo";
import { mineInfoUpdate } from "../login/redux/loginReducer";
import ChatDataManager from "../../model/chat/ChatDataManager";
import SessionEvent from "../event/SessionEvent";
import { sendToMain } from "../../core/ipcRenderer";
import Channel from "../../model/vo/Channel";
import { sendNetWork } from "./redux/reducers/netWorkReducer";
import OpenConverType from "../../model/vo/OpenConverType";
import { tabSelected } from "./redux/reducers/eventsReducer";
import PendingConverData from "../../model/vo/PendingConverData";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import { connectStatus } from "./redux/reducers/chatPageReducer";
import { setCurConver } from "./redux/reducers/pendingConverReducer";

class ConsultReceptRedux extends Component {
	
	constructor()
	{
		super();
		
		this._handleEvent = this._handleEvent.bind(this);
		this._onT2DEventHandler = this._onT2DEventHandler.bind(this);
		this._onNetWorkHandler = this._onNetWorkHandler.bind(this);
		
		GlobalEvtEmitter.on(SessionEvent.CONNECT_STATUS, this._onConnectStatus.bind(this));
		
		GlobalEvtEmitter.on(NtalkerEvent.CONSULT_RECEPTION, this._handleEvent);
		GlobalEvtEmitter.on(NtalkerEvent.NETWORK_STATUS, this._onNetWorkHandler);
		GlobalEvtEmitter.on(NtalkerEvent.T2D, this._onT2DEventHandler);
	}
	
	_onConnectStatus(data)
	{
		data.show = true;
		this.props.connectStatus(data);
	}
	
	_onT2DEventHandler(data)
	{
		try
		{
			if(!data || !data.listen)
				return;
			
			log("_onT2DEventHandler data.listen = " + data.listen);
			
			this._handleEvent(data);
		}
		catch(e)
		{
			log('_onT2DEventHandler stack: ' + e.stack);
		}
	}
	
	_onNetWorkHandler(data)
	{
		this.props.sendNetWork(data);
	}
	
	_handleEvent(data)
	{
		try
		{
			switch(data.listen)
			{
				case SessionEvent.NOTIFY_USERINFO_UPDATE:
					this._onUserInfoUpdateHandle(data.userInfoStr);
					break;
				
				case SessionEvent.CHAT_INFO:
					onChatInfo.call(this, data);
					break;
				
				case SessionEvent.REQUEST_CHAT:
					let [userId, converId, type, sessionInfo, members, templateid] = data.params;
					if(type === OpenConverType.VISITOR_PASSIVE_REQUEST_TO_SERVER)
						return;
					
					startChatWithGuest.call(this, userId, members, converId, sessionInfo, true, type, templateid);
					break;
				
				case SessionEvent.STARTCHAT:
					//[userId, memberMap, sessionId, sessionInfo, isCurrentWnd];
					startChatWithGuest.call(this, ...data.params);
					break;
				
				case SessionEvent.REQUEST_JOIN_CHAT:
					this._openJoinChat(...data.params);
					break;
			}
		}
		catch(e)
		{
			log('handleEvent stack: ' + e.stack);
		}
	}
	
	_openJoinChat(userId, memberMap, converId, sessionInfo, isCurrentWnd, openType)
	{
		if(!userId || !converId)
			return;
		
		startChatWithGuest.call(this, userId, memberMap, converId, sessionInfo, isCurrentWnd, openType);
	}
	
	_onUserInfoUpdateHandle(userInfoStr)
	{
		log(["_onUserInfoUpdateHandle userInfoStr = ", userInfoStr]);
		
		let userInfo = new UserInfo(userInfoStr),
			mine = loginUser();
		
		if(mine && userInfo.userId === mine.userId)
		{
			if(!mine.weakEqual(userInfo))
			{
				mine.merge(userInfo);
				this.props.mineInfoUpdate();
				
				sendToMain(Channel.USER_STATUS, mine.status);
			}
		}
	}
	
	render()
	{
		return null;
	}
	
	componentWillUnmount()
	{
		GlobalEvtEmitter.removeListener(SessionEvent.CONNECT_STATUS, this._onConnectStatus.bind(this));
		
		GlobalEvtEmitter.removeListener(NtalkerEvent.CONSULT_RECEPTION, this._handleEvent);
		GlobalEvtEmitter.removeListener(NtalkerEvent.NETWORK_STATUS, this._onNetWorkHandler);
		GlobalEvtEmitter.removeListener(NtalkerEvent.T2D, this._onT2DEventHandler);
	}
}

function startChatWithGuest(userId, memberMap, sessionId, sessionInfo, isCurrentWnd = false, openType = OpenConverType.VISITOR_PASSIVE_JOIN, templateid = "")
{
	log(['startChatWithGuest userId = ' + userId + ', memberMap = ', memberMap, ', sessionId = ' +
	sessionId + ', isCurrentWnd' + ' = ' + isCurrentWnd, ", openType = " + openType]);
	
	if(!userId || !sessionId)
	{
		log('startChatWithGuest !userId || !sessionId', LogUtil.ERROR);
		return;
	}
	
	let tabName = TabDataManager.getTabName(userId, sessionId),
		ntalkerList = getNtalkerList(),
		tabData = ntalkerList.getTabData(tabName),
		bNull = tabData == null,
		{curConver} = this.props,
		isPassiveRequest = openType === OpenConverType.VISITOR_PASSIVE_REQUEST;
	
	if(Object.keys(curConver).length && !tabData && !isPassiveRequest)
	{
		let {chatDataVo = {}} = curConver,
			{rosterUser = {}} = chatDataVo || {};
		
		if(rosterUser && rosterUser.userId === userId)
		{
			tabData = curConver;
			bNull = false;
			
			ntalkerList._addTabData(tabData, true);
			TabDataManager.setTab(userId, sessionId, tabData.name);
		}
	}
	
	log('startChatWithGuest not have TabData = ' + bNull);
	
	if(bNull)
	{
		tabData = new ChatDataManager("", openType);
		tabData.templateid = templateid;
		
		if(!isPassiveRequest)
		{
			ntalkerList.addTabData(tabData, isPassiveRequest);
			TabDataManager.setTab(userId, sessionId, tabData.name);
		}
	}
	
	if(!(tabName && isPassiveRequest))
	{
		tabData.createChatData(userId, memberMap, sessionId, sessionInfo, openType);
	}
	else
	{
		if(tabData.chatDataVo)
		{
			let members = tabData.chatDataVo._members;
			
			members.forEach(value => !memberMap.has(value.userId) && memberMap.delete(userId));
		}
	}
	
	if(!isPassiveRequest)
	{
		if(isCurrentWnd || ntalkerList.size <= 1)
		{
			this.props.tabSelected([tabData.name]);
		}
	}
	else
	{
		this.props.setCurConver(tabData);
		tabData.selected = true;
	}
	
	//tabData.set
}

function onChatInfo(info)
{
	try
	{
		let members = info.members,
			sessionInfo = info.sessionInfo,
			userId = sessionInfo.customerid,
			memberMap = new Map();
		
		for(let len = members.length, item, i = 0; i < len; i++)
		{
			item = members[i];
			
			if(item)
			{
				memberMap.set(item.userid, new UserInfo(item));
			}
		}
		
		startChatWithGuest.call(this, userId, memberMap, info.sid, sessionInfo);
	}
	catch(e)
	{
		log('onChatInfo stack: ' + e.stack);
	}
}

export function getNtalkerList()
{
	return Model.retrieveProxy(NtalkerListRedux.NAME);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('ConsultReceptRedux', info, log);
}

function mapStateToProps(state)
{
	let {pendingConvers} = state;
	
	return {
		curConver: pendingConvers.get("curConver")
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({mineInfoUpdate, sendNetWork, tabSelected, connectStatus, setCurConver}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultReceptRedux);
