/**
 * 仅仅管理上下行消息，不处理逻辑
 * ChatData implements IChatData,IChatChannel
 * */
import IChatChannel from "../../apps/chat/api/IChatChannel";
import SessionEvent from "../../apps/event/SessionEvent";
import { sendT2DEvent, loginUser } from "../../utils/MyUtil";
import ChatStatus from "../vo/ChatStatus";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";

class ChatData extends IChatChannel {
	
	_chatDataManager = null;
	_channelId = null;
	
	constructor(chatDataManager)
	{
		super();
		
		this._chatDataManager = chatDataManager;
	}
	
	init(sid)
	{
		this._channelId = sid;
		
		GlobalEvtEmitter.emit(SessionEvent.REGISTER_CHANNEL, {channelId: sid, channel: this});
	}
	
	get converId()
	{
		return this._channelId;
	}
	
	/**干系人进入会话（打开聊窗）*/
	requestEnterConversation(sessionId)
	{
		sendT2DEvent({
			listen: SessionEvent.REQUEST_ENTER_CHAT,
			params: [sessionId]
		});
	}
	
	/**
	 * 发送消息
	 * @param {Object} content 消息内容
	 * */
	sendMessage(content, type, messageId = "")
	{
		if(this.callBack && typeof this.callBack.requestSendMessage === 'function' && this._channelId)
		{
			this.callBack.requestSendMessage(this._channelId, content, type, messageId);
		}
	}
	
	/**
	 * 发送消息
	 * @param {Object} content 消息内容
	 * @param {String} toUser
	 * */
	markRead(content, toUser)
	{
		this.callBack.requestMarkreadMessage(content, toUser);
	}
	
	/**
	 * 正在发送消息
	 * @param {Object} content 消息内容
	 * */
	requestUserInputing(content, type)
	{
		if(this.callBack && typeof this.callBack.requestUserInputing === 'function' && this._channelId)
		{
			this.callBack.requestUserInputing(this._channelId, content, type);
		}
	}
	
	/**接管会话*/
	requestSessionTakeover()
	{
		if(this.callBack && typeof this.callBack.requestTakeover === 'function')
		{
			this.callBack.requestTakeover(this._channelId);
		}
	}
	
	/**邀请评价*/
	requestEvaluation()
	{
		if(this.callBack && typeof this.callBack.requestEvaluation === 'function')
		{
			this.callBack.requestEvaluation(this._channelId);
		}
	}
	
	/**提交总结*/
	requestSubmitSummary(summary, remark)
	{
		sendT2DEvent({
			listen: SessionEvent.REQUEST_SUBMIT_SUMMARY,
			params: [this._channelId, summary, remark]
		});
	}
	
	/**消息预知*/
	notifyUserInputing(message)
	{
		if(this.callBack && typeof this.callBack.requestUserInputing === 'function')
		{
			this.callBack.requestUserInputing(this._channelId, message);
		}
	}
	
	/**退出会话*/
	requestExitSession()
	{
		if(this.callBack && typeof this.callBack.requestExitSession === 'function')
		{
			this.callBack.requestExitSession(this._channelId);
		}
	}
	
	/**离开会话*/
	requestLeaveSession()
	{
		if(this.callBack && typeof this.callBack.requestLeaveSession === 'function')
		{
			this.callBack.requestLeaveSession(this._channelId);
		}
	}
	
	requestCooperate(data)
	{
		if(this.callBack && typeof this.callBack.requestCooperate === 'function')
		{
			this.callBack.requestCooperate(this._channelId, data);
		}
	}
	
	requestCooperateAction(cooperateData)
	{
		if(this.callBack && typeof this.callBack.requestCooperateAction === 'function')
		{
			this.callBack.requestCooperateAction(this._channelId, cooperateData);
		}
	}
	
	close()
	{
		if(this._chatDataManager && this._chatDataManager.chatDataVo)
		{
			let selfId = loginUser().userId,
				{members} = this._chatDataManager.chatDataVo;
			
			if(members && members.has(selfId))
			{
				let userInfo = members.get(selfId);
				if(userInfo.chatStatus === ChatStatus.MONITOR)
				{
					this.requestExitSession();
				}
			}
		}
		
		this.requestLeaveSession();
		
		if(this.callBack && typeof this.callBack.unregisterChannel === 'function')
		{
			this.callBack.unregisterChannel(this._channelId);
			this.callBack = null;
		}
	}
	
	get channelId()
	{
		return this._channelId;
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyChatInfo(members, senceInfo)
	{
		this._chatDataManager.onNotifyChatInfo(members, senceInfo);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyHistoryMessage(msgArray)
	{
		this._chatDataManager.onNotifyHistoryMessage(msgArray);
		
		if(this._chatDataManager.isCurrentView)
		{
			this._chatDataManager.markRead();
		}
	}
	
	/**
	 * @inheritDoc
	 * */
	onNotifyReceiveMessage(content)
	{
		this._chatDataManager.onNotifyReceiveMessage(content);
		
	/*	if(this._chatDataManager.isCurrentView)
		{
			this._chatDataManager.markRead();
		}*/
	}
	
	onNotifyMessageDelivered(messageid, status)
	{
		this._chatDataManager.onNotifyMessageDelivered(messageid, status);
	}
	
	onNotifyMessageDelivered(messageid, status)
	{
		this._chatDataManager.onNotifyMessageDelivered(messageid, status);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserEnter(userId, userInfo)
	{
		this._chatDataManager.onNotifyUserEnter(userId, userInfo);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserLeave(userId)
	{
		this._chatDataManager.onNotifyUserLeave(userId);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserExit(userId)
	{
		this._chatDataManager.onNotifyUserExit(userId);
	}
	
	/**
	 * @inheritDoc
	 * */
	onNotifySessionDestroy(from, reason)
	{
	
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyEvaluationResult(result)
	{
		this._chatDataManager.onNotifyEvaluationResult(result);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserInputting(message, from = null)
	{
		this._chatDataManager.onNotifyUserInputting(message, from);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserList(users)
	{
		this._chatDataManager.onNotifyUserList(users);
	}
	
	/**
	 *@inheritDoc
	 * */
	onNotifyUserChanged(uid, userinfo)
	{
		this._chatDataManager.onNotifyUserChanged(uid, userinfo);
	}
	
	onNotifyCooperate(coopType, source, vistorname, taskid, description)
	{
		this._chatDataManager.onNotifyCooperate(coopType, source, vistorname, taskid, description);
	}
	
	onNotifyCooperateAction(coopType, operation, targets, description)
	{
		this._chatDataManager.onNotifyCooperateAction(coopType, operation, targets, description);
	}
}

export default ChatData;
