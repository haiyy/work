import {
	GET_CURSTEM, DISTRIBUTION, GET_SKILLTAG_CURSTEM, MAKE_USERS, EDITOR_USER, DEL_USER, GET_USER, USER_CHECKED, DATATYPE_REQUEST, DATA_REQUEST
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { loginUserProxy } from "../../../../utils/MyUtil"
import Settings from '../../../../utils/Settings';

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
		progress = success ? LoadProgressConst.SAVING_SUCCESS : result && result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
	}

	dispatch(getAction(type, proType, progress, result));

	return Promise.resolve({success, result: result})
}

function getAction(type, progressType, progress, result)
{

	return {type, result, [progressType]: progress}
}

//获取用户群列表
export function distribute(terminalValue)
{
	return dispatch => {
		dispatch(getAction(DISTRIBUTION, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();
		let settingUrl = Settings.querySettingUrl("/template/", siteId, "?terminal=" + terminalValue);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, DISTRIBUTION, "left", true));
	}
}

//创建用户群
export function makeUsers(data)
{
	return dispatch => {
		dispatch(getAction(MAKE_USERS, "left", LoadProgressConst.SAVING));
		let {siteId, ntoken} = loginUserProxy();
		let settingUrl = Settings.querySettingUrl("/template/", siteId, "");

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, MAKE_USERS, "left", false));
	}
}

//查询单个用户群信息
export function getUserCurstem(id)
{
	return dispatch => {
		dispatch(getAction(GET_USER, "left", LoadProgressConst.LOADING));
		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.querySettingUrl("/template/", siteId, "/" + id + "?terminal=setting");
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, GET_USER, "left", true));
	}
}

export function checkoutExist(name)
{
    let {siteId} = loginUserProxy(),
        settingUrl = Settings.querySettingUrl("/template/", siteId, "/exist?name=" + name);

	return urlLoader(settingUrl)
	.then(roleMangerCode)
	.then(result => {
		let {code, data = {}} = result || {},
            {exist} = data,
			success = code == 200;

		return Promise.resolve(success && exist);
	})

}

export function clearUserMsg()
{
	return dispatch => {
		dispatch(getAction(GET_USER, "left", LoadProgressConst.LOAD_COMPLETE, {}));
	}
}

//提交编辑用户群
export function editorCurstem(data)
{
	return dispatch => {
		dispatch(getAction(EDITOR_USER, "left", LoadProgressConst.SAVING));
		let {siteId, ntoken} = loginUserProxy();
		data.siteid = siteId;

		let settingUrl = Settings.querySettingUrl("/template/", siteId, "/" + data.templateid);
		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, EDITOR_USER, "left", false));
	}
}

//删除用户群
export function delCurstem(id)
{
	return dispatch => {
		dispatch(getAction(DEL_USER, "left", LoadProgressConst.SAVING));
		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.querySettingUrl("/template/", siteId, "/" + id);
		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}})
		.then(roleMangerCode)
		.then(result => {
			let progress = result.success ? LoadProgressConst.SAVING_SUCCESS : result.code == 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
			result.id = id;
			dispatch({
				type: DEL_USER,
				"left": progress,
				result
			})
		});
	}
}

//更改用户群激活与挂起状态
export function curstemChecked(id, status)
{
	return dispatch => {

		dispatch(getAction(USER_CHECKED, "left", LoadProgressConst.SAVING));
		let {siteId, ntoken} = loginUserProxy(),
			data = {};
		data.siteid = siteId;
		data.templateid = id;
		data.status = (status ? 1 : 0);

		let settingUrl = Settings.querySettingUrl("/template/", siteId, "/status/" + id + "?status=" + data.status);
		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(roleMangerCode)
		.then(dispatchAction.bind(null, dispatch, USER_CHECKED, "left", false));
	}
}

//获取客服分组数据

export function getCustomerGroupData(data)
{
	return dispatch =>
	{
        // dispatch(getAction(GET_SKILLTAG_CURSTEM, "left", LoadProgressConst.LOADING));
        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.queryPathSettingUrl("/enterprise/"+siteId+"/groupuser/"+data.groupIds+"/"+data.page+"/"+data.rp);
        return urlLoader(settingUrl, {headers: ntoken})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_SKILLTAG_CURSTEM, "left", true));
	}
}

//获取筛选技能标签客服分组数据
export function getSkillTagCustomerGroupData(data)
{
    return dispatch =>
    {
        // dispatch(getAction(GET_SKILLTAG_CURSTEM, "left", LoadProgressConst.LOADING));
        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.queryPathSettingUrl("/enterprise/"+siteId+"/tag/config/"+data.tagids+"/"+data.page+"/"+data.rp);
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(roleMangerCode)
            .then(dispatchAction.bind(null, dispatch, GET_SKILLTAG_CURSTEM, "left", true));
    }
}

//清空客服数据
export function clearCustomerData()
{
	return dispatch => {
		dispatch(getAction(GET_SKILLTAG_CURSTEM, "left", LoadProgressConst.LOADING, []));
	}
}

let dataType = ["选择用户维度", "关键页面", "接待组", "用户地域", "用户终端", "用户来源", "关键词", "用户身份", "用户标识", "咨询发起页", "来源页", "着陆页", "自定义"];

//获取筛选用户类型
export function getType()
{
	return {
		type: DATATYPE_REQUEST,
		data: dataType
	};

	//return dispatch =>{
	//	getTypeData().then((result)=>
	//	{
	//		dispatch({
	//			type: DATA_REQUEST,
	//			result: resultData
	//		});
	//	}, (error)=>
	//	{
	//		console.log(error);
	//	});
	//}
}

function getTypeData()
{
	let data = {},
		{siteId, ntoken} = loginUserProxy();

	data.siteid = siteId;

	let settingUrl = Settings.querySettingUrl("getAllUserGroup", data);

	return urlLoader(settingUrl, {headers: {token: ntoken}})
	.then(getCode)
	.catch((error) => {
		return error;
	});
}

//获取筛选用户类型对应的内容
export function getdata(data)
{
	//let treeData = [{
	//	label: 'Node1',
	//	value: 'Node1',
	//	key: '0-0',
	//	children: [{
	//		label: 'Child Node1',
	//		value: 'Child Node1',
	//		key: '0-0-0'
	//	}]
	//}, {
	//	label: 'Node2',
	//	value: 'Node2',
	//	key: '0-1',
	//	children: [{
	//		label: 'Child Node3',
	//		value: 'Child Node3',
	//		key: '0-1-0'
	//	}]
	//}];
	return {
		type: DATA_REQUEST,
		data: treeData
	};

	//return dispatch =>{
	//	getDatas().then((result)=>
	//	{
	//		dispatch({
	//			type: DATA_REQUEST,
	//			result: resultData
	//		});
	//	}, (error)=>
	//	{
	//		console.log(error);
	//	});
	//}
}

function getDatas()
{
	let data = {},
		{siteId, ntoken} = loginUserProxy();

	data.siteid = siteId;

	let settingUrl = Settings.querySettingUrl("getAllUserGroup", data);

	return urlLoader(settingUrl, {headers: {token: ntoken}})
	.then(getCode)
	.catch((error) => {
		return error;
	});
}

function getCode(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

function roleMangerCode(response)
{
	LogUtil.trace("sessionLabel", LogUtil.INFO, response);

	return Promise.resolve(response.jsonResult);
}
