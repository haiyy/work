import { loginUser, loginUserProxy } from "../../utils/MyUtil";
import { createMessageId } from "../../lib/utils/Utils";
import Lang from "../../im/i18n/Lang";

class CooperateData {
	
	static TRANSFER_TYPE = 3;  //转接
	static INVITE_TYPE = 2;  //邀请
	static FORCE_INVITE_TYPE = 4;  //机器人转人工强制邀请强制邀请
	
	static CANCEL = 1;  //取消
	static ACCEPT = 2;  //接受
	static REFUSE = 3;  //拒绝
	static TIMEOUT = 4;  //超时
	
	//被协同操作对象类型
	static PERSONAL_TYPE = 1;  //个人
	static GROUP_TYPE = 2;   // 组
	
	coopType;  //邀请和转接类型，0：转接，1：邀请 ，2：强制邀请
	operation;  //动作描述
	taskId = "";  //客户端生成，服务器使用
	description = "";  //描述or操作原因说明
	_targets = [];  //被操作对象
	source = {};  //发起者信息
	vistorname = "";  //访客
	expiredTime = 60000;  //ms 协同最大操作时间
	
	constructor()
	{
		this.startTime = new Date().getTime();
	}
	
	get targets()
	{
		return this._targets;
	}
	
	set targets(value)
	{
		this._targets = value;
	}
	
	/*是否是发起者*/
	get isSponsor()
	{
		if(this.source && loginUser().userId === this.source.userid)
		{
			return true;
		}
		
		return false;
	}
	
	get isSelf()
	{
		if(this.isSponsor || (this.targets && this.targets.length <= 0))
		{
			return true;
		}
		
		return false;
	}
	
	static createTaskId()
	{
		return createMessageId("TK");
	}
	
	getData()
	{
		let data = {
			cooptype: this.coopType,
			taskid: this.taskId,
			operation: this.operation,
			description: this.description,
		};
		
		if(this.operation == undefined && this.targets)  //协同没有操作
		{
			data.targets = this.targets.map(user => {
				let targetid = "",
					siteid = user.siteId || loginUserProxy().siteId;
				if(user.type === 1) //个人
				{
					targetid = user.userid;
				}
				else if(user.type === 2)//用户群
				{
					targetid = user.templateid;
				}
				
				return {targetid, type: user.type, siteid};
			});
		}
		
		return data;
	}
	
	getDuration()
	{
		return this.expiredTime - (new Date().getTime() - this.startTime);
	}
	
	isRuning()
	{
		return this.getDuration() > 0;
	}
	
	getCoopTypeTxt()
	{
		let coopTypeTxt;
		switch(this.coopType)
		{
			case CooperateData.TRANSFER_TYPE:
				coopTypeTxt = Lang.getLangTxt("transfer");
				break;
			
			case CooperateData.INVITE_TYPE:
				coopTypeTxt = Lang.getLangTxt("invite");
				break;
		}
		
		return coopTypeTxt;
	}
	
	getCoopMessage()
	{
		let coopTypeTxt = this.getCoopTypeTxt(),
			visitorName = this.vistorname ? this.vistorname : "未知访客",
			customerName = this.source ? "客服" + this.source.showname : "未知客服";//getUserName(new UserInfo(this.source));
		
		if(this.source && this.source.userid === loginUser().userId)
		{
			customerName = "你";
		}
		
		//1. 发起or接收协同会话
		if(!this.operation)
		{
			if(this.isSponsor)
			{
				return Lang.getLangTxt("coopSended", coopTypeTxt, this.targets.map(
					item =>
					{
						return item.showname;
					})
				);
			}
			else
			{
				return Lang.getLangTxt("coopToYou", customerName, coopTypeTxt);
			}
		}
		
		//2. 协同会话超时
		if(this.operation === CooperateData.TIMEOUT)
		{
			return Lang.getLangTxt("coopTimeout", visitorName, coopTypeTxt);
		}
		
		//3. 协同会话操作结果
		let operationTxt;
		switch(this.operation)
		{
			case CooperateData.ACCEPT:
				operationTxt = Lang.getLangTxt("accept");
				break;
			
			case CooperateData.CANCEL:
				operationTxt = Lang.getLangTxt("cancel");
				break;
			
			case CooperateData.REFUSE:
				operationTxt = Lang.getLangTxt("refuse");
				break;
		}
		
		if(this.isSelf && !this.isSponsor)
		{
			return Lang.getLangTxt("coopSelfAction", operationTxt, coopTypeTxt);
		}
		else
		{
			if(this.targets && this.targets.hasOwnProperty("targetname"))
			{
				customerName = this.targets.targetname;
			}
			
			let des = this.description ? "\n " + Lang.getLangTxt("coopDes", this.description) : "";
			return Lang.getLangTxt("coopAction", customerName, operationTxt, visitorName, coopTypeTxt) + des;
		}
		
		return "";
	}
}

export default CooperateData;
