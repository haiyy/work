class NtalkerEvent {
	static APP = 'app_ui';  //通向UI所有事件侦听
	static CONSULT_RECEPTION = 'app_ui';  //咨询接待
	static NETWORK_STATUS = 'network_status';  //网络情况
	static T2D = 'session_T2d';  //除去会话以外的上行事件
	static DISPLAY_NO_DATA_VIEW = 'displayNoDataView'; //数据集合没有数据
	static CHAT_DATA_CHANGE = 'chatDataChange';
	static CHAT_DATA_LIST_CHANGE = 'chatDataListChange';
	static SWITCH_CONVER = 'switchConver';
	
	data = null;
}

export default NtalkerEvent;

