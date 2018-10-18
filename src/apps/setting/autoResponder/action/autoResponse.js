import {
	SET_AUTO_RESPONSE, RESET_ANWER_PROGRESS, SET_AUTO_RESPONSE_GREET, GET_TEMPLATE_AUTO_WELCOME, GET_AUTO_WELCOME, GET_AUTO_RESPONSE, GET_TEMPLATE_AUTO_RESPONSE
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

/**
 * 获取企业欢迎语开启级别及内容
 * */
export function getAutowelcomelevel(templateId)
{
	return dispatch =>
	{

        dispatch(getAction(GET_AUTO_WELCOME, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl;
        if (templateId)
        {
            settingUrl = Settings.querySettingUrl("/auto/welcome/",siteid,"/"+templateId+"?item=1");
        }else
        {
            settingUrl = Settings.querySettingUrl("/auto/welcome/",siteid,"?item=1");
        }

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_AUTO_WELCOME, "left", true));
	}
}

/**
 * 获取企业自动应答开启级别及内容
 * */
export function getResponselevel(templateId)
{
	return dispatch =>
	{
        dispatch(getAction(GET_AUTO_RESPONSE, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        let settingUrl;
        if (templateId)
        {
            settingUrl = Settings.querySettingUrl("/auto/reply/",siteid,"/"+templateId+"?item=2");
        }else
        {
            settingUrl = Settings.querySettingUrl("/auto/reply/",siteid,"?item=2");
        }

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_AUTO_RESPONSE, "left", true));
	}
}



/**
 * 设置企业、用户群问候语
 * */
export function autoResponseGreet(data)
{
	return dispatch => {

        dispatch(getAction(SET_AUTO_RESPONSE_GREET, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/auto/welcome/",siteid, "");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:SET_AUTO_RESPONSE_GREET,
                    "left":progress,
                    data:data,
                    success:result.success
                })
            });
    }
}

/**
 * 设置企业、用户群问候语（批量操作）
 * */
export function templatesAutoResponseGreet(data)
{
    return dispatch => {

        dispatch(getAction(SET_AUTO_RESPONSE_GREET, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/auto/welcome/",siteid, "/template");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:SET_AUTO_RESPONSE_GREET,
                    "left":progress,
                    data:data,
                    success:result.success
                })
            });
    }
}

/**
 * 设置企业、用户群、客服自动应答
 * */
export function autoResponse(data)
{
	return dispatch =>
	{

        dispatch(getAction(SET_AUTO_RESPONSE, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/auto/reply/",siteid, "");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:SET_AUTO_RESPONSE,
                    "left":progress,
                    data:data,
                    success:result.success
                })
            });
	}
}

/**
 * 设置企业、用户群、客服自动应答
 * */
export function resetAnswerProgress(data)
{
    return dispatch =>
    {
        dispatch(getAction(RESET_ANWER_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}

/**
 * 设置企业、用户群、客服自动应答（批量操作）
 * */
export function templateAutoResponse(data)
{
    return dispatch =>
    {

        dispatch(getAction(SET_AUTO_RESPONSE, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/auto/reply/",siteid, "/template");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:SET_AUTO_RESPONSE,
                    "left":progress,
                    data:data,
                    success:result.success
                })
            });
    }
}

/**
 * 获取用户群欢迎语内容
 * */
export function getUserwelcomelevel(templateId)
{
    return dispatch =>
    {
        dispatch(getAction(GET_TEMPLATE_AUTO_WELCOME, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/auto/welcome/",siteid,"/"+templateId+"?item=1");

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_TEMPLATE_AUTO_WELCOME, "left", true));
    }
}

/**
 * 获取用户群自动应答内容
 * */
export function getUserResponselevel(data)
{
    return dispatch =>
    {

        dispatch(getAction(GET_TEMPLATE_AUTO_RESPONSE, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/auto/welcome/",siteid,"/"+templateId+"?item=1");

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_TEMPLATE_AUTO_RESPONSE, "left", true));

    };
}

function autoUserResponseCode(data)
{
    let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
        siteId = loginUserProxy.siteId,
        tokenObj = loginUserProxy.token,
        tokenjson = JSON.stringify(tokenObj);

    data.siteid = siteId;
    data.scope = "autoReply";

    let settingUrl = Settings.querySettingUrl("getGroupReplay", data);
    //let settingUrl = "http://192.168.30.250:8080/getData?function=getGroupReplay&type=1&data="+JSON.stringify(data);
    return urlLoader(settingUrl, {headers: {token: tokenjson}})
        .then(autoResponseCode)
        .catch((error) =>
        {
            return error;
        });
}

/**
 * 设置用户群欢迎语和自动应答
 * */
export function autoUserResponse(data)
{
	return dispatch =>
	{
		autoUserResponseOff(data)
		.then((result) =>
		{
			dispatch({
				type: SET_AUTO_RESPONSE,
				result
			});
		}, (error) =>
		{
			console.log(error);
		});
	}
}

function autoUserResponseOff(data)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		siteId = loginUserProxy.siteId,
		tokenObj = loginUserProxy.token,
		tokenjson = JSON.stringify(tokenObj);

	data.siteid = siteId;

	let settingUrl = Settings.saveSettingUrl("editTemplateReplay");
	//let settingUrl = "http://192.168.30.250:8080/setData?function=editTemplateReplay&type=1";

	return urlLoader(settingUrl, {method: "post", headers: {token: tokenjson}, body: JSON.stringify(data)})
	.then(autoResponseCode)
	.catch((error) =>
	{
		return error;
	});
}

function autoResponseCode(response)
{
	//console.log(response)
	let jsonResult = response.jsonResult,
		data = jsonResult;
	return Promise.resolve(data);
}

function roleMangerCode(response)
{
    LogUtil.trace("sessionLabel", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}


