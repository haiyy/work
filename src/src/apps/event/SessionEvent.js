class SessionEvent
{
	//---------------------chat-------------------------------------
    static CHAT_INFO = 'chatInfo';//会话信息
	static STARTCHAT = 'startChatWithGuest';//开始会话
	
	static RESEND_MESSAGE = "resendMessage";
	
    static LOGIN_INFO = 'loginInfo';
    static REGISTER_CHANNEL = 'unregisterChannel';
	
	
	//---------------------APP-------------------------------------
	
	/**3001 remoteGetUserConversation 查询未销毁会话列表*/
	static REQUEST_NOTDESTROYED_COVERS = "requestNotDestroyedCovers";
	/**请求会话资源 3003*/
	static REQUEST_CHAT = 'requestChat';
	/**干系人进入会话（打开聊窗）3005*/
	static REQUEST_ENTER_CHAT = 'requestEnterChat';
	/**提交会话总结 3015*/
	static REQUEST_SUBMIT_SUMMARY = 'requestSubmitSummary';
	/**请求干系人列表*/
	static REQUEST_USERLIST = 'requestUserList';
	/**请求干系人信息*/
	static REQUEST_USERINFO = 'requestUserInfo';
	/**请求监控*/
	static REQUEST_MONITOR = 'requestMonitor';
	/**请求销毁会话*/
	static REQUEST_DESTROY_SESSION = 'requestDestroySession';
	/**请求踢出某会话成员*/
	static REQUEST_KICKOUT_USER = 'requestKickoutUser';
	/**请求更新用户状态*/
	static REQUEST_UPDATE_USERSTATUS = 'requestUpdateUserStatus';
	/**干系人调用该接口请求加入一个已创建的会话，原会话成员列表中无该干系人。*/
	static REQUEST_JOIN_CHAT = 'requestJoinChat';
	
	/**
	 * 请求待处理会话列表
	 * */
	static REQUEST_DESTROY_CONVER_LIST = 'requestDestroyConverList';
	
	/**退出应用*/
	static REQUEST_DISCONNECT = 'requestDisconnect';
	
	/**干系人调用该接口请求加入一个已创建的会话，原会话成员列表中无该干系人。*/
	static NOTIFY_USERINFO_UPDATE = 'NotifyUserInfoUpdate';
	
	//----------------------网络---------------------------------
	
	static CONNECT_STATUS = "connectStatus";
	static RECONNECT = "reconnect";
	
	
}

export default SessionEvent;
