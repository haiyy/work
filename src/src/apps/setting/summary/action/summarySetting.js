import {
	GET_SUMMARY_ALL,
    GET_SUMMARY_ALL_ITEMS,
	ADD_SUMMARY_TYPE,
	EDIT_SUMMARY_TYPE,
	REMOVE_SUMMARY_TYPE,
	GET_SUMMARY_LEAF,
	ADD_SUMMARY_LEAF,
	EDIT_SUMMARY_LEAF,
	REMOVE_SUMMARY_LEAF,
	GET_SUMMARY_LEAF_SEARCH,
	GET_CHATSUMMARY_ALL,
    EDIT_SUMMARY_TYPE_RANK,
	GET_COMMONSUMMARY,
    IS_SET_COMMON_OK,
    CLEAR_SET_COMMON_MSG,
    EDIT_SUMMARY_LEAF_RANK,
    IMPORT_SUMMARY
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import {loginUserProxy} from '../../../../utils/MyUtil';
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

//获取常用咨询总结（工具栏中使用）
export function getCommonSummary() {
	return dispatch =>
	{
		dispatch(getAction(GET_COMMONSUMMARY, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/often?count=10");

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_COMMONSUMMARY, "left", true));
	};
}

//获取所有咨询总结（聊窗内使用）
export function getChatSummaryAll() {
	return dispatch =>
	{

		dispatch(getAction(GET_CHATSUMMARY_ALL, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/entire");

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_CHATSUMMARY_ALL, "left", true));
	};
}

//获取咨询总结类型
export function getSummaryAll()
{
	return dispatch =>
	{
		dispatch(getAction(GET_SUMMARY_ALL, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "");

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_SUMMARY_ALL, "left", true));
	};
}


//新建咨询总结类型
export function addSummaryType(data)
{

	return dispatch =>
	{

		dispatch(getAction(ADD_SUMMARY_TYPE, "left", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy();

		data.siteid = siteId;
		data.scope = "summary";

		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "");

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, ADD_SUMMARY_TYPE, "left", false));
	};
}

//编辑咨询总结类型

export function editSummaryType(data)
{
	return dispatch =>
	{
		dispatch(getAction(EDIT_SUMMARY_TYPE, "left", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy();
		data.siteid = siteId;
		data.scope = "summary";
		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/group" ;
		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "");
		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
            result.data = data;
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: EDIT_SUMMARY_TYPE,
				"left": progress,
                result,
				success: result.success
			})
		});
	};
}

//编辑咨询总结类型排序

export function editSummaryTypeRank(rangeGroup)
{
    return dispatch =>
    {
        dispatch(getAction(EDIT_SUMMARY_TYPE_RANK, "left", LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy();
        rangeGroup.map(item=>{
            item.siteid = siteId;
            item.scope = "summary";
        });
        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/group" ;
        let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/batch");
        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(rangeGroup)})
            .then(roleMangerCode)
            .then(result =>
            {
                let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch({
                    type: EDIT_SUMMARY_TYPE_RANK,
                    "left": progress,
                    data: rangeGroup,
                    success: result.success
                })
            });
    };
}


//删除咨询总结类型

export function removeSummaryType(item, currentListPage)
{
	return dispatch =>
	{
		dispatch(getAction(REMOVE_SUMMARY_TYPE, "left", LoadProgressConst.SAVING));

		let {siteId: siteid, ntoken} = loginUserProxy(),
			data = {
				siteid,
				summaryid: item.summaryid
			},settingUrl = Settings.querySettingUrl("/summary/", siteid, "");
		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: REMOVE_SUMMARY_TYPE,
				"left": progress,
				data: item,
				success: result.success
			});

            if (result.success)
            {
                urlLoader(Settings.querySettingUrl("/summary/", siteid, "/laststage?page=" + currentListPage +"&rp=10"), {headers: {token: ntoken}})
                    .then(roleMangerCode)
                    .then(result =>
                    {
                        let success = result.success,
                            progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
                        dispatch({
                            type: GET_SUMMARY_LEAF,
                            "right": progress,
                            data: success && result.data.summaryconfig,
                            count: success && result.data.count,
                            success
                        })
                    })
            }
		});
	};
}

//获取咨询总结类型下条目

export function getSummaryLeaf(data)
{
	return dispatch =>
	{

		dispatch(getAction(GET_SUMMARY_LEAF, "right", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/group" ;
		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/node?summaryid=" + data);
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
            .then(result =>
            {
                let success = result.success,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
                dispatch({
                    type: GET_SUMMARY_LEAF,
                    "right": progress,
                    data: success && result.data,
                    count: success && result.data.length,
                    success
                })
            })
	};
}

//获取所有咨询总结项
export function getSummaryAllItems(data)
{
    return dispatch =>
    {
        dispatch(getAction(GET_SUMMARY_LEAF, "right", LoadProgressConst.LOADING));

        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/laststage?page=" + data.page + "&rp=" + data.rp);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(result =>
            {
                let success = result.success,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
                dispatch({
                    type: GET_SUMMARY_LEAF,
                    "right": progress,
                    data: success && result.data.summaryconfig,
                    count: success && result.data.count,
                    success
                })
            })
    };
}


//获取搜索咨询类型条目

export function getSummaryLeafSearchData(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_SUMMARY_LEAF_SEARCH, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();

        data.siteid=siteId;
		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/group";
		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/search?keywords=" + data.keywords);
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_SUMMARY_LEAF_SEARCH, "left", true));
	};
}

//新建咨询类型条目开启是否常用接口查询是否已设置超过十个 是则不可设置 否则可以

export function isSetCommonOk()
{
    return dispatch =>
    {
        dispatch(getAction(IS_SET_COMMON_OK, "right", LoadProgressConst.LOADING));
        let {siteId, ntoken} = loginUserProxy();

        // let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/group";
        let settingUrl = Settings.querySettingUrl("/summary/", siteId, "/iscommon");
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, IS_SET_COMMON_OK, "right", true));
    };
}

export function clearSetCommonMsg()
{
    return dispatch =>
    {
        dispatch(getAction(CLEAR_SET_COMMON_MSG));
    };
}


//新建咨询总结条目
export function addSummaryLeaf(data)
{

	return dispatch =>
	{

		dispatch(getAction(ADD_SUMMARY_LEAF, "right", LoadProgressConst.SAVING));
		let {siteId: siteid, ntoken} = loginUserProxy();
		data.siteid = siteid;
		data.scope = "summary";

		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteid+"/item";
		let settingUrl = Settings.querySettingUrl("/summary/", siteid, "");

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: ADD_SUMMARY_LEAF,
				"right": progress,
				success: result.success,
				result
			})
		});
	};
}

//修改咨询总结条目
export function editSummaryLeaf(data)
{
	return dispatch =>
	{

		dispatch(getAction(EDIT_SUMMARY_LEAF, "right", LoadProgressConst.SAVING));
		let {siteId, ntoken} = loginUserProxy();
		data.siteid = siteId;
		data.scope = "summary";
		// let settingUrl = "http://192.168.30.250:8080"+"/fastResponse/"+siteId+"/item";
		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "");

		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: EDIT_SUMMARY_LEAF,
				"right": progress,
				data: data,
                msg: result.msg || "",
				success: result.success
			})
		});
	};
}

//删除咨询总结条目
export function removeSummaryLeaf(data, isUpdate, currentPage)
{

	return dispatch =>
	{
		dispatch(getAction(REMOVE_SUMMARY_LEAF, "right", LoadProgressConst.SAVING));
		let {siteId, ntoken} = loginUserProxy();
		data.siteid = siteId;

		let settingUrl = Settings.querySettingUrl("/summary/", siteId, "");

		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: REMOVE_SUMMARY_LEAF,
				"right": progress,
				data: data,
				success: result.success
			});
            if (isUpdate && result.success)
            {
                urlLoader(Settings.querySettingUrl("/summary/", siteId, "/laststage?page=" + currentPage + "&rp=10"), {headers: {token: ntoken}})
                    .then(roleMangerCode)
                    .then(result =>
                    {
                        let success = result.success,
                            progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
                        dispatch({
                            type: GET_SUMMARY_LEAF,
                            "right": progress,
                            data: success && result.data.summaryconfig,
                            count: success && result.data.count,
                            success
                        })
                    })
            }
		});
	};
}

//导入咨询总结
export function importSummary(file)
{
    return dispatch =>
    {
        dispatch(getAction(IMPORT_SUMMARY, "left", LoadProgressConst.SAVING));
        let {siteId, ntoken, userId} = loginUserProxy(),
            formData = new FormData(),
            uploadUrl = Settings.querySettingUrl("/importExcel/summary?siteid=", siteId, "&operatorid=" + userId);

        formData.append("path", "/client");
        formData.append("file", file);

        return urlLoader(uploadUrl, {
            body: formData,
            method: "post"
        }, "")
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, IMPORT_SUMMARY, "left", false));
    }
}

function roleMangerCode(response)
{
	LogUtil.trace("sessionLabel", LogUtil.INFO, response);

	return Promise.resolve(response.jsonResult);
}
