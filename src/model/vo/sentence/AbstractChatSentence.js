import MessageType from '../../../im/message/MessageType';
import { loginUser } from '../../../utils/MyUtil';
import UserInfo from "../UserInfo";
import { getUserName } from "../RosterUser";

class AbstractChatSentence {
	
	_createTime;
	_bmine = true;
	_userInfo;
	
	/**
	 * 命令消息通道
	 * msgType = 2    咨询发起页；
	 * msgType = 5    商品信息页；
	 * msgType = 7    erpparam信息或者和语言类型
	 */
	static COMMAND_MSG_TYPE = 5;
	
	constructor(message)
	{
		/**消息ID*/
		this.sentenceID = '';
		
		/**消息类型：文本...*/
		this.messageType = -1;
		
		/**消息已送达 MessageType*/
		this.status = -1;
		
		/**会话ID*/
		this.sessionID = '';
		
		/**消息内容*/
		this.messageBody = null;
		
		/**消息有效时间*/
		this.expiredTime = 0;
		
		/**接收消息对象*/
		this.toUsers = null;
		
		if(message)
		{
			this.deserialize(message);
		}
	}
	
	get createTime()
	{
		if(this._createTime instanceof Date)
		{
			return this._createTime.getTime();
		}
		
		return this._createTime;
	}
	
	/**发送时间
	 * {Date}
	 * */
	set createTime(value)
	{
		if(value instanceof Date)
		{
			this._createTime = value;
		}
		else
		{
			this._createTime = new Date(value);
		}
	}
	
	serialize()
	{
		throw 'Abstract Method';
	}
	
	deserialize(data)
	{
		throw 'Abstract Method';
	}
	
	equal(value)
	{
		if(!value)
			return false;
		
		return value.sentenceID === this.sentenceID;
	}
	
	get bsystem()
	{
		return this.messageType == MessageType.MESSAGE_DOCUMENT_COMMAND;
	}
	
	//是否为客服
	get isKF()
	{
		return UserInfo.isCustomer(this.userInfo);
	}
	
	get isFK()
	{
		return this.userInfo && this.userInfo.type == UserInfo.VISITOR;
	}
	
	get isRobot()
	{
		return UserInfo.isRobot(this.userInfo);
	}
	
	get bmine()
	{
		return this._bmine && !this.bsystem;
	}
	
	get bhistory()
	{
		return this.status === MessageType.STATUS_MESSAGE_SEND_SENT;
	}
	
	/**消息发送者信息*/
	set userInfo(value)
	{
		try
		{
			if(!value)
				return;
			
			let userId = value instanceof UserInfo ? value.userId : value.userid;
			
			this._bmine = userId === loginUser().userId;
			
			this._userInfo = this._bmine ? loginUser().userInfo : value;
		}
		catch(e)
		{
		}
	}
	
	get userName()
	{
		return getUserName(this.userInfo, true);
	}
	
	get portrait()
	{
		if(this.userInfo)
		{
			return this.userInfo.portrait;
		}
		
		return "";
	}
	
	get userInfo()
	{
		if(!this._userInfo)
		{
			this._userInfo = loginUser()
				.userInfo;
		}
		else if(!(this._userInfo instanceof UserInfo))
		{
			this._userInfo = new UserInfo(this._userInfo);
		}
		
		return this._userInfo;
	}
	
	toString()
	{
		return this.messageBody;
	}
}

export default AbstractChatSentence;
