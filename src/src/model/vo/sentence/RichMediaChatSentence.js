import TextChatSentence from './TextChatSentence';
import MessageType from '../../../im/message/MessageType';

class RichMediaChatSentence extends TextChatSentence
{
    constructor(message)
    {
        super(message);
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_RICH_MEDIA;
    }
}

export default RichMediaChatSentence;
