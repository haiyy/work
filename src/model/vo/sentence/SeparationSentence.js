import AbstractChatSentence from './AbstractChatSentence';
import MessageType from '../../../im/message/MessageType';
import { getLangTxt } from "../../../utils/MyUtil";

class SeparationSentence extends AbstractChatSentence
{
    constructor()
    {
        super();

        this.messageBody = getLangTxt("consult_separ");
		this.messageType = MessageType.MESSAGE_DOCUMENT_SEPARATION;
    }

	deserialize(data)
	{
		this.sessionID = data.converid;
		this.sentenceID = data.messageid;
		this.createTime = data.createat;
		this.userInfo = data.fromuser;
	}
}

export default SeparationSentence;
