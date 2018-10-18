import Model from "./Model";
import ConfigProxy from "../model/proxy/ConfigProxy";
import { parseUrl, unique } from "../lib/utils/Utils";
import { loginUser, loginUserProxy } from "./MyUtil";
import { initUrl, getMainNavUrl, getToolbarUrl, getTabManagerUrl } from "./links/FunctionLinks";

/**
 * 功能配置
 * */
class Settings {
	
	static version()
	{
		return configProxy().version;
	}
	
	static getInitSwitcherUrl()
	{
		return initUrl();
	}
	
	/**获取主界面导航菜单*/
	static getMainNavUrl()
	{
		return getMainNavUrl();
	}
	
	//咨询工具条功能
	static getToolFunctionsUrl()
	{
		return getToolbarUrl();
	}
	
	//-------------------设置---------------------------
	/**
	 * 获取设置服务查询地址
	 * @param {String} method
	 * @param {Object} data
	 * @param {number} type [default=1]
	 * @returns {String}
	 */
	static querySettingUrl = function(area, siteId, suffix = "") {
		let settingUrl = configProxy().nSettingUrl + area + siteId + suffix;
		return settingUrl;
	};
	
	/**
	 * 获取设置保存地址
	 * @param {String} method
	 * @param {Object} data
	 * @param {number} type [default=1]
	 * @returns {String}
	 */
	static saveSettingUrl = function(method, type = 1) {
		let settingUrl = configProxy().nSettingUrl + "/setData?function=" + method + "&type=" + type;
		
		return settingUrl;
	};
	
	static getPersonInfoUrl = function() {
		if(!personInfoUrl)
		{
			if(configProxy().nSettingUrl)
			{
				personInfoUrl = configProxy().nSettingUrl;
			}
		}
		
		return personInfoUrl;
	};
	
	static getPersonInfoUrl2(funcName)
	{
		if(!personInfoUrl2)
		{
			var {siteId, userId} = loginUserProxy();
		}
		
		return Settings.getPersonInfoUrl() + "/settings/" + siteId + "/" + userId + "/" + funcName;
	}
	
	static getVisitorSourceUrl = function() {
		let siteId = loginUserProxy().siteId,
			settingUrl = configProxy().nSettingUrl + "/source/" + siteId + "/sourcetype/-1";
		
		return settingUrl;
	};
	
	static translateUrl()
	{
		let nTranslateServer = configProxy().nTranslateServer;
		
		if(!nTranslateServer)
			return "";
		
		return nTranslateServer + `/translate/${loginUserProxy().siteId}/list`;
	}
	
	static getLogoUrl()
	{
		return configProxy().nSettingUrl + `/sitelogo/${loginUserProxy().siteId}`;
	}
	
	//-------------------NAccountServer 帐号中心-----------------
	/**
	 * 获取账户中心查询地址
	 * @param {String} method
	 * @param {Object} data
	 * @param {number} type [default=1]
	 * @returns {String}
	 */
	static queryPathSettingUrl = function(path) {
		//TODO: 标准获取设置信息接口地址 ????
		
		let settingUrl = configProxy().nAccountUrl + path;
		
		return settingUrl;
	};
	
	static getLoginUrl()
	{
		if(!loginUrl)
		{
			if(configProxy().nAccountUrl)
			{
				loginUrl = configProxy().nAccountUrl + "/login/isLogin";
			}
		}
		
		return loginUrl;
	};
	
	static getLoginWithTokenUrl()
	{
		return configProxy().nAccountUrl + "/login/isLogin/token";
	};
	
	static getLoginCodeUrl()
	{
		if(!loginCodeUrl)
		{
			if(configProxy().nAccountUrl)
			{
				loginCodeUrl = configProxy().nAccountUrl + "/login/code";
			}
		}
		
		return loginCodeUrl;
	};
	
	static getBlacklistUrl()
	{
		return configProxy().nTAccountCenter_Visitant + "/guest/blacklist";
	}
	
	static getNRegionServer()
	{
		if(!nRegionServer)
		{
			nRegionServer = configProxy().nRegionServer;
		}
		
		return nRegionServer;
	}
	
	//--------------------IM-------------------------
	static getImUris()
	{
		if(!configProxy().imSocketUrl)
			throw new Error("imSocketUrl is null");
		
		let imSocketUrl = configProxy().imSocketUrl,
			sockets = imSocketUrl.split(";"),
			ports = [],
			hosts = [],
			useSSL = false;
		
		sockets = unique.call(sockets);
		
		sockets.forEach((url) => {
			if(!url)
				return;
			
			let match = parseUrl(url);
			
			if(match.protocol === "wss:")
			{
				ports.push(Number(match.port));
				hosts.push(match.host);
				
				useSSL = true;
			}
			else if(match.protocol === "ws:")
			{
				ports.push(Number(match.port));
				hosts.push(match.host);
			}
		});
		
		return [hosts, ports, useSSL];
	}
	
	static getImSynmessageUrl()
	{
		if(!synmessageUrl)
		{
			if(configProxy().imHttpUrl)
			{
				let siteId = loginUserProxy().siteId;
				
				synmessageUrl = configProxy().imHttpUrl + "/app/" + siteId;//+ "/synmessage"
			}
		}
		
		return synmessageUrl;
	}
	
	//-------------------NDolphin 待客云-------------------
	static getDolphinUrl()
	{
		if(!dolphinUrl)
		{
			if(configProxy().nDolphinUrl)
			{
				dolphinUrl = configProxy().nDolphinUrl;
			}
		}
		
		return dolphinUrl;
	}
	
	//获取同事会话列表链接
	static getColleagueConverUrl()
	{
		if(!colleagueConverUrl)
		{
			let {siteId, userId} = loginUserProxy();
			
			colleagueConverUrl = Settings.getDolphinUrl() + `/evs/${siteId}/groups?scope=conversation&userid=${userId}`;
		}
		
		return colleagueConverUrl;
	}
	
	/**
	 * 获取访客会话列表
	 * @param {String} customerid 访客ID
	 * @param {int} count = 5 查询次数，默认5次，最大20次
	 * */
	static getCustomerConverListUrl(customerid, count = 5)
	{
		if(!customerConverListUrl)
		{
			let siteId = loginUserProxy().siteId;
			
			customerConverListUrl = Settings.nCrocodileServer() + `/evs/${ siteId }/storage/conversationstorage`;
		}
		
		return customerConverListUrl + `?a=gcc&customerid=${ customerid }&count=${ count }`;
	}
	
	/**
	 *获取会话消息接口
	 * */
	static getConverHistoryUrl(converid, page, per_page, order = 1)  //正序
	{
		if(!converHistoryUrl)
		{
			let siteId = loginUserProxy().siteId;
			
			converHistoryUrl = Settings.nCrocodileServer() + `/evs/${ siteId }/storage/conversationstorage`;
		}
		
		return converHistoryUrl + `?a=gcm&converid=${converid}&page=${page}&per_page=${per_page}&order=${order}`;
	}
	
	/**
	 * 获取行政组
	 * */
	static getAdminGroupUrl()
	{
		if(!adminGroupUrl)
		{
			let {siteId} = loginUserProxy();
			
			adminGroupUrl = Settings.getDolphinUrl() + `/evs/${siteId}/groups?scope=group`;
			
		}
		
		return adminGroupUrl;
	}
	
	/**
	 * 查询分组指定信息
	 * */
	static getUsersByGroupIdUrl(groupId, userstatus = 1)
	{
		if(!userByGroupIdUrl)
		{
			let siteId = loginUserProxy().siteId;
			
			userByGroupIdUrl = Settings.getDolphinUrl() + `/evs/${ siteId }/groups/`;
		}
		
		return userByGroupIdUrl + `${groupId}?scope=member&userstatus=${ userstatus }`;
	}
	
	/**
	 * 查询商户下用户群指定信息
	 * */
	static getShopGroupByGroupIdUrl(siteid)
	{
		ShopGroupGroupIdUrl = Settings.getDolphinUrl() + `/evs/${ siteid }/template/templaterouter?scope=router&status=0`;
		
		return ShopGroupGroupIdUrl;
	}
	
	static getSummariesUrl(converId)
	{
		let siteId = loginUserProxy().siteId;
		
		return configProxy().nCrocodileServer + `/evs/${siteId}/conversations/${converId}?scope=summarizes`;
	}
	
	//-------------------NSkyEye 轨迹---------------------
	/**
	 * 获取轨迹查询接口地址
	 * @param ntid 访客ntid
	 * @param type 全部轨迹：all; 页面信息：Web; 商品：Product; Order：订单；空：info
	 * @param page 页码
	 * @param per_page 每页展示记录数
	 * @returns {string}
	 */
	static getSkyEyeUrl(ntid, type = "all", page = 1, per_page = 5)
	{
		if(!skyEyeUrl)
		{
			if(configProxy().nSkyEyeUrl)
			{
				skyEyeUrl = configProxy().nSkyEyeUrl;
			}
		}
		
		let param = "";
		
		param += "/enterprises/" + loginUserProxy().siteId + "/tracks/nt?nt_id=" + ntid + "&nav=" + type;
		
		if(page)
		{
			param += "&page=" + page;
		}
		
		if(per_page)
		{
			param += "&per_page=" + per_page;
		}
		
		return skyEyeUrl + param;
	}
	
	static getProductUrl(prid = "ntalker_test")
	{
		if(!skyEyeUrl)
		{
			if(configProxy().nSkyEyeUrl)
			{
				skyEyeUrl = configProxy().nSkyEyeUrl;
			}
		}
		
		let param = `/enterprises/${loginUserProxy().siteId}/navigations/Product/${prid}`;
		
		return skyEyeUrl + param;
	}
	
	static getSkyEyeToken()
	{
		return loginUserProxy().ntoken;
	}
	
	//------------------------存储-------------------------
	static getUploadUrl()
	{
		if(!uploadUrl)
		{
			if(configProxy().uploadUrl)
			{
				uploadUrl = configProxy().uploadUrl;
			}
		}
		
		return uploadUrl;
	}
	
	//------------------------计算引擎---------------------------
	static getPantherUrl()
	{
		return "http://192.168.31.149:8081";
		
		if(!pantherUrl)
		{
			if(configProxy().nPantherUrl)
			{
				pantherUrl = configProxy().nPantherUrl;
			}
		}
		return pantherUrl;
	}
	
	static getWorkBenchUrl()
	{
		if(!workBenchUrl)
		{
			workBenchUrl = Settings.getPantherUrl() + "/api/report";
		}
		
		return workBenchUrl;
	}
	
	static getWorkBenchAllUrl()
	{
		let {siteId} = loginUserProxy();
		
		return Settings.getPantherUrl() + `/api/rptmetadata/rpt_col/${siteId}/rpt_top_dashboard`;
	}
	
	static getWorkBenchUrl2()
	{
		let {siteId, userId} = loginUserProxy();
		
		return Settings.getPantherUrl() + `/api/report/favorite/${siteId}/${userId}/rpt_top_dashboard`;
	}
	
	//------------------------咨询接待---------------------------
	/**
	 * 咨询接待右侧页签地址
	 * */
	static getChatRightTabsUrl()
	{
		return getTabManagerUrl(configProxy().nSettingUrl);
	}
	
	static getHyperMediaFlist(templateId)
	{
		let siteId = loginUserProxy().siteId,
			templateIdParamStr = templateId ? "&templateId=" + templateId : "";
		
		return configProxy().nMagicServer + "/magicbox/flist?siteid=" + siteId + templateIdParamStr;
	}
	
	static getNMagicServer()
	{
		return configProxy().nMagicServer;
	}
	
	static getHyperMediaHtml(queryStr)
	{
		let str = queryStr ? "?" + queryStr : "";
		
		return configProxy().nMagicServer + "/magicbox/index" + str;
	}
	
	//----------------------互动记录--------------------------
	static getPendingConversUrl(per_page, page)
	{
		let {userId, siteId} = loginUserProxy();
		
		return configProxy().nCrocodileServer + "/nearest/getNearestCustomer?kfId=" + userId + "&siteId=" + siteId + "&per_page=" + per_page + "&page=" + page;
	}
	
	static nCrocodileServer()
	{
		return configProxy().nCrocodileServer;
	}
	
	//----------------------机器人代理--------------------------
	
	static nEagleServer()
	{
		return configProxy()
		.nEagleServer();
	}
	
	//----------------------呼叫中心--------------------------
	
	static nPhoneLoginUrl()
	{
		let {siteId, userId, ntoken} = loginUserProxy();
		return `${configProxy().xNccSettingServer}/sitecenter/evs/${siteId}/login/${userId}?authtoken=${ntoken}`;
		
	}
	
	static getCallRecordHeadersUrl(callType, resultType)
	{
		let {siteId, userId} = loginUserProxy();
		return configProxy()._xNccRecordServer + `/callrecord/${siteId}/${userId}/headshow?&callType=${callType}&resultType=${resultType}`;
		// return  `http://192.168.91.33:8083/callrecord/${siteId}/${userId}/headshow?&callType=${callType}&resultType=${resultType}`;
	}
	
	static getCallRecordSitHeadersUrl(callType, resultType, headfield, type)
	{
		let {siteId, userId} = loginUserProxy();
		return configProxy()._xNccRecordServer + `/callrecord/${siteId}/${userId}/headfield?callType=${callType}&resultType=${resultType}&headfield=${headfield}&type=${type}`;
	}
	
	static getCallRecordExport(callId, callType, resultType, startTime, endTime)
	{
		let {siteId, userId} = loginUserProxy();
		return configProxy()._xNccRecordServer + `/callrecord/${siteId}/recordext?&userId=${userId}&callId=${callId}&callType=${callType}&resultType=${resultType}&startTime=${startTime}&endTime=${endTime}`;
	}
	
	static getCallRecordDisplayColumn(callType, resultType)
	{
		let {siteId, userId} = loginUserProxy();
		return configProxy()._xNccRecordServer + `/callrecord/${siteId}/${userId}/display?&callType=${callType}&resultType=${resultType}`;
	}
	
	static getCallRecordListUrl(callType, currentPage, startTime, endTime, resultType, pageSize)
	{
		let {siteId, userId} = loginUserProxy();
		return configProxy()._xNccRecordServer + `/callrecord/${siteId}/records?userId=${userId}&callType=${callType}${startTime > 0 ? "&startTime=" + startTime : ""}${endTime > 0 ? "&endTime=" + endTime : ""}&currentPage=${currentPage}${pageSize > 0 ? "&pageSize=" + pageSize : ""}${resultType != -1 ? "&resultType=" + resultType : ""}`;
		// return   `http://192.168.91.33:8083/callrecord/${siteId}/records?userId=${userId}&callType=${callType}${startTime > 0 ? "&startTime=" + startTime : ""}${endTime > 0 ? "&endTime=" + endTime : ""}&currentPage=${currentPage}${pageSize > 0 ? "&pageSize=" + pageSize : ""}${resultType != -1 ? "&resultType=" + resultType : ""}`;
	}
	
	static phoneSummaryUrl(query = "")
	{
		let {siteId, userId} = loginUserProxy();
		
		return configProxy().xNccSettingServer + `/callsetting/${siteId}/summary/${userId}` + query;
	}
	
	static getCrmServerPassCode(telphone, type = "crm", customerId = "")
	{
		let {siteId, userId} = loginUserProxy();
		
		return configProxy().xNccSettingServer + `/sitecenter/evs/aes/${type}/${siteId}/${userId}/${telphone}/${customerId}`;
	}
	
	static getSearchWorkOrderForCRM()
	{
		return configProxy().nWoServer + "/wo/workorder/searchWorkOrderForCRM";
	}
	
	static getnWoWebUrl(passCode)
	{
		return configProxy().nWoWebServer + `/woweb/?passCode=${passCode}&token=phone`;
	}
	
	static getCrmWebUrl(passwordCode)
	{
		return configProxy().nCrmWebCallServer + "/call/?passwordCode=" + passwordCode;
	}
	
	static getCallSettingUrl(path, query = "")
	{
		return `${configProxy().xNccSettingServer}/sitecenter/evs/${path}${query}`;
	}
	
	static getVisitPlanUrl(path, query = "")
	{
		return `${configProxy().xNccRecordServer}/plan/${path}${query}`;
	}
	
	static getCallServerUrl(path, query = "")
	{
		return `${configProxy().xNccCallServer}/callserver/${path}${query}`;
	}
	
	static clear()
	{
		loginCodeUrl = "";
		loginUrl = "";
		imSocketUrl = "";
		dolphinUrl = "";
		skyEyeUrl = "";
		uploadUrl = "";
		pantherUrl = "";
		workBenchUrl = "";
		personInfoUrl = "";
		personInfoUrl2 = "";
		synmessageUrl = "";
		nRegionServer = "";
		colleagueConverUrl = "";  //同事会话列表
		converHistoryUrl = "";  //历史消息
		adminGroupUrl = "";  //行政组
		userByGroupIdUrl = "";  //组详细信息
		ShopGroupGroupIdUrl = "";  //商户下用户群详细信息
		customerConverListUrl = "";
		pendingConversUrl = "";
		summariesUrl = "";
	}
}

let _configProxy = null,
	loginCodeUrl = "",
	loginUrl = "",
	imSocketUrl = "",
	dolphinUrl = "",
	skyEyeUrl = "",
	uploadUrl = "",
	pantherUrl = "",
	workBenchUrl = "",
	personInfoUrl = "",
	personInfoUrl2 = "",
	synmessageUrl = "",
	nRegionServer = "",
	colleagueConverUrl = "",  //同事会话列表
	converHistoryUrl = "",  //历史消息
	adminGroupUrl = "",  //行政组
	userByGroupIdUrl = "",  //组详细信息
	ShopGroupGroupIdUrl = "",  //商户下用户群详细信息
	customerConverListUrl = "",
	pendingConversUrl = "",
	summariesUrl = "",
	personalInfoUrl;

function configProxy()
{
	if(!_configProxy)
	{
		_configProxy = Model.retrieveProxy(ConfigProxy.NAME)
	}
	
	return _configProxy;
}

export default Settings;
