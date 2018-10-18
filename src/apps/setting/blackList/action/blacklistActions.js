import { GET_ALL_BLACKLIST, ADD_BLACKLIST, REMOVE_BLACKLIST, CLEAR_PROGRESS, GET_SEARCH_BLACKLIST } from "../../../../model/vo/actionTypes";
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import Settings from '../../../../utils/Settings';
import { loginUserProxy } from '../../../../utils/MyUtil';

function dispatchAction(dispatch, type, proType, load, result)
{
    let progress = 2,
        success = result && result.code === 200;

    if(load)
    {
        progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
    }
    else
    {
        progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
    }

    dispatch(getAction(type, proType, progress, result)); //result.data

    return Promise.resolve({success, result: result})
}

function getAction(type, progressType, progress, result)
{
    return {type, result, progress}
}

//搜索黑名单
export function getSearchBlacklist(searchVal="")
{
    return dispatch =>
    {
        dispatch(getAction(GET_SEARCH_BLACKLIST, "left", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.getBlacklistUrl() + '?' + siteId + '&search=' + searchVal;
        // let settingUrl = 'https://gate-devdebug.ntalker.com//guest/blacklist?' + siteId + '&search=' + searchVal;

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_SEARCH_BLACKLIST, "left", true));
    }
}

//分页获取全部黑名单列表
export function getAllBlacklist(data={page:1,rp:10})
{
    return dispatch =>
    {
        dispatch(getAction(GET_ALL_BLACKLIST, "left", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.getBlacklistUrl() + '?siteid=' + siteId + '&page=' + data.page + '&size=' + data.rp;
        // let settingUrl = 'https://gate-devdebug.ntalker.com/guest/blacklist?siteid=' + siteId + '&page=' + data.page + '&size=' + data.rp;

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_ALL_BLACKLIST, "left", true));
    }
}

//添加黑名单
export function addBlackList(data = {}, currentPage = 1)
{
    return dispatch =>
    {
        let {siteId, userId, ntoken} = loginUserProxy(),
            settingUrl = Settings.getBlacklistUrl();
            // settingUrl = "https://gate-devdebug.ntalker.com/guest/blacklist";
        data.siteid = siteId;
        data.userid = userId;
        dispatch(getAction(ADD_BLACKLIST, "left", LoadProgressConst.SAVING));

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result.code == 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 400 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: ADD_BLACKLIST,
                    progress,
                    data: result.data,
                    msg: result.msg,
                    success
                });
                if (success)
                {
                    let settingUrl = Settings.getBlacklistUrl() + '?siteid=' + siteId + '&page=' + currentPage + '&size=10';
                    // let settingUrl = 'https://gate-devdebug.ntalker.com/guest/blacklist?siteid=' + siteId + '&page=' + currentPage + '&size=10';

                    dispatch(getAction(GET_ALL_BLACKLIST, "left", LoadProgressConst.LOADING));

                    urlLoader(settingUrl, {headers: {token: ntoken}})
                        .then(roleMangerCode)
                        .then(dispatchAction.bind(null, dispatch, GET_ALL_BLACKLIST, "left", true));
                }
            });
    }
}

//移除黑名单
export function removeBlackList(data, currentPage = 1)
{
    return dispatch =>
    {
        let {siteId, ntoken} = loginUserProxy(),
            settingUrl = Settings.getBlacklistUrl();
            // settingUrl = "https://gate-devdebug.ntalker.com/guest/blacklist";

        data.siteid = siteId;
        dispatch(getAction(REMOVE_BLACKLIST, "left", LoadProgressConst.SAVING));

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result.code == 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: REMOVE_BLACKLIST,
                    progress,
                    data,
                    success
                });
                if (success)
                {
                    let settingUrl = Settings.getBlacklistUrl() + '?siteid=' + siteId + '&page=' + currentPage + '&size=10';
                    // let settingUrl = 'https://gate-devdebug.ntalker.com/guest/blacklist?siteid=' + siteId + '&page=' + currentPage + '&size=10';

                    dispatch(getAction(GET_ALL_BLACKLIST, "left", LoadProgressConst.LOADING));

                    urlLoader(settingUrl, {headers: {token: ntoken}})
                        .then(roleMangerCode)
                        .then(dispatchAction.bind(null, dispatch, GET_ALL_BLACKLIST, "left", true));
                }
            });
    }
}

//刷新progress
export function clearProgress()
{
    return dispatch =>
    {
        dispatch(getAction(CLEAR_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}

function roleMangerCode(response)
{
    LogUtil.trace("CommonWord action", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}
