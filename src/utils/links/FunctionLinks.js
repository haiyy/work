import { loginUserProxy } from "../../utils/MyUtil";
import Model from "../Model";
import ConfigProxy from "../../model/proxy/ConfigProxy";

//初始化
export function initUrl()
{
	return getLink("init");
}

//主菜单
export function getMainNavUrl()
{
	return getLink("main");
}

//咨询工具条功能
export function getToolbarUrl()
{
	return getLink("toolbar");
}

export function getTabManagerUrl()
{
	let url = configProxy().nSettingUrl + "/settings/" + getSiteId() + "/" + loginUserProxy().userId + "/tabmanager";
	return url;
}

function getSiteId()
{
	let {siteId} = loginUserProxy();
	return siteId;
}

function getLink(key)
{
	return configProxy().nSettingUrl + linkSet[key] + getSiteId();
}

function configProxy()
{
	if(!_configProxy)
	{
		_configProxy = Model.retrieveProxy(ConfigProxy.NAME)
	}
	
	return _configProxy;
}

let linkSet = {
		main: "/menuconfig/",
		init: "/function/initialize/",
		toolbar: "/function/toolbar/",
	},
	_configProxy;
