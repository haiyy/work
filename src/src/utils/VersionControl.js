/**版本控制*/
import VisitorFontStyle from "../model/vo/VisitorFontStyle";

class VersionControl {

	//--------------------UserTabs---------------------
	static isBigAvatar = true;  //大小头像
	static chatSort = 1;  // 会话排序 1=>按时间排序 2=>按会话状态排序

	static CHAT_SORT_TIME = 1;
	static CHAT_SORT_STATUS = 2;

	static LAST_MSG_TYPE = 0; // 咨询列表的最后一条消息
	static SOUND_ON = 1;  // 新消息提示音
	static FORCE_OPEN_WINDOW = 0; // 新消息强制弹框

	static INTELLIGENT = "ctrl+q";

	static VISITOR_FONT_STYLE = new VisitorFontStyle();

	static initChatSet = function(data)
	{
		if(!data)
			return;

		VersionControl.LAST_MSG_TYPE = data.lastWord;
		VersionControl.SOUND_ON = data.soundOn;
		VersionControl.FORCE_OPEN_WINDOW = data.forceOpenWindow;
	};

    //--------------------client-lang---------------------
    static isShowLangOption = VersionControl.isShowLangOption2 == 1 || MULTI_LANGUAGE;
    
    static isShowLangOption2 = "{{MULTI_LANGUAGE}}";
}

export default VersionControl;
