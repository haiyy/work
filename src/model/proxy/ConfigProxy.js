import Proxy from "../Proxy";
import { getLoadData } from "../../utils/MyUtil";
import LogUtil from "../../lib/utils/LogUtil";
import LoginUserProxy from "./LoginUserProxy";
import Model from "../../utils/Model";
import { updateServerTime } from "../../utils/ConverUtils";
import { initServer } from '../../../package.json';

//网关文档
//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=50794727
class ConfigProxy extends Proxy {

	static NAME = 'ConfigProxy';

	_version = "7.0.0";
	_productInfo = null;
	_imSocketUrl = "";
	_imHttpUrl = "";  //IM拉去消息Url
	_nDolphinUrl = "";  //待客云HttpUrl
	_nSettingUrl = "";  //设置获取和提交Url
	_nPantherUrl = "";  //计算引擎
	_nAccountUrl = "";  //NAccountCenter 账号中心
	_nClientInitServer = "";  //初始化客户端服务
	_nSkyEyeUrl = "";  //NSkyEye 轨迹
	_uploadUrl = "";  //文件上传
	_flashServerUrl = "";  //获取配置链接地址getFlashServer.json
	_storageUrl = "";  //存储服务
	_nRegionServer = "";  //国家名称地图
	_nApiGatewayServer = "";  //网关地址
	_nCrocodileServer = "";  //互动记录
	_nTAccountCenter_Visitant = ""; //webserver
	_robotProxy = ""; //机器人代理服务
	_nThirdPartyServer = ""; //第三方媒体
	_nEagleServer = ""; //机器人代理服务
	_nAuthorize = ""; //wechat授权
		_nCrmServer = "";
	_xNccSettingServer = "";
	_xNccServer = "";
	_xNccRecordServer = "";
	_xNccCallServer = "";
	_nWoServer = "";
	_nWoWebServer = "";
	_nCrmWebCallServer = "";
	_nTranslateServer = ""; //翻译

	constructor()
	{
		super();

		this.name = ConfigProxy.NAME;
	}

	/**
	 * 获取getFlashserver信息
	 * @returns {*|Promise.<T>}
	 */
	getFlashServer()
	{
		log("getFlashServer...");

		if(!this.flashServerUrl)
			log("getFlashServer flashServerUrl is null!!!", LogUtil.ERROR);

		return getLoadData(this.flashServerUrl)
		.then(data => {
			let logType = LogUtil.INFO,
				success = false;

			if(data.error !== 20033)
			{
				this._parseFlashServer(data);
				success = true;
			}
			else
				logType = LogUtil.ERROR;

			log(["getFlashServer data = ", data], logType);

			return Promise.resolve(success);
		});
	}

	get flashServerUrl()
	{
		let {siteId} = Model.retrieveProxy(LoginUserProxy.NAME);

		if(Type === 3)
		{
			return "{{GETFLASHSERVERADDR}}/api/gate/kf/" + siteId;
		}

		return `${initServer}/api/gate/kf/` + siteId;
	}

	set flashServerUrl(value)
	{
		this._flashServerUrl = value;
	}

	get version()
	{
		return this._version;
	}

	set version(value)
	{
		this._version = value;
	}

	get nAccountUrl()
	{
		//	return this._nApiGatewayServer;
		return this._nAccountUrl;
	}

	set nAccountUrl(value)
	{
		this._nAccountUrl = value;
		//this._nAccountUrl = "https://gateway-min.ntalker.com";
	}

	get nPantherUrl()
	{
		return this._nPantherUrl;
		//return this._nApiGatewayServer;
	}

	set nPantherUrl(value)
	{
		this._nPantherUrl = value;
	}

	get nSettingUrl()
	{
		return this._nSettingUrl;
		//return this._nApiGatewayServer;
	}

	get nThirdPartyUrl()
	{
		return this._nThirdPartyServer;
	}

	set nSettingUrl(value)
	{
		this._nSettingUrl = value;
	}

	get nDolphinUrl()
	{
		return this._nDolphinUrl;
		//return this._nApiGatewayServer;
	}

	set nDolphinUrl(value)
	{
		this._nDolphinUrl = value;
	}

	get nRegionServer()
	{
		//return this._nApiGatewayServer;
		return this._nRegionServer;
	}

	set nRegionServer(value)
	{
		this._nRegionServer = value;
	}

	get imHttpUrl()
	{
		//return this._nApiGatewayServer;
		return this._imHttpUrl;
	}

	set imHttpUrl(value)
	{
		this._imHttpUrl = value;
	}

	get imSocketUrl()
	{
		return this._imSocketUrl ? this._imSocketUrl : "";
	}

	set imSocketUrl(value)
	{
		this._imSocketUrl = value;
	}

	get uploadUrl()
	{
		//return this._nApiGatewayServer;
		return this._uploadUrl;
	}

	set uploadUrl(value)
	{
		this._uploadUrl = value;
	}

	get nSkyEyeUrl()
	{
		//return this._nApiGatewayServer;
		return this._nSkyEyeUrl;
	}

	set nSkyEyeUrl(value)
	{
		this._nSkyEyeUrl = value;
	}

	get nCrocodileServer()
	{
		return this._nCrocodileServer;
	}

	set nCrocodileServer(value)
	{
		this._nCrocodileServer = value;
	}

	/**登录URL*/
	get loginUrl()
	{
		return this._nAccountUrl + "/login/isLogin";
		//return this._nApiGatewayServer + "/login/isLogin";
	}

	get loginCodeUrl()
	{
		return this._nAccountUrl + "/login/code";
		//return this._nApiGatewayServer + "/login/code";
	}

	get productInfo()
	{
		return this._productInfo;
	}

	set productInfo(value)
	{
		this._productInfo = value;
	}

	get nClientInitUrl()
	{
		//return this._nApiGatewayServer;
		return this._nClientInitServer;
	}

	get nMagicServer()
	{
		return this._nMagicServer;
	}

	get nTAccountCenter_Visitant()
	{
		//return this._nApiGatewayServer;
		return this._nTAccountCenter_Visitant;
	}

	get storageUrl()
	{
		return this._nApiGatewayServer;
	}

	get gatewayOn()
	{
		return "{{GATEWAYON}}";
	}

	get robotProxy()
	{
		return this._robotProxy;
	}

	set robotProxy(value)
	{
		this._robotProxy = value;
	}

	get nThirdPartyServer()
	{
		return this._nThirdPartyServer;
	}

	set nThirdPartyServer(value)
	{
		this._nThirdPartyServer = value;
	}

	get nEagleServer()
	{
		return this._nEagleServer;
	}

	set nEagleServer(value)
	{
		this._nEagleServer = value;
	}


	get nCrmServer()
	{
		return this._nCrmServer;
	}

	get xNccSettingServer()
	{
		return this._xNccSettingServer;
	}

	get xNccServer()
	{
		return this._xNccServer;
	}

	get xNccRecordServer()
	{
		return this._xNccRecordServer;
	}

	get nWoServer()
	{
		return this._nWoServer;
	}

	get nWoWebServer()
	{
		return this._nWoWebServer;
	}

	get xNccCallServer()
	{
		return this._xNccCallServer;
	}

	set xNccCallServer(value)
	{
		this._xNccCallServer = value;
	}

	get nCrmWebCallServer()
	{
		return this._nCrmWebCallServer;
	}

	set nCrmWebCallServer(value)
	{
		this._nCrmWebCallServer = value;
	}
	get nAuthorize()
	{
		return this._nAuthorize;
	}

	set nAuthorize(value)
	{
		this._nAuthorize = value;
	}

	get nTranslateServer()
	{
		return this._nTranslateServer;
	}

	set nTranslateServer(value)
	{
		this._nTranslateServer = value;
	}

	_parseFlashServer(info)
	{
		if(!info || !info.serverAddr)
			return;

		let {serverAddr, serverTime} = info,
			{
				NPigeonServer = {}, NDolphinServer = {}, NSettingServer = {}, NSkyEyeServer = {},
				NFileServer = {}, NAccountServer = {}, NPantherServer = {}, NStorageProvider = {},
				NClientInitServer = {}, NRegionServer = {}, NApiGatewayServer = {}, NCrocodileServer = {},
				NMagicServer = {}, NThirdpartyServer = {}, NEagleServer = {}, NAuthorize = {}, NSTranslateServer = {}, NCrmServer = {}, NCrmWebCallServer = {},
				XNccCallServer = {}, XNccRecordServer = {}, XNccServer = {}, XNccSettingServer = {}, NWoServer = {}, NWoWebServer = {}
			} = serverAddr,
			NTAccountCenter_Visitant = serverAddr["NTAccountCenter-Visitant"] || {};

		this._productInfo = info.productInfo;

		updateServerTime(serverTime);

		if(NApiGatewayServer)
		{
			this._nApiGatewayServer = NApiGatewayServer.httpServer;
			this.gatewayOpen = NApiGatewayServer.on == 1 || this.gatewayOn == 1;
		}

		this._imSocketUrl = NPigeonServer.socketServer;
		this._nMagicServer = NMagicServer.httpServer;

		if(this.gatewayOpen)
		{
			this._imHttpUrl = this._nApiGatewayServer + "/pigeon";
			this._nDolphinUrl = this._nApiGatewayServer + "/dolphin";
			this._nSettingUrl = this._nApiGatewayServer + "/setting";
			this._nSkyEyeUrl = this._nApiGatewayServer + "/skyeye";
			this._nAccountUrl = this._nApiGatewayServer + "/usercenter";
			this._nPantherUrl = this._nApiGatewayServer + "/kpi";
			this._nClientInitServer = this._nApiGatewayServer + "/client-init";
			this._uploadUrl = this._nApiGatewayServer + "/filestorage";
			this._storageUrl = this._nApiGatewayServer + "/setting";
			this._nRegionServer = this._nApiGatewayServer + "/setting";
			this._nCrocodileServer = this._nApiGatewayServer + "/crocodile";
			this._nTAccountCenter_Visitant = this._nApiGatewayServer + "/gate";
			this._nThirdPartyServer = this._nApiGatewayServer + "/thirdparty";
			this._nEagleServer = this._nApiGatewayServer + "/eagle";
			this._nAuthorize = this._nApiGatewayServer + "/authorize";
			this._nTranslateServer = this._nApiGatewayServer + "/translate";

				this._xNccSettingServer = this._nApiGatewayServer + "/xnccsetting";
			this._xNccRecordServer = this._nApiGatewayServer + "/xnccrecord";
			this._xNccCallServer = this._nApiGatewayServer + "/xncccs";
			this._nCrmServer = this._nApiGatewayServer + "/crm";
			this._nWoServer = this._nApiGatewayServer + "/wo";
			this._nWoWebServer = this._nApiGatewayServer + "/woweb";
			this._nCrmWebCallServer = this._nApiGatewayServer + "/crmweb";
		}
		else
		{
			this._imHttpUrl = NPigeonServer.httpServer;
			this._nDolphinUrl = NDolphinServer.httpServer;
			this._nSettingUrl = NSettingServer.httpServer;
			this._nSkyEyeUrl = NSkyEyeServer.httpServer;
			this._nAccountUrl = NAccountServer.httpServer;
			this._nPantherUrl = NPantherServer.httpServer;
			// this._nPantherUrl = "http://192.168.91.174:8081";
			this._nClientInitServer = NClientInitServer.httpServer;
			this._uploadUrl = NFileServer.httpServer;
			this._storageUrl = NStorageProvider.httpServer;
			this._nRegionServer = NRegionServer.httpServer;
			this._nCrocodileServer = NCrocodileServer.httpServer;
			this._nTAccountCenter_Visitant = NTAccountCenter_Visitant.httpServer;
			this._nThirdPartyServer = NThirdpartyServer.httpServer;
			this._nEagleServer = NEagleServer.httpServer;
			this._nAuthorize = NAuthorize.httpServer;
			this._nTranslateServer = NSTranslateServer.httpServer;

			this._xNccSettingServer = XNccSettingServer.httpServer;
			this._xNccServer = XNccServer.httpServer;
			this._xNccRecordServer = XNccRecordServer.httpServer;
			this._xNccCallServer = XNccCallServer.httpServer;
			this._nCrmServer = NCrmServer.httpServer;
			this._nWoServer = NWoServer.httpServer;
			this._nWoWebServer = NWoWebServer.httpServer;
			this._nCrmWebCallServer = NCrmWebCallServer.httpServer;
		}
	}

	_parseConfig(config)
	{
		let {flashServerUrl} = config;
		this._flashServerUrl = flashServerUrl;
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('ConfigProxy', info, log);
}

export default ConfigProxy;
