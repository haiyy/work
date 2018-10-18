import VersionControl from "./VisitorFontStyle";

/**
 * 最后一句话显示类型
 * */
class LastMsgType
{
    /**访客*/
    static GUESTER = 2;

    /**客服*/
    static CUSTOMER = 1;

    /**会话*/
    static AUTO = 0;
    
    static is(isCustomer)
    {
    	let lastMsgType = VersionControl.LAST_MSG_TYPE;
    	
	    if((lastMsgType == LastMsgType.CUSTOMER && !isCustomer)
		    || (lastMsgType == LastMsgType.GUESTER && isCustomer))
		    return false;
	    
	    return true;
    }
}

export default LastMsgType;
