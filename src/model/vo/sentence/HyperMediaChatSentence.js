import AbstractChatSentence from "./AbstractChatSentence";
import MessageType from "../../../im/message/MessageType";

class HyperMediaChatSentence extends AbstractChatSentence {
	
	static GETTING_PARAMS = 0; //0=>获取数据参数
	static GETTED_PARAMS = 1; //1=>获取参数完成
	static LOADING_IFRAME = 0; //2=>正在加载iframe
	static LOADED_IFRAME = 0; //3=>加载iframe完成
	
	constructor(message)
	{
		super(message);
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_HYPERMEDIA;
		
		this.params = [];
		
		this.progress = -1; // -1=>初始
	}
	
	serialize()
	{
		return {
			converid: this.sessionID,
			messageid: this.sentenceID,
			createat: this.createTime,
			fromuser: this.userInfo.toWeakObject(),
			message: this.messageBody,
			msgtype: this.messageType,
			status: this.status,
			params: this.params,
			position: this.position || 0
		};
	}
	
	deserialize(data)
	{
		this.sessionID = data.converid;
		this.sentenceID = data.messageid;
		this.status = data.status;
		this.createTime = data.createat;
		this.userInfo = data.fromuser;
		this.expiredTime = data.expiredtime;
		this.messageBody = data.message;
		this.position = data.position;
		this.params = data.params;
		
		if(data.toUsers)
		{
			this.toUsers = data.tousers;
		}
	}
}

export default HyperMediaChatSentence;