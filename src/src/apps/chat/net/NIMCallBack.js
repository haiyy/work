import T2DSession from "./AppSession";
import TChatSession from "./ChatSession";
import NIMMessage from "../../../im/message/NIMMessage";
import INIMCallBack from "../../../im/api/INIMCallBack";
import { sendT2DEvent } from "../../../utils/MyUtil";
import LogUtil from "../../../lib/utils/LogUtil";
import Model from "../../../utils/Model";
import LoginUserProxy from "../../../model/proxy/LoginUserProxy";
import NIMCode from "../../../im/error/NIMCode";
import SessionEvent from "../../event/SessionEvent";
import MessageType from "../../../im/message/MessageType";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import ConnectStatus from "../../../im/connect/ConnectStatus";
import TranslateProxy from "../../../model/chat/TranslateProxy";

class NIMCallBack extends INIMCallBack {
	
	_nimClient = null;
	
	chatSession = null; //分管会话消息
	appSession = null; //分管app消息
	siteId = '';
	userId = '';
	token = '';
	version = '';
	head = null;
	
	constructor(client)
	{
		super();
		
		this.client = client;
		
		this.onRegisterChannel = this.onRegisterChannel.bind(this);
		
		GlobalEvtEmitter.on(SessionEvent.REGISTER_CHANNEL, this.onRegisterChannel);
	}
	
	set client(value)
	{
		this._nimClient = value;
	}
	
	get client()
	{
		return this._nimClient;
	}
	
	init(siteId, userId, token, version)
	{
		this.siteId = siteId;
		this.userId = userId;
		this.token = token;
		this.version = version;
		
		if(!this.appSession)
		{
			this.appSession = new T2DSession(this);
		}
		
		if(!this.chatSession)
		{
			this.chatSession = new TChatSession(this);
		}
		
		if(!this.methods)
		{
			this.methods = {
				34: this.remoteNotifyUserEnter.bind(this),  // 成员加入会话MessageType.STATUS_CONVERSATION_MEMBER_JOIN
				35: this.remoteNotifyUserLeave.bind(this),  // 成员离开会话MessageType.STATUS_CONVERSATION_MEMBER_LEAVE
				3021: this.remoteNotifyHistoryMessage.bind(this),
				3022: this.remoteNotifySummary.bind(this),
				3023: this.remoteNotifyUserExit.bind(this),
				5000: this.remoteNotifyUserList.bind(this),  //接收会话列表remoteNotifyConversationList
				5001: this.remoteNotifyChatInfo.bind(this),  //接收会话信息remoteNotifyConversationInformation
				5003: this.remoteNotifyReceiveMessage.bind(this),  //remoteNotifySendMessage
				5004: this.remoteNotifyUserInputting.bind(this),  //会话消息预知事件remoteNotifyOnPredictMessage
				5005: this.remoteNotifyEvaluationResult.bind(this),  //接收评价内容
				5006: this.remoteNotifyConversationMemberInfo.bind(this),//会话成员信息变化事件
				5007: this.remoteNotifySessionDestroy.bind(this), //会话终止事件remoteNotifyConversationTerminated
				5008: this.remoteNotifyUserInformation.bind(this), //接收干系人信息变化事件
				5009: this.remoteNotifySystemMsg.bind(this), //remoteNotifyNotification接收干系人信息变化事件
				5013: this.remoteNotifyFilterSensitiveWords.bind(this), //  该接口用于客服发送消息后过滤敏感词信息。
				5020: this.remoteNotifyCooperate.bind(this),  //收到被协同操作通知
				5021: this.remoteNotifyCooperateAction.bind(this),  //协同操作结果
				6003: this.remoteNotifyTimeoutConver.bind(this),  //接收已超时的会话列表[待处理]
				6201: this.remoteNotifySystemMessage.bind(this),  //全局系统消息
			};
		}
	}
	
	/**
	 * @inheritDoc
	 * */
	onMessageArrivedHandler(message)
	{
		try
		{
			if(!this.appSession || !this.chatSession || !message)
				return;
			
			log(["onMessageArrivedHandler message = ", message]);
			
			if(message instanceof NIMMessage)
			{
				message = message.content;
			}
			
			let method, body, nimMessage;
			
			if(typeof message === "string")
			{
				nimMessage = JSON.parse(message);
			}
			else
			{
				nimMessage = message;
			}
			
			method = nimMessage.m;
			body = nimMessage.body;
			
			if(this.methods && typeof this.methods[method] === 'function')
			{
				this.methods[method](body);
			}
		}
		catch(e)
		{
			log('onMessageArrivedHandler e.stack = ' + e.stack);
		}
	}
	
	/**
	 * 发布消息
	 * @param {String} method 方法名
	 * @param {Object} body 请求参数列表
	 * @param {int} type 消息类型
	 * @param {int} bAck 是否需要确认发送成功
	 * @param {String} toUser - 向某个人发送
	 * @param {String} toConverid - 向某个会话发送
	 * @param {String} messageType - 向IM发送的消息类型，即交互方式（转发还是请求，MessageType.MESSAGE_DOCUMENT，MessageType.MESSAGE_REQUEST）
	 * */
	publish(method, body, type, bAck = 0, toConverid = "", toUser = "", messageType = MessageType.MESSAGE_DOCUMENT, messageId = "")
	{
		try
		{
			if(messageType === MessageType.MESSAGE_DOCUMENT)
			{
				let head = this.getHead(),
					payLoad = {head, body};
				
				head.m = method;
				
				//默认选择发向待客云（NDolphin）
				toUser = toUser ? toUser : this.siteId + ":NDolphin";
				
				this.client.publish(payLoad, type, bAck, toConverid, toUser, messageType, messageId);
			}
			else if(messageType === MessageType.MESSAGE_ORDER)
			{
				this.client.publish(body, type, bAck, toConverid, toUser, messageType);
			}
			else
			{
				this.client.publish("", type, bAck, "", "", messageType, messageId);
			}
		}
		catch(e)
		{
			log('publish stack: ' + e.stack);
		}
	}
	
	/**
	 * @inheritDoc
	 * */
	onMessageDeliveredHandler(content, send)
	{
		let {converid, messageid} = content;
		
		if(converid)
		{
			this.chatSession.onNotifyMessageDelivered(converid, messageid, send);
		}
	}
	
	/**
	 * @inheritDoc
	 * */
	onConnectStatusHandler(connectStatus, errorCode = -1)
	{
		super.onConnectStatusHandler(connectStatus, errorCode);
		
		GlobalEvtEmitter.emit(SessionEvent.CONNECT_STATUS, {connectStatus, errorCode});
		
		switch(connectStatus)
		{
			case ConnectStatus.ST_CONNECTED:
				if(errorCode === NIMCode.HANDLE_SHARK)
				{
					this.requestUpdateUserStatus();
					this.requestGetUserInfo();
					
					sendT2DEvent({listen: SessionEvent.REQUEST_NOTDESTROYED_COVERS, params: []});
				}
				break;
			
			case NIMCode.RECONNECTING_ERROR:
				
				break;
			
			case NIMCode.RECONNECT_FAILED_ERROR:
				//appSession.onNotifyNetWork(connectStatus, errorCode);
				break;
		}
	}
	
	getHead()
	{
		if(!this.head)
		{
			this.head = {};
			this.head.e = this.siteId;
			this.head.u = this.userId;
			this.head.v = this.version;
			this.head.l = TranslateProxy.LANGUAGE || "zh-cn";
		}
		
		let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME),
			token = loginUserProxy.ntoken;
		
		this.head.t = token;
		
		return this.head;
	}
	
	onRegisterChannel(data)
	{
		try
		{
			this.chatSession.registerChannel(data.channelId, data.channel);
		}
		catch(e)
		{
			log('onRegisterChannel stack: ' + e.stack);
		}
	}
	
	requestGetUserInfo(userId = null)
	{
		log("requestGetUserInfo...");
		
		let tUserId = userId ? userId : this.userId;
		
		sendT2DEvent({
			listen: SessionEvent.REQUEST_USERINFO,
			params: [tUserId]
		});
	}
	
	requestUpdateUserStatus()
	{
		let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME);
		
		log("requestUpdateUserStatus...", sessionStorage.getItem("loginStatus") || loginUserProxy.loginStatus);
		
		
		
		sendT2DEvent({
			listen: SessionEvent.REQUEST_UPDATE_USERSTATUS,
			params: [sessionStorage.getItem("loginStatus") || loginUserProxy.loginStatus]
		});
	}
	
	remoteNotifyUserList(body)
	{
		try
		{
			let {conversations = []} = body;
			
			conversations.forEach(value => {
				let {converid} = value,
					timeOutID = setTimeout(() => {
						if(converid)
						{
							sendT2DEvent({
								listen: SessionEvent.REQUEST_ENTER_CHAT,
								params: [converid]
							});
						}
						
						clearTimeout(timeOutID);
						timeOutID = -1;
					}, 10);
			});
		}
		catch(e)
		{
			log('onNotifyUserList stack: ' + e.stack);
		}
	}
	
	remoteNotifySystemMessage(body)
	{
		try
		{
			let {converid, msgtype} = body;
			
			if(converid)
			{
				body.msgtype = MessageType.MESSAGE_DOCUMENT_COMMAND;
				body.systemtype = msgtype;
				
				this.chatSession.onNotifyReceiveMessage(converid, body, 6201);
			}
		}
		catch(e)
		{
			log('remoteNotifySystemMessage stack: ' + e.stack);
		}
	}
	
	/**接收消息*/
	remoteNotifyReceiveMessage(body)
	{
		this.chatSession.onNotifyReceiveMessage(body.converid, body, 5003);
	}
	
	/**接收到会话信息 remoteNotifyConversationInfo*/
	remoteNotifyChatInfo(body)
	{
		let members = body.conversationInfo.members,
			sessionInfo = body.conversationInfo,
			sid = body.converid;
		
		if(this.chatSession.hasChannel(sid))
		{
			this.chatSession.onNotifyChatInfo(sid, members, sessionInfo);
		}
		else
		{
			this.appSession.onNotifyChatInfo(sid, members, sessionInfo);
		}
	}
	
	/**评价会话结果*/
	remoteNotifyEvaluationResult(body)
	{
		this.chatSession.onNotifyEvaluationResult(body.converid, body.evaluationResult);
	}
	
	/**用户进入会话*/
	remoteNotifyUserEnter(body)
	{
		this.chatSession.onNotifyUserEnter(body.converid, body.userid, body.fromUser);
	}
	
	/**用户离开会话*/
	remoteNotifyUserLeave(body)
	{
		this.chatSession.onNotifyUserLeave(body.converid, body.userid);
	}
	
	/**用户退出会话*/
	remoteNotifyUserExit(body)
	{
		this.chatSession.onNotifyUserExit(body.converid, body.userid);
	}
	
	/**对方正在输入 remoteNotifyOnPredictMessage*/
	remoteNotifyUserInputting(body)
	{
		this.chatSession.onNotifyUserInputting(body.converid, body.message);
	}
	
	/**收到会话历史消息*/
	remoteNotifyHistoryMessage(body)
	{
		this.chatSession.onNotifyHistoryMessage(body.converid, body.messages);
	}
	
	/**会话被强制终止remoteNotifyConversationTerminated*/
	remoteNotifySessionDestroy(body)
	{
		this.chatSession.onNotifySessionDestroy(body.converid, body.from, body.reason);
	}
	
	/**会话成员信息变化事件*/
	remoteNotifyConversationMemberInfo(body)
	{
		let {converid, member: {userid}} = body;
		this.chatSession.onNotifyUserChanged(converid, userid, body.member);
	}
	
	/**会话总结*/
	remoteNotifySummary(body)
	{
	}
	
	/**用户信息更新*/
	remoteNotifyUserInformation(body)
	{
		this.appSession.onNotifyUserInformation(body);
	}
	
	/**接收干系人信息变化事件*/
	remoteNotifySystemMsg(body)
	{
	
	}
	
	/**
	 * 接收已超时的会话列表[待处理]
	 * */
	remoteNotifyTimeoutConver(body)
	{
		let {conversations} = body;
		
		this.appSession.onNotifyGetDestroyConver(conversations);
	}
	
	remoteNotifyCooperate(body)
	{
		this.chatSession.onNotifyCooperate(body.converid, body.cooptype, body.source, body.vistorname, body.taskid, body.description);
	}
	
	remoteNotifyCooperateAction(body)
	{
		this.chatSession.onNotifyCooperateAction(body.converid, body.cooptype, body.operation, body.targets, body.description);
	}
	
	remoteNotifyFilterSensitiveWords(body)
	{
		this.chatSession.onNotifyFilterSensitiveWords(body.converid, body.messageid, body.sensitiveWord, body.message, body.createdat);
	}
	
	destroy()
	{
		super.destroy();
		
		if(this.appSession)
		{
			this.appSession.destroy();
		}
		
		if(this.chatSession)
		{
			this.chatSession.destroy();
		}
		
		this.chatSession = null;
		this.appSession = null;
		
		this.head = null;
		
		this._nimClient = null;
		
		this.methods = null;
		
		GlobalEvtEmitter.removeListener(SessionEvent.REGISTER_CHANNEL, this.onRegisterChannel);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('NIMCallBack', info, log);
}

export default NIMCallBack;
