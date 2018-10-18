import AbstractChatSentence from './AbstractChatSentence';
import MessageType from "../../../im/message/MessageType";

class SystemSentence extends AbstractChatSentence {
	static TIP = 1;
	static WARN = 2;
	static ERROR = 3;
	
	static WELCOME_TYPE = 1;  //欢迎语
	static AUTOREPLY_TYPE = 2;  //自动应答消息
	static STARTPAGE_TYPE = 3;  //咨询发起页
	static REQUEST_EVALUATION_TYPE = 4;  //邀请评价结果
	static EVALUATION_TYPE = 5;  //评价结果
	static SUMMARY_TYPE = 6;  //总结结果
	static QUALITY_TYPE = 7;  //质检
	static MONITOR_TYPE = 8;  //监控
	
	errorType = 1;  //1->提示， 2->警告， 3->错误
	_messageBody = "";
	
	constructor()
	{
		super();
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_COMMAND;
	}
	
	get messageBody()
	{
		return this._messageBody;
	}
	
	set messageBody(value)
	{
		if(typeof value === "string")
		{
			this._messageBody = value;
		}
		else
		{
			if(this.systemType === SystemSentence.EVALUATION_TYPE)
			{
				let {result = "", remark = ""} = value;
				
				this._messageBody = result + "；" + remark;
			}
			else if(this.systemType === SystemSentence.SUMMARY_TYPE)
			{
				let {summary} = value;
				if(Array.isArray(summary))
				{
					this._messageBody = "总结成功：" + summary.filter(val => val.content)
						.map(val => val.content)
						.join("；");
				}
				else
				{
					this._messageBody = "总结成功！";
				}
			}
			else if(this.systemType === SystemSentence.STARTPAGE_TYPE)
			{
				this.message = value.startpage || {};
				
				this._messageBody = this.message.pagetitle || this.message.url || "";
			}
		}
	}
	
	deserialize(data)
	{
		this.sessionID = data.converid;
		this.sentenceID = data.messageid;
		this.errorType = data.errortype;
		this.status = data.status;
		this.createTime = data.createat;
		this.userInfo = data.fromuser || data.from;
		this.systemType = data.systemtype || data.sys;  //系统消息类型 1：咨询总结 2：质检 3：评价
		this.fromType = data.fromtype;
		this.messageBody = data.message;
		if(data.toUsers)
		{
			this.toUsers = data.tousers;
		}
	}
}

export default SystemSentence;
