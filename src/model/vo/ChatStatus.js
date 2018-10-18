class ChatStatus
{
	/**
	 *会话新建状态，等待会话任务
	 */
	static IDLE = 1;
	
	/**
	 *准备状态，
	 * 会话创建成功，等待干系人加入会话
	 */
	static READY = 2;
	
	/**
	 *会话进行中，
	 *干系人已进入会话，能够正常的收发消息
	 */
	static TALK = 3;
	
	/**
	 *挂起状态
	 * 干系人全部离开会话，等待干系人重新进入会话或销毁
	 */
	static SLEEP = 4;
	
	/**
	 *销毁状态
	 * 验证会话有效性后停止会话
	 */
	static DESTROY = 5;
	
	//--------------------------会话中成员状态---------------------------
	static PROHIBIT = -1;  //禁言
	static NEW_ALLOCATED = 0;  //新会话
	static CHATING = 1;  //会话中
	static CLOSED = 2;  //对方已关闭会话
	static Exit = 3;  //对方已经退出会话
	static MONITOR = 4;  //监控
	static OFFLINE = 5;  //对方已离线
	
	//--------------------------------end--------------------------------
	
	static CHANGE_EVENT = "CHANGE_EVENT";
}

Object.freeze(ChatStatus);

export default ChatStatus;