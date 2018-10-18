import {
	GET_SKILLTAG, NEW_SKILLTAG, DEL_SKILLTAG, GET_LISTINFO, EDITOR_SKILLTAG
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import Settings from '../../../../utils/Settings';
import { loginUserProxy } from "../../../../utils/MyUtil";

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

//技能标签获取数据
export function getSkillTagList(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_SKILLTAG, "left", LoadProgressConst.LOADING));
		
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + "/tag/" + data.page + "/" + data.rp);
		if(data.range)
		{
			settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + "/tag/" + data.range + "/" + data.page + "/" + data.rp);
		}
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_SKILLTAG, "left", true));
	}
}

//技能标签下客服列表获取数据
export function getSkillTagUserList(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_LISTINFO, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + "/tag/" + data.tagid);
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_LISTINFO, "left", true));
	}
}

//新建技能标签
export function newSkillTag(data)
{
	return dispatch =>
	{
		dispatch(getAction(NEW_SKILLTAG, "left", LoadProgressConst.SAVING));
		
		let {siteId, ntoken} = loginUserProxy(),
			obj = {tagname: data};
		
		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/tag');
		
		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(obj)})
		.then(roleMangerCode)
		.then(result =>
		{
			result.tagname = data;
			let progress = result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : result.code == 400 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: NEW_SKILLTAG,
				"left": progress,
				result: result,
				success: result.success
			})
		});
	}
}

//删除技能标签
export function removeSkillTag(id, loadPageNum = -1)
{
	return dispatch =>
	{
		dispatch(getAction(DEL_SKILLTAG, "left", LoadProgressConst.SAVING));
		
		let {siteId, ntoken} = loginUserProxy(),
			obj = {tagid: id};
		
		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/tag/' + id);
		return urlLoader(settingUrl, {
			method: "DELETE", headers: {token: ntoken, "Content-Type": "application/json"}, body: JSON.stringify(obj)
		})
		.then(roleMangerCode)
		.then(result =>
		{
			if(loadPageNum < 0)
			{
				let success = result.code == 200,
					progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
				
				dispatch({
					type: DEL_SKILLTAG,
					"left": progress,
					result: id,
					success
				});
			}
			
			return Promise.resolve(loadPageNum);
		})
		.then(pageNum =>
		{
			if(pageNum > -1)
			{
				let data = {
					"page": pageNum,
					"rp": 10
				};
				
				dispatch(getAction(GET_SKILLTAG, "left", LoadProgressConst.LOADING));
				
				let {siteId, ntoken} = loginUserProxy(),
					settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + "/tag/" + data.page + "/" + data.rp);
				
				return urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(dispatchAction.bind(null, dispatch, GET_SKILLTAG, "left", true));
			}
		});
	}
}

//编辑技能标签
export function editSkillTag(data)
{
	return dispatch =>
	{
		dispatch(getAction(EDITOR_SKILLTAG, "left", LoadProgressConst.SAVING));
		
		let {siteId, ntoken} = loginUserProxy();
		
		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/tag/' + data.tagid);
		
		return urlLoader(settingUrl, {
			method: "PUT", headers: {token: ntoken, "Content-Type": "application/json"}, body: JSON.stringify(data)
		})
		.then(roleMangerCode)
		.then(result =>
		{
			let progress = result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : result.code == 400 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: EDITOR_SKILLTAG,
				"left": progress,
				result: data,
				success: result.code == 200
				
			})
		});
	}
}

function roleMangerCode(response)
{
	LogUtil.trace("skilltag action", LogUtil.INFO, response);
	
	return Promise.resolve(response.jsonResult);
}

