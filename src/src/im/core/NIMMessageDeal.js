import NIMMessage from "../message/NIMMessage";
import NIMMessageState from "./NIMMessageState";
import MessageType from "../message/MessageType";
import MessageACK from "../message/MessageACK";
import LogUtil from "../../lib/utils/LogUtil";
import { EventEmitter } from "events";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";

class NIMMessageDeal extends EventEmitter {
	
	step = 1000;
	MAX_CALL_NUM = 3;
	RESEND_TIMER = 5 * this.step;
	
	_local_version_max = -1;
	
	_receiveMessages = new Map();   //接收的消息集合
	
	_nimHttpCon = null;
	_intervalId = -1;
	_sendingMsgNum = 0;  //-1 停止检测 0 将要停止检测 >0 正在检测
	
	_now = -1;
	_sendingTime = -1;
	
	_nextVersionId = -1;
	
	_tryCheckCount = 0;
	MESSAGE_SEND_TIMEOUT = 5 * this.step; //消息在5s内连续3条消息发送失败
	
	static MINE = "NIMMessageDeal";
	static sendMessages = {};  //正在发送的消息集合
	
	constructor(nimHttpCon)
	{
		super();
		
		if(nimHttpCon)
		{
			this._nimHttpCon = nimHttpCon;
			this._nimHttpCon.callBack = this.pullMessageCallBack.bind(this);
		}
		
		this.__nextVersionId = -1;  //下一条要接收的消息
		
		this.checkSendingMessage = this.checkSendingMessage.bind(this);
	}
	
	/**
	 *发布消息
	 * @param {int} messageId 消息版本号
	 * @param {NIMMessage} message 消息
	 */
	publish(messageId, message)
	{
		if(!message)
			return;
		
		if(NIMMessageDeal.sendMessages[messageId])
		{
			message = NIMMessageDeal.sendMessages[messageId];
		}
		else
		{
			NIMMessageDeal.sendMessages[messageId] = message;
		}
		
		if(this instanceof NIMMessageState)
		{
			message.sendingTime = new Date().getTime();
			message.sendNum++;
		}
		else
		{
			message.httpSendingTime = new Date().getTime();
			message.httpSendNum++;
			
			message.messageType === 12 && this.startToPull();
		}
		
		if(this._sendingMsgNum <= 0 || this._intervalId < 0)
		{
			this.startSend();
			this._sendingMsgNum++;
		}
	}
	
	/**
	 *@private 拉去消息
	 */
	pullMessage()
	{
		if(this._nimHttpCon)
		{
			this._nimHttpCon.pullMessages(this.__nextVersionId);
		}
	}
	
	/**
	 * 拉取回调
	 * @param {Boolean} success
	 * @param {Array} data
	 * */
	pullMessageCallBack(success, data)
	{
	}
	
	/**
	 *接收消息
	 *@param {NetworkMessage} message
	 */
	messageArrived(message, pull = false)
	{
	
	}
	
	/**
	 *发送消息完成
	 *@param {NetworkMessage(protoBuf)} message
	 */
	messageDelivered(messageId)
	{
		try
		{
			if(!messageId)
				return;
			
			let sendingMessage = NIMMessageDeal.sendMessages[messageId];
			if(sendingMessage)
			{
				delete NIMMessageDeal.sendMessages[messageId];
			}
			
			log(["messageDelivered end"]);
		}
		catch(e)
		{
			log("messageDelivered stack:  " + e.stack);
		}
	}
	
	/**
	 * 消息已到达IM服务器
	 * @param {String} messageId 消息ID
	 * @param {int} type 消息发送情况，到达，失败，已被接收...
	 * */
	messageIMDelivered(messageId, type = 41, content = {})
	{
		try
		{
			log("messageIMDelivered messageId = " + messageId);
			
			if(type === MessageType.STATUS_MESSAGE_SEND_SENT)
			{
				let sentMessage = NIMMessageDeal.sendMessages[messageId];
				if(!sentMessage || !sentMessage.hasOwnProperty("messageType"))
					return;
				
				if(sentMessage.qos !== MessageACK.SUCCESS_ACK)
					return;
				
				content = sentMessage.content;
			}
			
			if(content && typeof content === "string")
			{
				content = JSON.parse(content);
			}
			
			GlobalEvtEmitter.emit(NIMMessageState.MESSAGE_DELIVERED, {send: type, message: content});
			
			delete NIMMessageDeal.sendMessages[messageId];
		}
		catch(e)
		{
			log("messageIMDelivered stack: " + e.stack);
		}
	}
	
	failedPull()
	{
		if(this._receiveMessages.get(this.__nextVersionId))
		{
			this.messageArrived(this._receiveMessages.get(this.__nextVersionId));
			return;
		}
		
		this._receiveMessages.set(this.__nextVersionId, 0);
		
		log("failedPull __nextVersionId = " + this.__nextVersionId + ", _local_version_max = " + this._local_version_max);
		
		this.__nextVersionId++;
		
		if(this._receiveMessages.has(this.__nextVersionId))
		{
			this.messageArrived(this._receiveMessages.get(this.__nextVersionId));
			return;
		}
		
		if(this._local_version_max >= this.__nextVersionId)
		{
			this.pullMessage();
		}
	}
	
	startSend()
	{
		if(this._intervalId > -1)
		{
			this.stopSend();
		}
		
		this._intervalId = setInterval(this.checkSendingMessage, 1000);
		
		log("startSend this._intervalId = " + this._intervalId);
	}
	
	stopSend()
	{
		log("stopSend this._intervalId = " + this._intervalId);
		
		clearInterval(this._intervalId);
		this._intervalId = -1;
	}
	
	checkTimeout(key)
	{
		//log("checkTimeout key = " + key + ", this._sendingMsgNum = " + this._sendingMsgNum);
		
		let message = NIMMessageDeal.sendMessages[key],
			sendingTime = this instanceof NIMMessageState ? "sendingTime" : "httpSendingTime",
			sendNum = 0;
		
		this._sendingMsgNum++;  //正在发送的数量
		
		if(message instanceof NIMMessage)
		{
			this._sendingTime = message[sendingTime];
			
			if(this._now - this._sendingTime >= this.RESEND_TIMER * 2)
			{
				delete NIMMessageDeal.sendMessages[key];
				
				sendNum = message.httpSendNum > message.sendNum ? message.httpSendNum : message.sendNum;
				
				if(sendNum >= this.MAX_CALL_NUM)
				{
					GlobalEvtEmitter.emit(NIMMessageState.MESSAGE_DELIVERED, {
						message: message.contentObject, send: MessageType.STATUS_MESSAGE_SEND_FAILED
					});
				}
				else
				{
					this.emit(NIMMessageState.PUBLISH, message);
				}
			}
		}
	}
	
	checkSendingMessage()
	{
		//log("checkSendingMessage this._tryCheckCount = " + this._tryCheckCount);
		
		this._tryCheckCount += this.step;
		
		if(this._tryCheckCount < this.RESEND_TIMER)
		{
			this._messageSendCount = 0;
			let now = new Date().getTime();
			
			for(let key in NIMMessageDeal.sendMessages)
			{
				if(NIMMessageDeal.sendMessages[key])
				{
					let sendingTime = NIMMessageDeal.sendMessages[key].sendingTime;
					
					if(now - sendingTime <= this.MESSAGE_SEND_TIMEOUT)
					{
						this._messageSendCount++;
					}
				}
			}
			
			if(this._messageSendCount > 3)
			{
				this.emit(NIMMessageState.MESSAGE_SEND_CONTINUE_FAILED);
			}
			return;
		}
		
		this._tryCheckCount = 0;
		this._now = new Date().getTime();
		
		if(NIMMessageDeal.sendMessages)
		{
			this._sendingMsgNum = 0;
			
			let key;
			for(key in NIMMessageDeal.sendMessages)
			{
				if(NIMMessageDeal.sendMessages.hasOwnProperty(key))
				{
					this.checkTimeout(key);
				}
			}
			
			if(this._sendingMsgNum <= 0)
			{
				this.stopSend();
				this._sendingMsgNum = -1;
			}
		}
	}
	
	forceSending()
	{
		let message;
		for(let key in NIMMessageDeal.sendMessages)
		{
			message = NIMMessageDeal.sendMessages[key];
			
			if(message instanceof NIMMessage)
			{
				this.emit(NIMMessageState.PUBLISH, message);
			}
		}
	}
	
	destroy()
	{
		this.stopSend();
		
		this._sendingMsgNum = -1;
		
		NIMMessageDeal.sendMessages = {};
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NIMMessageDeal", info, log);
}

export default NIMMessageDeal;