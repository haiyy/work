import DocumentMessage from "./DocumentMessage";
import OrderMessage from "./OrderMessage";
import ResultMessage from "./ResultMessage";
import PooledClass from "../../../lib/utils/PooledClass";

class NetworkMessage {
	
	messageid = ""; //string
	messageType = -1; // int32 消息类型
	fromUser = "";//string 发送者
	fromConversation = ""; //string 发送者
	toUser = ""; //string 接收者user
	toConversation = "";//// 接收者conversation
	
	message = null;
	
	constructor()
	{
	
	}
	
	serialize()
	{
		if(!this.message)
			return {};
		
		return {
			messageid: this.messageid,
			type: this.messageType,
			fromUser: this.fromUser,
			fromConversation: this.fromConversation,
			toConversation: this.toConversation,
			toUser: this.toUser,
			[className[this.messageType]]: this.message.serialize()
		};
	}
	
	deserialize(data)
	{
		if(!data)
			return;
		
		let {messageid, type, fromUser, fromConversation, toUser, toConversation} = data,
			classObject = classMap[type],
			key = className[type];
		
		this.messageid = messageid;
		this.messageType = type;
		this.fromUser = fromUser;
		this.fromConversation = fromConversation;
		this.toUser = toUser;
		this.toConversation = toConversation;
		
		this.message = classObject.getPooled();
		
		if(key && data[key])
		{
			this.message.deserialize(data[key]);
		}
		
		return this;
	}
	
	destroy()
	{
		if(this.message)
		{
			this.message.release();
			this.message = null;
		}
	}
}

let classMap = {
		5: OrderMessage,
		6: DocumentMessage,
		8: ResultMessage
	},
	className = {
		0: "handshakeMessage",
		1: "keepAliveMessage",
		2: "disconnectMessage",
		3: "",
		4: "",
		5: "orderMessage",
		6: "documentMessage",
		7: "",
		8: "resultMessage",
	};

PooledClass.addPoolingTo(NetworkMessage, PooledClass.oneArgumentPooler);

export default NetworkMessage;


