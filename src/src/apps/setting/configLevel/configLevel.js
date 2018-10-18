/**
 * <!-------------------------------配置项级别设置----------------------------->
 * */
import {
	GET_INDIVIDUAL_LEVEL, EDIT_CONFIG_LEVEL, GET_ALL_CONFIG_LEVEL
} from '../../../model/vo/actionTypes';
import Model from "../../../utils/Model";
import { urlLoader } from "../../../lib/utils/cFetch";
import LogUtil from "../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import LoginUserProxy from "../../../model/proxy/LoginUserProxy";
import Settings from '../../../utils/Settings';
import { getDataFromResult } from "../../../utils/MyUtil";

function dispatchAction(dispatch, type, proType, load, result)
{
	let progress = 2,
		success = result && result.code == 200;
	
	if(load)
	{
		progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
	}
	else
	{
		progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
	}
	
	dispatch(getAction(type, proType, progress, result));
	
	return Promise.resolve({success, result: result})
}

function getAction(type, progressType, progress, result)
{
	
	return {type, result, [progressType]: progress}
}

/**
 * 查询单个配置项级别
 * */

/*export function getPersonLevel(data)
 {
 return dispatch =>
 {
 dispatch(getAction(GET_INDIVIDUAL_LEVEL, "left", LoadProgressConst.LOADING));
 let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
 {siteId:siteid, token} = loginUserProxy,
 tokenJson = JSON.stringify(token);
 data.siteid = siteId;
 // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
 let settingUrl = Settings.querySettingUrl("/configItems/",siteid, "?item="+data.item);
 return urlLoader(settingUrl, {headers: {tokenJson}})
 .then(roleMangerCode)
 .then(dispatchAction.bind(null, dispatch, GET_INDIVIDUAL_LEVEL, "left", true));
 }
 }*/

/**
 * 查询全部配置项级别
 * */
export function getAllLevel()
{
	return dispatch =>
	{
		dispatch(getAction(GET_ALL_CONFIG_LEVEL, "left", LoadProgressConst.LOADING));
		
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		
		let settingUrl = Settings.querySettingUrl("/configItems/", siteid, "/all");
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(getDataFromResult)
		.then(dispatchAction.bind(null, dispatch, GET_ALL_CONFIG_LEVEL, "left", true));
	}
}

/**
 * 修改配置项级别
 * */
export function editConfigLevel(data)
{
	return dispatch =>
	{
		
		dispatch(getAction(EDIT_CONFIG_LEVEL, "left", LoadProgressConst.SAVING));
		
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		data.siteid = siteid;
		
		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
		let settingUrl = Settings.querySettingUrl("/configItems/", siteid, "");
		
		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: EDIT_CONFIG_LEVEL,
				"left": progress,
				data: data,
				success: result.success
			})
		});
	}
}

function roleMangerCode(response)
{
	LogUtil.trace("sessionLabel", LogUtil.INFO, response);
	
	return Promise.resolve(response.jsonResult);
}


