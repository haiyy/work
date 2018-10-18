import AbstractChatSentence from './AbstractChatSentence';
import MessageType from '../../../im/message/MessageType';

class AudioChatSentence extends AbstractChatSentence
{
	length = 0;
	
    constructor(message)
    {
        super(message);
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_AUDIO;
    }
	
	serialize()
	{
		return {
			converid: this.sessionID,
			messageid: this.sentenceID,
			createat:this.createTime,
			fromuser: this.userInfo.toWeakObject(),
			message: this.messageBody,
			msgtype:this.messageType,
			status:this.status,
			url:this.url,
			duration:this.duration
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
		this.url = data.url;
		this.duration = data.duration;
		
		if(data.toUsers)
		{
			this.toUsers = data.toUsers;
		}
	}
}

export default AudioChatSentence;
