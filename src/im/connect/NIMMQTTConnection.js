/**
 *MQTT连接创建，负责消息的上下行
 */
import UIDUtil from "uuid";
import Lang from "../i18n/Lang";
import LogUtil from "../../lib/utils/LogUtil";
import MessageBufPool from "../message/MessageBufPool";
import ObjectPool from "../../lib/utils/ObjectPool";
import NIMCode from "../error/NIMCode";
import NIMMessage from "../message/NIMMessage";
import MessageType from "../message/MessageType";
import { NetworkMessage } from "../message/NIMMessageProtoBuf";
import MessageACK from "../message/MessageACK";
import NIMPullForBlobUtils from "../../lib/utils/NIMPullForBlobUtils";
import NIMMessageState from "../core/NIMMessageState";
import SubscribeOptions from "../core/options/SubscribeOptions";
import UnsubscribeOptions from "../core/options/UnsubscribeOptions";
import KeepAliveConnection from "./KeepAliveConnection";
import ConnectStatus from "./ConnectStatus";
import { createMessageId } from "../../lib/utils/Utils";
import { Client } from "../../lib/mqttws31";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import NIMClient from "../core/NIMClient";
import NIMHTTPConnection from "./NIMHTTPConnection";

class NIMMQTTConnection extends KeepAliveConnection {
	
	_handshake_topic = "";  //路由，通知对应的IM服务器进行约定操作
	_s_topic = "";  //上行
	_c_topic2 = ""; //下行
	_c_topic = "";  //下行
	_appID = "appid";
	_userId = "";
	
	_nimClientConfig = null;
	_options = null;
	
	_nimMessageState = null;  //NIMMessageState
	
	constructor(nimClientConfig)
	{
		super();
		
		this.setNimClientConfig(nimClientConfig);
		this.onRepublishHandler = this.onRepublishHandler.bind(this);
		this.onHandleShark = this.onHandleShark.bind(this);
		this.onMessageSendContinueFailed = this.onMessageSendContinueFailed.bind(this);
		
		this.createNimMessageState();
		
		this.createTopic();
	}
	
	initMQTTClient()
	{
		//创建连接参数
		this._options = this._nimClientConfig.getConnectOptions();
		this._options.onSuccess = this.onConnectSuccessHandler.bind(this);//连接成功callback
		this._options.onFailure = this.onConnectFailureHandler.bind(this);//连接失败callback
		
		//创建MQTT.ClientID
		this._clientId = this._nimClientConfig.deviceType + UIDUtil.v1()
		.replace(/-/g, "")
		.substr(0, 20);
		
		this._appID = this._nimClientConfig.appId;
		this._userId = this._nimClientConfig.userId;
		this.host = this._options.hosts[0];
		this.port = this._options.ports[0];
		
		//创建连接
		this._client = new Client(this.host, this.port, this._clientId);
		this._client.trace = mqttTrace;
		
		this.log("initMQTTClient _appID = " + this._appID + ", _userId = " + this._userId +
			", host = " + this.host + ", port = " + this.port + ", _clientId = " + this._clientId);
	}
	
	createNimMessageState()
	{
		if(!this._nimMessageState)
		{
			let nimHttpCon = new NIMPullForBlobUtils();
			nimHttpCon.url = this._nimClientConfig.synMessageUrl + "/pullmessage";
			nimHttpCon.userid = this._nimClientConfig.userId;
			nimHttpCon.sessionId = this._nimClientConfig.sessionId;
			nimHttpCon.deviceType = this._nimClientConfig.deviceType;
			
			this._nimMessageState = new NIMMessageState(nimHttpCon);
			this._nimMessageState.on(NIMMessageState.PUBLISH, this.onRepublishHandler);
			this._nimMessageState.on(NIMMessageState.HANDLE_SHARK, this.onHandleShark);
			this._nimMessageState.on(NIMMessageState.MESSAGE_SEND_CONTINUE_FAILED, this.onMessageSendContinueFailed);
		}
		
		if(!this._httpCon)
		{
			this._httpCon = new NIMHTTPConnection(this._nimClientConfig, 2);
		}
	}
	
	onMessageSendContinueFailed()
	{
		if(this.status === ConnectStatus.ST_CONNECTING)
			return;
		
		this.onConnectFailed(true);
	}
	
	createTopic()
	{
		let appclientid = UIDUtil.v1()
		.substr(0, 4);
		
		this._handshake_topic = "s/im/" + this._appID + "/route/" + this._userId + "/" + appclientid;
		this._s_topic = "s/im/" + this._appID + "/message/" + this._userId + "/" + this._nimClientConfig.sessionId;
		this._c_topic = "c/im/" + this._appID + "/message/" + this._userId + "/" + this._nimClientConfig.sessionId;
		this._will_topic = "s/im/" + this._appID;
		
		this.log("createTopic _handshake_topic = " + this._handshake_topic + ", _c_topic = " + this._c_topic + ", _s_topic = " + this._s_topic);
	}
	
	onHandleShark()
	{
		super.onHandleShark();
		this.log("onHandleShark 握手成功!!!");
		
		clearTimeout(this._handshakeTimeoutID);
		
		this._resetTimeout();
		
		this.handleConnectStatus(this.status, NIMCode.HANDLE_SHARK);
		
		this.emit(NIMClient.HTTP_START); //长连接连接成功，销毁辅助的短链接
	}
	
	onRepublishHandler(message)
	{
		try
		{
			if(!message)
				return;
			
			let isConnected = this.status === ConnectStatus.ST_CONNECTED;
			
			if(message instanceof NIMMessage && message.messageType)
			{
				if(message.sendNum >= 2 && this._httpCon)
				{
					message.sendNum = message.httpSendNum = 3;
					
					this._httpCon.publish(message);
					return;
				}
				
				this.publish(message);
				
				this.log("onRepublishHandler message = " + message.content);
			}
			else if(message instanceof NetworkMessage)
			{
				message.setMessageid(createMessageId());
				
				this.log(["onRepublishHandler message = ", message.toObject()]);
				
				isConnected && this._client.send(this._s_topic, message.serializeBinary(), 0, false);
			}
		}
		catch(e)
		{
			this.log("onRepublishHandler stack = " + e.stack);
		}
	}
	
	setNimClientConfig(value)
	{
		this._nimClientConfig = value;
		
		this.initMQTTClient();
	}
	
	getNimClientConfig()
	{
		return this._nimClientConfig;
	}
	
	/**
	 * @inheritDoc
	 * @override
	 */
	connect()
	{
		try
		{
			super.connect();
			
			let ct = this._client;
			if(ct)
			{
				if(!ct.isConnected())
				{
					ct.onMessageArrived = this.messageArrived.bind(this);//消息到达，即下行
					ct.onMessageDelivered = this.messageDelivered.bind(this);//消息发送完成
					ct.onConnectionLost = this.connectionLost.bind(this);//连接异常断开
					ct.connect(this._options.getOptions());
				}
				else
				{
					this.onConnected();  //修复握手失败，物理连接没有断开
				}
				
			}
		}
		catch(e)
		{
			this.log("connect stack: " + e.stack);
		}
	}
	
	/**
	 *发布消息
	 *@param {NIMMessage} nimMessage
	 *@param {Boolean} retained 是否保留
	 */
	publish(nimMessage, retained = false)
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
				networkMessage = MessageBufPool.getMessage(MessageType.NETWORK_MESSAGE);
			
			switch(messageType)
			{
				case MessageType.MESSAGE_DOCUMENT:
					message = MessageBufPool.getMessage(MessageType.MESSAGE_DOCUMENT);
					message.setType(nimMessage.type);
					message.setContentstring(nimMessage.content);
					
					networkMessage.setDocumentmessage(message);
					break;
				
				case MessageType.MESSAGE_ORDER:
					message = MessageBufPool.getMessage(MessageType.MESSAGE_ORDER);
					message.setType(nimMessage.type);
					message.setValidtime(nimMessage.validtime);
					message.setExpire(nimMessage.expire);
					message.setTargetid(nimMessage.targetid);
					message.setContent(nimMessage.content);
					
					networkMessage.setOrdermessage(message);
					break;
				
				case MessageType.MESSAGE_REQUEST:
					message = MessageBufPool.getMessage(MessageType.MESSAGE_DOCUMENT);
					message.setType(nimMessage.type);
					message.setContentstring(nimMessage.content);
					
					networkMessage.setDocumentmessage(message);
					break;
				
				case MessageType.MESSAGE_DISCONNECT:
					this.log("publish MessageType.MESSAGE_DISCONNECT...");
					
					message = new NetworkMessage.DisconnectMessage();
					message.setSessionid(this._nimClientConfig.sessionId);
					message.setContent(nimMessage.content);
					
					networkMessage.setDisconnectmessage(message);
					break;
				
				case MessageType.MESSAGE_EVENT:
					message = MessageBufPool.getMessage(MessageType.MESSAGE_EVENT);
					message.setType(nimMessage.type);
					message.setContent(nimMessage.content);
					
					networkMessage.setEventmessage(message);
					break;
				
				default:
					this.log("publish Unknown message type");
					return;
			}
			
			networkMessage.setType(messageType);
			
			let toUser = nimMessage.toUser ? nimMessage.toUser : this._appID,
				toConverid = nimMessage.toConverid;
			
			if(toConverid)
			{
				networkMessage.setToconversation(toConverid);
			}
			
			networkMessage.setTouser(toUser);
			networkMessage.setFromuser(this._userId);
			networkMessage.setMessageid(messageId);
			
			if(qos > MessageACK.NO_ACK && this._nimMessageState)
			{
				if(message.setVersionid)
				{
					message.setVersionid(versionId);
					this._nimMessageState.publish(messageId, nimMessage);
				}
			}
			
			this.log(["publish _s_topic = " + this._s_topic + ", networkmessage:", networkMessage.toObject()]);
			
			this.publishToMqtt(networkMessage, qos, retained);
			
			//mqtt断开连接会直接返回消息发送失败，但会继续尝试发送此条消息
			if(this._client && this._client.isConnected())
			{
				GlobalEvtEmitter.emit(NIMMessageState.MESSAGE_DELIVERED, {
					message: message.contentObject, send: MessageType.STATUS_MESSAGE_SEND_FAILED
				});
			}
		}
		catch(e)
		{
			this.log("publish e.stack = " + e.stack);
		}
	}
	
	/**
	 * 订阅
	 *override
	 */
	subscribe()
	{
		this.log("subscribe this._c_topic2 = " + this._c_topic2 + "this._c_topic = " + this._c_topic);
		
		if(!this._client)
			return;
		
		let subscribeOptions = new SubscribeOptions();
		subscribeOptions.onSuccess = this.onSubSuccessHandler.bind(this);
		subscribeOptions.onFailure = this.onSubFailureHandler.bind(this);
		
		this._client.subscribe(this._c_topic, subscribeOptions.getOptions());
		//this._client.subscribe(this._c_topic2, subscribeOptions.options);
	}
	
	/**
	 *取消订阅
	 *@protected
	 */
	unsubscribe()
	{
		try
		{
			if(this._client && this.status === ConnectStatus.ST_CONNECTED)
			{
				let unsubscribeOptions = new UnsubscribeOptions();
				unsubscribeOptions.invocationContext = {};
				
				this._client.unsubscribe(this._c_topic, unsubscribeOptions.getOptions());
				//this._client.unsubscribe(this._c_topic2, unsubscribeOptions.options);
			}
		}
		catch(e)
		{
			this.log("unsubscribe e.stack: " + e.stack);
		}
	}
	
	_keepAliveMessage = null;
	
	sendKeepAlive()
	{
		this.log("sendKeepAlive...");
		
		super.sendKeepAlive();
		
		if(!this._keepAliveMessage)
		{
			this._keepAliveMessage = MessageBufPool.getMessage(MessageType.NETWORK_MESSAGE);
			this._keepAliveMessage.setType(MessageType.MESSAGE_KEEPALIVE);
			this._keepAliveMessage.setToconversation("NPigeon");
			this._keepAliveMessage.setTouser("NPigeon");
			this._keepAliveMessage.setFromuser(this._userId);
			this._keepAliveMessage.setMessageid("-1");
		}
		
		let tkmsg;
		if(!tkmsg)
		{
			tkmsg = MessageBufPool.getMessage(MessageType.MESSAGE_KEEPALIVE);
			tkmsg.setLastversion(-1);
			tkmsg.setSessionid(this._nimClientConfig.sessionId);
			this._keepAliveMessage.setKeepalivemessage(tkmsg);
		}
		
		this.log(["sendKeepAlive keepaliveMessage", this._keepAliveMessage.toObject()]);
		
		this.publishToMqtt(this._keepAliveMessage, 0, false)
	}
	
	/**
	 * @inheritDoc
	 */
	onConnected()
	{
		try
		{
			if(!this._nimClientConfig)
				return;
			
			super.onConnected();
			
			let message = new NetworkMessage.HandshakeMessage();
			message.setToken(this._nimClientConfig.token);
			message.setDevice(this._nimClientConfig.device);
			message.setIp(this._nimClientConfig.ip);
			message.setAppkey(this._nimClientConfig.appId);
			message.setUserid(this._nimClientConfig.userId);
			message.setSessionid(this._nimClientConfig.sessionId);
			
			let networkMessage = MessageBufPool.getMessage(MessageType.NETWORK_MESSAGE);
			networkMessage.setMessageid(createMessageId());
			networkMessage.setType(MessageType.MESSAGE_HANDSHAKE);
			networkMessage.setHandshakemessage(message);
			networkMessage.setFromuser(this._userId);
			
			this.log(["onConnected publish Handshakemessage sessionId = " + this._nimClientConfig.sessionId, ", HandshakeMessage = ", networkMessage.toObject()]);
			
			this._client.send(this._handshake_topic, networkMessage.serializeBinary(), 1);
			clearTimeout(this._handshakeTimeoutID);
			this._handshakeTimeoutID = setTimeout(() => {
				this.onConnectFailed(true);
				
				this.log("Handshake failed！！！");
			}, 10000)
		}
		catch(e)
		{
			this.log("onConnected stack: " + e.stack);
			
			this.onConnectFailed(true);
		}
	}
	
	onConnectFailed(reconnect, maxReconnectTime = 30)
	{
		super.onConnectFailed(reconnect, maxReconnectTime);
		
		if(this._tryConnectCount >= 1)
		{
			//长连接连接失败，切换至短链接辅助
			this.emit(NIMClient.HTTP_START, false);
		}
	}
	
	handleConnectStatus(status, errorCode = -1)
	{
		GlobalEvtEmitter.emit(NIMMessageState.CONNECT_STATUS, {status, errorCode, mode: 1});
		
		this.log("handleConnectStatus status = " + status + ", errorCode = " + errorCode);
	}
	
	messageArrived(message)
	{
		try
		{
			this.log(["messageArrived message.destinationName = ", message.destinationName]);
			
			if(message && this._nimMessageState)
			{
				let networkMessage = NetworkMessage.deserializeBinary(message.payloadBytes);
				
				//log(["messageArrived message = ", networkMessage.toObject()]);
				
				this._nimMessageState.messageArrived(networkMessage);
			}
		}
		catch(e)
		{
			this.log("message stack: " + e.stack);
		}
	}
	
	messageDelivered(message)
	{
		try
		{
			//if(message && this._nimMessageState)
			//{
			//	let networkMessage = NetworkMessage.deserializeBinary(message.payloadBytes);
			//
			//	this.log(["messageDelivered message = ", networkMessage.toObject()]);
			//
			//	this._nimMessageState.messageDelivered(networkMessage.getMessageid());
			//}
		}
		catch(e)
		{
			this.log("messageDelivered stack: " + e.stack);
		}
		
	}
	
	onSubSuccessHandler()
	{
		this.log("onSubSuccessHandler...");
		
		this.onConnected();
	}
	
	onSubFailureHandler()
	{
		this.log("onSubFailureHandler...");
		
		this.connectionLost(null);
		
		this.handleConnectStatus(this.status);
	}
	
	publishToMqtt(networkMessage, qos, retained)
	{
		this.log("publishToMqtt...");
		
		if(this._client)
		{
			var payload = networkMessage.serializeBinary();
			
			if(this._client.isConnected())
			{
				this._client.send(this._s_topic, payload, qos, retained);
			}
			else
			{
				this.log("publishToMqtt this._client.isConnected() = ", this._client.isConnected());
			}
			
			if(networkMessage.getType() !== MessageType.MESSAGE_KEEPALIVE)
			{
				MessageBufPool.freeMessage(networkMessage);
			}
		}
	}
	
	disconnect(imDis = true)
	{
		try
		{
			if(imDis)
			{
				let message = ObjectPool.getObject(NIMMessage.CLASS_NAME);
				message.messageType = MessageType.MESSAGE_DISCONNECT;
				message.versionId = NIMMessage.messageId();
				message.messageId = NIMMessage.versionId();
				message.qos = 0;
				
				this._client && this._client.isConnected() && this.publish(message);
				
				this._httpCon && this._httpCon.publish(message);
			}
		}
		catch(e)
		{
			this.log(["disconnect e.stack = ", e.stack]);
		}
		
		this.unsubscribe();
		
		clearTimeout(this._handshakeTimeoutID);
		
		this._client && (this._client.onConnectionLost = () => {
		});
		
		if(this._nimMessageState)
		{
			this._nimMessageState.destroy();
		}
		
		super.disconnect();
		
		this._client = null;
		this._nimMessageState = null;
	}
	
	destroy()
	{
		super.destroy();
		
		this.disconnect();
		
		if(this._nimMessageState)
		{
			this._nimMessageState.removeListener(NIMMessageState.PUBLISH, this.onRepublishHandler);
			this._nimMessageState.removeListener(NIMMessageState.HANDLE_SHARK, this.onHandleShark);
			this._nimMessageState = null;
		}
		
		if(this._httpCon)
		{
			this._httpCon.destroy();
			this._httpCon = null;
		}
		
		if(this._nimClientConfig)
		{
			this._nimClientConfig.destroy();
			this._nimClientConfig = null;
		}
	}
	
	log(log, info = LogUtil.INFO)
	{
		LogUtil.trace("NIMMQTTConnection", info, log);
	}
}

function mqttTrace(info)
{
	if(!LogUtil.mqttDebug)
	{
		mqttTrace = function() {
		};
		return;
	}
	
	if(info)
	{
		this.log("mqtt " + info.message);
	}
}

export default NIMMQTTConnection;