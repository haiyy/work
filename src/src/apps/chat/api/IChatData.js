class IChatData {
	
    /**
     * 发送消息
     * @param {String} content
     * @param {String} type
     * */
    sendMessage(content, type) { }

	/**邀请评价*/
	requestEvaluation()
	{
	}
	
	/**提交总结*/
	requestSubmitSummary(from, summary)
	{
	}
	
	/**请求历史消息*/
	requestHistoryMessage()
	{
	}
	
	/**消息预知*/
	notifyUserInputing(message)
	{
	}
	
	/**退出会话*/
	requestExitSession()
	{
	}
	
	/**离开会话*/
	requestLeaveSession()
	{
	}
	
	/**回去转接数据*/
	get transferActionData()
	{
	}
	
	close()
	{
	}
	
}

export default IChatData;