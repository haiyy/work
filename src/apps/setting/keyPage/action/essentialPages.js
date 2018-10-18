import {
  GET_ESSENTIAL ,ESSENTIAL, NEW_ESSENTIAL, DEL_ESSENTIAL
} from '../../../../model/vo/actionTypes';
import { urlLoader } from '../../../../lib/utils/cFetch'
import Settings from '../../../../utils/Settings';
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import {loginUserProxy} from '../../../../utils/MyUtil';
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
//获取关键页面信息
export function  fetchRules() {
  return dispatch => {
      dispatch(getAction(GET_ESSENTIAL, "left", LoadProgressConst.LOADING));
      let {siteId, ntoken} = loginUserProxy();

      let settingUrl = Settings.querySettingUrl("/keyPage/",siteId, "");
      return urlLoader(settingUrl, {headers: {token: ntoken}})
          .then(roleMangerCode)
          .then(dispatchAction.bind(null, dispatch, GET_ESSENTIAL, "left", true));
  };
}

//删除关键页面
export function delKeyPage(keyid, key)
{
	return dispatch => {

        dispatch(getAction(DEL_ESSENTIAL, "left", LoadProgressConst.SAVING));

        let {siteId:siteid, ntoken} = loginUserProxy();

        let data = { keyid, siteid},
            settingUrl = Settings.querySettingUrl("/keyPage/",siteid, "");

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type:DEL_ESSENTIAL,
                    "left":progress,
                    result:keyid,
                    key,
                    success:result.success
                })
            });
        };
}

//修改关键页面
export function editKeyPage(record){

    return dispatch =>
    {
        dispatch(getAction(ESSENTIAL, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy(),
            data = {};

        data["keyid"] = record.keyid;
        data["urlreg"] = record.urlreg;
        data["keyname"] = record.keyname;
        data["pagelevel"] = record.pagelevel;
        data["siteid"] = siteId;

        let settingUrl = Settings.querySettingUrl("/keyPage/", siteId);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=>
            {
                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type:ESSENTIAL,
                    "left":progress,
                    data:data,
                    success:success
                })
            });
    }
}

//新建关键页面
export function addKeyPage(keylevel, data)
{
	return dispatch => {

        dispatch(getAction(NEW_ESSENTIAL, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        data["pagelevel"] = keylevel;
        data["siteid"] = siteId;

        let settingUrl = Settings.querySettingUrl("/keyPage/",siteId, "");

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=>
            {
                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type:NEW_ESSENTIAL,
                    "left":progress,
                    result: result,
                    key: keylevel,
                    success
                })
            });
	};
}

function roleMangerCode(response)
{
    LogUtil.trace("sessionLabel", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}
