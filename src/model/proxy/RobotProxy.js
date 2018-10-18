import Proxy from "../Proxy";
import { createMessageId } from "../../lib/utils/Utils";
import { configProxy, loginUserProxy } from "../../utils/MyUtil";
import { urlLoader } from "../../lib/utils/cFetch";
import { getRobotID } from "../../apps/chat/ChatPage";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=77004885
class RobotProxy extends Proxy {
	
	static NAME = "RobotProxy";
	static FK_TYPE = "GuestType";
	static KF_TYPE = "kfType";
	
	constructor(props)
	{
		super(props);
		
		this.name = RobotProxy.NAME;
		this.preQuestion = "";
		this.nextList = [];
		this.list = [];
	}
	
	loadData({question, robotId, sessionId}, type = RobotProxy.KF_TYPE)
	{
		if(question === this.preQuestion && this.list.length)
			return;
		
		if(!robotId)
		{
			//若没有传值robotID， 默认为当前会话
			robotId = getRobotID();
			
			if(!robotId)
				return;
		}
		
		let senderId = createMessageId(),
			url = configProxy().nEagleServer + "/assist?siteid=" + loginUserProxy().siteId +
				"&senderId=" + senderId + "&question=" + question.trim() + "&robotId=" + robotId + "&sessionId=" + sessionId;
		
		urlLoader(url)
		.then(({jsonResult}) => {
			let {code, data} = jsonResult,
				list = [];
			
			if(code == 200)
			{
				if(Array.isArray(data.answerList))
				{
					list = data.answerList.map(({answer}) => ({type: 1, response: answer, title: "机器人"}));
				}
			}
			
			if(type === RobotProxy.KF_TYPE && this.list.length)
			{
				this.nextList = list;
				this.nextQ = question;
				return;
			}
			
			this.list = list;
			this.question = question;
			
			if(list.length)
			{
				this.emit(type, list, question);
			}
			
			console.log("RobotProxy list = ", list);
		});
	}
	
	clear()
	{
		if(this.nextList.length)
		{
			this.list = this.nextList;
			this.nextList = [];
			this.question = this.nextQ;
		}
		else
		{
			this.list = [];
			this.question = "";
		}
		
		this.nextQ = "";
	}
}

export default RobotProxy;