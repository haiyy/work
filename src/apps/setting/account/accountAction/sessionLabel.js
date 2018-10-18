import {
	GET_ACCOUNT, GET_ACCOUNT_TABLEDATE, ADD_GROUP,
	EDITOR_GROUP, REMOVE_GROUP, ACCOUNT_PROGRESS, GET_ROLE_LIST, GET_USER_TYPE, GET_ROBOT_URL,
	GET_USER_SKILL_TAG,
	GET_EDIT_DATA, REMOVE_ACCOUNT_LIST, SEND_NEW_ACCOUNT, EDITOR_ACCOUNT_LIST, EDITOR_PASSWORD,
	EDITOR_PASSWORD_MSG_CLEAR, GET_ACCOUNT_SEARCH_DATA, SEND_MIGRATE_ACCOUNTS, REMOVE_ACCOUNTS, EDITOR_GROUP_RANK
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import Settings from '../../../../utils/Settings';
import { loginUserProxy } from "../../../../utils/MyUtil";

//获取行政组数据
export function getAccountGroup()
{
	return dispatch => {
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.LOADING));
		
		let {siteId: siteid, ntoken} = loginUserProxy();
		
		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/group');
		
		return urlLoader(settingUrl, {headers: {token: ntoken}, credentials: 'include'})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_ACCOUNT, "left", true));
	}
}

export function getAccountGroupList()
{
	return dispatch => {
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.LOADING));
		
		let {siteId: siteid, ntoken} = loginUserProxy();
		
		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/group');
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_ACCOUNT, "left", true));
	}
}

//点击左侧账户获取对应账户列表数据
export function getlListData(data = {page: 1, size: 10})
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			groupidParam = data && data.groupid ? data.groupid + "/" : "",
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/user/' + groupidParam + data.page + "/" + data.size);
		
		dispatch(getUserListAction(GET_ACCOUNT_TABLEDATE, "right", LoadProgressConst.LOADING));
		
		urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(result => {
			let {code, message: count, data} = result,
				success = code === 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			
			dispatch({
				type: GET_ACCOUNT_TABLEDATE,
				"right": progress,
				data, count, success
			})
		});
	}
}

//清楚添加错误progress

export function clearErrorNewGroupProgress()
{
	return dispatch => {
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
	}
}

//添加行政组
export function addGroup(data)
{
	return dispatch => {
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.SAVING));
		
		let {ntoken, siteId} = loginUserProxy();
		
		data.siteid = siteId;
		
		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/group');
		
		return urlLoader(settingUrl, {method: "post", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result => {
			let success = result && result.code == 200,
				progress;
			if(result.code === 200)
			{
				progress = LoadProgressConst.SAVING_SUCCESS;
			}
			else if(result.code === 400)
			{
				progress = LoadProgressConst.DUPLICATE;
			}
			else if(result.code === 401)
			{
				progress = LoadProgressConst.LEVEL_EXCEED;
			}
			else if(result.code === 406)
			{
				progress = LoadProgressConst.ACCOUNT_EXCEED;
			}
			else
			{
				progress = LoadProgressConst.SAVING_FAILED;
			}
			
			dispatch({
				type: ADD_GROUP,
				"left": progress,
				data: result && result.data,
				newGroupInfo: data,
				success
			});
			if(success)
			{
				let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/group');
				
				return urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(dispatchAction.bind(null, dispatch, GET_ACCOUNT, "left", true));
			}
		});
	}
}

//编辑行政组
export function editorGroup(data, oldParentId)
{
	return dispatch => {
		let {siteId: siteid, ntoken} = loginUserProxy();
		
		let settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteid + '/group/' + data.groupid);
		
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify({...data, siteid})})
		.then(roleMangerCode)
		.then(result => {
			data.oldParentId = oldParentId;
			let progress;
			
			if(result.code === 200)
			{
				progress = LoadProgressConst.SAVING_SUCCESS;
			}
			else if(result.code === 400)
			{
				progress = LoadProgressConst.DUPLICATE;
			}
			else if(result.code === 401)
			{
				progress = LoadProgressConst.LEVEL_EXCEED;
			}
			else if(result.code === 406)
			{
				progress = LoadProgressConst.ACCOUNT_EXCEED;
			}
			else
			{
				progress = LoadProgressConst.SAVING_FAILED;
			}
			
			if(result.code == 200)
			{
				let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/group');
				
				return urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(dispatchAction.bind(null, dispatch, GET_ACCOUNT, "left", true));
			}
			dispatch({
				type: EDITOR_GROUP,
				"left": progress,
				data,
				success: result.code == 200
			})
		});
	}
}

//编辑行政组排序
export function editorGroupRank(data)
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy();
		
		let settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + '/moveGroup');
		
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result => {
			let success = result.code == 200,
				progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			
			dispatch({
				type: EDITOR_GROUP_RANK,
				"left": progress,
				data,
				success
			});
			
			if(success)
			{
				let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/group');
				
				return urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(dispatchAction.bind(null, dispatch, GET_ACCOUNT, "left", true));
			}
		});
	}
}

//删除行政组
export function removeGroup(groupid)
{
	return dispatch => {
		let {siteId: siteid, ntoken} = loginUserProxy(),
			body = JSON.stringify({groupid, siteid});
		
		dispatch(getAction(ACCOUNT_PROGRESS, "left", LoadProgressConst.SAVING));
		
		let settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteid + "/group/" + groupid);
		
		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body})
		.then(roleMangerCode)
		.then(result => {
			
			let success = result.code == 200,
				progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 405 ? LoadProgressConst.UNDELETED : LoadProgressConst.SAVING_FAILED;
			dispatch({
				type: REMOVE_GROUP,
				"left": progress,
				data: groupid,
				success
			});
			
			if(success)
			{
				let {siteId, ntoken} = loginUserProxy(),
					settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/user/1/10');
				
				dispatch(getUserListAction(GET_ACCOUNT_TABLEDATE, "right", LoadProgressConst.LOADING));
				
				urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(result => {
					let {code, message: count, data} = result,
						success = code === 200,
						progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
					
					dispatch({
						type: GET_ACCOUNT_TABLEDATE,
						"right": progress,
						data, count, success
					})
				});
			}
		});
	}
}

/**
 * 获取新建账号角色信息
 * */
export function getNewUserInfo(siteid)
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl;
		if(!siteid)
			siteid = siteId;
		
		settingUrl = Settings.queryPathSettingUrl('/enterprise/role?siteid=' + siteid);
		
		// http://192.168.91.151:8080/enterprise/"+siteId+"/role?page="+data.page+"&size="+data.rp
		// settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/role?page='+data.page+"&size="+data.rp)
		dispatch(getAction(GET_ROLE_LIST, "right", LoadProgressConst.LOADING));
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_ROLE_LIST, "right", true));
	}
}

/**
 * 获取账号性质信息
 * */
export function getUserType()
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/usertype');
		
		dispatch(getAction(GET_USER_TYPE, "right", LoadProgressConst.LOADING));
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_USER_TYPE, "right", true));
	}
}

/**
 * 获取账号技能标签信息
 * */
export function getUserSkillTag()
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/tag');
		
		dispatch(getAction(GET_USER_SKILL_TAG, "right", LoadProgressConst.LOADING));
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_USER_SKILL_TAG, "right", true));
	}
}

/**
 * 获取编辑帐号信息 editorUser
 * */
export function getUserInfo(userid)
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/user/' + userid);
		
		dispatch(getAction(GET_EDIT_DATA, "right", LoadProgressConst.LOADING));
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_EDIT_DATA, "right", true));
	}
}

/**
 * 提交创建账户
 * */
export function createUser(data)
{
	return dispatch => {
		let {siteId: siteid, userId: userid, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/user');
		
		dispatch(getAction(SEND_NEW_ACCOUNT, "right", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {
			method: "post", headers: {token: ntoken}, body: JSON.stringify({siteid, ...data})
		})
		.then(roleMangerCode)
		.then((result) => {
			let progress, accountData = null;
			
			if(result)
			{
				switch(result.code)
				{
					case 200:
						progress = LoadProgressConst.SAVING_SUCCESS;
						break;
					
					case 400:
						progress = LoadProgressConst.DUPLICATE;
						break;
					
					case 401:
						progress = LoadProgressConst.DUPLICATE_NICKNAME;
						break;
					
					case 406:
						progress = LoadProgressConst.ACCOUNT_EXCEED;
						break;
					
					case 500:
						progress = LoadProgressConst.SAVING_FAILED;
						break;
					
					default:
						progress = LoadProgressConst.SAVING_FAILED;
						break;
				}
			}
			
			if(result.data)
				accountData = {userid: result.data, ...data};
			
			dispatch(getAction(SEND_NEW_ACCOUNT, "right", progress, accountData));
		});
	}
}

/**
 * 提交批量迁移账号
 * */
export function migrateAccounts(data, isUpdate, currentPage, currentGroupId)
{
	return dispatch => {
		dispatch(getAction(SEND_MIGRATE_ACCOUNTS, "right", LoadProgressConst.SAVING));
		
		let {siteId: siteid, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/batchMove/');
		
		return urlLoader(settingUrl, {
			method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)
		})
		.then(roleMangerCode)
		.then((result) => {
			let success = result.code === 200,
				progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			
			dispatch({
				type: SEND_MIGRATE_ACCOUNTS,
				"right": progress,
				success,
				result: data
			});
			
			if(isUpdate && success)
			{
				let groupidParam = currentGroupId ? currentGroupId + "/" : "",
					settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/user/' + groupidParam + currentPage + "/10");
				
				dispatch(getUserListAction(GET_ACCOUNT_TABLEDATE, "right", LoadProgressConst.LOADING));
				
				urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(result => {
					let {code, message: count, data} = result,
						success = code === 200,
						progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
					
					dispatch({
						type: GET_ACCOUNT_TABLEDATE,
						"right": progress,
						data, count, success
					})
				});
			}
		});
	}
}

/**
 * 提交编辑账户
 * @param data
 */
export function editUser(data)
{
	return dispatch => {
		let {siteId: siteid, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/user/' + data.userid);
		
		dispatch(getAction(EDITOR_ACCOUNT_LIST, "right", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {method: "put", headers: {token: ntoken}, body: JSON.stringify({siteid, ...data})})
		.then(roleMangerCode)
		.then((result) => {
			
			let success = result && result.code == 200,
				progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			data.success = success;
			dispatch(getAction(EDITOR_ACCOUNT_LIST, "right", progress, data));
		});
	}
}

/**
 * 提交编辑账户密码
 * @param data
 */
export function editPassWord(data)
{
	return dispatch => {
		let {siteId: siteid, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/modifyPassword/' + data.userid);
		
		dispatch(getAction(EDITOR_PASSWORD, "password", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {
			method: "POST", headers: {token: ntoken}, body: JSON.stringify({siteid, ...data})
		})
		.then(roleMangerCode)
		.then((result) => {
			let progress = result && result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : result && result.code == 405 ? LoadProgressConst.ERROR_PASSWORD : LoadProgressConst.SAVING_FAILED;
			
			dispatch(getAction(EDITOR_PASSWORD, "password", progress, result));
		});
	}
}

/**
 * 清除密碼錯誤信息
 *
 */
export function clearPasswordErrorMsg()
{
	return dispatch => {
		dispatch(getAction(EDITOR_PASSWORD_MSG_CLEAR, "password", LoadProgressConst.LOAD_COMPLETE));
	}
}

//清楚删除账户错误progress

export function clearDeleteProgress()
{
	return dispatch => {
		dispatch(getAction(REMOVE_ACCOUNT_LIST, "right", LoadProgressConst.LOAD_COMPLETE));
	}
}

//删除账户
export function delAccountList(userid, isUpdate, currentPage, currentGroupId)
{
	return dispatch => {
		let {siteId: siteid, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/user/' + userid);
		
		dispatch(getAction(REMOVE_ACCOUNT_LIST, "right", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {
			method: "DELETE", headers: {token: ntoken}, body: JSON.stringify({siteid, userid})
		})
		.then(roleMangerCode)
		.then((result) => {
			let progress = result && result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : result && result.code == 405 ? LoadProgressConst.UNDELETED : LoadProgressConst.SAVING_FAILED;
			result.success = result && result.code == 200;
			result.userid = userid;
			dispatch(getAction(REMOVE_ACCOUNT_LIST, "right", progress, result));
			
			if(isUpdate && result.success)
			{
				let groupidParam = currentGroupId ? currentGroupId + "/" : "",
					settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/user/' + groupidParam + currentPage + "/10");
				
				dispatch(getUserListAction(GET_ACCOUNT_TABLEDATE, "right", LoadProgressConst.LOADING));
				
				urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(result => {
					let {code, message: count, data} = result,
						success = code === 200,
						progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
					
					dispatch({
						type: GET_ACCOUNT_TABLEDATE,
						"right": progress,
						data, count, success
					})
				});
			}
		});
	}
}

//批量删除账户
export function delAccounts(userids, isUpdate, currentPage, currentGroupId)
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/batchDelete');
		
		userids.siteid = siteId;
		dispatch(getAction(REMOVE_ACCOUNTS, "right", LoadProgressConst.SAVING));
		
		return urlLoader(settingUrl, {
			method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(userids)
		})
		.then(roleMangerCode)
		.then((result) => {
			let progress = result && result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : result && result.code == 405 ? LoadProgressConst.UNDELETED : LoadProgressConst.SAVING_FAILED;
			result.success = result && result.code == 200;
			result.userids = userids.userids;
			dispatch(getAction(REMOVE_ACCOUNTS, "right", progress, result));
			
			if(isUpdate && result.success)
			{
				let groupidParam = currentGroupId ? currentGroupId + "/" : "",
					settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/user/' + groupidParam + currentPage + "/10");
				
				dispatch(getUserListAction(GET_ACCOUNT_TABLEDATE, "right", LoadProgressConst.LOADING));
				
				urlLoader(settingUrl, {headers: {token: ntoken}})
				.then(roleMangerCode)
				.then(result => {
					let {code, message: count, data} = result,
						success = code === 200,
						progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
					
					dispatch({
						type: GET_ACCOUNT_TABLEDATE,
						"right": progress,
						data, count, success
					})
				});
			}
		});
	}
}

//搜索账号数据
export function getSearchData(data = {page: 1, size: 10})
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/searchQuery');
		
		data.siteid = siteId;
		dispatch(getAction(GET_ACCOUNT_SEARCH_DATA, "right", LoadProgressConst.LOADING, []));
		
		urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(result => {
			let {code, message: count, data} = result,
				success = code === 200,
				progress = LoadProgressConst.LOAD_COMPLETE;
			
			dispatch({
				type: GET_ACCOUNT_SEARCH_DATA,
				"right": progress,
				data, count, success
			})
		});
	}
}

function roleMangerCode(response)
{
	LogUtil.trace("sessionLabel", LogUtil.INFO, response);
	
	return Promise.resolve(response.jsonResult);
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

function getUserListAction(type, progressType, progress)
{
	return {type, [progressType]: progress}
}
