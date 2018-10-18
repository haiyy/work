import LogUtil from "../../lib/utils/LogUtil";
import ObjectPool from "../../lib/utils/ObjectPool";
import NIMMessage from "../message/NIMMessage";
import { NetworkMessage } from "../message/NIMMessageProtoBuf";
import NIMMessageState from "../core/NIMMessageState";
import DocumentMessage from "../message/http/DocumentMessage";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import NIMCode from "../error/NIMCode";
import ConnectStatus from "../connect/ConnectStatus";


/**
 * IM对外输出类:
 * 1.消息发送的状态
 * 2.接收消息
 * 3.连接状态
 * */
class INIMCallBack {
	
	constructor()
	{
		this.onNotifyReceiveMsg = this.onNotifyReceiveMsg.bind(this);
		this.onMessageArrived = this.onMessageArrived.bind(this);
		this.onConnectStatus = this.onConnectStatus.bind(this);
		
		GlobalEvtEmitter.on(NIMMessageState.MESSAGE_DELIVERED, this.onNotifyReceiveMsg);
		GlobalEvtEmitter.on(NIMMessageState.MESSAGE_ARRIVED, this.onMessageArrived);
		GlobalEvtEmitter.on(NIMMessageState.CONNECT_STATUS, this.onConnectStatus);
	}

	/**
	 * 收到消息
	 * @param {Object} message - 收到消息
	 * @example
	 * message = {m:1000,body:{}}
	 * @return
	 */
	onMessageArrivedHandler(message)
	{

	}

	/**
	 * 消息是否到达服务器
	 * @param {String} content - 发送消息 {converid, messageid}
	 * @param {String} send - send_status
	 * @return
	 */
	onMessageDeliveredHandler(content, send)
	{

	}

	/**
	 * 连接状态
	 * @param {int} connectstatus - 连接状态
	 * @param {int} errorcode - 错误代码
	 * @example
	 * connectstatus = ConnectStatus.ST_CONNECTED 连接成功
	 * errorcode = -1
	 * @return void
	 * @example
	 * connectstatus = ConnectStatus.ST_DISCONNECT 连接断开
	 * errorcode = 11001 未知错误
	 */
	onConnectStatusHandler(connectstatus, errorcode = -1)
	{
	/*	switch(connectStatus)
		{
			case NIMCode.HANDLE_SHARK:  //网络连接成功
				this._chatDataVo.systemMessage = null;
				break;

			case ConnectStatus.ST_CONNECTING:  //网络正在连接
				if(errorCode == NIMCode.RECONNECT_FAILED_ERROR)
				{
					//重连失败
				}
				else
				{
					//正在连接
				}
				break;

			case ConnectStatus.ST_DISCONNECT: //网络断开

				break;
		}*/
	}
	
	onNotifyReceiveMsg(data)
	{
		if(!data || !data.message)
			return;
		
		let message = data.message;
		if(typeof message === "string")
		{
			message = JSON.parse(data.message) || {};
		}
		
		this.onMessageDeliveredHandler(message.body || message, data.send);
	}
	
	onMessageArrived(data)
	{
		log("onMessageArrived...");
		
		if(!data)
			return;
		
		let message = data.message, content;
		
		if(message instanceof NetworkMessage.DocumentMessage)
		{
			if(message.getContentstring())
			{
				content = message.getContentstring();
			}
			else if(message.getContentbytes())
			{
				content = message.getContentbytes();
			}
		}
		else if(message instanceof NIMMessage)
		{
			content = message.contentObject;
			
			ObjectPool.freeObject(message);
		}
		else if(message.message instanceof DocumentMessage)
		{
			content = message.message.getContent();
			
			if(typeof message.destroy === "function")
			{
				message.destroy();
			}
		}
		
		if(content)
		{
			this.onMessageArrivedHandler(content);
		}
	}
	
	onConnectStatus(data)
	{
		if(!data)
			return;
		
		//若是连接状态，则需要相同模式（MQTTorHTTP）的连接, 才会触发状态改变
		if(this.connectstatus === ConnectStatus.ST_CONNECTED)
		{
			if(this.mode !== data.mode)
				return;
		}
		
		//若是连接超时状态，则需要连接状态, 才会触发状态改变
		if(this.errorcode === NIMCode.RECONNECT_FAILED_ERROR)
		{
			if(data.status !== ConnectStatus.ST_CONNECTED)
				return;
		}
		
		this.connectstatus = data.status;
		this.errorcode = data.errorCode;
		this.mode = data.mode;
		
		this.onConnectStatusHandler(data.status, data.errorCode);
	}
	
	destroy()
	{
		GlobalEvtEmitter.removeListener(NIMMessageState.MESSAGE_DELIVERED, this.onNotifyReceiveMsg)
		.removeListener(NIMMessageState.MESSAGE_ARRIVED, this.onMessageArrived)
		.removeListener(NIMMessageState.CONNECT_STATUS, this.onConnectStatus);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("INIMCallBack", info, log);
}

export default INIMCallBack;

