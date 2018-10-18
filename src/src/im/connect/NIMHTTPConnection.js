import KeepAliveConnection from "./KeepAliveConnection";
import NIMMessageState from "../core/NIMMessageState";
import NIMMessageState2 from "../core/NIMMessageState2";
import NIMCode from "../error/NIMCode";
import ConnectStatus from "./ConnectStatus";
import KeepAliveMessage from "../message/http/KeepAliveMessage";
import DisconnectMessage from "../message/http/DisconnectMessage";
import HandshakeMessage from "../message/http/HandshakeMessage";
import NetworkMessage from "../message/http/NetworkMessage";
import OrderMessage from "../message/http/OrderMessage";
import MessageType from "../message/MessageType";
import { createMessageId } from "../../lib/utils/Utils";
import { urlLoader } from "../../lib/utils/cFetch";
import NIMMessage from "../message/NIMMessage";
import ObjectPool from "../../lib/utils/ObjectPool";
import Lang from "../i18n/Lang";
import DocumentMessage from "../message/http/DocumentMessage";
import MessageACK from "../message/MessageACK";
import NIMPullForJSONUtils from "../../lib/utils/NIMPullForJSONUtils";
import LogUtil from "../../lib/utils/LogUtil";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";

class NIMHTTPConnection extends KeepAliveConnection {
	
	_appID = "appid";
	_userId = "";
	_sessionId = "";
	_nimClientConfig = null;
	_nimMessageState = null;  //NIMMessageState2
	_destroy = false;
	
	constructor(nimClientConfig, mode = 1)
	{
		super(nimClientConfig);
		
		this.setNimClientConfig(nimClientConfig);
		
		this._userId = this._nimClientConfig.userId;
		this._appID = this._nimClientConfig.appId;
		this._sessionId = this._nimClientConfig.sessionId;
		
		let synMessageUrl = this._nimClientConfig.synMessageUrl;
		
		this.synMessageUrl = synMessageUrl + "/pullmessage";
		this.sendMessageUrl = synMessageUrl + "/publish";
		this.handshakeMessageUrl = synMessageUrl + "/handshake";
		
		this.createNimMessageState(mode);
		
		this.onRepublishHandler = this.onRepublishHandler.bind(this);
		
		this.sendToServer = this.sendToServer.bind(this);
		
		this._nimMessageState.on(NIMMessageState.PUBLISH, this.onRepublishHandler);
		
		this.RECONNECT_INTERVAL_TIME = 2; //重新连接间隔时间2s
	}
	
	createNimMessageState(mode)
	{
		if(!this._nimMessageState)
		{
			let nimHttpCon = new NIMPullForJSONUtils();
			nimHttpCon.url = this.synMessageUrl;
			nimHttpCon.userid = this._nimClientConfig.userId;
			nimHttpCon.sessionId = this._nimClientConfig.sessionId;
			nimHttpCon.deviceType = this._nimClientConfig.deviceType;
			
			this._nimMessageState = new NIMMessageState2(nimHttpCon);
			
			this._nimMessageState.mode = mode;
		}
	}
	
	setNimClientConfig(value)
	{
		this._nimClientConfig = value;
	}
	
	getNimClientConfig()
	{
		return this._nimClientConfig;
	}
	
	onHandleShark(id)
	{
		super.onHandleShark();
		
		if(id !== this._handshakeTimeoutID)
			return;
		
		this.log("onHandleShark 握手成功!!!");
		
		clearTimeout(this._handshakeTimeoutID);
		
		this.reset();
		this._resetTimeout();
		
		this.status = ConnectStatus.ST_CONNECTED;
		
		this.onConnected();
		
		this.handleConnectStatus(this.status, NIMCode.HANDLE_SHARK);
	}
	
	onRepublishHandler(message)
	{
		try
		{
			if(!message)
				return;
			
			if(message instanceof NIMMessage)
			{
				this.publish(message);
			}
			else if(message instanceof NetworkMessage)
			{
				message.setMessageid(createMessageId());
				
				this.send(message.serialize());
			}
		}
		catch(e)
		{
			this.log("onRepublishHandler stack = " + e.stack);
		}
	}
	
	connect()
	{
		this.status = ConnectStatus.ST_CONNECTING;
		this.handleConnectStatus(this.status, NIMCode.RECONNECTING_ERROR);
		
		if(this._startConnectTime <= 0)
		{
			this._startConnectTime = new Date().getTime();
		}
		
		this.sendHandleShark();
	}
	
	sendHandleShark()
	{
		this.log("onConnected...");
		
		let handSharkMessage = new HandshakeMessage();
		handSharkMessage.userid = this._userId;
		handSharkMessage.ip = this._nimClientConfig.ip;
		handSharkMessage.device = this._nimClientConfig.device;
		handSharkMessage.token = this._nimClientConfig.token;
		handSharkMessage.sessionid = this._sessionId;
		handSharkMessage.appkey = this._appID;
		
		let networkMessage = new NetworkMessage();
		networkMessage.messageid = createMessageId();
		networkMessage.messageType = MessageType.MESSAGE_HANDSHAKE;
		networkMessage.fromUser = this._userId;
		networkMessage.message = handSharkMessage;
		
		this.log(["sendHandleShark publish Handshakemessage sessionId = " + this._sessionId, ", HandshakeMessage = ", handSharkMessage.serialize()]);
		
		clearTimeout(this._handshakeTimeoutID);
		
		this._handshakeTimeoutID = setTimeout(() => {
			this.onConnectFailed(true);
			
			this.log("Handshake failed！！！");
		}, 10000);
		
		this.createNimMessageState();
		
		if(this.onHandleShark)
		{
			this._nimMessageState.removeListener(NIMMessageState.HANDLE_SHARK, this.onHandleShark);
		}
		
		this._nimMessageState.on(NIMMessageState.HANDLE_SHARK, this.onHandleShark.bind(this, this._handshakeTimeoutID));
		
		if(!this.wrap)
		{
			this.wrap = {};
			this.wrap.userid = this._userId;
			this.wrap.siteid = this._appID;
			this.wrap.sessionid = this._nimClientConfig.sessionId;
			this.wrap.message = [];
		}
		
		this.wrap.message = networkMessage.serialize();
		
		this.sendToServer(this.handshakeMessageUrl, this.wrap, true);
		
		this.wrap.message = [];
	}
	
	sendKeepAlive()
	{
		super.sendKeepAlive();
		
		if(!this.keepAliveMessage)
		{
			this.keepAliveMessage = new KeepAliveMessage();
			this.keepAliveMessage.sessionid = this._sessionId;
		}
		
		if(!this.ntKaMessage)
		{
			this.ntKaMessage = new NetworkMessage();
			this.ntKaMessage.messageType = MessageType.MESSAGE_KEEPALIVE;
			this.ntKaMessage.toConversation = "NPigeon";
			this.ntKaMessage.toUser = "NPigeon";
			this.ntKaMessage.fromUser = this._userId;
			this.ntKaMessage.messageid = "-1";
			this.ntKaMessage.message = this.keepAliveMessage;
			this.ntKaMessageSerialize = this.ntKaMessage.serialize();
		}
		
		this.send(this.ntKaMessageSerialize, true);
	}
	
	_sendTimeoutId = -1;
	
	send(message, delay = true, url = "")
	{
		if(!message || !this.sendMessageUrl)
			return;
		
		if(!this.wrap)
		{
			this.wrap = {};
			this.wrap.userid = this._userId;
			this.wrap.siteid = this._appID;
			this.wrap.sessionid = this._nimClientConfig.sessionId;
			this.wrap.message = [];
		}
		
		if(this._sendTimeoutId < 0)
		{
			this._sendTimeoutId = setTimeout(this.sendToServer.bind(this, this.sendMessageUrl, this.wrap), 500);
			this.wrap.message = [];
		}
		
		this.wrap.message.push(message);
		
		if(!delay)
		{
			let loadUrl = url ? url : this.sendMessageUrl;
			
			this.sendToServer(loadUrl, this.wrap);
		}
	}
	
	sendToServer(url, wrap, reconnect = false)
	{
		clearTimeout(this._sendTimeoutId);
		
		this._sendTimeoutId = -1;
		
		if(!wrap.message || (Array.isArray(wrap.message) && wrap.message.length <= 0))
			return;
		
		this.log(["sendToServer wrap = ", wrap]);
		
		urlLoader(url, {body: JSON.stringify(wrap), method: "post"})
		.then(({jsonResult}) => {
			if(jsonResult.code === 200)
			{
				//if(jsonResult.data)
				//{
				if(url.indexOf("handshake") > -1)
				{
					this.messageArrived(jsonResult.data);
				}
				else
				{
					//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=56426660
					this._nimMessageState && this._nimMessageState.resetPullMessage({
						nextCheckInterval: jsonResult.nextCheckInterval, maxVersion: NIMMessageState2.versionId
					}, false);
				}
				//}
			}
			else
			{
				if(reconnect)
				{
					this.log("sendToServer reconnect message...");
					
					this.onConnectFailed(true);
				}
			}
			
			this.messageIMDelivered(this.wrap.message);
		});
		
		this.wrap.message = [];
	}
	
	onConnectFailed(reconnect, maxReconnectTime = 30)
	{
		//防止在销毁的时候，发送sendToServer(url, wrap, reconnect = true),使得再次调用onConnectFailed
		if(this._destroy)
			return;
		
		super.onConnectFailed(reconnect, maxReconnectTime);
	}
	
	messageArrived(message)
	{
		if(!message)
			return;
		
		if(this._nimMessageState)
		{
			let networkMessage = NetworkMessage.getPooled()
			.deserialize(message);
			
			this._nimMessageState.messageArrived(networkMessage);
		}
	}
	
	messageIMDelivered(msgs)
	{
		msgs.forEach(message => {
			if(message.type === MessageType.MESSAGE_KEEPALIVE)
			{
				this._onSendKeepAliveSuccess();
				return;
			}
			
			this._nimMessageState && this._nimMessageState.messageIMDelivered(message.messageid);
		})
	}
	
	handleConnectStatus(status, errorCode = -1)
	{
		this.log("handleConnectStatus status = " + status + ", errorCode = " + errorCode);
		
		GlobalEvtEmitter.emit(NIMMessageState.CONNECT_STATUS, {status, errorCode, mode: 2});
	}
	
	publish(nimMessage)
	{
		try
		{
			if(!nimMessage || !nimMessage instanceof NIMMessage)
				throw Lang.getError(NIMCode.TYPE_ERROR, "publish", "nimMessage", "NIMMessage");
			
			if(nimMessage.toUser === this._userId)
			{
				this.log("publish toUser is the same");
				return;
			}
			
			let message, qos = nimMessage.qos,
				messageId = nimMessage.messageId,
				versionId = nimMessage.versionId,
				messageType = nimMessage.messageType === 12 ? MessageType.MESSAGE_DOCUMENT : nimMessage.messageType,
				networkMessage = NetworkMessage.getPooled();
			
			switch(messageType)
			{
				case MessageType.MESSAGE_DOCUMENT:
					message = DocumentMessage.getPooled();
					message.type = nimMessage.type;
					message.setContentString(nimMessage.content);
					break;
				
				case MessageType.MESSAGE_ORDER:
					message = OrderMessage.getPooled();
					message.type = nimMessage.type;
					message.validtime = nimMessage.validtime;
					message.expire = nimMessage.expire;
					message.targetid = nimMessage.targetid;
					message.content = nimMessage.content;
					break;
				
				case MessageType.MESSAGE_DISCONNECT:
					this.log("publish MessageType.MESSAGE_DISCONNECT...");
					
					message = new DisconnectMessage();
					message.versionid = nimMessage.versionId;
					message.sessionid = this._sessionId;
					message.content = nimMessage.content;
					break;
				
				default:
					this.log("publish Unknown message type");
					return;
			}
			
			networkMessage.message = message;
			networkMessage.messageType = messageType;
			
			let toUser = nimMessage.toUser ? nimMessage.toUser : this._appID,
				toConverid = nimMessage.toConverid;
			
			if(toConverid)
			{
				networkMessage.toConversation = toConverid;
			}
			
			networkMessage.toUser = toUser;
			networkMessage.fromUser = this._userId;
			networkMessage.messageid = messageId;
			
			if(qos > MessageACK.NO_ACK && this._nimMessageState)
			{
				message.versionid = versionId;
				this._nimMessageState.publish(messageId, nimMessage);
			}
			
			let delay = nimMessage.messageType !== 12 && nimMessage.messageType !== MessageType.MESSAGE_DISCONNECT;  //web端特殊要求，防止异步时间过长
			
			this.send(networkMessage.serialize(), delay);
			
			NetworkMessage.release(networkMessage);
		}
		catch(e)
		{
			this.log("publish e.stack = " + e.stack);
		}
	}
	
	hanleReconnect()
	{
		try
		{
			this.log("hanleReconnect start reconnect");
			
			this.stopConnectTimer();
			
			if(this.status === ConnectStatus.ST_CONNECTED)
			{
				this.disconnect(false);
			}
			
			if(this._nimMessageState)
			{
				this._nimMessageState.stopPull();
			}
			
			this.connect();
		}
		catch(e)
		{
			this.log("hanleReconnect e.stack: " + e.stack);
		}
	}
	
	disconnect(nimDis = true)
	{
		this.log("disconnect nimDis = " + nimDis);
		
		if(nimDis)
		{
			let message = ObjectPool.getObject(NIMMessage.CLASS_NAME);
			message.messageType = MessageType.MESSAGE_DISCONNECT;
			message.versionId = NIMMessage.messageId();
			message.messageId = NIMMessage.versionId();
			message.qos = 0;
			
			this.publish(message);
		}
		
		super.disconnect();
	}
	
	destroy(nimDis = true)
	{
		this.disconnect(nimDis);
		this._destroy = true;
		
		if(this._nimMessageState)
		{
			this._nimMessageState.removeListener(NIMMessageState.HANDLE_SHARK, this.onHandleShark);
			this._nimMessageState.removeListener(NIMMessageState.PUBLISH, this.onRepublishHandler);
			this._nimMessageState.disconnect();
			this._nimMessageState = null;
		}
		
		this._nimClientConfig = null;
		
		super.destroy();
	}
	
	log(log, info = LogUtil.INFO)
	{
		LogUtil.trace("NIMHTTPConnection", info, log);
	}
}

export default NIMHTTPConnection;
