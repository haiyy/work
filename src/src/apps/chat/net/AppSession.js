import LogUtil from "../../../lib/utils/LogUtil";
import MessageACK from "../../../im/message/MessageACK";
import MethodCode from "./MethodCode";
import NtalkerEvent from "../../event/NtalkerEvent";
import SessionEvent from "../../event/SessionEvent";
import Model from "../../../utils/Model";
import UserStatus from "../../../model/vo/UserStatus";
import MessageType from "../../../im/message/MessageType";
import LoginUserProxy from "../../../model/proxy/LoginUserProxy";
import APPEvent from "../../event/APPEvent";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import OpenConverType from "../../../model/vo/OpenConverType";

class AppSession {
	
	constructor(nimCallBack)
	{
		this.nimCallBack = nimCallBack;
		
		this.handlerEvent = this.handlerEvent.bind(this);
		
		GlobalEvtEmitter.on(NtalkerEvent.T2D, this.handlerEvent);
		
		this.initSession();
	}
	
	initSession()
	{
		if(!this.methods)
		{
			this.methods = {
				[SessionEvent.REQUEST_ENTER_CHAT]: this.requestEnterChat.bind(this),  //干系人进入会话（打开聊窗）
				[SessionEvent.REQUEST_JOIN_CHAT]: this.requestJoinConversation.bind(this),  //请求加入会话
				[SessionEvent.REQUEST_CHAT]: this.requestChat.bind(this),  //请求会话资源
				[SessionEvent.REQUEST_SUBMIT_SUMMARY]: this.requestSubmitSummary.bind(this),  //提交会话总结
				[SessionEvent.REQUEST_USERLIST]: this.requestUserList.bind(this),  //查询供给方干系人列表
				[SessionEvent.REQUEST_USERINFO]: this.requestUserInfo.bind(this),  //请求用户信息
				[SessionEvent.REQUEST_DESTROY_SESSION]: this.requestDestroySession.bind(this),  //请求会话销毁
				[SessionEvent.REQUEST_KICKOUT_USER]: this.requestKickoutUser.bind(this),  //请求移除会话成员
				[SessionEvent.REQUEST_UPDATE_USERSTATUS]: this.requestUpdateUserStatus.bind(this),  //请求更新用户状态
				[SessionEvent.REQUEST_DISCONNECT]: this.requestDisconnect.bind(this),
				[SessionEvent.REQUEST_NOTDESTROYED_COVERS]: this.requestNotDestroyedCovers.bind(this),
			}
		}
	}
	
	handlerEvent(data)
	{
		try
		{
			log(["handlerEvent data = ", data]);
			
			if(!data || !data.listen || !this.nimCallBack)
				return;
			
			if(typeof this.methods[data.listen] === "function")
			{
				this.methods[data.listen](...data.params);
			}
		}
		catch(e)
		{
			log('handlerEvent stack: ' + e.stack);
		}
	}
	
	/**
	 * 请求会话资源
	 * @param {String} userid 干系人id
	 * @param {JSON} converId 会话
	 * @param {int} type 发起人 2：客服发起会话（目标：访客）
	 * */
	requestChat(userid, converid, type, a, b, templateid)
	{
		if(type !== OpenConverType.VISITOR_PASSIVE_REQUEST)
		{
			this.nimCallBack.publish(MethodCode.remoteRequestChat, {
				userid, converid, type: 2, templateid
			}, defaultMessageType, MessageACK.SUCCESS_ACK);
		}
	}
	
	/**
	 * 干系人进入会话（打开聊窗）
	 * @param {String} converid 目标Id：企业ID，接待组ID，干系人ID
	 * */
	requestEnterChat(converid)
	{
		this.nimCallBack.publish(MethodCode.remoteEnterConversation, {converid}, defaultMessageType, MessageACK.SUCCESS_ACK);
	}
	
	/**查询供给方干系人列表*/
	requestUserList(status)
	{
		this.nimCallBack.publish(MethodCode.remoteUserList, {status}, defaultMessageType, MessageACK.ACK);
	}
	
	/**
	 * 请求用户信息
	 * @param {String} userid
	 * */
	requestUserInfo(userid)
	{
		this.nimCallBack.publish(MethodCode.remoteGetUserInfo, {userid}, defaultMessageType, MessageACK.SUCCESS_ACK);
	}
	
	/**请求会话销毁*/
	requestDestroySession(converid, reason)
	{
		this.nimCallBack.publish(MethodCode.remoteDestroySession, {
			converid, reason
		}, defaultMessageType, MessageACK.SUCCESS_ACK, converid);
	}
	
	/**请求移除会话成员
	 * @param {String} converid
	 * @param {JSON} fromUser
	 * @param {Array} toUsers
	 * */
	requestKickoutUser(converid, toUsers, fromUser = null)
	{
		this.nimCallBack.publish(MethodCode.remoteKickoutUser, {
			converid, fromUser, toUsers
		}, defaultMessageType, MessageACK.SUCCESS_ACK, converid);
	}
	
	/**请求增加会话成员
	 * @param {String} converid
	 * @param {JSON} fromUser
	 * @param {Array} toUsers
	 * */
	requestAddMember(converid, toUsers, fromUser = null)
	{
		this.nimCallBack.publish(MethodCode.remoteAddConversationMember, {
			converid, fromUser, toUsers
		}, defaultMessageType, MessageACK.SUCCESS_ACK, converid);
	}
	
	/**请求加入会话
	 * @param {String} converid 会话ID
	 * @param {int} type = 0 会话类型: 0 => 以普通会话成员方式进入会话  1=> 以监控身份进入会话
	 * @return void
	 * userId, memberMap, converId, sessionInfo, isCurrentWnd, openType
	 * */
	requestJoinConversation(userId, memberMap, converid, sessionInfo, isCurrentWnd, type)
	{
		this.nimCallBack.publish(MethodCode.remoteJoinConversation, {
			converid, type
		}, defaultMessageType, MessageACK.SUCCESS_ACK, converid);
	}
	
	/**请求会话列表*/
	requestChatList(target, order)
	{
		this.nimCallBack.publish(MethodCode.remoteGetUserConversation, {
			target, order
		}, defaultMessageType, MessageACK.SUCCESS_ACK);
	}
	
	/**
	 * 提交会话总结
	 * @param {String} converid 会话ID
	 * @param {Array} summary 总结
	 * @param {String} remark 备注
	 * @return void
	 * @example
	 * summary = [ { "id":"总结条目id", "content":"总结内容" }...]
	 *
	 * 1. Redux::submitSummary([summary, remark])
	 * 2. sendT2DEvent({
 *       listen: SessionEvent.REQUEST_SUBMIT_SUMMARY,
 *       params: [converid, summary, remark]
 * });
	 * */
	requestSubmitSummary(converid, summary, remark)
	{
		this.nimCallBack.publish(MethodCode.remoteSubmitSummary, {
			converid, summary, remark
		}, defaultMessageType, MessageACK.SUCCESS_ACK, converid);
	}
	
	/**
	 * 请求更新用户状态
	 * @param {String} userid 用户信息
	 * @param {int} status 用户状态 0：离线1：在线 2：隐身；3：忙碌 4：离开
	 * */
	requestUpdateUserStatus(status, userid = null)
	{
		this.nimCallBack.publish(MethodCode.remoteUpdateUserStatus, {
			status, userid
		}, defaultMessageType, MessageACK.SUCCESS_ACK);
	}
	
	requestNotDestroyedCovers()
	{
		this.nimCallBack.publish(MethodCode.requestNotDestroyedCovers, {}, defaultMessageType, MessageACK.NO_ACK);
	}
	
	requestDisconnect()
	{
		log("requestDisconnect...");
		
		this.requestUpdateUserStatus(UserStatus.OFFLINE);
		
		this.nimCallBack.publish("", null, "", 0, "", "", MessageType.MESSAGE_DISCONNECT);
		
		let loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);
		if(!loginProxy)
			return;
		
		loginProxy.loginCode = -1; //loginCode无效
	}
	
	/**
	 * 查询企业供给方干系人list
	 * @param {int} page当前页数
	 * @param {int} rp 请求数据数量
	 * @param {Array} users  用户列表
	 * */
	onNotifyUserList(page, rp, users)
	{
	}
	
	/**
	 *会话信息
	 */
	onNotifyChatInfo(sid, members, sessionInfo)
	{
		let message = {sid, members, sessionInfo, listen: SessionEvent.CHAT_INFO};
		
		GlobalEvtEmitter.emit(NtalkerEvent.CONSULT_RECEPTION, message);
	}
	
	/**
	 * 用户信息更新
	 */
	onNotifyUserInformation(userInfoStr)
	{
		let message = {userInfoStr, listen: SessionEvent.NOTIFY_USERINFO_UPDATE};
		GlobalEvtEmitter.emit(NtalkerEvent.CONSULT_RECEPTION, message);
	}
	
	onNotifyNetWork(connectStatus, errorCode = -1)
	{
		let title = "网络", code = connectStatus;
		
		GlobalEvtEmitter.emit(NtalkerEvent.NETWORK_STATUS, {title, code});
	}
	
	onNotifyGetDestroyConver(totalcount, pagenumbers, page, rp, customers)
	{
		GlobalEvtEmitter.emit(APPEvent.NOTIFY_GET_DESTROY_CONVER, {totalcount, pagenumbers, page, rp, customers});
	}
	
	onNotifyTimeoutConver(customers)
	{
		//GlobalEvtEmitter.emit(APPEvent.NOTIFY_TIMEOUT_CONVER, {customers});
	}
	
	destroy()
	{
		GlobalEvtEmitter.removeListener(NtalkerEvent.T2D, this.handlerEvent);
		
		this.methods = null;
		
		this.nimCallBack = null;
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('AppSession', info, log);
}

let defaultMessageType = 11;

export default AppSession;