import { Record, fromJS } from "immutable";
import LogUtil from "../../lib/utils/LogUtil";

const IUserTrail = Record({
	country:"",  //国家
	province:"",  //省
	city:"",  //城市
	
	maxlevel:"",  //最大访问深度
	maxlevelname:"",  //最大访问深度网页Title
	lang:"",  //语言
	source:"",  //来源 "baidu"
	fl:"",  //flash版本
	ua:"",  //user-agent浏览器信息
	sid:"",  //来访id
	dv:"",  //设备类型(PC、Phone、其他)
	tml:"",  //终端类型(Web、Wap、Android App、iOS App、wechat、weibo、AliPay、其他)
	ref:"",  //来源页网址
	browser:"",  //浏览器
	keyword:"",   //搜索关键词
	taltimelong:"",  //总停留时间
	scs:"",  //屏幕分辨率
	uname:"",  //访客名称
	ulevel:"",  //用户等级
	ip:"",
	an:"",  //客户端应用名称
	webnodecount:"",  //本次来访次数
	system:"",  //操作系统
	oname:"",  //微信公众号
	domain:"",  //来源根域名
}, "UserTrail");


class UserTrail extends IUserTrail{
	
	constructor(props)
	{
		super(props);
	}
	
	get device()
	{
		return this.get("dv");
	}
	
	get source()
	{
		return this.get("source");
	}
	
	update(value)
	{
		try
		{
			if(!value)
				return;

			this._map = this._map.merge(fromJS(value));
		}
		catch(e)
		{
			log("update exception: " + e.stack);
		}
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("UserTrail", info, log);
}

export default UserTrail;
