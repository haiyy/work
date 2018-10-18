class OpenConverType {
	
	static VISITOR_ACTIVE_REQUEST = 0;  //访客-主动打开-请求会话资源
	static VISITOR_PASSIVE_JOIN = 1;  //访客-被动打开-请求加入会话
	static VISITOR_PASSIVE_REQUEST = 2;  //访客-被动打开-请求加入会话（只打开窗口，不做服务器请求）
	static COLLEAGUE_ACTIVE = 3;  //同事-主动打开
	static VISITOR_PASSIVE_REQUEST_TO_SERVER = 4;  //与VISITOR_PASSIVE_REQUEST配对，当openType === 4时，不影响UI显示
}

export default OpenConverType;