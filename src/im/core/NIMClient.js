import Lang from "../i18n/Lang";
import LogUtil from "../../lib/utils/LogUtil";
import ObjectPool from "../../lib/utils/ObjectPool";
import NIMCode from "../error/NIMCode";
import INIMCallBack from "../api/INIMCallBack";
import MessageType from "../message/MessageType";
import NIMMessage from "../message/NIMMessage";
import NIMClientConfig from "./NIMClientConfig";
import NIMMQTTConnection from "../connect/NIMMQTTConnection";
import NIMHTTPConnection from "../connect/NIMHTTPConnection";
import { setDeviceType, createMessageId } from "../../lib/utils/Utils";
import ConnectStatus from "../connect/ConnectStatus";

/**
 *IM SDK入口
 **/
class NIMClient {
	
	_connection = null;
	
	static HTTP_START = "HTTP_START";
	
	/**
	 * @description 初始化NIMClient
	 * @param {NIMClientConfig} nimConfig - 基础配置
	 * @param {INIMCallBack} icallBack - 下行到业务逻辑层的API
	 */
	init(nimConfig, icallBack)
	{
		log("IMSDK init...");
		
		this.validate(nimConfig, icallBack);
		
		//Lang.setI18n(nimConfig.i18n);
		
		this.onHttpStart = this.onHttpStart.bind(this);
		
		if(window && window.WebSocket)
		{
			this._connection = new NIMMQTTConnection(nimConfig);
			this._connection.on(NIMClient.HTTP_START, this.onHttpStart);
		}
		else
		{
			this._connection = new NIMHTTPConnection(nimConfig);
		}
		
		NIMMessage.setDeviceType(nimConfig.deviceType);
		
		setDeviceType(nimConfig.deviceType);
	}
	
	/**
	 * 建立与服务器之间的连接
	 */
	connect()
	{
		log("connect...");
		
		if(!this._connection)
			return;
		
		this._connection.connect();
	}
	
	onHttpStart(destroy = true)
	{
		if(destroy)
		{
			if(this._httpCon)
			{
				this._httpCon.destroy(false);
				this._httpCon = null;
			}
			
			log("onHttpStart 销毁辅助短链接...");
			return;
		}
		
		if(this._httpCon)
			return;
		
		if(this._connection)
		{
			let config = this._connection.getNimClientConfig();
			
			if(config)
			{
				log("onHttpStart 启动辅助短链接...");
				
				this._httpCon = new NIMHTTPConnection(config);
				this._httpCon.connect();
			}
		}
	}
	
	/**
	 *  @description 发布消息
	 *  @param {Object | NIMMessage | String} payload - 需要发布的消息 Object or NIMMessage
	 *  @param {int} type - 业务逻辑上的业务逻辑
	 *  @param {int} qos - 0 -> 不需 要ACK，1 -> 需要ACK, 2 -> 需要ACK并返回消息发送状态
	 *  @param {String} toConverid - 向某个会话发送
	 *  @param {String} toUser - 向某个人发送
	 *  @param {int} messageType - 消息类型 NetWorkMessage.MessageType，IM专用
	 *  @param {String} messageId - 消息
	 * */
	publish(payload, type, qos = 0, toConverid = "", toUser = "", messageType = MessageType.MESSAGE_DOCUMENT, messageId = "")
	{
		if(!this._connection)
			return;
		
		let nimMessage;
		if(payload instanceof NIMMessage)
		{
			nimMessage = payload;
		}
		else
		{
			nimMessage = ObjectPool.getObject(NIMMessage.CLASS_NAME);
			nimMessage.contentObject = payload;
			
			if(typeof payload === "string")
			{
				nimMessage.content = payload;
			}
			else if(typeof payload === "number")
			{
				nimMessage.content = payload + "";
			}
			else if(typeof payload === "object")
			{
				nimMessage.content = JSON.stringify(payload);
				nimMessage.targetid = payload.messageid;
			}
		}
		
		nimMessage.messageType = messageType;
		nimMessage.type = type;
		nimMessage.versionId = NIMMessage.messageId();
		nimMessage.messageId = messageId ? messageId : createMessageId();
		nimMessage.qos = qos;
		nimMessage.toUser = toUser;
		nimMessage.toConverid = toConverid;
		
		log("publish qos = " + qos + ", messageid = " + nimMessage.messageId);
		
		this._connection.publish(nimMessage);
		
		if(this._httpCon && this._httpCon.status === ConnectStatus.ST_CONNECTED)
		{
			this._httpCon.publish(nimMessage);
		}
	}
	
	/**
	 * 断开与服务器之间的连接
	 */
	doDisconnect()
	{
		log("doDisconnect...");
		
		if(this._connection)
		{
			this._connection.disconnect();
		}
		
		if(this._httpCon)
		{
			this._httpCon.disconnect();
		}
	}
	
	destroy()
	{
		log("destroy...");
		
		if(this._connection)
		{
			this._connection.destroy();
			this._connection.removeListener(NIMClient.HTTP_START, this.onHttpStart);
			this.onHttpStart = null;
		}
		
		if(this._httpCon)
		{
			this._httpCon.destroy();
		}
		
		this._connection = null;
		this._httpCon = null;
	}
	
	validate(nimConfig, icallBack)
	{
		if(!nimConfig || !(nimConfig instanceof NIMClientConfig))
		{
			throw Lang.getError(NIMCode.TYPE_ERROR, ["init", "nimConfig", "NIMClientConfig"]);
		}
		else if(!nimConfig.validate())
		{
			throw Lang.getError(NIMCode.VALIDATE_ERROR, ["NIMClientConfig"]);
		}
		
		if(!icallBack || !(icallBack instanceof INIMCallBack))
		{
			throw Lang.getError(NIMCode.TYPE_ERROR, ["init", "icallBack", "INIMCallBack"]);
		}
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NIMClient", info, log);
}

export default NIMClient;