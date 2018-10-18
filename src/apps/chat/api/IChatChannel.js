import events from "events";

class IChatChannel extends events.EventEmitter {
	
	constructor(props)
	{
		super(props);
		
		this.callBack = null;
	}
	
	onNotifyChatInfo(members, senceInfo)
	{
		
	}
	
	onNotifyHistoryMessage(msgArray)
	{
		
	}
	
	/**
	 *接收消息
	 * @param {Object} content 消息详细内容
	 */
	onNotifyReceiveMessage(content)
	{
		
	}
	
	/**
	 *进入会话
	 * @param {Object} userId 用户ID
	 * @param {Object} userInfo　用户信息
	 * */
	onNotifyUserEnter(userId, userInfo)
	{
		
	}
	
	/**
	 *离开会话
	 * */
	onNotifyUserLeave(userId)
	{
		
	}
	
	/**
	 *退出会话
	 * */
	onNotifyUserExit(userId)
	{
		
	}
	
	/**会话强制销毁*/
	onNotifySessionDestroy(from, reason)
	{
		
	}
	
	onNotifyEvaluationResult(result)
	{
	}
	
	/**对方正在输入*/
	onNotifyUserInputting(message)
	{
		
	}
	
	onNotifyTransferAction(action, srcId, sessionID, type, reason)
	{
		
	}
	
	onNotifyTakeover()
	{
		
	}
	
	/**
	 * 获取会话成员列表
	 * */
	onNotifyUserList(users)
	{
		
	}
	
	/**
	 *会话成员信息变化事件
	 * */
	onNotifyUserChanged(uid, userinfo)
	{
		
	}
}

export default IChatChannel;