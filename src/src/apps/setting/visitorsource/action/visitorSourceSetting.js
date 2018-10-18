import {
	GET_VISITORDATA, GET_NEW_VISITOR_TYPE,
	GET_EDITOR_VISITOR_TYPE, REMOVE_VISITOR_TYPE, GET_VISITOR,
	GET_NEW_VISITOR, GET_EDITOR_VISITOR, REMOVE_VISITOR, CLEAR_VISITOR_PROGRESS, CLEAR_VISITOR_ITEM_PROGRESS
} from '../../../../model/vo/actionTypes';
import Model from "../../../../utils/Model";
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import LoginUserProxy from "../../../../model/proxy/LoginUserProxy";
import Settings from '../../../../utils/Settings';

function dispatchAction(dispatch, type, proType, load, result)
{
	let progress = 2,
		success = result && result.success;

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

//获取访客来源类型列表
export function visitorItems(data)
{
	return dispatch =>
	{

		dispatch(getAction(GET_VISITORDATA, "left", LoadProgressConst.LOADING));
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;

		let settingUrl = Settings.querySettingUrl("/source/", siteid, "");
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(result =>
        {
            let success = result && result.success,
                progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
            dispatch({
                type: GET_VISITORDATA,
                "left": progress,
                result,
                success
            });
            return Promise.resolve(result)
        });
	}
}

//清除访客来源progress
export function clearVisitorProgress()
{
    return dispatch =>
    {
        dispatch(getAction(CLEAR_VISITOR_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}

//新建访客来源类型
export function newVisitorType(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_NEW_VISITOR_TYPE, "left", LoadProgressConst.SAVING));
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		data.siteid = siteid;

		let settingUrl = Settings.querySettingUrl("/source/", siteid, "");

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
        .then(result =>
        {
            let success = result.success,
                progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
            dispatch({
                type: GET_NEW_VISITOR_TYPE,
                "left": progress,
                result,
                success
            })
        });
	}
}

//编辑访客来源类型
export function editorVisitorType(data, ownId)
{
	return dispatch =>
	{

		dispatch(getAction(GET_EDITOR_VISITOR_TYPE, "left", LoadProgressConst.SAVING));

		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		data.siteid = siteid;
		data.ownId = ownId;

		let settingUrl = Settings.querySettingUrl("/source/", siteid, "");

		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let success = result.success,
                progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: GET_EDITOR_VISITOR_TYPE,
				"left": progress,
				data,
                result,
				success
			})
		});
	}
}

//删除访客来源类型
export function removeVisitorType(data)
{
	return dispatch =>
	{

		dispatch(getAction(REMOVE_VISITOR_TYPE, "left", LoadProgressConst.SAVING));

		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		data.siteid = siteid;

		let settingUrl = Settings.querySettingUrl("/source/", siteid, "");

		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: REMOVE_VISITOR_TYPE,
				"left": progress,
				data: data,
				success: result.success
			});
            if (result.success)
            {
                return urlLoader(Settings.querySettingUrl("/source/", siteid, "/sourcetype/-1"), {headers: {token: ntoken}})
                    .then(roleMangerCode)
                    .then(dispatchAction.bind(null, dispatch, GET_VISITOR, "right", true));
            }
		});
	}
}

//获取访客来源列表
export function getVisitorData(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_VISITOR, "right", LoadProgressConst.LOADING));

		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;

		let settingUrl = Settings.querySettingUrl("/source/", siteid, "/sourcetype/" + data);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_VISITOR, "right", true));
	}
}

//清除访客来源progress
export function clearVisitorItemProgress(type)
{
    let actionType = type == "left" ? CLEAR_VISITOR_PROGRESS : CLEAR_VISITOR_ITEM_PROGRESS;
    return dispatch =>
    {
        dispatch(getAction(actionType, type, LoadProgressConst.LOAD_COMPLETE));
    }
}


//新建访客来源
export function newVisitor(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_NEW_VISITOR, "right", LoadProgressConst.SAVING));
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		data.siteid = siteid;

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
		let settingUrl = Settings.querySettingUrl("/source/", siteid, "/item");

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: GET_NEW_VISITOR,
				"right": progress,
				success: result.success,
				result
			})
		});
	}
}

//编辑访客来源
export function editorVisitor(data)
{
	return dispatch =>
	{

		dispatch(getAction(GET_EDITOR_VISITOR, "right", LoadProgressConst.SAVING));
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy;
		data.siteid = siteid;

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
		let settingUrl = Settings.querySettingUrl("/source/", siteid, "/item");

		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let success = result.success,
                progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: GET_EDITOR_VISITOR,
				"right": progress,
				data,
                result,
				success
			})
		});
	}
}

//删除访客来源
export function removeVisitor(pkid, sys)
{
	return dispatch =>
	{

		dispatch(getAction(REMOVE_VISITOR, "right", LoadProgressConst.SAVING));
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{siteId: siteid, ntoken} = loginUserProxy,
			data = {
				siteid,
				pk_config_source: pkid,
                sys
			};

		let settingUrl = Settings.querySettingUrl("/source/", siteid, "/item");
		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";

		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: REMOVE_VISITOR,
				"right": progress,
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
