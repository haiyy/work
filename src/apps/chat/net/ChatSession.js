import LogUtil from "../../../lib/utils/LogUtil";
import IChatChannel from "../api/IChatChannel";
import ServerMethodCode from "./MethodCode";
import MessageACK from "../../../im/message/MessageACK";
import MessageType from "../../../im/message/MessageType";
import { sendT2DEvent } from "../../../utils/MyUtil";
import SessionEvent from "../../event/SessionEvent";

class ChatSession {
	
	constructor(nimCallBack)
	{
		this.nimCallBack = nimCallBack;
		
		this._chatChannelArray = new Map();
		
		this.defaultMessageType = 11;
	}
	
	unregisterChannel(channelId)
	{
		try
		{
			log("unregisterChannel channelId = " + channelId);
			
			if(!channelId)
				return;
			
			let channel = this._chatChannelArray.get(channelId);
			channel.callBack = null;
			this._chatChannelArray.delete(channelId);
		}
		catch(e)
		{
			log('unregisterChannel stack: ' + e.stack);
		}
	}
	
	unregisterAllChannel()
	{
		this._chatChannelArray.clear();
	}
	
	registerChannel(channelId, newChannel)
	{
		log("registerChannel channelId = " + channelId);
		
		if(!channelId || !newChannel || !(newChannel instanceof IChatChannel))
			return;
		
		this._chatChannelArray.set(channelId, newChannel);
		
		newChannel.callBack = this;
	}
	
	/**查询会话信息
	 * @param {String} converid 会话ID
	 * @param {int} infoType 请求会话信息类型。 会话成员列表/会话基本信息/会话全部信息 缺省为会话全部信息。
	 * @param {int} type 消息类型 默认为11
	 * */
	requestConversationInfo(converid, infoType, type = 11)
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteGetConversationInfo, {
				converid, type: infoType
			}, type, MessageACK.ACK, converid);
		}
	}
	
	/**
	 * 发送消息
	 * @param {Object} content 消息内容
	 * @param {int} type 消息类型 默认为11
	 * */
	requestSendMessage(converid, content, type = 11, messageId = "")
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteSendMessage, content, type, MessageACK.SUCCESS_ACK, converid, "", MessageType.MESSAGE_DOCUMENT, messageId);
		}
	}
	
	requestMarkreadMessage(content, toUser = "")
	{
		console.log("requestMarkreadMessage order = " + MessageType.MESSAGE_ORDER, MessageType.STATUS_MESSAGE_SEND_READ);
		
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(null, content, MessageType.STATUS_MESSAGE_SEND_READ, MessageACK.NO_ACK, content.converid, toUser, MessageType.MESSAGE_ORDER);
		}
	}
	
	/**
	 *邀请评价
	 * @param {String} converid 会话ID
	 * */
	requestEvaluation(converid)
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteRequestEvaluation, {converid}, this.defaultMessageType, MessageACK.SUCCESS_ACK, converid);
		}
	}
	
	/**
	 * 发送正在输入
	 * @param {String} converid 会话ID
	 * @param {String} content 正在输入内容
	 * @param {Array} toUsers 目标
	 * @param {String} fromUser
	 * */
	requestUserInputing(converid, content, toUsers = null, fromUser = null)
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteUserInputing, {
				converid, content, toUsers, fromUser
			}, this.defaultMessageType, MessageACK.NO_ACK, converid);
		}
	}
	
	/**
	 * 禁言
	 * @param {String} converid
	 * @param {Array} targets 禁言成员
	 * @param {Boolean} enableSendMessage 禁言/解禁
	 * @param {String} fromUser
	 * */
	requestProhibit(converid, targets, enableSendMessage, fromUser)
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteTransferSession, {
				converid, enableSendMessage, targets, fromUser
			}, this.defaultMessageType, MessageACK.SUCCESS_ACK, converid);
		}
	}
	
	/**请求离开会话*/
	requestLeaveSession(converid)
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteLeaveSession, {converid}, this.defaultMessageType, MessageACK.ACK, converid);
		}
	}
	
	/**请求退出会话*/
	requestExitSession(converid)
	{
		if(this.nimCallBack)
		{
			this.nimCallBack.publish(ServerMethodCode.remoteExitSession, {converid}, this.defaultMessageType, MessageACK.ACK, converid);
		}
	}
	
	requestCooperate(converid, data)
	{
		if(this.nimCallBack)
		{
			data.converid = converid;
			
			this.nimCallBack.publish(ServerMethodCode.remoteCooperate, data,
				this.defaultMessageType, MessageACK.SUCCESS_ACK, converid);
		}
	}
	
	requestCooperateAction(converid, cooperateData)
	{
		if(this.nimCallBack)
		{
			cooperateData.converid = converid;
			this.nimCallBack.publish(ServerMethodCode.remoteCooperateAction, cooperateData,
				this.defaultMessageType, MessageACK.SUCCESS_ACK, converid);
		}
	}
	
	/**
	 *会话信息
	 */
	onNotifyChatInfo(sid, members, sessionInfo)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyChatInfo(members, sessionInfo);
		}
	}
	
	/**
	 *接收消息
	 * @param {String} sid
	 * @param {Object} content 消息信息
	 */
	onNotifyReceiveMessage(sid, content, methodId = undefined)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			content && channel.onNotifyReceiveMessage(content);
		}
		else
		{
			if(methodId === 5003)
			{
				sendT2DEvent({
					listen: SessionEvent.REQUEST_ENTER_CHAT,
					params: [sid]
				});
			}
		}
	}
	
	onNotifyMessageDelivered(converid, messageid, status)
	{
		let channel = this._chatChannelArray.get(converid);
		if(channel && messageid)
		{
			channel.onNotifyMessageDelivered(messageid, status);
		}
	}
	
	/**
	 *对方正在输入
	 */
	onNotifyUserInputting(sid, message, from)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyUserInputting(message, from);
		}
	}
	
	/**接收历史消息*/
	onNotifyHistoryMessage(sid, msgArray)
	{
		log(["onNotifyHistoryMessage sid = " + sid, msgArray]);
		
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyHistoryMessage(msgArray);
		}
	}
	
	/**
	 * 进入会话
	 * */
	onNotifyUserEnter(sid, userId, userInfo)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyUserEnter(userId, userInfo);
		}
	}
	
	/**
	 * 用户离开会话
	 * */
	onNotifyUserLeave(sid, userId)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyUserLeave(userId);
		}
	}
	
	/**
	 * 用户离开会话
	 * */
	onNotifyUserExit(sid, userId)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyUserExit(userId);
		}
	}
	
	/**用户列表*/
	onNotifyUserList(sid, users)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyUserList(users);
		}
	}
	
	/**会话成员信息变化事件*/
	onNotifyUserChanged(sid, userId, userinfo)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyUserChanged(userId, userinfo);
		}
	}
	
	/**
	 * 会话被强制终止
	 * */
	onNotifySessionDestroy(sid, from, reason)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifySessionDestroy(from, reason);
		}
	}
	
	/**
	 * 邀请评价结果
	 * */
	onNotifyEvaluationResult(sid, result)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyEvaluationResult(result);
		}
	}
	
	onNotifySystemMessage(sid, subtype, message, expiredtime, callbackoperation, msglevel, messageId)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifySystemMessage(subtype, message, expiredtime, callbackoperation, msglevel, messageId);
		}
	}
	
	/**
	 *转接动作
	 */
	onNotifyTransferAction(sid, action, srcId, sessionID, type, reason)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyTransferAction(action, srcId, sessionID, type, reason);
		}
	}
	
	/**
	 *会话被接管
	 */
	onNotifyTakeover(sid)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyTakeover();
		}
	}
	
	onNotifyCooperate(sid, coopType, source, vistorname, taskid, description)
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyCooperate(coopType, source, vistorname, taskid, description);
		}
	}
	
	onNotifyCooperateAction(sid, cooptype, operation, targets = null, description = "")
	{
		let channel = this._chatChannelArray.get(sid);
		if(channel)
		{
			channel.onNotifyCooperateAction(cooptype, operation, targets, description);
		}
	}
	
	hasChannel(id)
	{
		return this._chatChannelArray.has(id);
	}
	
	destroy()
	{
		this._chatChannelArray.clear();
		this.nimCallBack = null;
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('ChatSession', info, log);
}

export default ChatSession;
