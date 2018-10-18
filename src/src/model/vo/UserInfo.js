import LogUtil from "../../lib/utils/LogUtil";
import UserTrail from "./UserTrail";
import { fromJS, Record, is } from "immutable";

const IUserInfo = Record({
	userid: "",
	status: 0, // 访客没有状态
	chatstatus: -2,
	lables: "",//客服标签列表
	loginid: "",
	
	logintime: "",
	logouttime: "",
	conversationstarttime: "",
	conversationendtime: "",
	currentconversationcount: 0,
	todayconversationcount: 0,
	maxconversationcount: 0,
	
	username: "",  // 登录名
	account: "",  // 干系人帐号
	showname: "",  // 外部名称
	nickname: "",  // 内部名称
	
	usericon: "",
	portrait: "",
	sex: -1,
	age: -1,
	phone: "",
	mobile: "",
	type: -1,
	
	level: "",
	
	groupname: "",
	groupid: "",
	
	enterpriseinfo: null,  //EnterpriseInfo
	
	devicetype: null,  //[]
	
	updaterecenttime: -1,
	
	country: "",
	province: "",
	city: "",
	
	signature: "",
	
	exterinfo: "",
	
	usertrail: null,
	
	startpage: null
});

class UserInfo extends IUserInfo {
	
	static CUSTOMER = 1;
	static VISITOR = 2;
	static ROBOT = 3;
	
	_preChatstatus = -2;
	
	constructor(props)
	{
		super(props);
	}
	
	static isCustomer(value)
	{
		let type = value;
		if(typeof value === "object")
		{
			type = value.type;
		}
		
		return type == UserInfo.CUSTOMER;
	}
	
	static isRobot(value)
	{
		let type = value;
		if(typeof value === "object")
		{
			type = value.type;
		}
		
		return type == UserInfo.ROBOT;
	}
	
	updateUser(value)
	{
		try
		{
			if(!value)
				return;
			
			if(typeof value === "string")
			{
				value = JSON.parse(value);
			}
			
			this.merge(value);
			
			log(["updateUser value = ", value]);
		}
		catch(e)
		{
			log("updateUser exception: " + e.stack);
		}
	}
	
	merge(userinfo)
	{
		log(["merge userinfo = ", userinfo]);
		
		this.chatStatus = userinfo.chatstatus;
		
		this._map = this._map.mergeWith(this._mergeFn.bind(this), userinfo);
	}
	
	_mergeFn(oldVal, newVal, key)
	{
		if(notMergeData.includes(key) || (!newVal || newVal === -1))
		{
			return oldVal;
		}
		else
		{
			return newVal;
		}
	}
	
	set userId(value)
	{
		this.set("userid", value);
	}
	
	get userId()
	{
		return this.get("userid");
	}
	
	set loginId(value)
	{
		this.set("loginid", value);
	}
	
	get loginId()
	{
		return this.get("loginid");
	}
	
	get portrait()
	{
		return this.get("portrait");
	}
	
	get chatStatus()
	{
		return this.get("chatstatus");
	}
	
	set chatStatus(value)
	{
		if(this.chatStatus === value || value === -2 || value === undefined)
			return;
		
		this.preChatstatus = this.chatstatus;
		this.set("chatstatus", value)
	}
	
	get preChatstatus()
	{
		return this._preChatstatus;
	}
	
	set preChatstatus(value)
	{
		this._preChatstatus = value;
	}
	
	set groupId(value)
	{
		this.set("groupid", value);
	}
	
	get groupId()
	{
		return this.get("groupid");
	}
	
	set groupName(value)
	{
		this.set("groupname", value);
	}
	
	get groupName()
	{
		return this.get("groupname");
	}
	
	set userName(value)
	{
		this.set("username", value);
	}
	
	get userName()
	{
		if(this.get("account"))
		{
			return this.get("account");
		}
		
		return this.get("username");
	}
	
	set nickName(value)
	{
		this.set("nickname", value);
	}
	
	get nickName()
	{
		return this.get("nickname");
	}
	
	set externalName(value)
	{
		this.set("showname", value);
	}
	
	get externalName()
	{
		return this.get("showname");
	}
	
	set userIcon(value)
	{
		this.set("usericon", value);
	}
	
	get userIcon()
	{
		return this.get("usericon");
	}
	
	set status(value)
	{
		this.set("status", value);
	}
	
	get exterinfo()
	{
		return this.get("exterinfo");
	}
	
	set exterinfo(value)
	{
		this.set("exterinfo", value);
	}
	
	get status()
	{
		return this.get("status");
	}
	
	set sex(value)
	{
		this.set("sex", value);
	}
	
	get sex()
	{
		return this.get("sex");
	}
	
	set age(value)
	{
		this.set("age", value)
	}
	
	get age()
	{
		return this.get("age");
	}
	
	set level(value)
	{
		this.set("level", value);
	}
	
	get level()
	{
		return this.get("level");
	}
	
	set enterpriseInfo(value)
	{
		this.set("enterpriseinfo", value);
	}
	
	get enterpriseInfo()
	{
		return this.get("enterpriseinfo");
	}
	
	set loginTime(value)
	{
		this.set("logintime", value)
	}
	
	get loginTime()
	{
		return this.get("logintime");
	}
	
	get logoutTime()
	{
		return this.get("logouttime");
	}
	
	set logoutTime(value)
	{
		this.set("logouttime", value);
	}
	
	set deviceType(value)
	{
		this.set("devicetype", value);
	}
	
	get deviceType()
	{
		return this.get("devicetype");
	}
	
	set signature(value)
	{
		this.set("signature", value);
	}
	
	get signature()
	{
		return this.get("signature");
	}
	
	set updateRecentTime(value)
	{
		if(this.updateRecentTime < value)
		{
			this.set("updaterecenttime", value);
		}
	}
	
	get updateRecentTime()
	{
		return this.get("updaterecenttime");
	}
	
	get city()
	{
		if(this.userTrail)
		{
			return this.userTrail.city || this.get("city");
		}
		
		return "";
	}
	
	set city(value)
	{
		this.set("city", value);
	}
	
	get province()
	{
		if(this.userTrail)
		{
			return this.userTrail.province || this.get("province");
		}
		
		return "";
	}
	
	set province(value)
	{
		this.set("province", value);
	}
	
	get country()
	{
		if(this.userTrail)
		{
			return this.userTrail.country || this.get("country");
		}
		
		return "";
	}
	
	set country(value)
	{
		this.set("country", value);
	}
	
	get mobile()
	{
		return this.get("mobile");
	}
	
	set mobile(value)
	{
		this.set("mobile", value);
	}
	
	get phone()
	{
		return this.get("phone");
	}
	
	set phone(value)
	{
		this.set("phone", value);
	}
	
	get userTrail()
	{
		return this.get("usertrail");
	}
	
	set userTrail(value)
	{
		if(typeof value === "string")
		{
			value = JSON.stringify(value);
		}
		
		//if(this.userTrail)
		//{
		//	this.userTrail.update(value);
		//}
		//else
		//{
		this.set("usertrail", value);
		//}
	}
	
	/**
	 *  "startpage":
	 *  {
	 *      "url": "咨询发起页url",
	 *      "level": "咨询发起页级别",
	 *      "levelname": "咨询发起页级别名称",
	 *      "pagetitle": "发起页标题"
	 *  }
	 * */
	get startpage()
	{
		return this.get("startpage");
	}
	
	set startpage(value)
	{
		this.set("startpage", value);
	}
	
	get type()
	{
		return this.get("type");
	}
	
	set type(value)
	{
		this.set("type", value);
	}
	
	equals(userinfo)
	{
		return is(this, userinfo);
	}
	
	/*
	 * 基本信息比较
	 * */
	weakEqual(userinfo)
	{
		if(!userinfo)
			return false;
		
		return map.filterNot(key => {
			return userinfo.get(key) === this.get(key);
		}).size === 0;
	}
	
	set(key, value)
	{
		this._map = this._map.set(key, value);
	}
	
	toWeakObject()
	{
		return {
			userid: this.get("userid"),
			account: this.get("account"),
			nickname: this.get("nickname"),
			showname: this.get("showname"),
			username: this.get("username")
		}
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("UserInfo", info, log);
}

let map = fromJS(["userid", "status", "username", "sex", "showname", "groupid"]),
	notMergeData = ["userid"];

export default UserInfo;