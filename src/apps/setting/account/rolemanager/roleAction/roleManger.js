import {
	ROLE_MANAGER, GET_ROLE_LIMIT_DATA, SET_NEW_ROLE, SET_EDITOR_ROLE, DELETE_ROLE, SET_EDITOR_ROLE_STATUS
} from '../../../../../model/vo/actionTypes';
import Settings from '../../../../../utils/Settings';
import { urlLoader } from "../../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../../utils/MyUtil";
import LoadProgressConst from "../../../../../model/vo/LoadProgressConst";

/**
 * 获取账户角色列表
 * */
export function getRoleManager(data)
{
    return dispatch => {
        dispatch(getAction(ROLE_MANAGER, "left", LoadProgressConst.LOADING));
        let {ntoken, siteId} = loginUserProxy();

         let settingUrl = Settings.queryPathSettingUrl("/enterprise/"+siteId+"/role?page="+data.page+"&size="+data.rp);
        //let settingUrl = "http://192.168.31.213:8080/enterprise/"+siteId+"/role?page="+data.page+"&size="+data.rp;

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, ROLE_MANAGER, "left", true));
        };

}

/**
 * 获取角色功能与字段权限展示
 * */
export function getRoleMangerLimitData(roleId="")
{
    return dispatch => {
        dispatch(getAction(GET_ROLE_LIMIT_DATA, "left", LoadProgressConst.LOADING));
        let {ntoken, siteId} = loginUserProxy(),
            settingUrl;
        if (roleId)
        {
            //settingUrl = ("http://192.168.31.213:8080/usercenter/enterprise/productFeature?siteid="+siteId+"&roleid="+roleId);
             settingUrl = Settings.queryPathSettingUrl("/usercenter/enterprise/productFeature?siteid="+siteId+"&roleid="+roleId+"&opentype=0");
        }else
        {
            //settingUrl = "http://192.168.31.213:8080/usercenter/enterprise/productFeature?siteid="+siteId+"&roleid="+roleId;
             settingUrl = Settings.queryPathSettingUrl("/usercenter/enterprise/productFeature?siteid="+siteId+"&roleid="+roleId+"&opentype=0");
        }

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_ROLE_LIMIT_DATA, "left", true));
    };
}

/*清除角色错误progress*/
export function clearRoleErrorProgress()
{
    return dispatch =>
    {
        dispatch(getAction(SET_NEW_ROLE, "left", LoadProgressConst.SAVING_SUCCESS));
    }
}

/**
 * 创建账户角色
 * */
export function sendNewRoleManger(data) {

    return dispatch =>
    {
        dispatch(getAction(SET_NEW_ROLE, "left", LoadProgressConst.SAVING));

        let {ntoken, siteId} = loginUserProxy();

        data.siteid = siteId;

         let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/role');

        //let settingUrl = 'http://192.168.31.213:8080/enterprise/' + siteId + '/role';

        return urlLoader(settingUrl, {method: "post", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result && result.code == 200,
                    progress;

                if(success)
                {
                    progress = LoadProgressConst.SAVING_SUCCESS;
                }else if (result && result.code == 400 || result && result.code == 401)
                {
                    progress = LoadProgressConst.DUPLICATE;
                }else if (result && result.code == 403)
                {
                    progress = LoadProgressConst.ROLE_LIMIT_EMPTY;
                }else
                {
                    progress = LoadProgressConst.SAVING_FAILED;
                }

                dispatch({
                    type: SET_NEW_ROLE,
                    "left": progress,
                    data: result && result.data,
                    newGroupInfo: data,
                    success
                });
                return Promise.resolve(result)
            });
    }
}

/**
 * 编辑账户角色
 * */
export function sendEditorRoleManger(data) {

    return dispatch =>
    {
        dispatch(getAction(SET_EDITOR_ROLE, "left", LoadProgressConst.SAVING));

        let {ntoken, siteId} = loginUserProxy();

        data.siteid = siteId;

         let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/role/' + data.roleid);
        //let settingUrl = 'http://192.168.31.213:8080/enterprise/' + siteId + '/role/'+ data.roleid;

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result && result.code == 200,
                    progress;

                if(success)
                {
                    progress = LoadProgressConst.SAVING_SUCCESS;
                }else if (result && result.code == 400 || result && result.code == 401)
                {
                    progress = LoadProgressConst.DUPLICATE;
                }else if (result && result.code == 403)
                {
                    progress = LoadProgressConst.ROLE_LIMIT_EMPTY;
                }else
                {
                    progress = LoadProgressConst.SAVING_FAILED;
                }

                dispatch({
                    type: SET_EDITOR_ROLE,
                    "left": progress,
                    data: result && result.data,
                    newGroupInfo: data,
                    success
                });

                return Promise.resolve(result)
            });
    }
}

/**
 * 编辑账户角色开启状态
 * */
export function sendEditorRoleMangerStatus(data) {

    return dispatch =>
    {
        dispatch(getAction(SET_EDITOR_ROLE_STATUS, "left", LoadProgressConst.SAVING));

        let {ntoken, siteId} = loginUserProxy(),
            obj = {status: data.status};

        data.siteid = siteId;

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/switchRole/' + data.roleid);
         //let settingUrl = 'http://192.168.31.213:8080/enterprise/' + siteId + '/switchRole/'+ data.roleid;

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(obj)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: SET_EDITOR_ROLE_STATUS,
                    "left": progress,
                    data,
                    success
                })
            });
    }
}

/**
 * 删除账户角色
 * */
export function deleteRoleManger(roleid, isUpdate, currentPage) {

    return dispatch =>
    {
        dispatch(getAction(DELETE_ROLE, "left", LoadProgressConst.SAVING));

        let {ntoken, siteId: siteid} = loginUserProxy(),
            data = {siteid, roleid};

         let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/role/' + roleid);
        //let settingUrl = 'http://192.168.31.213:8080/enterprise/' + siteid + '/role/' + roleid;
        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: DELETE_ROLE,
                    "left": progress,
                    data: result && result.data,
                    newGroupInfo: data,
                    success
                });
                if (success && isUpdate)
                {
                    urlLoader(Settings.queryPathSettingUrl("/enterprise/"+siteid+"/role?page="+currentPage+"&size=10"), {headers: {token: ntoken}})
                        .then(roleMangerCode)
                        .then(dispatchAction.bind(null, dispatch, ROLE_MANAGER, "left", true));
                }

            });
    }
}

function roleMangerCode(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}
function dispatchAction(dispatch, type, proType, load, result)
{
    let progress = 2,
        success = result && result.code == 200;

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
