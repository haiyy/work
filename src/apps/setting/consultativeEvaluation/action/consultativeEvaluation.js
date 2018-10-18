import {
    GET_EVALUATION, EDIT_EVALUATION, CLEAR_EVALUATION_PROGRESS
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

//获取评价
export function getEvaluation(data) {
	return dispatch =>
	{
        dispatch(getAction(GET_EVALUATION, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl;
        if (data&&data.templateid)
        {
            settingUrl = Settings.querySettingUrl("/evaluation/",siteid, "/"+obj.templateid+"?item="+8)

        }else
        {
            settingUrl = Settings.querySettingUrl("/evaluation/",siteid, "?item="+8)
        }

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_EVALUATION, "left", true));
	}
}

//修改评价
export function editEvaluation(data) {
    return dispatch =>
    {
        dispatch(getAction(EDIT_EVALUATION, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group";

        let settingUrl;

        if (data&&data.templateid)
        {
            settingUrl = Settings.querySettingUrl("/evaluation/",siteid, "/"+obj.templateid)
        }else
        {
            settingUrl = Settings.querySettingUrl("/evaluation/",siteid, "")
        }

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:EDIT_EVALUATION,
                    "left":progress,
                    data:data,
                    success:result.success
                })
            });
    }
}

export function clearEvaluationProgress()
{
    return dispatch =>
    {
        dispatch(getAction(CLEAR_EVALUATION_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}

function roleMangerCode(response)
{
    LogUtil.trace("consultativeEvaluation", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}
