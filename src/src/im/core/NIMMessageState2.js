import NIMMessageDeal from "./NIMMessageDeal";
import NetworkMessage from "../message/http/NetworkMessage";
import MessageType from "../message/MessageType";
import ObjectPool from "../../lib/utils/ObjectPool";
import { createMessageId } from "../../lib/utils/Utils";
import NIMMessage from "../message/NIMMessage";
import NIMMessageState from "./NIMMessageState";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import LogUtil from "../../lib/utils/LogUtil";

class NIMMessageState2 extends NIMMessageDeal {
	
	mode = 1; //1为正常  2为辅助
	
	nextCheckInterval = 10 * 1000; //10s
	
	static versionId = -1;
	
	constructor(nimHttpCon)
	{
		super(nimHttpCon);
		
		this.nextVersionId = NIMMessageState2.versionId;
		
		NIMMessageDeal.MINE = "NIMMessageState2";
	}
	
	/**
	 *接收消息
	 *@param {NetworkMessage} message
	 */
	messageArrived(networkMsg, pull = false)
	{
		if(!networkMsg)
			return;
		
		let {message, messageType, messageid} = networkMsg;
		
		log(["messageArrived message = ", message]);
		
		if(!message)
			return;
		
		this.emit(NIMMessageState.KEEPALIVE_SUCCESS);
		
		if(message.versionid < NIMMessageState2.versionId)
			return;
		
		message.versionid >= this.nextVersionId && (NIMMessageState2.versionId = this.nextVersionId = message.versionid + 1);
		
		switch(messageType)
		{
			case MessageType.MESSAGE_DOCUMENT:
				this.returnOrder(networkMsg);
				
				GlobalEvtEmitter.emit(NIMMessageState.MESSAGE_ARRIVED, {message: networkMsg});
				return;
			
			case MessageType.MESSAGE_ORDER:
				let {type, content} = message;
				
				if(type === MessageType.STATUS_MESSAGE_SEND_SENT || type === MessageType.STATUS_MESSAGE_SEND_RECEIVED)
				{
					messageid = message.targetid || messageid;
					
					this.messageIMDelivered(messageid, type, content);
				}
				
				NetworkMessage.release(networkMsg);
				break;
			
			case MessageType.MESSAGE_RESULT:
				this.dealResultMessage(networkMsg);
				return;
		}
	}
	
	returnOrder(message)
	{
		let {messageid, fromUser} = message,
			content = {userid: fromUser};
		
		if(fromUser === "NDolphin" || !fromUser)
			return;
		
		let nimMessage = ObjectPool.getObject(NIMMessage.CLASS_NAME);
		
		nimMessage.messageType = MessageType.MESSAGE_ORDER;
		nimMessage.content = JSON.stringify(content);
		nimMessage.toUser = fromUser;
		nimMessage.type = MessageType.STATUS_MESSAGE_SEND_RECEIVED;
		nimMessage.targetid = messageid;
		nimMessage.messageId = createMessageId();
		
		this.emit(NIMMessageState.PUBLISH, nimMessage);
	}
	
	dealResultMessage(value)
	{
		if(!value || !value.message)
			return;
		
		let message = value.message,
			{type, result} = message,
			content = message.getContent();
		
		switch(type)
		{
			case MessageType.RESULT_MESSAGE_KICK_OFF:
				log("NIMMessageState dealResultMessage 不小心被踢了");
				GlobalEvtEmitter.emit(NIMMessageState.KICK_OFF);
				break;
			
			case MessageType.RESULT_MESSAGE_NEXTCHECK_SET:
				if(!content) return;
				
				this.resetPullMessage(content);
				break;
			
			case MessageType.RESULT_MESSAGE_HANDLESHAKE:
				if(content)
				{
					this.resetPullMessage(content, false);
				}
				
				if(result)
				{
					this.emit(NIMMessageState.HANDLE_SHARK);
					
					this.forceSending();
				}
				else
					log("握手异常！！！");
				break;
		}
		
		NetworkMessage.release(value);
	}
	
	resetPullMessage({maxVersion, versionid, nextCheckInterval}, delay = true)
	{
		if((!maxVersion && !versionid) || !nextCheckInterval)
			return;
		
		let preCheckInterval = this.nextCheckInterval;
		this.nextCheckInterval = nextCheckInterval > 0 ? nextCheckInterval : 10 * 1000;
		
		if(this.nextVersionId <= -1)
		{
			NIMMessageState2.versionId  = this.nextVersionId = versionid || maxVersion;
			
			this.nextVersionId += 1;
		}
		
		log("resetPullMessage nextVersionId = " + this.nextVersionId);
		
		if(!this.nextVersionId)
		{
			log("resetPullMessage nextVersionId...");
		}
		
		(!delay) && this._nimHttpCon && this._nimHttpCon.pullMessages(this.nextVersionId);
		
		if(preCheckInterval !== this.nextCheckInterval || !this.pullId)
		{
			this.startToPull();
		}
	}
	
	/**
	 * 拉取回调
	 * @param {Boolean} success
	 * @param {Array} data
	 * */
	pullMessageCallBack(success, data, sessionId = "", code = -1)
	{
		if(success)
		{
			try
			{
				if(Array.isArray(data))
				{
					let networkMessage;
					
					data.forEach(message => {
						networkMessage = NetworkMessage.getPooled();
						networkMessage.deserialize(message);
						
						this.messageArrived(networkMessage, true);
					})
				}
			}
			catch(e)
			{
			}
		}
		else
		{
			/**
			 * 2018-09-18 liuguanglun
			 * 会话版本号失效
			 * */
			if(this._nimHttpCon && sessionId == this._nimHttpCon._sessionId && code == 2001)
			{
				this.stopPull();
				this._nimHttpCon.destroy();
			}
		}
	}
	
	disconnect()
	{
		this.stopPull();
	}
	
	startToPull(forcePull = false)
	{
		this.stopPull();
		
		log("startToPull...");
		
		if(this.mode === 2) //作为辅助模式，禁止拉取
			return;
		
		let time = 0, interval = forcePull ? 2000 : this.nextCheckInterval;
		
		this.pullId = setInterval(() => {
			
			forcePull && time >= 4 && this.startToPull();
			
			if(this._nimHttpCon)
			{
				this._nimHttpCon.pullMessages(this.nextVersionId);
			}
			
			time++;
			
		}, interval);
	}
	
	stopPull()
	{
		log("stopPull...");
		
		clearInterval(this.pullId);
		this.pullId = null;
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NIMMessageState2", info, log);
}

export default NIMMessageState2;