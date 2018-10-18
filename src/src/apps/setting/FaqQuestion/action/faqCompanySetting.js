import {
    ADD_COMPANY_FAQGROUP,
    ADD_TEMPLATE_FAQGROUP,
    EDIT_COMPANY_FAQGROUP, 
    DEL_COMPANY_FAQGROUP, 
    GET_COMPANY_FAQGROUP_LIST,
    GET_TEMPLATES_GROUP_LIST,
    ADD_COMPANY_FAQITEM, 
    EDIT_COMPANY_FAQITEM, 
    DEL_COMPANY_FAQITEM, 
    GET_COMPANY_FAQITEM_LIST,
    GET_COMPANY_SEARCH_COMPANY_DATA,
    GET_ALL_COMPANY_FAQ_ITEM_DATA,
    IMPORT_FAQ_QUESTION,
    CLEAR_FAQ_ITEM_DATA,
    EDIT_COMPANY_FAQGROUP_RANK,
    EDIT_COMPANY_FAQITEM_RANK
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import {loginUserProxy} from '../../../../utils/MyUtil';
import Settings from '../../../../utils/Settings';

/**
 * <!-------------------------------企业常用问题组设置----------------------------->
 * */

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

/**
 * 新增常用问题组（企业）
 * */
export function addCompanyFaqGroup(data)
{
    return dispatch =>
    {
        let result = [];
        dispatch(getAction(ADD_COMPANY_FAQGROUP, "left", LoadProgressConst.SAVING, result));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        let settingUrl = Settings.querySettingUrl('/fastQuestion/',siteId);
        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, ADD_COMPANY_FAQGROUP, "left", false));
    }
}
/**
 * 新增常用问题组（用户群）
 * */
export function addTemplateFaqGroup(data)
{
    return dispatch =>
    {
        dispatch(getAction(ADD_TEMPLATE_FAQGROUP, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        let settingUrl = Settings.querySettingUrl('/fastQuestion/',siteId);
        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, ADD_TEMPLATE_FAQGROUP, "left", false));
    }
}

/**
 * 修改常用问题组（企业）
 * */
export function editCompanyFaqGroup(data)
{
    return dispatch =>
    {
        dispatch(getAction(EDIT_COMPANY_FAQGROUP, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastQuestion/",siteId);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:EDIT_COMPANY_FAQGROUP,
                    "left":progress,
                    data:data,
                    msg: result.msg,
                    success:result.success
                })
            });
    }
}

/**
 * 修改常用问题组排序
 * */
export function editCompanyFaqGroupRank(data)
{
    return dispatch =>
    {
        dispatch(getAction(EDIT_COMPANY_FAQGROUP_RANK, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/groupbatch" ;
        let settingUrl = Settings.querySettingUrl("/fastQuestion/", siteId, "/groupbatch");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:EDIT_COMPANY_FAQGROUP_RANK,
                    "left":progress,
                    data:data,
                    msg: result.msg,
                    success:result.success
                })
            });
    }
}

/**
 * 删除常用问题组（企业）
 * */
export function delCompanyFaqGroup(data, getAllItemData)
{
    return dispatch =>
    {

        dispatch(getAction(DEL_COMPANY_FAQGROUP, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastQuestion/",siteId);

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type:DEL_COMPANY_FAQGROUP,
                    "left":progress,
                    data:data,
                    success:result.success
                });

               urlLoader(Settings.querySettingUrl("/fastQuestion/question/",siteId, "/search?groupId="+getAllItemData.groupId+"&templateid="+getAllItemData.templateid+"&keywords="+getAllItemData.keywords+"&page="+getAllItemData.page+"&rp="+getAllItemData.rp), {headers: {token: ntoken}})
                    .then(roleMangerCode)
                    .then(dispatchAction.bind(null, dispatch, GET_COMPANY_SEARCH_COMPANY_DATA, "right", true));

            });
    }
}

export function getTemalatesGroup(ifFirst)
{
    return dispatch =>
    {
        let result;
        if (ifFirst)
            result = [];
        dispatch(getAction(GET_TEMPLATES_GROUP_LIST, "left", LoadProgressConst.LOAD_COMPLETE,result));
    }
}

/**
 * 获取常用问题组列表（企业）
 * */
export function getCompanyFaqGroupList(obj)
{
	return dispatch =>
	{
        let result = [];
        dispatch(getAction(GET_COMPANY_FAQGROUP_LIST, "left", LoadProgressConst.LOADING,result));
        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = Settings.querySettingUrl("/fastQuestion/",siteId, obj ? "/"+obj.templateid : "");
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_COMPANY_FAQGROUP_LIST, "left", true));
	}
}
/**
 * <!-------------------------------企业常用问题设置----------------------------->
 * */

/**
 * 新增常用问题（企业）
 * */
export function addCompanyFaqItem(data)
{
    return dispatch =>
    {

        dispatch(getAction(ADD_COMPANY_FAQITEM, "right", LoadProgressConst.SAVING));
        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastQuestion/question/",siteId);

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type : ADD_COMPANY_FAQITEM,
                    "right" : progress,
                    success : result.success,
                    result
                })
            });
    }
}

/**
 * 修改常用问题（企业）
 * */
export function editCompanyFaqItem(data)
{
    return dispatch =>
    {

        dispatch(getAction(EDIT_COMPANY_FAQITEM, "right", LoadProgressConst.SAVING));
        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastQuestion/question/",siteId);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 400 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type : EDIT_COMPANY_FAQITEM,
                    "right" : progress,
                    data : data,
                    success : result.success
                })
            });
    }
}

/**
 * 修改常用问题项排序
 * */
export function editCompanyFaqItemRank(data)
{
    return dispatch =>
    {
        dispatch(getAction(EDIT_COMPANY_FAQITEM_RANK, "right", LoadProgressConst.SAVING));
        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastQuestion/question/", siteId, "/itembatch");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type : EDIT_COMPANY_FAQITEM_RANK,
                    "right" : progress,
                    data : data,
                    success : result.success
                })
            });
    }
}

/**
 * 删除常用问题（企业）
 * */
export function delCompanyFaqItem(data, isUpdate, searchFaqItem, pageNumber, searchValue = "")
{
    return dispatch =>
    {
        dispatch(getAction(DEL_COMPANY_FAQITEM, "right", LoadProgressConst.SAVING));
        let {siteId, ntoken} = loginUserProxy(),
            templateId = data.templateid || "";
            data.siteid = siteId;

        let settingUrl = Settings.querySettingUrl("/fastQuestion/question/",siteId);
        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/item";

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken},body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=>{
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type : DEL_COMPANY_FAQITEM,
                    "right" : progress,
                    data : data,
                    success : result.success
                });

                if (isUpdate && result.success)
                {
                    if (searchFaqItem)
                    {
                        urlLoader(Settings.querySettingUrl("/fastQuestion/question/",siteId, "/search?groupId=&templateid="+templateId+"&keywords="+searchValue+"&page="+pageNumber+"&rp=10"), {headers: {token: ntoken}})
                            .then(roleMangerCode)
                            .then(dispatchAction.bind(null, dispatch, GET_COMPANY_SEARCH_COMPANY_DATA, "right", true));
                    }
                    else
                    {
                        urlLoader(Settings.querySettingUrl("/fastQuestion/question/",siteId,"/"+data.groupId+"?page="+pageNumber+"&rp=10"), {headers: {token: ntoken}})
                            .then(roleMangerCode)
                            .then(dispatchAction.bind(null, dispatch, GET_COMPANY_FAQITEM_LIST, "right", true));
                    }
                }
            });
    }
}

/*
* 清空常见问题条目列表
* */
export function clearFaqItem(data)
{
    return dispatch =>
    {

        dispatch(getAction(CLEAR_FAQ_ITEM_DATA, "right", LoadProgressConst.LOADING));

    }
}


/**
 * 获取常用问题列表（企业）
 * */
export function getCompanyFaqItemList(data)
{
    return dispatch =>
    {

        dispatch(getAction(GET_COMPANY_FAQITEM_LIST, "right", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/allitems?groupId="+data.groupId ;
        let settingUrl = Settings.querySettingUrl("/fastQuestion/question/",siteId,"/"+data.groupId+"?page="+data.page+"&rp="+data.rp);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_COMPANY_FAQITEM_LIST, "right", true));
    }
}

/**
 * 搜索常用问题（企业）
 * */
export function getCompanySearchFaqData(data)
{
    return dispatch =>
    {
        dispatch(getAction(GET_COMPANY_SEARCH_COMPANY_DATA, "right", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy(),
        settingUrl = Settings.querySettingUrl("/fastQuestion/question/",siteId, "/search?groupId="+data.groupId+"&templateid="+data.templateid+"&keywords="+data.keywords+"&page="+data.page+"&rp="+data.rp);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_COMPANY_SEARCH_COMPANY_DATA, "right", true));
    }
}

export function getAllCompanyFaqItemData(data)
{
    return dispatch =>
    {

        dispatch(getAction(GET_ALL_COMPANY_FAQ_ITEM_DATA, "right", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy(),
            settingUrl = Settings.querySettingUrl("/fastQuestion/question/",siteId, "/search?page="+data.page+"&rp="+data.rp);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_ALL_COMPANY_FAQ_ITEM_DATA, "right", true));
    }
}

//导入常见问题

export function importFaqData(file, templateid) {

    return dispatch => {

        dispatch(getAction(IMPORT_FAQ_QUESTION, "right", LoadProgressConst.SAVING));
        let {siteId, ntoken, userId} = loginUserProxy(),
            formData = new FormData(),
            uploadUrl;

            // uploadUrl = "http://192.168.30.250:8080/importExcel/fastQuestion?siteid="+siteId+"&operatorid=" + userId + (templateid ? "&templateid=" + templateid : "");
            uploadUrl = Settings.querySettingUrl("/importExcel/fastQuestion?siteid=", siteId, "&operatorid=" + userId + (templateid ? ("&templateid=" + templateid) : ""));

            formData.append("path", "/client");
            formData.append("file", file);

        return urlLoader(uploadUrl, {
                body: formData,
                method: "post"
            }, "")
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, IMPORT_FAQ_QUESTION, "right", false));
    }
}

function roleMangerCode(response)
{
    LogUtil.trace("FaqSettingCommon action", LogUtil.INFO, response);

    return Promise.resolve(response.jsonResult);
}


