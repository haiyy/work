import NIMCode from "../error/NIMCode";
import ConnectStatus from "./ConnectStatus";
import NIMMessageState from "../core/NIMMessageState";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import { EventEmitter } from "events";

class MQTTConnection extends EventEmitter {
	
	_tryConnectCount = 0;
	_tryCount = -1;
	status = -1;
	_startConnectTime = -1;
	_tryTimerInterval = -1;
	
	toConnectTime = 1000;
	
	constructor(args)
	{
		super(args);
		
		this._client = null;
		
		this.RECONNECT_FAILED_TIME = 15;
		
		this.RECONNECT_INTERVAL_TIME = 1;
		
		//this.MAX_RECONNECT_TIME = 30;//处理重连超过时间
		
		this.onKickOff = this.onKickOff.bind(this);
	}
	
	onKickOff()
	{
		this.disconnect();
		
		this.handleConnectStatus(this.status, NIMCode.KICK_OFF);
		
		this.destroy();
	}
	
	/**
	 * 连接服务器
	 * */
	connect()
	{
		this._tryConnectCount++;
		
		this.log("connect status = " + this.status + ", _tryConnectCount = " + this._tryConnectCount);
		
		if(this.status === ConnectStatus.ST_DISCONNECT)
		{
			if(this._startConnectTime <= 0)
			{
				this._startConnectTime = new Date().getTime();
			}
			
			this.onConnecting();
		}
	}
	
	disconnect()
	{
		try
		{
			this.log("disconnect...");
			
			this.status = ConnectStatus.ST_DISCONNECT;
			
			this.stopConnectTimer();
			
			let _client = this._client;
			
			if(_client)
			{
				this.unsubscribe();
				
				_client.stopTrace();
				_client.isConnected() && _client.disconnect();
				
				if(_client.clear) _client.clear();
			}
			
			GlobalEvtEmitter.removeListener(NIMMessageState.KICK_OFF, this.onKickOff);
		}
		catch(e)
		{
			this.log("disconnect e.stack:" + e.stack);
		}
	}
	
	subscribe()
	{
		
	}
	
	unsubscribe()
	{
		
	}
	
	connectionLost(response)
	{
		this.log("connectionLost response = " + response.errorMessage, this.status);
		
		this.status = ConnectStatus.ST_DISCONNECT;
		
		this.onConnectFailed(true);
		
		this.handleConnectStatus(this.status, NIMCode.DISCONNECT_LOST_ERROR);
	}
	
	onConnecting()
	{
		this.status = ConnectStatus.ST_CONNECTING;
		this.handleConnectStatus(this.status, NIMCode.RECONNECTING_ERROR);
	}
	
	/**IM连接成功建立*/
	onConnected()
	{
		this.log("onConnected...");
		
		this.status = ConnectStatus.ST_CONNECTED;
		
		GlobalEvtEmitter.on(NIMMessageState.KICK_OFF, this.onKickOff);
		
		this.handleConnectStatus(this.status);
	}
	
	/**MQTT连接成功建立*/
	onMQTTConnected()
	{
		this.log("onMQTTConnected...");
		
		this.status = ConnectStatus.ST_MQTT_CONNECTED;
		this.subscribe();
	}
	
	onHandleShark()
	{
		this._tryConnectCount = 0;
	}
	
	onConnectSuccessHandler()
	{
		this.log("onConnectSuccessHandler...");
		
		this.reset();
		
		this.stopConnectTimer();
		this.onMQTTConnected();
	}
	
	onConnectFailureHandler()
	{
		this.log("onConnectFailureHandler...");
		
		this.onConnectFailed(true, 15);
	}
	
	/**
	 * 连接失败
	 * @param reconnect Boolean 是否重连
	 * @param maxReconnectTime int 重连最大时间
	 */
	onConnectFailed(reconnect, maxReconnectTime = 30)
	{
		this.log("onConnectFailed reconnect = " + reconnect + ", maxReconnectTime = " + maxReconnectTime);
		
		this.status = ConnectStatus.ST_DISCONNECT;
		
		this.handleReconnectTimeOut(maxReconnectTime);
		
		if(reconnect)
		{
			this.startReconnect();
		}
	}
	
	handleConnectStatus(status, errorCode = -1)
	{
		
	}
	
	reset()
	{
		this._tryTimerInterval = -1;
		this._tryCount = -1;
		this._startConnectTime = 0;
	}
	
	getRandRangeInterval()
	{
		let randomNum = Math.round(MIN_RECONNECT_INTERVAL + (Math.random() * (MAX_RECONNECT_INTERVAL - MIN_RECONNECT_INTERVAL)));
		return randomNum;
	}
	
	startReconnect()
	{
		if(this._tryTimerInterval <= 0)
		{
			this._tryTimerInterval = this.getTryTimerInterval();
		}
		
		if(this._tryCount < 0)
		{
			this._tryCount = 0;
		}
		
		this.log("startReconnect _tryTimerInterval = " + this._tryTimerInterval);
		
		this.startConnectTimer();
	}
	
	startConnectTimer()
	{
		this.stopConnectTimer();
		
		this.log("startConnectTimer...");
		
		this._connectTimer = setInterval(this.onConnectTimerHandler.bind(this), this.toConnectTime);
	}
	
	stopConnectTimer()
	{
		this.log("stopConnectTimer...");
		
		clearInterval(this._connectTimer);
		this._connectTimer = -1;
	}
	
	getTryTimerInterval()
	{
		let spentTime = 0;
		
		if(this._startConnectTime > 0)
		{
			var now = new Date().getTime();
			spentTime = (now - this._startConnectTime) / 1000;
			spentTime = parseInt(spentTime);
		}
		
		let interval = spentTime <= this.RECONNECT_FAILED_TIME ? this.RECONNECT_INTERVAL_TIME : this.getRandRangeInterval();
		return interval;
	}
	
	onConnectTimerHandler()
	{
		if(this._tryTimerInterval < 0)
		{
			this.log("onConnectTimerHandler _tryTimerInterval = ", this._tryTimerInterval);
			
			this.stopConnectTimer();
			return;
		}
		
		if(this._tryCount >= 0)
		{
			this._tryCount++;
		}
		
		this.log("onConnectTimerHandler _tryCount = " + this._tryCount);
		
		if(this._tryCount > 0 && this._tryTimerInterval > 0 && (this._tryCount % this._tryTimerInterval == 0))
		{
			this.log("onConnectTimerHandler start connect _tryTimerInterval = " + this._tryTimerInterval);
			
			this._tryTimerInterval = -1;
			this._tryCount = -1;
			
			this.hanleReconnect();
		}
	}
	
	handleReconnectTimeOut(maxReconnectTime)
	{
		if(this._startConnectTime <= 0)
			return;
		
		let now = new Date().getTime();
		let spentTime = (now - this._startConnectTime) / 1000;
		spentTime = parseInt(spentTime);
		
		if(spentTime > maxReconnectTime)
		{
			this.handleConnectStatus(this.status, NIMCode.RECONNECT_FAILED_ERROR);
			
			this.log("handleReconnectTimeOut 连接超时...");
		}
		else
		{
			this.handleConnectStatus(this.status, NIMCode.RECONNECTING_ERROR);
		}
	}
	
	hanleReconnect()
	{
		try
		{
			this.log("hanleReconnect start reconnect");
			
			this.stopConnectTimer();
			
			if(this._client && this.status === ConnectStatus.ST_CONNECTED)
			{
				this.unsubscribe();
				
				this._client.disconnect();
			}
			
			this.connect();
		}
		catch(e)
		{
			this.log("hanleReconnect e.stack: " + e.stack);
		}
	}
	
	destroy()
	{
		this.stopConnectTimer();
	}
	
	log()
	{
	}
}

let MIN_RECONNECT_INTERVAL = 10,
	MAX_RECONNECT_INTERVAL = 16;

export default MQTTConnection;