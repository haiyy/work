import PooledClass from "../../../lib/utils/PooledClass";
class OrderMessage {
	// 消息版本号
	versionid = -1;
	
	// 消息的有效时长
	validtime = -1;
	
	// 过期时间
	expire = -1;
	
	// 目标id，userid/sessionid/conversationid/messageid，必填
	targetid = "";
	
	// 信令消息类型，必填
	type = -1;
	
	// 存放其他内容，扩展字段，选填
	content = "";
	
	constructor()
	{
	}
	
	serialize()
	{
		return {
			versionid: this.versionid,
			targetid: this.targetid,
			type: this.type,
			content: this.content
		};
	}
	
	deserialize(data)
	{
		if(!data)
			return;
		
		let {versionid, targetid, type} = data;
		
		this.versionid = versionid;
		this.targetid = targetid;
		this.type = type;
	}
	
	release()
	{
		OrderMessage.release(this);
	}
}

PooledClass.addPoolingTo(OrderMessage, PooledClass.oneArgumentPooler);

export default OrderMessage;
