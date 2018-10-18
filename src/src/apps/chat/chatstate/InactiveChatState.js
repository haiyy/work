import IChatState from '../api/IChatState';
import ChatState from './ChatState';

class InactiveChatState extends IChatState
{
	constructor(chatData)
	{
	    super(chatData);
		
		this.chatStateType = ChatState.INACTIVE_STATE;
	}

	handleChatDataStateIn(chatstate)
	{
	}

	handleChatDataStateOut()
	{
	}
}

export default InactiveChatState;