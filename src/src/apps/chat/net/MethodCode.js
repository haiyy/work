/**
 *与服务器之间API的代码
 * */
class MethodCode {

	//------------------T2D----------------------------------------
	/**请求用户详细信息*/
	static remoteGetUserInfo = 2001;

	/**请求更新用户状态*/
	static remoteUpdateUserStatus = 2002;
	
	/**
	 * 请求待处理会话列表
	 * */
	static remoteGetDestroyConverList = 4002;

	//-----------------TCHAT---------------------------------------

	/**查询已销毁会话列表，即访客历史消息会话列表*/
	static remoteDestoryConversations = 3000;

	/**查询未销毁会话列表 remoteGetUserConversation*/
	static requestNotDestroyedCovers = 3001;

	/**查询会话信息*/
	static remoteGetConversationInfo = 3002;

	/**请求会话资源*/
	static remoteRequestChat = 3003;

	/**请求加入会话*/
	static remoteJoinConversation = 3004;

	/**进入会话（打开聊窗）*/
	static remoteEnterConversation = 3005;

	/**发送消息*/
	static remoteSendMessage = 3006;

	/**请求退出会话*/
	static remoteLeaveSession = 3007;

	/**干系人退出会话*/
	static remoteExitSession = 3008;

	//请求会话评价内容？？？？
	static remoteGetEvaluationInfo = 3009;
	//终止正在进行的会话remoteTerminateConversation
	static remoteDestroySession = 3012;

	/**增加会话成员*/
	static remoteAddConversationMember = 3013;

	/**将成员踢出会话 RemoveConversationMember*/
	static remoteKickoutUser = 3014;

	/**发送正在输入消息remoteOnPredictMessage*/
	static remoteUserInputing = 3016;

	//会话成员禁言/解禁
	static remoteDisableSendMsg = 3017;

	/**发起协同会话*/
	static remoteCooperate = 3101;

	/**发起协同会话*/
	static remoteCooperateAction = 3102;

	//质检会话
	static remoteQualityConversation = 3201;

	//总结会话 remoteSummaryConversation
	static remoteSubmitSummary = 3202;
	/**邀请评价*/
	static remoteRequestEvaluation = 3203;
}

export default MethodCode;
