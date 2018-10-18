import IChatState from '../api/IChatState';
import ChatState from './ChatState';

class ClosedChatState extends IChatState
{
	constructor(args)
	{
		super();
		
		this.chatStateType = ChatState.CLOSED_STATE;
	}

	handleChatDataStateIn()
	{
		//反注册chatData
		return true;
	}

	handleChatDataStateOut()
	{
		return true;
	}

}

export default ClosedChatState;