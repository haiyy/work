import {
    GET_PERSON_TIPS_TYPE, NEW_PERSON_TIPS_TYPE,
    EDIT_PERSON_TIPS_TYPE, DEL_PERSON_TIPS_TYPE, GET_PERSON_TIPS_ITEM,
    NEW_PERSON_TIPS_ITEM, EDIT_PERSON_TIPS_ITEM, DEL_PERSON_TIPS_ITEM,
    IMPORT_PERSON_TIPS, CLEAR_PERSONTIPS_PROGRESS, EDIT_PERSON_TIPS_TYPE_RANK, EDIT_PERSON_TIPS_ITEM_RANK
} from '../../../../model/vo/actionTypes';
import LogUtil from "../../../../lib/utils/LogUtil";
import {urlLoader} from "../../../../lib/utils/cFetch";
import {loginUserProxy} from '../../../../utils/MyUtil';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import Settings from '../../../../utils/Settings';


function dispatchAction(dispatch, type, proType, load, result) {
    let progress = 2,
        success = result && result.success;

    if (load)
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

function getAction(type, progressType, progress, result) {
    return {type, result, [progressType]: progress}
}
//获取话术分组列表
export function getPersonTipsAll(userid) {
    return dispatch => {

        dispatch(getAction(GET_PERSON_TIPS_TYPE, "left", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+ siteId +"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "?userid=" + userid);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_PERSON_TIPS_TYPE, "left", true));
    }
}

//新建话术分组
export function newPersonTipsGroup(data) {
    return dispatch => {

        dispatch(getAction(NEW_PERSON_TIPS_TYPE, "left", LoadProgressConst.SAVING));

        let {siteId:siteid, ntoken} = loginUserProxy(),
            obj = {siteid, groupName: data.groupName};

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteid, "/group?userid=" + data.userid);

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(obj)})
            .then(roleMangerCode)
            .then(result=> {
                let success = result.success,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: NEW_PERSON_TIPS_TYPE,
                    "left": progress,
                    success,
                    result
                })
            });
    }
}

//编辑话术分组
export function editPersonTipsGroup(data) {
    return dispatch => {

        dispatch(getAction(EDIT_PERSON_TIPS_TYPE, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/group?userid=" + data.userid);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=> {
                let success = result.success,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: EDIT_PERSON_TIPS_TYPE,
                    "left": progress,
                    data,
                    success,
                    result
                })
            });
    }
}

//编辑话术分组
export function editPersonTipsTypeRank(data, userId) {
    return dispatch => {

        dispatch(getAction(EDIT_PERSON_TIPS_TYPE_RANK, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/groupbatch?userid=" + userId);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=> {

                let success = result.success,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: EDIT_PERSON_TIPS_TYPE_RANK,
                    "left": progress,
                    data,
                    success,
                    result
                })
            });
    }
}

//删除话术分组
export function delPersonTipsGroup(data) {
    return dispatch => {

        dispatch(getAction(DEL_PERSON_TIPS_TYPE, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/group?userid=" + data.userid);

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=> {
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: DEL_PERSON_TIPS_TYPE,
                    "left": progress,
                    data: data,
                    success: result.success
                })
            });
    }
}

//获取常用话术
export function getPersonTipsItem(data) {
    return dispatch => {

        dispatch(getAction(GET_PERSON_TIPS_ITEM, "left", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/allitems?groupId="+data.groupId;
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/allitems?userid=" + data.userid + "&groupId=" + data.groupId);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_PERSON_TIPS_ITEM, "left", true));
    }
}

export function clearPersonTipsProgress() {
    return dispatch => {
        dispatch(getAction(CLEAR_PERSONTIPS_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}

//新建常用话术
export function newPersonTips(data) {
    return dispatch => {

        dispatch(getAction(NEW_PERSON_TIPS_ITEM, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/item");

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=> {
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: NEW_PERSON_TIPS_ITEM,
                    "left": progress,
                    success: result.success,
                    result
                })
            });
    }
}

//编辑常用话术
export function editPersonTips(data) {
    return dispatch => {

        dispatch(getAction(EDIT_PERSON_TIPS_ITEM, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/item");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=> {
                let success = result.success,
                    progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: EDIT_PERSON_TIPS_ITEM,
                    "left": progress,
                    data,
                    success,
                    result
                })
            });

    }
}

//编辑常用话术分组
export function editPersonTipsRank(data) {
    return dispatch => {

        dispatch(getAction(EDIT_PERSON_TIPS_ITEM_RANK, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/batch");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=> {
                let success = result.success,
                    progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: EDIT_PERSON_TIPS_ITEM_RANK,
                    "left": progress,
                    data,
                    success,
                    result
                })
            });

    }
}

//删除常用话术
export function delPersonTips(data) {
    return dispatch => {

        dispatch(getAction(DEL_PERSON_TIPS_ITEM, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/item");
        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=> {
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: DEL_PERSON_TIPS_ITEM,
                    "left": progress,
                    data: data,
                    success: result.success
                })
            });
    }
}

//导入个人常用话术
export function importPersonCommonWord(file) {
    return dispatch => {
        dispatch(getAction(IMPORT_PERSON_TIPS, "left", LoadProgressConst.SAVING));
        let {siteId, ntoken, userId} = loginUserProxy(),
            formData = new FormData(),
            uploadUrl = Settings.querySettingUrl("/importExcel/fastResponse?siteid=", siteId, "&operatorid=" + userId + "&userid=" + userId);

        formData.append("path", "/client");
        formData.append("file", file);

        return urlLoader(uploadUrl, {
            body: formData,
            method: "post"
        }, "").then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, IMPORT_PERSON_TIPS, "left", false));
    }
}

function roleMangerCode(response) {
    LogUtil.trace("sessionLabel", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}
