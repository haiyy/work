import IChatState from '../api/IChatState';
import ChatState from './ChatState';
import LogUtil from '../../../lib/utils/LogUtil';
import InputMessage from "../../../model/vo/InputMessage";
import UsualTips from "../view/aside/UsualTips";

class ActiveChatState extends IChatState {
	
	constructor(chatData)
	{
		super(chatData);
		
		this.chatStateType = ChatState.ACTIVE_STATE;
	}
	
	handleChatDataStateIn()
	{
		try
		{
			let chatView = this.chatData.chatView;
			if(!chatView)
				return;
			
			if(this.chatDataVo)
			{
				chatView.setInputMessage(this.chatDataVo.inputMessage ||  new InputMessage(UsualTips.TEXT_TYPE, ""));
				this.chatDataVo.inputMessage = null;
			}
			
			this.chatData.delayToChange();
		}
		catch(e)
		{
			log("handleChatDataStateIn stack: " + e.stack);
		}
	}
	
	handleChatDataStateOut()
	{
		try
		{
			let chatView = this.chatData.chatView;
			if(!chatView)
				return;
			
			let inputMessage = new InputMessage(UsualTips.TEXT_TYPE, chatView.inputMessage);
			
			console.log("ActiveChatState handleChatDataStateOut.inputMessage = ", chatView.inputMessage);
			
			this.chatDataVo.inputMessage = inputMessage;
		}
		catch(e)
		{
			log("handleChatDataStateOut stack: " + e.stack);
		}
	}
	
	handlePredictMessage(message)
	{
		if(message && message.length > 0)
		{
			super.handlePredictMessage(message);
			
			this.chatData.delayToChange();
		}
	}
	
	handleUserEnter(userID, userInfoStr)
	{
		
	}
	
	handleUserLeave(userID)
	{
		
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('ActiveChatState', info, log);
}

export default ActiveChatState;
