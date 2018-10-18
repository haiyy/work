import { GET_QUALITYTEST, NEW_QUALITYTEST, EDITOR_QUALITYTEST, REMOVE_QUALITYTEST } from '../../../../model/vo/actionTypes';
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


//查询质检
export function getQualityTest()
{
	return dispatch =>
	{

        dispatch(getAction(GET_QUALITYTEST, "left", LoadProgressConst.LOADING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;

        let settingUrl = Settings.querySettingUrl("/quality/",siteid, "");
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_QUALITYTEST, "left", true));
	}
}

//创建质检
export function newQualityTest(data)
{
	return dispatch =>
	{

        dispatch(getAction(NEW_QUALITYTEST, "left", LoadProgressConst.SAVING));
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        let settingUrl = Settings.querySettingUrl("/quality/",siteid, "");

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, NEW_QUALITYTEST, "left", false));
	}
}

//修改质检
export function editorQualityTest(data)
{
	return dispatch =>
	{

        dispatch(getAction(EDITOR_QUALITYTEST, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy;
        data.siteid = siteid;

        let settingUrl = Settings.querySettingUrl("/quality/",siteid, "");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:EDITOR_QUALITYTEST,
                    "left":progress,
                    data:data,
                    success:result.success
                })
            });
	}
}

//删除质检
export function removeQualityTest(id)
{
	return dispatch =>
	{

        dispatch(getAction(REMOVE_QUALITYTEST, "left", LoadProgressConst.SAVING));

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId:siteid, ntoken} = loginUserProxy,
            obj={
                siteid,
                qualityId: id
            };
        let settingUrl = Settings.querySettingUrl("/quality/",siteid, "");

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken},body: JSON.stringify(obj)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:REMOVE_QUALITYTEST,
                    "left":progress,
                    data:obj,
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
