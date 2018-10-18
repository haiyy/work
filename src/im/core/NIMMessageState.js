import NIMMessage from "../message/NIMMessage";
import MessageType from "../message/MessageType";
import LogUtil from "../../lib/utils/LogUtil";
import ObjectPool from "../../lib/utils/ObjectPool";
import { NetworkMessage } from "../message/NIMMessageProtoBuf";
import { createMessageId } from "../../lib/utils/Utils";
import NIMMessageDeal from "./NIMMessageDeal";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import NIMMessageState2 from "./NIMMessageState2";

class NIMMessageState extends NIMMessageDeal {
	
	static PUBLISH = "republish";
	static MESSAGE_DELIVERED = "messageDelivered";
	static HANDSHAKE_SUCCESS = "handshakeSuccess";
	static MESSAGE_ARRIVED = "";
	static KEEPALIVE_SUCCESS = "keepaliveSuccess";
	static KICK_OFF = "nimKickOff";
	static HANDLE_SHARK = "handleShark";
	static CONNECT_STATUS = "connect_status";
	static MESSAGE_SEND_CONTINUE_FAILED = "message_send_continue_failed";  //消息在5s内连续3条消息发送失败
	
	constructor(nimHttpCon)
	{
		super(nimHttpCon);
		
		this.deserializeToMessage = this.deserializeToMessage.bind(this);
		this.pullTimeoutId = -1;
		this.intervalToPullMsg = 20 * 1000;
		this.lastReceiveMsgTime = new Date();
		
		NIMMessageDeal.MINE = "NIMMessageState";
	}
	
	/**
	 *接收消息
	 *@param {NetworkMessage} message
	 */
	messageArrived(message, pull = false)
	{
		try
		{
			if(!message)
				return;
			
			this.emit(NIMMessageState.KEEPALIVE_SUCCESS);
			
			log(["messageArrived message = ", message.toObject()]);
			
			this.lastReceiveMsgTime = new Date(); //收取消息时间
			
			let messageType = message.getType(),
				messageId = message.getMessageid(),
				oneof, versionId;
			
			switch(messageType)
			{
				case MessageType.MESSAGE_DOCUMENT:
					oneof = message.getDocumentmessage();
					this.returnOrder(message);
					break;
				
				case MessageType.MESSAGE_ORDER:
					oneof = message.getOrdermessage();
					break;
				
				case MessageType.MESSAGE_RESULT:
					this.dealResultMessage(message);
					return;
			}
			
			if(!oneof || typeof oneof.getVersionid !== "function")
				return;
			
			versionId = oneof.getVersionid();
			
			log("messageArrived versionId = " + versionId + ", messageId = " + messageId
				+ ", messageType = " + messageType + ", this._nextVersionId = " + this.get_nextVersionId()
				+ ", this._local_version_max = " + this._local_version_max + ", pull = " + pull);
			
			if(this._receiveMessages.get(versionId) === 1)
			{
				log("messageArrived 重复消息");
				return;
			}
			
			this._local_version_max = versionId > this._local_version_max ? versionId : this._local_version_max;
			
			/*
			 * 1. 初始_nextVersionId（下一个要获取消息的版本号） === -1
			 * 2. 当版本号 < _nextVersionId, 判断是否为拉取失败的消息，否则会再次处理
			 * 3. 当消息版本号 === _nextVersionId, 直接处理
			 * 4. 当消息版本号 > _nextVersionId, 拉去消息
			 * 5. 当已经拉取的消息，当消息版本号 !== _nextVersionId ===> _nextVersionId = 当消息版本号
			 * */
			if(versionId - this.get_nextVersionId() > 1000 || (versionId !== this.get_nextVersionId() && pull))
				this.set_nextVersionId(versionId);
			
			if(versionId < this.get_nextVersionId())
			{
				this.dealMessage(messageType, message);
				return;
			}
			
			//根据正常收取消息版本序列或者接收取消息
			if(versionId === this.get_nextVersionId() || pull)
			{
				clearTimeout(this.pullTimeoutId);
				
				this.pullTimeoutId = -1;
				
				this.set_nextVersionId(versionId + 1);
				
				this.dealMessage(messageType, message);
				
				let nextMessage = this._receiveMessages.get(this.get_nextVersionId());
				
				if(nextMessage instanceof NetworkMessage)
				{
					this.messageArrived(nextMessage);
				}
				
				return;
			}
			
			if(versionId - this.get_nextVersionId() <= 150)
			{
				this._receiveMessages.set(versionId, message);
			}
			
			this._clearMoreMessages();
			
			if(!pull)
			{
				//缓解EMQTT下行消息顺序与IM服务器下行消息顺序不一致
				if(this.pullTimeoutId < 0)
				{
					this.pullTimeoutId = setTimeout(() => {
						this.pullTimeoutId = -1;
						this.pullMessage();
					}, 1000);
				}
			}
		}
		catch(e)
		{
			log("messageArrived stack: " + e.stack);
		}
	}
	
	dealMessage(messageType, message)
	{
		if(!message)
			return;
		
		let oneof, versionId;
		
		switch(messageType)
		{
			case MessageType.MESSAGE_DOCUMENT:
				oneof = message.getDocumentmessage();
				
				if(!oneof || typeof oneof.getVersionid !== "function")
					return;
				
				versionId = oneof.getVersionid();
				
				log(["dealMessage  versionId = " + versionId]);
				
				GlobalEvtEmitter.emit(NIMMessageState.MESSAGE_ARRIVED, {message: oneof});
				break;
			
			case MessageType.MESSAGE_ORDER:
				oneof = message.getOrdermessage();
				
				if(!oneof || typeof oneof.getVersionid !== "function")
					return;
				
				versionId = oneof.getVersionid();
				this.dealOrderMessage(message);
				break;
		}
		
		this._receiveMessages.set(versionId, 1);
		
		if(versionId === this.get_nextVersionId())
		{
			let message = this._receiveMessages.get(this.get_nextVersionId());
			
			this.set_nextVersionId(this.get_nextVersionId() + 1);
			
			message && message !== -1 && this.messageArrived(message);
		}
	}
	
	dealOrderMessage(message)
	{
		log("dealOrderMessage...");
		
		let orderMessage = message.getOrdermessage(),
			messageId = orderMessage.getTargetid(),
			type = orderMessage.getType(),
			content = orderMessage.getContent() || {};
		
		switch(type)
		{
			case MessageType.STATUS_MESSAGE_SEND_SENT:
			case MessageType.STATUS_MESSAGE_SEND_RECEIVED:
				this.messageIMDelivered(messageId, type, content);
				break;
		}
	}
	
	dealResultMessage(message)
	{
		let resultMessage = message.getResultmessage();
		if(!resultMessage)
			return;
		
		let type = resultMessage.getType();
		
		switch(type)
		{
			case MessageType.RESULT_MESSAGE_KICK_OFF:
				log("NIMMessageState dealResultMessage 不小心被踢了");
				GlobalEvtEmitter.emit(NIMMessageState.KICK_OFF);
				break;
			
			case MessageType.RESULT_MESSAGE_HANDLESHAKE:
				if(resultMessage.getResult())
				{
					let content = JSON.parse(resultMessage.getContent());
					
					if(content)
					{
						let timeout = content.nextCheckInterval || 5000;
						this._nimHttpCon.timeout = timeout;
						
						this.intervalPull(timeout);
					}
					
					this.emit(NIMMessageState.HANDLE_SHARK);
					
					this.forceSending();
				}
				else
					this.onConnectFailed(true);
				break;
		}
	}
	
	intervalPull(timeout)
	{
		clearTimeout(this._intervalPullId);
		
		let now;
		this._intervalPullId = setInterval(() => {
			now = new Date();
			
			if(now - this.lastReceiveMsgTime > this.intervalToPullMsg)
			{
				this.lastReceiveMsgTime = now;
				this.__nextVersionId > 0 && this.pullMessage();
			}
		}, timeout);
	}
	
	get_nextVersionId()
	{
		return this.__nextVersionId;
	}
	
	set_nextVersionId(value)
	{
		NIMMessageState2.versionId = this.__nextVersionId = value;
		
		log("__nextVersionId set value = " + value);
		
		if(this.__nextVersionId > this._local_version_max)
		{
			this._local_version_max = this.__nextVersionId;
		}
	}
	
	returnOrder(networkMessage)
	{
		let messageid = networkMessage.getMessageid(),
			userid = networkMessage.getFromuser(),
			content = {userid};
		
		if(userid === "NDolphin")
			return;
		
		let nimMessage = ObjectPool.getObject(NIMMessage.CLASS_NAME);
		
		nimMessage.messageType = MessageType.MESSAGE_ORDER;
		nimMessage.content = JSON.stringify(content);
		nimMessage.toUser = userid;
		nimMessage.type = MessageType.STATUS_MESSAGE_SEND_RECEIVED;
		nimMessage.targetid = messageid;
		nimMessage.messageId = createMessageId();
		
		this.emit(NIMMessageState.PUBLISH, nimMessage);
		
	}
	
	_clearMoreMessages()
	{
		let id = this.get_nextVersionId() - 150;
		
		if(id <= 0)
			return;
		
		this._receiveMessages.forEach((value, key) => {
			if(key < id)
			{
				this._receiveMessages.delete(key);
			}
		});
	}
	
	/**
	 * 拉取回调
	 * @param {Boolean} success
	 * @param {Array} data
	 * */
	pullMessageCallBack(success, data)
	{
		log("pullMessageCallBack...");
		
		if(success)
		{
			try
			{
				let networkMessage = NetworkMessage.deserializeBinary(data);
				if(networkMessage.getType() === MessageType.MESSAGE_SYNCH)
				{
					let byteList = networkMessage.getByteslist()
					.getBytelistList();
					
					if(Array.isArray(byteList))
					{
						byteList.forEach(this.deserializeToMessage);
					}
				}
			}
			catch(e)
			{
				this.failedPull();
			}
		}
		else
		{
			this.failedPull();
		}
	}
	
	deserializeToMessage(payloadBytes)
	{
		let networkMessage = NetworkMessage.deserializeBinary(payloadBytes);
		
		this.messageArrived(networkMessage, true);
	}
	
	destroy()
	{
		super.destroy();
		
		clearInterval(this._intervalPullId);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NIMMessageState", info, log);
}

export default NIMMessageState;
