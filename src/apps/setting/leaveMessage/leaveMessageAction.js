import {
    GET_LEAVE_MESSAGE, EDIT_LEAVE_MESSAGE
} from '../../../model/vo/actionTypes';
import Model from "../../../utils/Model";
import { urlLoader } from "../../../lib/utils/cFetch";
import LogUtil from "../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import LoginUserProxy from "../../../model/proxy/LoginUserProxy";
import Settings from '../../../utils/Settings';

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

function judgeSettingUrl(obj)
{
    let settingUrl,
        loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
        {siteId:siteid} = loginUserProxy;
    if (obj&&obj.templateid)
    {
        settingUrl = Settings.querySettingUrl("/leaveMsg/",siteid, "/"+obj.templateid)

    }else
    {
        settingUrl = Settings.querySettingUrl("/leaveMsg/",siteid, "")
    }
    return settingUrl
}

//获取留言
export function getLeaveMessage(data) {
	return dispatch =>
	{
        dispatch(getAction(GET_LEAVE_MESSAGE, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = judgeSettingUrl(data);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_LEAVE_MESSAGE, "left", true));
	}
}

//编辑留言
export function editLeaveMessage(data) {
	return dispatch =>
	{
        dispatch(getAction(EDIT_LEAVE_MESSAGE, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId, ntoken} = loginUserProxy;
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/group" ;
        let settingUrl = judgeSettingUrl(data);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
        .then(roleMangerCode).then(result=>{
            let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
            dispatch({
                type:EDIT_LEAVE_MESSAGE,
                "left":progress,
                data:data,
                success:result.success
            })
        });
    }
}

function roleMangerCode(response)
{
    LogUtil.trace("sessionLabel", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}
