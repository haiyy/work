import ChatData from "./ChatData";
import ChatDataVo from "../vo/ChatDataVo";
import UserInfo from "../vo/UserInfo";
import RosterUser, { getUserName } from "../vo/RosterUser";
import IChatChannel from "../../apps/chat/api/IChatChannel";
import LogUtil from "../../lib/utils/LogUtil";
import ChatState from "../../apps/chat/chatstate/ChatState";
import ClosedChatState from "../../apps/chat/chatstate/ClosedChatState";
import ActiveChatState from "../../apps/chat/chatstate/ActiveChatState";
import InactiveChatState from "../../apps/chat/chatstate/InactiveChatState";
import ChatPage from "../../apps/chat/ChatPage";
import ChatStatus from "../vo/ChatStatus";
import Settings from "../../utils/Settings";
import { getLangTxt, loginUser, loginUserProxy, sendT2DEvent } from "../../utils/MyUtil";
import SystemSentence from "../vo/sentence/SystemSentence";
import MessageType from "../../im/message/MessageType";
import CooperateData from "../vo/CooperateData";
import { createMessageId } from "../../lib/utils/Utils";
import { CLOSE } from "../../apps/event/TabEvent";
import { urlLoader } from "../../lib/utils/cFetch";
import SystemMessage from "../vo/SystemMessage";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import SessionEvent from "../../apps/event/SessionEvent";
import { chatIsClose, serverTimeGap } from "../../utils/ConverUtils";
import NtalkerEvent from "../../apps/event/NtalkerEvent";
import OpenConverType from "../vo/OpenConverType";
import TranslateProxy from "./TranslateProxy";
import { closeSystemPrompt, sendToMain } from "../../core/ipcRenderer";
import Channel from "../vo/Channel";

class ChatDataManager extends IChatChannel {
	
	static createVersion = 0;
	
	_chatDataVo = null;
	_chatDataState = null;
	_chatDataStateMap = null;
	_predictTimes = 0;
	_predictTimeIndex = -1;
	_predictMaxTimes = 15;
	_selected = false;
	_top = false;
	_hasMoreMsg = false;
	openType = 1;  //默认（访客-被动打开-请求加入会话）
	getReadyMessageArr = [];
	forceClose = false;
	robot = null;
	inputtingTranslate = "";
	
	constructor(store, openType = 1)
	{
		super();
		
		this.emitterChange = this.emitterChange.bind(this);
		
		this.name = "" + ChatDataManager.createVersion++;
		
		this._chatDataVo = new ChatDataVo();
		
		this.openType = openType;
		
		this._initChatDataState();
		
		this._chatDataVo.systemMessage = new SystemMessage("正在加载中...");
		
		this.translate = new TranslateProxy();
		this.translate.on(this.onTranslateComplete.bind(this));
	}
	
	createChatData(userId, memberMap, sessionId, sessionInfo = null, openType)
	{
		try
		{
			log("createChatData userId = " + userId + ", sessionId = " + sessionId);
			
			let userInfo = memberMap.get(userId),
				hasCustomer = this._chatDataVo.hasMember(userId),
				systemMessageStr = "",
				preSessionId = this._chatDataVo.sessionId;
			
			this._chatDataVo.rosterUser = new RosterUser(userInfo);
			
			this._chatDataVo.members = memberMap;
			
			this._chatDataVo.sessionId = sessionId;
			this.openType = openType;
			
			if(!hasCustomer)
			{
				systemMessageStr = this._getSystemMsgForStatus(userInfo);
				
				if(!systemMessageStr)
				{
					systemMessageStr = getUserName(userInfo) + "加入会话";
				}
				
				this._chatDataVo.systemMessage = new SystemMessage(systemMessageStr);
			}
			else
			{
				let msg = this._getSystemMsgForStatus(this._chatDataVo.rosterUser.userInfo);
				
				this._chatDataVo.systemMessage = msg ? new SystemMessage(msg) : null;
			}
			
			this.sessionInfo = sessionInfo;
			
			let chatData = this._chatDataVo.chatDataArray.find(item => item.converId === sessionId);
			
			if(!chatData)
			{
				chatData = new ChatData(this);
				this.openType !== OpenConverType.VISITOR_PASSIVE_REQUEST && chatData.init(sessionId);
				this._chatDataVo.chatDataArray.push(chatData);
				this._chatDataVo.openChatTime = new Date().getTime();
			}
			
			this.getReadyToSend(sessionId);
			
			this.delayToChange();
			
			if(preSessionId === sessionId)
				return;
			
			this.requestHistoryMessage(this.sessionId, 1, 20, true)
			.then(result => {
				if(result)
				{
					this.delayToChange();
				}
			});
		}
		catch(e)
		{
			log("createChatData stack: " + e.stack);
		}
	}
	
	_initChatDataState()
	{
		try
		{
			this._chatDataStateMap = new Map();
			this._chatDataState = new InactiveChatState(this);
			this._chatDataState.handleChatDataStateIn();
			
			this._chatDataStateMap.set(ChatState.INACTIVE_STATE, this._chatDataState)
		}
		catch(e)
		{
			log("_initChatDataState stack: " + e.stack);
		}
	}
	
	addTranslate(message, delay = true)
	{
		if(this.translate)
		{
			this.translate.add(message, delay);
		}
	}
	
	onTranslateComplete(data)
	{
		if(!data || !data.length)
			return;
		
		data.forEach(({messageid, message}) => {
			if(messageid == -1)
			{
				this.inputtingTranslate = message;
			}
			else
			{
				this.chatDataVo.updateTranslate(messageid, message);
			}
		});
		
		this.delayToChange();
	}
	
	_getSystemMsgForStatus(userInfo)
	{
		if(!userInfo)
			return "";
		
		let userName = getUserName(userInfo);
		if(userInfo.chatStatus === ChatStatus.CLOSED || userInfo.chatStatus === ChatStatus.Exit)
		{
			return userName + getLangTxt("consult_closed");
		}
		else if(userInfo.chatStatus === ChatStatus.OFFLINE)
		{
			return userName + getLangTxt("consult_offline");
		}
		
		return "";
	}
	
	get hasMoreMsg()
	{
		return this._hasMoreMsg;
	}
	
	set hasMoreMsg(value)
	{
		this._hasMoreMsg = value;
	}
	
	set inputMessage(value)
	{
		if(this.chatView)
		{
			this.chatView.setInputMessage(value);
		}
	}
	
	set sessionInfo(value)
	{
		if(value)
		{
			this._chatDataVo.sessionInfo = value;
			
			this.delayToChange();
		}
	}
	
	get top()
	{
		return this._top;
	}
	
	set top(value)
	{
		this._top = value;
	}
	
	get status()
	{
		//return ChatStatus.OFFLINE;
	}
	
	get chatStatus()
	{
		if(!this._chatDataVo)
			return this._chatDataVo;
		
		let rosterUser = this._chatDataVo.rosterUser;
		if(rosterUser && rosterUser.userInfo)
		{
			let chatStatus = rosterUser.userInfo.chatStatus;
			if(chatIsClose(chatStatus))  //如果对方已关闭会话, 退出会话, 离线 直接返回状态
				return chatStatus;
			
			if(this._chatDataVo && this._chatDataVo.newconver === 1)
				return ChatStatus.NEW_ALLOCATED;
			
			return rosterUser.userInfo.chatStatus;
		}
		
		return ChatStatus.OFFLINE;
	}
	
	get preChatStatus()
	{
		let rosterUser = this._chatDataVo.rosterUser;
		if(rosterUser && rosterUser.userInfo)
		{
			return rosterUser.userInfo.preChatstatus;
		}
		
		return ChatStatus.OFFLINE;
	}
	
	get openChatTime()
	{
		if(this._chatDataVo)
		{
			return this._chatDataVo.openChatTime;
		}
		
		return -1;
	}
	
	get selected()
	{
		return this._selected;
	}
	
	set selected(value)
	{
		this.setSelected(value);
	}
	
	setSelected(value = false, forceUpdate = true)
	{
		log("ChatDataManager selected value = " + value + ", name = " + this.name);
		
		if(!this._chatDataVo)
			return;
		
		/*if(value)
		{
			this.markRead();
		}*/
		
		if(this._selected !== value || (this._chatDataVo.unreadMsgCount > 0))
		{
			this._selected = value;
			this.switchChatDataState(this._selected ? ChatState.ACTIVE_STATE : ChatState.INACTIVE_STATE);
			
			if(this._chatDataVo)
			{
				/*let {username, siteId} = loginUserProxy();
				
				if(enabledForSelected(siteId) && value && !this._chatDataVo.selected)
				{
					let {userId, userInfo = {}} = this._chatDataVo.rosterUser || {},
						{exterinfo, loginId} = userInfo,
						p_status = "";
					
					if(exterinfo)
					{
						p_status = JSON.parse(exterinfo).p_status || "";
					}
					
					userId = loginId || userId;
					
					console.log("ChatDataManager setSelected userId = ", userId, ", loginId = ", loginId);
					
					//sendZhilianSeleced(username, userId, p_status);
				}
				*/
				this._chatDataVo.setUnreadMsgCount(this._chatDataVo.unreadMsgCount, this._selected, false);
				this._chatDataVo.selected = value;
			}
			
			forceUpdate && this.delayToChange();
		}
	}
	
	/*markRead()
	{
		if(this._chatDataVo.unreadMessageIds.length <= 0)
			return;
		
		let chatData = this._chatDataVo.chatDataArray[0];
		
		if(!chatData)
			return;
		
		//标记消息已读
		this._chatDataVo.unreadMessageIds.forEach(messageid => {
			let message = this._chatDataVo.getMessage(messageid);
			
			if(message && message.userInfo)
			{
				let conversationid = message.sessionID,
					messageid = message.sentenceID,
					userid = message.userInfo.userId;
				
				message.status = MessageType.STATUS_MESSAGE_SEND_READ;
				
				chatData.markRead({conversationid, userid, messageid}, userid);
			}
		});
		
		this._chatDataVo.clearUnreadMessageIds();
	}*/
	
	switchChatDataState(state)
	{
		try
		{
			if(!this._chatDataState || this._chatDataState.chatStateType === state)
				return;
			
			var chatState = this._chatDataStateMap.get(state);
			
			if(!chatState)
			{
				switch(state)
				{
					case ChatState.ACTIVE_STATE:
						chatState = new ActiveChatState(this);
						break;
					
					case ChatState.CLOSED_STATE:
						chatState = new ClosedChatState(this);
						break;
					
					case ChatState.INACTIVE_STATE:
						chatState = new InactiveChatState(this);
						break;
				}
				
				this._chatDataStateMap.set(state, chatState);
			}
			
			this._setChatDataState(chatState);
		}
		catch(e)
		{
			log("switchChatDataState stack: " + e.stack);
		}
	}
	
	get chatDataVo()
	{
		return this._chatDataVo;
	}
	
	get chatView()
	{
		if(this.isCurrentView)
		{
			return ChatPage.instance();
		}
		
		return null;
	}
	
	get isCurrentView()
	{
		return this._chatDataState instanceof ActiveChatState;
	}
	
	addSentenceToOutput(sentence)
	{
		if(this._chatDataVo)
		{
			sentence.sessionID = sentence.sessionID || this._chatDataVo.sessionId;
		}
		
		let added = this._chatDataVo.addSentenceToOutput(sentence);
		
		log("addSentenceToOutput added = " + added + ", sentence.sentenceID = " + sentence.sentenceID);
		
		if(added)
		{
			if(!sentence.bmine)
			{
				this.lastMessageSender = -1;
			}
			
			this._chatDataVo.averageTimeVo.update(sentence);
			
			//if(sentence.sessionID === this._chatDataVo.sessionId)
			//{
			this._chatDataVo.lastReceiveMessage = sentence;
			//}
			
			this.delayToChange();
		}
	}
	
	/**
	 * 发送消息
	 * @param {AbstractChatSentence} sentence 会话ID
	 * @param {Array} to
	 * @param {String} type
	 * */
	sendMessage(sentence, to = null)
	{
		try
		{
			if(!sentence || !this._chatDataVo)
				return;
			
			log("sendMessage...");
			
			this.sendMessageSuccess();
			
			let messageType = sentence.messageType,
				chatDataArray = this._chatDataVo.chatDataArray,
				serialize;
			
			sentence.sessionID = this._chatDataVo.sessionId;
			serialize = sentence.serialize();
			
			if(this.openType !== OpenConverType.VISITOR_PASSIVE_REQUEST)
			{
				chatDataArray.forEach(chatData => {
					if(chatData.converId != sentence.sessionID)
						return;
					
					chatData && chatData.sendMessage(serialize, messageType, sentence.sentenceID);
				});
			}
			else
			{
				this.getReadyMessageArr.push(sentence);
				
				sendT2DEvent({
					listen: SessionEvent.REQUEST_CHAT,
					params: [
						this._chatDataVo.rosterUser.userId, this._chatDataVo.sessionId,
						OpenConverType.VISITOR_PASSIVE_REQUEST_TO_SERVER, null, null, this.templateid
					] //干系人ID, 会话ID, type会话类型
				});
			}
			
			this._chatDataVo.newconver = 0;
			
			this.addSentenceToOutput(sentence);
		}
		catch(e)
		{
			log(["sendMessage e.stack: ", e.stack]);
		}
	}
	
	resendMessage(messageId)
	{
		this.sendMessage(this._chatDataVo.getMessage(messageId));
	}
	
	sendMessageSuccess()
	{
		if(this._chatDataVo)
		{
			this._chatDataVo.setUnreadMsgCount(0, true); //selected == true，强制清空未读消息数量
		}
		
		this.lastMessageSender = 1;  // === 1时，最后一条自己发送的
		
		sendToMain(Channel.NEW_MESSAGE, 3);
	}
	
	/**正在发送消息*/
	requestUserInputing()
	{
		callChatDataMethod.call(this, "requestUserInputing");
	}
	
	/**
	 * 请求协同
	 * @param {int} coopType 协同操作类型
	 * @param {Array} toUsers 协同操作目标对象
	 * @param {String} description 协同操作描述
	 * @return void
	 * */
	requestCooperate(coopType, toUsers, description)
	{
		log(["requestCooperate coopType = " + coopType + ", toUsers = ", toUsers, ", description = " + description]);
		
		let coopData;
		
		if(!this._chatDataVo.cooperateData)
		{
			coopData = new CooperateData();
			coopData.coopType = coopType;
			coopData.targets = toUsers;
			coopData.taskId = CooperateData.createTaskId();
			coopData.vistorname = getUserName(this._chatDataVo.rosterUser.userInfo);
			coopData.description = description;
			coopData.source = {userid: loginUser().userId, showname: getUserName(loginUser().userInfo)};
			
			this._chatDataVo.cooperateData = coopData;
		}
		else
		{
			coopData = this._chatDataVo.cooperateData;
		}
		
		this.chatDataVo.cooperateData = coopData;
		
		this.delayToChange();
		
		callChatDataMethod.call(this, "requestCooperate", coopData.getData());
	}
	
	/**
	 * 协同会话回复
	 * @param {int} operation 对协同会话回复动作
	 * @return void
	 * */
	requestCooperateAction(operation)
	{
		log("requestCooperateAction operation = " + operation);
		
		let cooperateData = this.chatDataVo && this.chatDataVo.cooperateData;
		if(!cooperateData)
			return;
		
		cooperateData.operation = operation;
		
		if(!cooperateData.isSponsor)
		{
			callChatDataMethod.call(this, "requestCooperateAction", cooperateData.getData());
			
			if(CooperateData.ACCEPT === operation)
			{
				this.sendSystemPromptSentence(cooperateData.getCoopMessage(), createMessageId(), SystemSentence.TIP);
			}
			else
			{
				
				GlobalEvtEmitter.emit(CLOSE, [this.name]);
			}
		}
		else
		{
			if(CooperateData.TIMEOUT !== operation)
			{
				callChatDataMethod.call(this, "requestCooperateAction", cooperateData.getData());
			}
			
			this.sendSystemPromptSentence(cooperateData.getCoopMessage(), createMessageId(), SystemSentence.WARN);
		}
		
		closeSystemPrompt(this.name);
		
		this.chatDataVo.cooperateData = null;
		this.delayToChange();
	}
	
	/**邀请评价*/
	requestEvaluation()
	{
		callChatDataMethod.call(this, "requestEvaluation");
	}
	
	/**提交总结*/
	requestSubmitSummary(summary, remark)
	{
		callChatDataMethod.call(this, "requestSubmitSummary", summary, remark);
	}
	
	/**
	 * 请求历史消息
	 * @param {String} converIds
	 * @param {int} countPerpage
	 * @param {int} page
	 * */
	requestHistoryMessage(converIds, page = 1, countPerpage = 20, currentConver = false)
	{
		log(["requestHistoryMessage converIds = ", converIds, ", countPerpage = ", countPerpage, ", page = " + page]);
		
		if(!this._chatDataVo || !this._chatDataVo.rosterUser)
			return;
		
		let url = Settings.getConverHistoryUrl(converIds, page, countPerpage, 0);
		
		return urlLoader(url)
		.then(({jsonResult}) => {
			log(["requestHistoryMessage jsonResult = ", jsonResult]);
			
			if(Array.isArray(jsonResult))
			{
				this._nextPerpage = countPerpage - jsonResult.length;
				
				this._hasMoreMsg = this._nextPerpage <= 0;
				
				this.onNotifyHistoryMessage(jsonResult.reverse());
				
				if(currentConver && this._nextPerpage > 0) //当前会话是否满足20条
				{
					this.requestDestoryConvers();
				}
				else
				{
					this._nextPageNum = page + 1;
				}
				
				return Promise.resolve(true);
			}
			
			return Promise.resolve(false);
		})
	}
	
	/**查询已销毁会话列表，即访客历史消息会话列表*/
	requestDestoryConvers()
	{
		let converListUrl = Settings.getCustomerConverListUrl(this._chatDataVo.rosterUser.userId);
		
		log("requestDestoryConvers converListUrl = " + converListUrl);
		
		urlLoader(converListUrl)
		.then(({jsonResult}) => {
			if(jsonResult)
			{
				if(Array.isArray(jsonResult.converids))
				{
					log(["requestDestoryConvers converids = ", jsonResult.converids]);
					
					let converIds = jsonResult.converids,
						index = converIds.lastIndexOf(this.sessionId);
					
					if(index > -1)
					{
						converIds.splice(index, 1);
					}
					
					this._chatDataVo.destroyedConvers = converIds;
					
					if(converIds.length > 0)
					{
						let perpage = this._nextPerpage;
						this.requestHistoryMessage(converIds.toString(), this._nextPageNum, perpage);
					}
				}
			}
		})
	}
	
	requestHistoryMore()
	{
		let converList = this._chatDataVo.destroyedConvers,
			converIds = !converList ? this.sessionId : (converList.length >= 2 ? converList.toString() : ""); //converList===null => 当前会话还有剩余消息没有加载
		
		if(converIds)
		{
			this.requestHistoryMessage(converIds, this._nextPageNum);
		}
	}
	
	/**消息预知*/
	notifyUserInputing(message)
	{
		callChatDataMethod.call(this, "notifyUserInputing", message);
	}
	
	/**退出会话, 还可以接收消息*/
	leaveSession()
	{
		callChatDataMethod.call(this, "requestLeaveSession");
	}
	
	/**永久退出会话*/
	exitSession()
	{
		callChatDataMethod.call(this, "requestExitSession");
	}
	
	get sessionId()
	{
		if(this._chatDataVo)
		{
			return this._chatDataVo.sessionId;
		}
		
		return null;
	}
	
	/**收到会话信息*/
	onNotifyChatInfo(members, sessionInfo)
	{
		if(this._invalidChatDataState())
			return;
		
		let thisMembers = this._chatDataVo._members;
		
		thisMembers.forEach(value => {
			let index = members.findIndex(v => v.userid === value.userId);
			
			index <= -1 && thisMembers.delete(value.userId)
		});
		
		for(let i = 0, item, len = members.length; i < len; i++)
		{
			item = members[i];
			if(item)
			{
				let result = this._chatDataVo.setMember(new UserInfo(item)),
					systemMessageStr, userInfo = result.userInfo;
				
				if(result.chatStatusChanged && userInfo.chatStatus === ChatStatus.CHATING)
				{
					if(userInfo.userId === loginUserProxy().userId || !UserInfo.isCustomer(userInfo))
						break;
					
					systemMessageStr = this._getSystemMsgForStatus(userInfo);
					
					if(!systemMessageStr)
					{
						systemMessageStr = getUserName(userInfo) + "加入会话";
					}
					
					this.sendSystemPromptSentence(systemMessageStr, createMessageId(), SystemSentence.TIP);
				}
			}
		}
		
		this.sessionInfo = sessionInfo;
		
		let msg = this._getSystemMsgForStatus(this._chatDataVo.rosterUser.userInfo),
			sessionId = sessionInfo.converid;
		
		this._chatDataVo.systemMessage = msg ? new SystemMessage(msg) : null;
		
		this.getReadyToSend(sessionId);
		
		this.delayToChange();
	}
	
	getReadyToSend(sessionId)
	{
		if(this.getReadyMessageArr.length)
		{
			this.getReadyMessageArr.forEach(value => {
				this.chatDataVo.removeFromOutput(value.sessionID, value);
				value.sessionID = sessionId;
				this.sendMessage(value);
			});
			
			this.getReadyMessageArr = [];
		}
	}
	
	onNotifyHistoryMessage(msgArray)
	{
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handleHistoryChatMessage(msgArray);
		
	}
	
	/**
	 * @inheritDoc
	 * */
	onNotifyReceiveMessage(content)
	{
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handleNotifyReceiveMessage(content);
	}
	
	onNotifyMessageDelivered(messageid, status)
	{
		if(this._invalidChatDataState())
			return;
		
		let message = this._chatDataVo.getMessage(messageid);
		
		if(message)
		{
			message.status = status;
		}
		
		this.delayToChange();
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserEnter(userId, userInfo)
	{
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handleUserEnter(userId, userInfo);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserLeave(userId)
	{
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handleUserLeave(userId);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserExit(userId)
	{
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handlerUserExit(userId);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyEvaluationResult(result)
	{
	
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserInputting(message, from = null)
	{
		log("onNotifyUserInputting message = " + message + ", invalidChatDataState = " + this._invalidChatDataState());
		
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handlePredictMessage(message);
		
		if(message)
		{
			startHidePredictMsgTimer.call(this);
		}
		else
		{
			this._predictTimes = 16;
			stopHidePredictMsgTimer.call(this);
		}
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserList(users)
	{
	
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserChanged(userid, userinfo)
	{
		log("onNotifyUserChanged userid = " + userid);
		
		if(this._invalidChatDataState())
			return;
		
		let userInfo = new UserInfo(userinfo),
			rosterUser = this._chatDataVo.rosterUser,
			result = this._chatDataVo.setMember(userInfo),
			username = getUserName(userInfo),
			systemMessageStr = "";
		
		userInfo = result.userInfo;
		
		if(result.isJoin && !(userInfo.userId === loginUserProxy().userId || UserInfo.isCustomer(userInfo)))
		{
			systemMessageStr = username + "加入会话";
		}
		else
		{
			if(userInfo.chatStatus === ChatStatus.CHATING)
			{
				this._chatDataVo.lastReceiveMessage = "会话正在进行中";
			}
			else if(userInfo.preChatstatus !== userInfo.chatStatus)
			{
				systemMessageStr = this._getSystemMsgForStatus(userInfo);
			}
		}
		
		if(systemMessageStr)
		{
			let message = new SystemMessage(systemMessageStr);
			message.id = userInfo.userId;
			
			this.systemMessage = message;
		}
		else
		{
			let systemMessage = this._chatDataVo.systemMessage;
			if(systemMessage && systemMessage.id === userid)
			{
				this.systemMessage = null;
			}
		}
		
		if(rosterUser.userId === userid)
		{
			if(systemMessageStr)
			{
				this._chatDataVo.lastReceiveMessage = systemMessageStr;
			}
			this._chatDataVo.rosterUser.merge(userInfo);
			this.delayToChange();
		}
	}
	
	set systemMessage(value)
	{
		this._chatDataVo.systemMessage = value;
		this.delayToChange();
	}
	
	onNotifyCooperate(coopType, source, vistorname, taskid, description)
	{
		if(this._invalidChatDataState())
			return;
		
		this._chatDataState.handleCooperate(coopType, source, vistorname, taskid, description);
		this.delayToChange();
	}
	
	onNotifyCooperateAction(coopType, operation, targets, description)
	{
		if(this._invalidChatDataState())
			return;
		
		let cooperateData = this.chatDataVo.cooperateData;
		if(!cooperateData)
			return;
		
		let isColse = (cooperateData.isSponsor && coopType === CooperateData.TRANSFER_TYPE && operation === CooperateData.ACCEPT) ||
			!cooperateData.isSponsor && operation === CooperateData.CANCEL;  //发起者&&转接被接受 || 被发起者取消协同
		
		if(isColse)
		{
			GlobalEvtEmitter.emit(CLOSE, [this.name]);
			
			closeSystemPrompt(this.name);
		}
		else
		{
			this._chatDataState.handleCooperateAction(coopType, operation, targets, description);
		}
		
		this.delayToChange();
	}
	
	sendSystemPromptSentence(msg, msgId, errorType = 1, msgTime = 0)
	{
		let sentence = new SystemSentence();
		sentence.sessionID = this.sessionId;
		sentence.sentenceID = msgId;
		sentence.errorType = errorType;
		sentence.status = MessageType.STATUS_MESSAGE_SEND_READ;
		sentence.createTime = (msgTime > 0 ? new Date(msgTime) : new Date()).getTime() - serverTimeGap();
		sentence.messageBody = msg;
		this.addSentenceToOutput(sentence);
	}
	
	_invalidChatDataState()
	{
		if(!this._chatDataState)
			return true;
		
		return this._chatDataState instanceof ClosedChatState;
	}
	
	getRobotList(clear = true)
	{
		if(this._chatDataState)
		{
			return this._chatDataState.getRobotList(clear);
		}
		
		return [];
	}
	
	close()
	{
		log("close...");
		
		this._hasMoreMsg = false;
		this.destroyChatData();
		
		this.switchChatDataState(ChatState.CLOSED_STATE);
		
		if(this._chatDataState)
		{
			this._chatDataState.close();
		}
		
		this._chatDataState = null;
		
		if(this._chatDataStateMap && this._chatDataStateMap.size > 0)
		{
			this._chatDataStateMap.forEach((item) => {
				if(item) item.close();
			});
			this._chatDataStateMap.clear();
			this._chatDataStateMap = null;
		}
		
		if(this._chatDataVo)
		{
			this._chatDataVo.clearData();
			this._chatDataVo = null;
		}
	}
	
	_setChatDataState(chatState)
	{
		try
		{
			if(!chatState)
				return;
			
			log("setChatDataState chatState = " + chatState.chatStateType);
			
			this._chatDataState.handleChatDataStateOut(chatState);
			
			let oldChatDataState = this._chatDataState;
			this._chatDataState = chatState;
			
			this._chatDataState.handleChatDataStateIn(oldChatDataState);
		}
		catch(e)
		{
			log("setChatDataState stack: " + e.stack);
		}
	}
	
	static timeoutId = -1;
	
	delayToChange()
	{
		this.updateTime = new Date().getTime();
		
		if(ChatDataManager.timeoutId > 0)
			return;
		
		ChatDataManager.timeoutId = setTimeout(this.emitterChange, 100);
	}
	
	emitterChange()
	{
		clearTimeout(ChatDataManager.timeoutId);
		ChatDataManager.timeoutId = -1;
		
		GlobalEvtEmitter.emit(NtalkerEvent.CHAT_DATA_CHANGE);
	}
	
	destroyChatData()
	{
		try
		{
			if(!this._chatDataVo.chatDataArray)
			{
				this._chatDataVo.chatDataArray = [];
				return;
			}
			
			this._chatDataVo.chatDataArray.forEach(chatData => {
				chatData && chatData.close();
				chatData = null;
			});
			
			this.inputtingTranslate = "";
		}
		catch(e)
		{
			log("destroyChatData stack: " + e.stack);
		}
	}
}

function startHidePredictMsgTimer()
{
	if(this._predictTimes <= 0)
	{
		this._predictTimeIndex = setInterval(stopHidePredictMsgTimer.bind(this), 2000);
	}
	
	this._predictTimes = 1;
}

function stopHidePredictMsgTimer()
{
	if(this._predictTimes > this._predictMaxTimes)
	{
		this._predictTimes = 0;
		
		if(this._chatDataVo)
		{
			this._chatDataVo.predictMessage = null;
		}
		
		clearInterval(this._predictTimeIndex);
	}
	else
	{
		this._predictTimes += 2;
	}
}

function callChatDataMethod(method, ...arg)
{
	let chatDataArray = this._chatDataVo.chatDataArray;
	
	chatDataArray.forEach(chatData => {
		chatData && chatData[method](...arg);
	});
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("ChatDataManager", info, log);
}

export default ChatDataManager;
