import {
	GET_WEBVIEW, SET_WEBVIEW, CLEAR_WEBVIEW_PROGRESS
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

//获取访客聊窗数据
export function getWebView()
{
	return dispatch =>
	{

        dispatch(getAction(GET_WEBVIEW, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        let settingUrl = Settings.querySettingUrl("/webChat/", siteid, "/setting ");
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_WEBVIEW, "left", true));
	}
}

//设置访客聊窗数据
export function setWebView(data)
{
	return dispatch =>
	{
        dispatch(getAction(SET_WEBVIEW, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, userId: userid, ntoken} = loginUserProxy;
        data.userid = userid;

        let settingUrl = Settings.querySettingUrl("/webChat/",siteid, "");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type : SET_WEBVIEW,
                    "left" : progress,
                    data : data,
                    success : result.success
                })
            });
	}
}

//清除访客聊窗progress
export function clearWebviewProgress()
{
    return dispatch =>
    {
        dispatch(getAction(CLEAR_WEBVIEW_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}


function roleMangerCode(response)
{
    LogUtil.trace("sessionLabel", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}
