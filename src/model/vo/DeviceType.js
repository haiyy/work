class DeviceType
{
	static PC = "web";
	static WEIXIN = "wechat";
	static APP = "2";
	static WAP = "wap";
	static IOS = "IOS App";
	static ANDROID = "Android App";
	static PHONE = "6";
	static WEIBO = "weibo";
	static ALIPAY = "alipay";

	
	static getDevicetype(value)
	{
		var deviceType = 'input';
		
		switch(value)
		{
			case DeviceType.PC:
				deviceType = "pc";
				break;
			
			case DeviceType.WEIXIN:
				deviceType = "weixin";
				break;
			
			case DeviceType.APP:
				deviceType = "app";
				break;
			
			case DeviceType.WAP:
				deviceType = "wap";
				break;
			
			case DeviceType.IOS:
				deviceType = "ios";
				break;
			
			case DeviceType.ANDROID:
				deviceType = "android";
				break;
			
			case DeviceType.PHONE:
				deviceType = "phone";
				break;
			
			case DeviceType.WEIBO:
				deviceType = "weibo";
				break;
			
			case DeviceType.ALIPAY:
				deviceType = "alipay";
				break;
		}
		
		return deviceType;
	}
}

Object.freeze(DeviceType);

export default DeviceType;