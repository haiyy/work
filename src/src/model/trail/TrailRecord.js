import LogUtil from "../../lib/utils/LogUtil";
import { formatTime, formatTimestamp } from "../../utils/MyUtil";

const KEYLEVEL = {
	HOME: 1, // 首页
	LIST: 2, // 列表页
	PRODUCT: 3, // 商品页
	CATEGORY: 4, // 购物车页
	ORDER: 5, // 订单(填写 || 提交)页
	PAY: 6, // 支付页
	PAYEND: 7 // 支付完成页
}

export default class TrailRecord {
	
	// 基础参数，如果没有这些参数，认定为一条无效的记录
	// id, 页面级别，页面级别名称，页面标题，页面URL，来访时间，停留时长, 访问设备类型
	baseParams = ["id", "keylevel", "keyname", "ttl", "url", "time", "timelong", "dv"];
	
	productParams = ["prid", "pn", "iu"];
	
	orderParams = ["oi"];
	
	payParams = ["oi"];
	
	constructor(data)
	{
		if(!data)
		{
			LogUtil.trace("trail", LogUtil.ERROR, "error code 300000：record init data is null, this record is invaild");
			throw new Error("300000");
		}
		
		let baseParams = this.baseParams,
			productParams = this.productParams,
			orderParams = this.orderParams,
			payParams = this.payParams;
		
		let errorcode = 0;
		
		for(let attr in data)
		{
			this[attr] = data[attr];
		}
		
		// 检查必要参数
		for(let i = 0, l = baseParams.length; i < l; i++)
		{
			let attr = baseParams[i];
			if(!data[attr])
			{
				errorcode = 300001;
				// LogUtil.trace("trail", LogUtil.ERROR, "error code 300001：record base param \"" + attr + "\" is null, this record is invaild");
			}
		}
		
		let keylevel = parseInt(data.keylevel, 10);
		
		// 如果是商品页，应该校验商品信息必要参数
		if(keylevel === KEYLEVEL.PRODUCT)
		{
			for(let i = 0, l = productParams.length; i < l; i++)
			{
				let attr = productParams[i];
				if(!data[attr])
				{
					errorcode = 300002;
					// LogUtil.trace("trail", LogUtil.ERROR, "error code 300002：record product param \"" + attr + "\" is null, this record is invaild, record id is ");
				}
			}
		}
		
		// 如果是订单页，应该校验订单信息必要参数
		if(keylevel === KEYLEVEL.ORDER)
		{
			for(let i = 0, l = orderParams.length; i < l; i++)
			{
				let attr = orderParams[i];
				if(!data[attr])
				{
					errorcode = 300003;
					// LogUtil.trace("trail", LogUtil.ERROR, "error code 300003：record order param \"" + attr + "\" is null, this record is invaild, record id is ");
				}
			}
		}
		
		// 如果是支付页，应该校验支付信息必要参数
		if(keylevel === KEYLEVEL.PAY)
		{
			for(let i = 0, l = payParams.length; i < l; i++)
			{
				let attr = payParams[i];
				if(!data[attr])
				{
					errorcode = 300004;
					// LogUtil.trace("trail", LogUtil.ERROR, "error code 300003：record pay param \"" + attr + "\" is null, this record is invaild, record id is ");
				}
			}
		}
		
		// 处理keyname
		this.keyname = this.keyname ? "[" + this.keyname + "]" : "";
		
		// 处理停留时长
		this.stayTime = formatTime(parseInt(this.timelong / 1000), true, true);
		
		this.time = typeof data.time === "string" ? data.time : formatTimestamp(data.time, true);
		//TimeConvert.secondTohms(Math.round(parseInt(this.timelong) / 1000), 'zh', false);
		
		// 暂时关闭errorcode
		errorcode = 0;
		
		if(errorcode)
		{
			throw new Error(errorcode);
		}
	}
	
	isSame(record)
	{
		if(this.id == record.id)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}