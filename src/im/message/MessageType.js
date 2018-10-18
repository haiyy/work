class MessageType {
	
	static NETWORK_MESSAGE = -1;//所有消息的父类
	
	static MESSAGE_HANDSHAKE = 0;
	// keepalive消息
	static MESSAGE_KEEPALIVE = 1;
	// 主动断开消息
	static MESSAGE_DISCONNECT = 2;
	// 空消息
	static MESSAGE_INVALID = 3;
	// 拉取消息
	static MESSAGE_QUEST = 4;
	// 信令消息
	static MESSAGE_ORDER = 5;
	// 文档消息
	static MESSAGE_DOCUMENT = 6;
	// 事件消息
	static MESSAGE_EVENT = 7;
	
	static MESSAGE_RESULT = 8;
	
	static MESSAGE_SYNCH = 9;
	
	static MESSAGE_REQUEST = 10;
	
	// 文本消息
	static MESSAGE_DOCUMENT_TXT = 11;
	// 图片消息
	static MESSAGE_DOCUMENT_IMAGE = 12;
	// 短语音
	static MESSAGE_DOCUMENT_AUDIO = 13;
	// 短视频
	static MESSAGE_DOCUMENT_VIDEO = 14;
	// 超媒体
	static MESSAGE_DOCUMENT_HYPERMEDIA = 15;
	// 优惠券或红包消息
	static MESSAGE_DOCUMENT_COUPON = 16;
	/**文件传输消息*/
	static MESSAGE_DOCUMENT_FILE = 17;
	/**富文本*/
	static MESSAGE_DOCUMENT_RICH_MEDIA = 18;
	/**命令消息通道*/
	static MESSAGE_DOCUMENT_COMMAND = 19;
	/**分割消息*/
	static MESSAGE_DOCUMENT_SEPARATION = 20;
	
	// 用户下线
	static STATUS_USER_OFFLINE = 21;
	// 用户上线
	static STATUS_USER_ONLINE = 22;
	// session忙碌
	static STATUS_SESSION_BUSY = 23;
	// session离开
	static STATUS_SESSION_AWAY = 24;
	// session隐身
	static STATUS_SESSION_HIDE = 25;
	
	// 会话创建
	static STATUS_CONVERSATION_CREATE = 31;
	// 会话销毁
	static STATUS_CONVERSATION_DESTROY = 32;
	// 会话暂停
	static STATUS_CONVERSATION_FORZEN = 33;
	// 成员加入会话
	static STATUS_CONVERSATION_MEMBER_JOIN = 34;
	// 成员离开会话
	static STATUS_CONVERSATION_MEMBER_LEAVE = 35;
	// 成员禁言
	static STATUS_CONVERSATION_MEMBER_FORZEN = 36;
	// 成员解禁
	static STATUS_CONVERSATION_MEMBER_FREE = 37;
	
	// 消息已到达服务器
	static STATUS_MESSAGE_SEND_SENT = 41;
	// 消息发送失败
	static STATUS_MESSAGE_SEND_FAILED = 42;
	// 消息已被接收　IM没有做
	static STATUS_MESSAGE_SEND_RECEIVED = 43;
	// 消息已被读取
	static STATUS_MESSAGE_SEND_READ = 44;
	// 文件已被下载
	static STATUS_MESSAGE_SEND_DOWNLOAD = 45;
	// 消息销毁
	static STATUS_MESSAGE_SEND_CANCEL = 46;
	// 消息已被其他端接收
	static STATUS_MESSAGE_RECEIVE_MULTIPLE = 47;
	// 消息已被其他端读取
	static STATUS_MESSAGE_RECEIVE_READ = 48;
	// 消息已被其他端监听
	static STATUS_MESSAGE_RECEIVE_LISTENED = 49;
	
	static RESULT_MESSAGE_HANDLESHAKE = 61;
	static RESULT_MESSAGE_DISCONNECT = 62;
	static RESULT_MESSAGE_KEEPLIVE = 63;
	
	static RESULT_MESSAGE_KICK_OFF = 65;  //互踢现象，强制下线
	static RESULT_MESSAGE_NEXTCHECK_SET = 67;  //下次拉去时，版本号与拉去时间的设置
	
	static REQUEST_MESSAGE_HISTORY = 71;
}

export default MessageType;
