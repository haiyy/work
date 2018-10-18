import {
	GET_ALL_TIPS_DATA, GET_SEARCH_TIPS, GET_TIPS_GROUP_DATA, NEW_TIPS_GROUP,
	EDIT_TIPS_GROUP, REMOVE_TIPS_GROUP, GET_TIPS,
	GET_NEW_TIPS, GET_EDITOR_TIPS, REMOVE_TIPS, IMPORT_COMMON_WORD, EDIT_TIPS_GROUP_RANK, GET_EDITOR_TIPS_RANK
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import Settings from '../../../../utils/Settings';
import { loginUserProxy } from '../../../../utils/MyUtil';

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

	dispatch(getAction(type, proType, progress, result)); //result.data

	return Promise.resolve({success, result: result})
}

function getAction(type, progressType, progress, result)
{
	return {type, result, [progressType]: progress}
}

function judgeSettingUrl(obj)
{

	let paramStr = "/group",
		{siteId} = loginUserProxy();

	if(!obj)
	{
		LogUtil.trace("CommonWord settingUrl", obj);
		return Settings.querySettingUrl("/fastResponse/", siteId, paramStr);
	}

	let {templateid, userid} = obj;

	if(templateid)
	{
		paramStr += "?templateid=" + templateid;
	}
	else if(userid)
	{
		paramStr = "?userid=" + userid;
	}

	return Settings.querySettingUrl("/fastResponse/", siteId, paramStr);
}

//获取话术分组列表
export function getTipsGroup(obj)
{
	return dispatch =>
	{
		dispatch(getAction(GET_TIPS_GROUP_DATA, "left", LoadProgressConst.LOADING));

		let {ntoken} = loginUserProxy();

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+ siteId +"/group" ;
		let settingUrl = judgeSettingUrl(obj);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_TIPS_GROUP_DATA, "left", true));
	}
}

//新建话术分组
export function newTipsGroup(data)
{
	return dispatch =>
	{
		dispatch(getAction(NEW_TIPS_GROUP, "left", LoadProgressConst.SAVING));

		let {siteId: siteid, ntoken} = loginUserProxy(),
			obj = {siteid, groupName: data.groupName};

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
		let settingUrl = judgeSettingUrl(data);

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(obj)})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, NEW_TIPS_GROUP, "left", false));
	}
}

//编辑话术分组
export function editTipsGroup(data)
{
	return dispatch =>
	{
		dispatch(getAction(EDIT_TIPS_GROUP, "left", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy();
		data.siteid = siteId;

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
		let settingUrl = judgeSettingUrl(data);

		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{//错的
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

			dispatch({
				type: EDIT_TIPS_GROUP,
				"left": progress,
				data: data,
				success: result.success
			})
		});
	}
}

//批量修改常用话术分组排序
export function editTipsGroupRank(data)
{
    return dispatch =>
    {
        dispatch(getAction(EDIT_TIPS_GROUP_RANK, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl =  Settings.querySettingUrl("/fastResponse/", siteId, "/groupbatch");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result.success,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch({
                    type: EDIT_TIPS_GROUP_RANK,
                    "left": progress,
                    data: data,
                    success
                })
            });
    }
}


//删除话术分组
export function removeTipsGroup(data) {
    return dispatch => {
        dispatch(getAction(REMOVE_TIPS_GROUP, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/group" ;
        let settingUrl = judgeSettingUrl(data);

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result=> {
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: REMOVE_TIPS_GROUP,
                    "left": progress,
                    data: data,
                    success: result.success
                });
                urlLoader(Settings.querySettingUrl("/fastResponse/", siteId, "/paging?page=1&rp=10"), {headers: {token: ntoken}})
                    .then(roleMangerCode)
                    .then(dispatchAction.bind(null, dispatch, GET_ALL_TIPS_DATA, "right", true));
            });
    }
}

//获取企业全部话术列表
export function getAllTipsData(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_ALL_TIPS_DATA, "right", LoadProgressConst.LOADING));

		let {siteId, ntoken} = loginUserProxy();

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+'/paging?page='+data.page+"&rp="+data.rp;
		let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/paging?page=" + data.page + "&rp=" + data.rp);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_ALL_TIPS_DATA, "right", true));
	}
}

//模糊搜索全部常用话术
export function getSearchTipsData(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_SEARCH_TIPS, "right", LoadProgressConst.LOADING));

		let {siteId, ntoken} = loginUserProxy();

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/searchitems?keyWord="+data ;
		let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/searchitems?keyWord=" + data.keyWord + "&page=" + data.page + "&rp=" + data.rp);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_SEARCH_TIPS, "right", true));
	}
}

//获取常用话术
export function getTipsData(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_TIPS, "right", LoadProgressConst.LOADING));

		let {siteId, ntoken} = loginUserProxy();

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/allitems?groupId="+data.groupId;
		let settingUrl;
		if(data.templateid)
		{
			settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/allitems?templateid=" + data.templateid + "&groupId=" + data.groupId);
		}
		else if(data.userid)
		{
			settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/allitems?userid=" + data.userid + "&groupId=" + data.groupId);
		}
		else
		{
			settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/allitems?groupId=" + data.groupId);
		}

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_TIPS, "right", true));
	}
}

//新建常用话术
export function newTips(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_NEW_TIPS, "right", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy();

		data.siteid = siteId;

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
		let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/item");

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: GET_NEW_TIPS,
				"right": progress,
				success: result.success,
				result
			})
		});
	}
}

//编辑常用话术
export function editorTips(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_EDITOR_TIPS, "right", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy();

		data.siteid = siteId;

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
		let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/item");

		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: GET_EDITOR_TIPS,
				"right": progress,
				data: data,
				success: result.success
			})
		});
	}
}

//修改常用话术排序
export function editorTipsRank(data)
{
    return dispatch =>
    {
        dispatch(getAction(GET_EDITOR_TIPS_RANK, "right", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/batch");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result.success,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: GET_EDITOR_TIPS_RANK,
                    "right": progress,
                    data: data,
                    success
                })
            });
    }
}

//删除常用话术
export function removeTips(data, isUpdate, currentPage) {
    return dispatch => {
        dispatch(getAction(REMOVE_TIPS, "right", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        let settingUrl = Settings.querySettingUrl("/fastResponse/", siteId, "/item");
        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(roleMangerCode).then(result=> {
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: REMOVE_TIPS,
                    "right": progress,
                    data: data,
                    success: result.success
                });
                if (isUpdate && result.success)
                {
                    urlLoader(Settings.querySettingUrl("/fastResponse/", siteId, "/paging?page=" + currentPage + "&rp=" + 10), {headers: {token: ntoken}})
                        .then(roleMangerCode)
                        .then(dispatchAction.bind(null, dispatch, GET_ALL_TIPS_DATA, "right", true));
                }

            });
    }
}

//导入常用话术
export function importCommonWord(file)
{
	return dispatch =>
	{
		dispatch(getAction(IMPORT_COMMON_WORD, "left", LoadProgressConst.SAVING));
		let {siteId, ntoken, userId} = loginUserProxy(),
			formData = new FormData(),
			uploadUrl = Settings.querySettingUrl("/importExcel/fastResponse?siteid=", siteId, "&operatorid=" + userId);

		formData.append("path", "/client");
		formData.append("file", file);

		return urlLoader(uploadUrl, {
			body: formData,
			method: "post"
		}, "")
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, IMPORT_COMMON_WORD, "left", false));
	}
}

function roleMangerCode(response)
{
	LogUtil.trace("CommonWord action", LogUtil.INFO, response);

	return Promise.resolve(response.jsonResult);
}
