import {
	GET_SENSITIVEWORD, SET_SENSITIVEWORD
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


//敏感词获取数据
export function getSensitive()
{
	return dispatch =>
	{

        dispatch(getAction(GET_SENSITIVEWORD, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/sensitiveWords/",siteid, "");
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_SENSITIVEWORD, "left", true));
	}
}

//敏感词修改数据
export function setSensitive(data)
{
	return dispatch =>
	{

        dispatch(getAction(SET_SENSITIVEWORD, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/sensitiveWords/",siteid, "");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:SET_SENSITIVEWORD,
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

