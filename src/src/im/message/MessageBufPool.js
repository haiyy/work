import MessageType from "./MessageType";
import { NetworkMessage } from "./NIMMessageProtoBuf";

class MessageBufPool {
	/**
	 * 获取NetworkMessage or NetworkMessage.oneof
	 * @param {int} messageType
	 * @return NetworkMessage.oneof
	 * */
	getMessage(messageType)
	{
		let messages = this.free[messageType];
		if(!messages || messages.length <= 0)
			this.createMessage(messageType);
		
		return this.free[messageType].pop();
	}
	
	freeMessage(message)
	{
		if(!message)
			return;
		
		if(freeTime > freeTimes)
		{
			clear.call(this);
			freeTime = 0;
		}
		else freeTime++;
		
		if(message instanceof NetworkMessage.DocumentMessage)
		{
			this.free[MessageType.MESSAGE_DOCUMENT].push(message);
		}
		else if(message instanceof NetworkMessage.OrderMessage)
		{
			this.free[MessageType.MESSAGE_ORDER].push(message);
		}
		else if(message instanceof NetworkMessage.EventMessage)
		{
			this.free[MessageType.MESSAGE_EVENT].push(message);
		}
		else if(message instanceof NetworkMessage.KeepAliveMessage)
		{
			this.free[MessageType.MESSAGE_KEEPALIVE].push(message);
		}
		else if(message instanceof NetworkMessage)
		{
			this.free[MessageType.NETWORK_MESSAGE].push(message);
			
			switch(message.getType())
			{
				case MessageType.MESSAGE_DOCUMENT:
					this.freeMessage(message.getDocumentmessage());
					message.clearDocumentmessage();
					break;
				
				case MessageType.MESSAGE_EVENT:
					this.freeMessage(message.getEventmessage());
					message.clearEventmessage();
					break;
				
				case MessageType.MESSAGE_ORDER:
					this.freeMessage(message.getOrdermessage());
					message.clearOrdermessage();
					break;
				
				case MessageType.MESSAGE_KEEPALIVE:
					this.freeMessage(message.getKeepalivemessage());
					message.clearKeepalivemessage();
					break;
			}
		}
	}
	
	createMessage(messageType)
	{
		let messageClass;
		switch(messageType)
		{
			case MessageType.MESSAGE_DOCUMENT:
				messageClass = NetworkMessage.DocumentMessage;
				break;
			
			case MessageType.MESSAGE_ORDER:
				messageClass = NetworkMessage.OrderMessage;
				break;
			
			case MessageType.MESSAGE_EVENT:
				messageClass = NetworkMessage.EventMessage;
				break;
			
			case MessageType.NETWORK_MESSAGE:
				messageClass = NetworkMessage;
				break;
			
			case MessageType.MESSAGE_KEEPALIVE:
				messageClass = NetworkMessage.KeepAliveMessage;
				break;
		}
		
		let messageArr = this.free[messageType];
		messageArr = messageArr ? messageArr : [];
		this.free[messageType] = messageArr;
		
		if(!messageClass)
			return;
		
		for(let i = 0; i < _minNum; i++)
		{
			messageArr.push(new messageClass());
		}
	}
	
	free = {};
}

let _minNum = 5,
	MAX_NUM = 50,
	freeTime = 0,
	freeTimes = 1000;//1000次回收，对所有对象个数大于MAX_NUM进行清理

function clear()
{
	try
	{
		let key, messageArr;
		for(key in this.free)
		{
			if(this.free.hasOwnProperty(key))
			{
				messageArr = this.free[key];
				if(messageArr && messageArr.length >= MAX_NUM)
				{
					messageArr.splice(MAX_NUM, messageArr.length - MAX_NUM - 1);
				}
			}
		}
	}
	catch(e)
	{
	}
}

export default new MessageBufPool();