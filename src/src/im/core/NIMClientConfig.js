import ConnectOptions from "./options/ConnectOptions";
import LogUtil from "../../lib/utils/LogUtil";
import { parseUrl } from "../../lib/utils/Utils";

/**
 * 基础配置类
 * */
class NIMClientConfig {
	
	constructor()
	{
		/**国际化语言类型切换
		 * @default zh_CN
		 * */
		this.i18n = "zh_CN";
		
		this.appId = ""; //"企业ID"
		this.userId = "";
		this.userName = "";
		this.token = "";
		this.sessionId = "";
		
		this.device = "";
		
		this.hosts = [];
		this.ports = [];
		this.useSSL = false;
		
		this.synMessageUrl = "";
		
		this.deviceType = "";
	}
	
	validate()
	{
		var berror = true;
		
		if(!this.hosts || this.hosts.length <= 0)
		{
			log("validate error = " + "hosts is error!", LogUtil.ERROR);
			berror = false;
		}
		
		if(!this.ports || this.ports.length <= 0)
		{
			log("validate error = " + "ports is error", LogUtil.ERROR);
			berror = false;
		}
		
		if(!this.userId || !this.appId || !this.token)
		{
			log("validate error = " + "userId || appId || token is null", LogUtil.ERROR);
			berror = false;
		}
		
		if(!this.synMessageUrl || this.synMessageUrl.length <= 0)
		{
			log("validate httpUrl is error!", LogUtil.ERROR);
		}
		
		return berror;
	}
	
	/**
	 * 获取网络连接属性对象
	 * */
	getConnectOptions()
	{
		let options = new ConnectOptions();
		
		options.hosts = this.hosts;
		options.ports = this.ports;
		options.useSSL = this.useSSL;
		
		return options;
	}
	
	destroy()
	{
		this.appId = ""; //"企业ID"
		this.userId = "";
		this.userName = "";
		this.token = "";
		this.sessionId = "";
		
		this.device = "";
		
		this.hosts = [];
		this.ports = [];
		this.useSSL = false;
		
		this.synMessageUrl = "";
		
		this.deviceType = "";
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NIMClientConfig", info, log);
}

export default NIMClientConfig;

          