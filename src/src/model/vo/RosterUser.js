import { isCustomer } from "../../lib/utils/Utils";
import LogUtil from "../../lib/utils/LogUtil";
import UserInfo from "./UserInfo";

class RosterUser {
	
	_userInfo = null;  //UserInfo
	
	constructor(userInfo)
	{
		if(userInfo)
		{
			this._userInfo = userInfo;
		}
	}

	get status()
	{
		if(this._userInfo)
		{
			return this._userInfo.status;
		}
		
		return -1;
	}
	
	set status(value)
	{
		if(this._userInfo)
		{
			this._userInfo.status = value;
		}
	}
	
	get chatStatus()
	{
		if(this._userInfo)
		{
			const {status, chatStatus} = this._userInfo;
			
			//if(status === UserStatus.OFFLINE)
			//	return ChatStatus.OFFLINE;
			
			return chatStatus;
		}
	}
	
	get userId()
	{
		if(this._userInfo)
		{
			return this._userInfo.userId;
		}
	}
	
	get groupId()
	{
		if(this._userInfo)
		{
			return this._userInfo.groupId;
		}
		
		return "";
	}
	
	get portrait()
	{
		if(this._userInfo)
		{
			return this._userInfo.portrait;
		}
	}
	
	set userInfo(value)
	{
		if(!value)
			return;
		
		this._userInfo = this._userInfo ? this._userInfo.merge(value) : value;
	}
	
	get userInfo()
	{
		return this._userInfo;
	}
	
	//获取username or nickname or userid
	get userName()
	{
		return getUserName(this._userInfo);
	}
	
	//获取真实username
	get userName2()
	{
		return this._userInfo.userName;
	}
	
	get address()
	{
		return getUserAddress(this._userInfo);
	}
	
	get entrance()
	{
		if(this._userInfo)
		{
			return this._userInfo.entrance;
		}
		
		return "";
	}
	
	get userStatus()
	{
		if(this._userInfo)
		{
			return this._userInfo.status;
		}
		
		return 0;
	}
	
	/*工作时长*/
	get totalWorkingTime()
	{
		return 0;
	}
	
	/*休息时长*/
	get totalRestTime()
	{
		return 0;
	}
	
	/*上一次登录状态*/
	get lastStatus()
	{
		return -1;
	}
	
	get tatalSessionNum()
	{
		return 0;
	}
	
	get currentSessionNumber()
	{
		return 0;
	}
	
	get defaultSessionNum()
	{
		return 8;
	}
	
	set updateRecentTime(value)
	{
		if(this._userInfo)
		{
			this._userInfo.updateRecentTime = value;
		}
	}
	
	get updateRecentTime()
	{
		if(this._userInfo)
		{
			return this._userInfo.updateRecentTime;
		}
		
		return -1;
	}
	
	get startpage()
	{
		if(this._userInfo)
		{
			return this._userInfo.startpage;
		}
		
		return null;
	}
	
	get ip()
	{
		if(this._userInfo)
		{
			return this._userInfo.ip;
		}
		
		return "";
	}
	
	weakEqual(data)
	{
		if(!data || !this._userInfo)
			return false;
		
		if(data instanceof RosterUser)
		{
			data = data.userInfo;
		}
		
		return this._userInfo.weakEqual(data);
	}
	
	/**
	 *@param rosterUser IRosterUser|UserInfo|JSON_String
	 */
	merge(rosterUser, force = false)
	{
		try
		{
			let userinfo;
			
			if(rosterUser instanceof RosterUser)
			{
				userinfo = rosterUser.userInfo;
			}
			else if(rosterUser instanceof UserInfo)
			{
				userinfo = rosterUser;
			}
			
			if(this._userInfo)
			{
				if(this._userInfo.userId === userinfo.userid || force)
				{
					this._userInfo.merge(userinfo);
				}
			}
			else
			{
				this._userInfo = userinfo;
			}
		}
		catch(e)
		{
			log("merge stack: " + e.stack);
		}
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("RosterUser", info, log);
}

export function getUserAddress(userInfo)
{
	if(!userInfo)
		return "";
	
	let city = userInfo.city,
		province = userInfo.province,
		provText = province ? province : "",
		cityText = city ? city : "";
	
	if(cityText.indexOf(provText) >= 0)
		return provText;
	
	return provText + cityText;
}

export function getUserName(userInfo, bExternal = false)
{
	if(!userInfo)
		return "";
	
	let userName;
	
	try
	{
		userName = userInfo.nickName ? userInfo.nickName : userInfo.userName;
		
		if(bExternal)
		{
			if(userInfo.type !== UserInfo.VISITOR)
			{
				if( userInfo.externalName)
				{
					userName += "(" + userInfo.externalName + ")";
				}
			}
			else
			{
				//crmName
			}
		}
		
		if(!userName || userName.length <= 0)
		{
			if(userInfo.userId)
			{
				userName = "游客" + userInfo.userId.substr(0, 6);
			}
			else
			{
				userName = "";
			}
		}
	}
	catch(e)
	{
		log("getUserName catch an exception: " + e.stack);
	}
	
	return userName;
}

export default RosterUser;
