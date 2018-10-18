import IPool from "../../lib/api/IPool";
import ObjectPool from "../../lib/utils/ObjectPool";

class NIMMessage extends IPool {
	
	messageid = 0;
	versionId = 0;
	qos = 0;
	
	constructor()
	{
		super();
		
		this.poolType = "NIMMessage";
	}
	
	clear()
	{
		this.type = 11;
		this.messageId = -1;
		this.messageType = -1;
		this.content = null;
		this.contentObject = null;
		this.sendingTime = -1;
		this.sendNum = 0;
		this.qos = 0;
		this.validtime = -1;
		this.expire = -1;
		this.targetid = -1;
	};
	
	toString()
	{
		return JSON.stringify(this);
	}
	
	static versionId = function()
	{
		return new Date().getTime()
			.toString()
			.substr(4) + mid_version + deviceType;
	};
	
	static messageId()
	{
		if(mid_version > MAX_VERSIONID)
		{
			mid_version = 0;
		}
		
		return mid_version++;
	}
	
	static setDeviceType(value)
	{
		deviceType = value;
	}
	
	static CLASS_NAME = "NIMMessage";
	
	type = 11;//文档消息
	messageType = -1;//NetWorkMessage.MessageType，IM专用
	content = null;//消息载体
	contentObject = null;//消息原形
	
	validtime = -1;
	expire = -1;
	targetid = -1;
	
	sendingTime = -1;//发送时间
	sendNum = 0;//发送次数
	httpSendNum = 0;//发送次数
	httpSendingTime = -1;//发送时间
	
	toUser = "";
	toConverid = "";
}

let mid_version = 0,
	MAX_VERSIONID = 65535,
	deviceType = "";

ObjectPool.registerClass(NIMMessage.CLASS_NAME, NIMMessage);

export default NIMMessage;