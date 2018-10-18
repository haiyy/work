import MQTTConnection from "./MQTTConnection";
import NIMMessageState from "../core/NIMMessageState";

class KeepAliveConnection extends MQTTConnection {
	
	MAX_KEEPALIVE_UNCONFIRMED_TIMES = 2;
	KEEP_ALIVE_INTERVAL = 45 * 1000;//30 * 1000;
	
	_kpInterval = -1;
	_sendKeepAliveUnconfirmedCount = 0;
	
	constructor(args)
	{
		super(args);
		
		this.sendKeepAlive = this.sendKeepAlive.bind(this);
		
		this._onSendKeepAliveSuccess = this._onSendKeepAliveSuccess.bind(this);
	}
	
	onMQTTConnected()
	{
		super.onMQTTConnected();
		
		if(this._nimMessageState)
		{
			this._nimMessageState.removeListener(NIMMessageState.KEEPALIVE_SUCCESS, this._onSendKeepAliveSuccess);
			
			this._nimMessageState.on(NIMMessageState.KEEPALIVE_SUCCESS, this._onSendKeepAliveSuccess);
		}
	}
	
	onConnectFailed(reconnect, maxReconnectTime = 30)
	{
		super.onConnectFailed(reconnect, maxReconnectTime);
		
		this.stopSendKeepAlive();
	}
	
	sendKeepAlive()
	{
		this._sendKeepAliveUnconfirmedCount++;
		
		this._hanleSendKeepAlive();
	}
	
	_onSendKeepAliveSuccess()
	{
		this.log("onSendKeepAliveSuccess...");
		
		this._sendKeepAliveUnconfirmedCount = 0;
	}
	
	stopSendKeepAlive()
	{
		this.log("stopSendKeepAlive..." + this._kpInterval);
		
		clearInterval(this._kpInterval);
		
		this._kpInterval = -1;
		this._sendKeepAliveUnconfirmedCount = 0;
	}
	
	_resetTimeout()
	{
		this.log("_resetTimeout...");
		
		clearInterval(this._kpInterval);
		
		if(this.KEEP_ALIVE_INTERVAL > 0)
		{
			this._kpInterval = setInterval(this.sendKeepAlive, this.KEEP_ALIVE_INTERVAL);
		}
	}
	
	_hanleSendKeepAlive()
	{
		this.log("hanleSendKeepAlive _sendKeepAliveUnconfirmedCount = " + this._sendKeepAliveUnconfirmedCount);
		
		if(this._sendKeepAliveUnconfirmedCount >= this.MAX_KEEPALIVE_UNCONFIRMED_TIMES)
		{
			this.log("handleSendKeepAlive: send keepAlive timeout");
			
			this.onConnectFailed(true);
		}
	}
	
	disconnect()
	{
		super.disconnect();
		
		this.stopSendKeepAlive();
		
		if(this._nimMessageState)
		{
			this._nimMessageState.removeListener(NIMMessageState.KEEPALIVE_SUCCESS, this._onSendKeepAliveSuccess);
		}
	}
}

export default KeepAliveConnection;