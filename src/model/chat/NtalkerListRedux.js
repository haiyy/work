/**
 * 会话列表
 * 单例
 * */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { sendMessage, tabClosed, tabSelected, requestCooperate, requestCooperateAction, requestEvaluate } from '../../apps/chat/redux/reducers/eventsReducer';
import { loginUser } from '../../utils/MyUtil';
import LogUtil from "../../lib/utils/LogUtil";
import {
	SENDMESSAGE, TABSELECTED, TABCLOSED, UI_REQUEST_COOPERATE_ACTION, UI_REQUEST_COOPERATE,
	UI_REQUEST_SUBMIT_SUMMARY, UI_REQUEST_EVALUATION
} from '../vo/actionTypes';
import TabDataManager from "../../utils/TabDataManager";
import Model from "../../utils/Model";
import NtalkerEvent from "../../apps/event/NtalkerEvent";
import { chatDataChanged, chatDataClear, hasConver } from "../../apps/chat/redux/reducers/chatPageReducer";
import { CLOSE_ALL, OPEN_SUMMARY } from "../../apps/event/TabEvent";
import VersionControl from "../../utils/VersionControl";
import ChatStatus from "../vo/ChatStatus";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import { sendMessageWithChatData } from "../../utils/ConverUtils";
import OpenConverType from "../vo/OpenConverType";

class NtalkerListRedux extends Component {
	
	static NAME = 'NtalkerListRedux';
	
	chatSort = 1;
	_isActive = true;
	
	constructor()
	{
		super();
		
		this.name = NtalkerListRedux.NAME;
		
		_tabList = [];
		
		this._colTabList = new Map();  //同事会话列表 current => 当前选择项
		
		Model.registerProxy(this);
		
		this._initDealMap();
		
		GlobalEvtEmitter.on(NtalkerEvent.SWITCH_CONVER, this.onSwitchConver.bind(this));
		GlobalEvtEmitter.on(SENDMESSAGE, this.onSendMessage.bind(this));
		GlobalEvtEmitter.on(CLOSE_ALL, this._onCloseAll.bind(this));
	}
	
	_onCloseAll()
	{
		let tabNames = _tabList.map(chatData => chatData.name)
		.filter(name => name !== undefined);
		
		if(tabNames.length > 0)
		{
			this._tabClosed(...tabNames);
			this.change();
		}
	}
	
	onSendMessage({msg})
	{
		this._sendMessage(msg, 11);
	}
	
	onSwitchConver(index)
	{
		this._nextSelected(index);
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {events} = nextProps;
		
		if(!events || Object.keys(events).length <= 0)
			return null;
		
		if(!Array.isArray(events))
		{
			this._dealEvent(events);
		}
		else
		{
			for(let event of events)
			{
				this._dealEvent(event);
			}
		}
	}
	
	shouldComponentUpdate()
	{
		return false;
	}
	
	registerChatData(chat)
	{
		if(chat)
		{
			chat.selected = true;
			
			this.isActive && this.props.chatDataChanged(chat);
		}
		
		_chatData = chat;
	}
	
	removeChatData()
	{
		if(_chatData)
		{
			_chatData.selected = false;
		}
		_chatData = null;
	}
	
	get currentChatData()
	{
		return _chatData;
	}
	
	get isActive()
	{
		return this._isActive;
	}
	
	set isActive(value)
	{
		this._isActive = value;
		
		if(this._isActive)
		{
			this.props.chatDataChanged(this.currentChatData || {});
			this.props.hasConver(this.size > 0);
		}
	}
	
	render()
	{
		return null;
	}
	
	/**添加Tab*/
	addTabData(data, isColleagueConver = false)
	{
		if(!data)
			return;
		
		if(isColleagueConver)
		{
			this._colTabList.set(data.name, data);
			this.isActive && this.props.chatDataChanged(data);
		}
		else
		{
			this._addTabData(data);
		}
	}
	
	_addTabData(data, selected = false)
	{
		if(this.chatSort === VersionControl.CHAT_SORT_STATUS)
		{
			this._addForStatus(data);
		}
		else
		{
			_tabList.push(data);
		}
		
		selected && this._tabSelected(data.name);
		
		this.change();
	}
	
	_addForStatus(data)
	{
		if(!data)
			return null;
		
		let chatStatus = data.chatStatus,
			index = getInsertIndex(chatStatus);
		
		_tabList.splice(index, 0, data);
		
		indexChange(chatStatus, 1);
	}
	
	_deleteTabData(data)
	{
		this._removeFromTabManager(data);
		data.close();
		
		for(let i = 0, len = _tabList.length, tabData; i < len; i++)
		{
			tabData = _tabList[i];
			if(tabData && tabData.name === data.name)
			{
				_tabList.splice(i, 1);
				
				if(this.chatSort === VersionControl.CHAT_SORT_STATUS)
				{
					indexChange(data.chatStatus, -1);
				}
				break;
			}
		}
		
		if(_tabList.length <= 0)
		{
			this.props.chatDataClear();
		}
		
		this.change();
	}
	
	getTabData(tabName)
	{
		let tabData,
			len = _tabList.length;
		
		if(_chatData && (_chatData.name === tabName || tabName === "-1"))
			return _chatData;
		
		for(var i = 0; i < len; i++)
		{
			tabData = _tabList[i];
			if(tabData && tabData.name === tabName)
			{
				return tabData;
			}
		}
		
		return null;
	}
	
	getTabDataByUserId(userId)
	{
		let tabName = TabDataManager.getTabName(userId, ""),
			tabData = this.getTabData(tabName);
		
		return tabData;
	}
	
	getTabDataForIndex(value)
	{
		if(value < 0 || value > _tabList.length - 1)
			return null;
		
		return _tabList[value];
	}
	
	/**
	 * 获取当前会话数
	 * */
	get size()
	{
		if(_tabList)
			return _tabList.length;
		
		return 0;
	}
	
	_removeFromTabManager(tabData)
	{
		let chatDataVo = tabData.chatDataVo;
		if(chatDataVo && chatDataVo.rosterUser)
		{
			TabDataManager.removeTab(chatDataVo.rosterUser.userId, tabData.sessionId);
		}
	}
	
	get tabList()
	{
		return _tabList;
	}
	
	get tabNames()
	{
		return this.tabList.map(chatData => chatData.name)
		.filter(name => name !== undefined);
	}
	
	_nextSelected(index)
	{
		let curChatData = this.getTabDataForIndex(index);
		
		if(curChatData)
		{
			curChatData.selected = false;
		}
		else
		{
			_tabList.forEach(data => data.setSelected());
			index = _tabList.length - 1;
		}
		
		let chatData = getNextSelected(index);
		
		this.registerChatData(chatData);
	}
	
	getProxyName()
	{
		return this.name;
	}
	
	_initDealMap()
	{
		_dealMap = new Map();
		_dealMap.set(SENDMESSAGE, this._sendMessage.bind(this));
		_dealMap.set(TABSELECTED, this._tabSelected.bind(this));
		_dealMap.set(TABCLOSED, this._tabClosed.bind(this));
		_dealMap.set(UI_REQUEST_COOPERATE, this._requestCooperate.bind(this));
		_dealMap.set(UI_REQUEST_COOPERATE_ACTION, this._requestCoopAction.bind(this));
		_dealMap.set(UI_REQUEST_SUBMIT_SUMMARY, this._requestSubmitSummary.bind(this));
		_dealMap.set(UI_REQUEST_EVALUATION, this._requestEvaluation.bind(this));
	}
	
	_tabSelected(tabName)
	{
		if(_chatData)
		{
			if(_chatData.name === tabName)
				return;
			
			_chatData.selected = false;
			this.removeChatData();
		}
		
		let chatData = _tabList.find(item => item.name === tabName);
		
		if(chatData)
			this.registerChatData(chatData);
	}
	
	_tabClosed()
	{
		try
		{
			const tabs = Array.from(arguments);
			let sendedSummary = false,
				localData = JSON.parse(localStorage.getItem(loginUser().userId) || "{}"),
				{autoopenSummary = false} = localData,  //关闭会话时弹出咨询总结  默认关闭
				closeSelectedIndex = -1,  //当前选中会话的index
				len = tabs.length;
			
			let tabName = "";
			
			for(let i = 0; i < len; i++)
			{
				tabName = tabs[i];
				
				//--------------若为当前会话，则查找Index-------------
				if(_chatData && _chatData.name === tabName)
				{
					let index = _tabList.findIndex(chatData => chatData.name === tabName);
					if(index > -1)
					{
						closeSelectedIndex = index;
					}
				}
				//------------------------end----------------------
				
				let tabData = this.getTabData(tabName);
				
				if(tabData)
				{
					let {chatDataVo = {}, forceClose, openType} = tabData,
						{cooperateData, summarized, isMonitor} = chatDataVo || {},
						summaryEnable = !isMonitor && openType !== OpenConverType.VISITOR_PASSIVE_REQUEST;
					
					if(cooperateData && cooperateData.isRuning())
						autoopenSummary = false;
					
					if(!summarized && autoopenSummary && !forceClose && summaryEnable)
					{
						let toolFuncsData = this.props.toolFuncsData,
							index = toolFuncsData && toolFuncsData.findIndex(item => "summary" === item.get("name") && item.get("enable") === 1) || -1;
						
						this._tabSelected(tabName);
						tabData.forceClose = true;
						index > -1 && !sendedSummary && GlobalEvtEmitter.emit(OPEN_SUMMARY, {tabData, isCurrent: true});
						sendedSummary = true;
						
						return;
					}
					
					!sendedSummary && this._deleteTabData(tabData);
				}
			
			}
			
			console.log("NtalkerListRedux sendedSummary = ", sendedSummary)
			
			!sendedSummary && this._nextSelected(closeSelectedIndex);
		}
		catch(e)
		{
			log("_tabClosed e.stack = " + e.stack);
		}
	}
	
	_sendMessage(messageBody, messageType)
	{
		if(!this._isActive)
			return;
		
		sendMessageWithChatData(_chatData, messageBody, messageType);
	}
	
	_requestCooperate(tabName, coopType, toUsers)
	{
		tabName = tabName && typeof tabName === "string" ? tabName : _chatData.name;
		
		let tabData = this.getTabData(tabName);
		if(!tabData)
			return;
		
		tabData.requestCooperate(coopType, toUsers);
	}
	
	_requestCoopAction(tabName, operation)
	{
		tabName = tabName && typeof tabName === "string" ? tabName : _chatData.name;
		
		let tabData = this.getTabData(tabName);
		
		tabData && tabData.requestCooperateAction(operation);
	}
	
	_requestSubmitSummary(summary, remark, tabName = "-1")
	{
		let tabData = this.getTabData(tabName);
		tabData && tabData.requestSubmitSummary(summary, remark);
	}
	
	_requestEvaluation(tabName = "-1")
	{
		let tabData = this.getTabData(tabName);
		tabData && tabData.requestEvaluation();
	}
	
	/**
	 * event:{type:"", data: null}
	 * */
	_dealEvent(event)
	{
		let eventType = event.type;
		
		if(_dealMap && _dealMap.has(eventType) && !event.dealed)
		{
			_dealMap.get(eventType)(...event.params);
			
			event.dealed = true;
		}
	}
	
	sortByStatus()
	{
		if(!_tabList || !_tabList.length)
			return false;
		
		let oldList = _tabList;
		
		_tabList = [];
		
		initSort();
		
		let len = oldList.length, tabData, i = 0;
		
		for(; i < len; i++)
		{
			tabData = oldList[i];
			this._addForStatus(tabData);
		}
		
		this.change();
	}
	
	change()
	{
		GlobalEvtEmitter.emit(NtalkerEvent.CHAT_DATA_LIST_CHANGE);
		
		if(this._isActive)
		{
			this.props.hasConver(this.size > 0);
		}
	}
	
	get untreatedConverCount()
	{
		let count = 0;
		_tabList.forEach(chatData => {
			let chatDataVo = chatData.chatDataVo;
			
			if(chatDataVo && (chatDataVo.newconver === 1 || chatDataVo.unreadMsgCount > 0))
			{
				count++;
			}
		});
		
		return count;
	}
	
	get getCooperate()
	{
		let count = 0;
		_tabList.forEach(chatData => {
			let chatDataVo = chatData.chatDataVo;
			
			if(chatDataVo && chatDataVo.cooperateData)
			{
				count++;
			}
		});
		
		return count;
	}
	
	onRegister()
	{
	
	}
	
	onRemove()
	{
	}
	
	clear()
	{
		_tabList = [];
		_chatData = null;
	}
}

let _chatingIndex = 0,
	_newAllocatedIndex = 0,
	_closeIndex = 0,
	_offlineIndex = 0,
	
	preunreadNum = 0,
	prewaitTime = 0,
	preStatus = 0,
	preChatData = null,
	unreadNum = 0,
	waitTime = 0,
	curStatus = -2,
	curChatData = null;

/*
 * 智能切换：
 *   1. 顺序=》新会话=》正在进行中=》关闭=》离线
 *   2. 相同会话类型不同会话之间切换：未读消息数=》等待时长
 *   3. 不同会话类型之间不可向后切换，只可向前切换
 * */
function getNextSelected(index)
{
	if(_tabList.length <= 0)
		return null;
	
	let {chatStatus, chatDataVo: {unreadMsgCount: count, unreadCountTime: time}} = _tabList[index];
	
	preunreadNum = unreadNum = count;
	prewaitTime = waitTime = time;
	preStatus = curStatus = chatStatus;
	preChatData = curChatData = _tabList[index];
	
	let nextIndex = index + 1 > _tabList.length - 1 ? 0 : index + 1,
		oprateArr = _tabList.slice(nextIndex, _tabList.length)
		.concat(_tabList.slice(0, nextIndex));
	
	oprateArr.forEach(chatData => {
		//优先切换到新会话
		if(curStatus === ChatStatus.NEW_ALLOCATED)
		{
			if(chatData.chatStatus !== ChatStatus.NEW_ALLOCATED)
				return;
			
			setCurrentChatData(chatData, index);
		}
		//正在会话中
		else if(curStatus === ChatStatus.CHATING && chatData.chatStatus !== ChatStatus.NEW_ALLOCATED)
		{
			if(chatData.chatStatus !== ChatStatus.CHATING)
				return;
			
			setCurrentChatData(chatData, index);
		}
		//关闭
		else if((curStatus === ChatStatus.CLOSED || curStatus === ChatStatus.Exit) && chatData.chatStatus !== ChatStatus.CHATING && chatData.chatStatus !== ChatStatus.NEW_ALLOCATED)
		{
			if(chatData.chatStatus !== ChatStatus.CLOSED && chatData.chatStatus !== ChatStatus.Exit)
				return;
			
			setCurrentChatData(chatData, index);
		}
		//离线
		else if(curStatus === ChatStatus.OFFLINE && chatData.chatStatus === ChatStatus.OFFLINE)
		{
			setCurrentChatData(chatData, index);
		}
		else
		{
			let chatDataVo = chatData.chatDataVo,
				{unreadMsgCount, unreadCountTime} = chatDataVo;
			
			unreadNum = unreadMsgCount;
			waitTime = unreadCountTime;
			curStatus = chatData.chatStatus;
			curChatData = chatData;
		}
	});
	
	if(curChatData.name === _tabList[index].name)
	{
		curChatData = nextSelectedIsSelf(curChatData);
	}
	
	return curChatData;
}

function nextSelectedIsSelf(curChatData)
{
	let {chatDataVo} = curChatData,
		{unreadMsgCount, unreadCountTime} = chatDataVo;
	
	if(unreadMsgCount > 0 || unreadCountTime > 0)
		return curChatData;
	
	for(var i = 0; i < _tabList.length - 1; i++)
	{
		let {chatStatus} = _tabList[i];
		
		if(chatStatus !== curStatus)
			continue;
		
		return _tabList[i];
	}
	
	return curChatData;
}

function setCurrentChatData(value, index)
{
	if(preChatData.name === value.name)
		return;
	
	let chatDataVo = value.chatDataVo,
		{unreadMsgCount, unreadCountTime} = chatDataVo;
	
	if(preStatus === curStatus)
	{
		//比当前选中未读数小，等待时间短 则返回
		if(unreadMsgCount < preunreadNum && (unreadCountTime > prewaitTime && prewaitTime > 0))
			return;
	}
	
	if(unreadMsgCount > unreadNum)
	{
		unreadNum = unreadMsgCount;
		waitTime = unreadCountTime;
		curChatData = value;
	}
	else if(unreadMsgCount === unreadNum)
	{
		if(unreadCountTime > 0 && (waitTime < 0 || unreadCountTime < waitTime))
		{
			waitTime = unreadCountTime;
			curChatData = value;
		}
		else if(unreadCountTime === waitTime)
		{
			if(curChatData === _tabList[index])
			{
				curChatData = value;
			}
		}
	}
}

function getInsertIndex(chatStatus)
{
	if(chatStatus === ChatStatus.OFFLINE || chatStatus === ChatStatus.PROHIBIT)
	{
		return _offlineIndex;
	}
	else if(chatStatus === ChatStatus.CLOSED || chatStatus === ChatStatus.Exit)
	{
		return _closeIndex;
	}
	else if(chatStatus === ChatStatus.NEW_ALLOCATED)
	{
		return _newAllocatedIndex;
	}
	else
	{
		return _chatingIndex;
	}
	
	return -1;
}

function initSort(addStep = 0)
{
	if(addStep !== 0)
	{
		_chatingIndex += addStep;
		_newAllocatedIndex += addStep;
		_closeIndex += addStep;
		_offlineIndex += addStep;
	}
	else
	{
		_chatingIndex = 0;
		_newAllocatedIndex = 0;
		_closeIndex = 0;
		_offlineIndex = 0;
	}
}

/**
 *会话添加或者删除引发index变化
 * @param chatStatus
 * @param step 是否为新增 1 or -1
 */
function indexChange(chatStatus, step = 1)
{
	if(chatStatus === ChatStatus.OFFLINE || chatStatus === ChatStatus.PROHIBIT)
	{
		setOfflineIndex(_offlineIndex + step);
	}
	else if(chatStatus === ChatStatus.CLOSED || chatStatus === ChatStatus.Exit)
	{
		setCloseIndex(_closeIndex + step);
		setOfflineIndex(_offlineIndex + step);
	}
	else if(chatStatus === ChatStatus.NEW_ALLOCATED)
	{
		setNewAllocatedIndex(_newAllocatedIndex + step);
		setCloseIndex(_closeIndex + step);
		setOfflineIndex(_offlineIndex + step);
	}
	else
	{
		setChatingIndex(_chatingIndex + step);
		setNewAllocatedIndex(_newAllocatedIndex + step);
		setCloseIndex(_closeIndex + step);
		setOfflineIndex(_offlineIndex + step);
	}
}

function setOfflineIndex(value)
{
	_offlineIndex = value <= _closeIndex ? _closeIndex : value;
}

function setCloseIndex(value)
{
	_closeIndex = value <= _newAllocatedIndex ? _newAllocatedIndex : value;
}

function setNewAllocatedIndex(value)
{
	_newAllocatedIndex = value <= _chatingIndex ? _chatingIndex : value;
}

function setChatingIndex(value)
{
	_chatingIndex = value <= 0 ? 0 : value;
}

let _tabList = null, _dealMap = null, _chatData;

function mapStateToProps(state)
{
	const {events, startUpData} = state,
		toolFuncsData = startUpData.get("toolFuncsData");
	
	return {events, toolFuncsData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		chatDataClear, chatDataChanged, hasConver,
		sendMessage, tabClosed, tabSelected, requestCooperate,
		requestCooperateAction, requestEvaluate
	}, dispatch);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('NtalkerListRedux', info, log);
}

export default connect(mapStateToProps, mapDispatchToProps)(NtalkerListRedux);
