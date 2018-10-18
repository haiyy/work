import { Map, fromJS } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy ,configProxy} from "../../../../utils/MyUtil";
import {message} from 'antd'

// /sitecenter/evs/{$siteId}/usersetting/{$userId}?accesstoken=XXX

const RECEPTIONGGROUP_PROGRESS = "RECEPTIONGGROUP_PROGRESS",
	GET_RECEPTIONG_GROUP = "GET_RECEPTIONG_GROUP",//查询所有有效接待组（分页）
	POSTADD_RECEPTIONG_GROUP = "POSTADD_RECEPTIONG_GROUP", //用于创建一个新的接待组
	PUT_RECEPTIONG_GROUP = "PUT_RECEPTIONG_GROUP",//用于修改已有接待组名称和成员信息
	DELETE_RECEPTIONG_GROUP = "DELETE_RECEPTIONG_GROUP",//删除接待组
	GET_CTIGROUPS = "GET_CTIGROUPS",//根据接待组id查询
	GET_BINDGROUPS="GET_BINDGROUPS",
	QUERY_RECEPTIONG_GROUP = "QUERY_RECEPTIONG_GROUP",//根据接待组ID查询接待组信息
	GET_GROUOLIST = "GET_GROUOLIST";

/**
 *  接待组  查询所有有效接待组
 *  @param {String} siteId //   企业ID
 *  @param {String} templateName    //   接待组名
 *  @param {String} page     // 当前页码
 *  @param {String} rp //    每页显示数量，默认是10
 * */
export const getRecePtiongGroupList = (templateName = '', page = 1, rp = 10) => dispatch => {
	dispatch({type: RECEPTIONGGROUP_PROGRESS, progress: LoadProgressConst.LOADING});
	let {siteId, ntoken} = loginUserProxy(),
		data={},
		headUrl =  configProxy().xNccSettingServer  + `/sitecenter/evs/${siteId}/ctigroup`;
		data.templateName=templateName;
		data.page=page;
		data.rp=rp;
		
	return urlLoader(headUrl,{
		body: JSON.stringify(data),
		method: "post",
        headers: {token: ntoken}

    })
	.then(({jsonResult}) => {
		let {code, data, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

		if(!success)
		{
			data = {};
		}

		dispatch({
			type: GET_RECEPTIONG_GROUP,
			data,
			msg,
			progress,
			roloadFlag: false,
		})
	});
};

/**
 *  接待组 创建
 *  @param {String} siteId //   企业ID
 *  @param {String} templateName   //   接待组name
 *  @param {String} userIds   //   接待组成员坐席工号
 * */
export const addRecePtiongGroup = (data) => dispatch => {
	console.log(data);
	dispatch({type: RECEPTIONGGROUP_PROGRESS, progress: LoadProgressConst.LOADING});
	let {ntoken,siteId} = loginUserProxy(),
		headUrl =  configProxy().xNccSettingServer  + `/sitecenter/evs/${siteId}/ctigroups?`;

	return urlLoader(headUrl, {
		body: JSON.stringify(data),
		method: "post",
        headers: {token: ntoken}

    })
	.then(({jsonResult}) => {
		let {code, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
			roloadFlag = success;

		if(!success)
		{
			roloadFlag = false;
			message.error(msg);
		} else {

			dispatch({
				type: POSTADD_RECEPTIONG_GROUP,
				msg,
				progress,
				roloadFlag
			})
		}
	});
};

/**
 *  接待组  编辑
 *  @param {String} siteId //   企业ID
 *  @param {String} templateId   //   接待组id
 *  @param {String} templateName   //   接待组名
 *  @param {String} userId   //   接待组成员坐席工号
 * */
export const putRecePtiongGroup = (data, xntemplateId) => dispatch => {

	dispatch({type: RECEPTIONGGROUP_PROGRESS, progress: LoadProgressConst.LOADING});
	let {ntoken,siteId} = loginUserProxy(),
		
		headUrl =  configProxy().xNccSettingServer +`/sitecenter/evs/${siteId}/ctigroups/${xntemplateId}?`;

	return urlLoader(headUrl, {
		body: JSON.stringify(data),
		method: "put",
        headers: {token: ntoken}

    })
	.then(({jsonResult}) => {
		let {code, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
			roloadFlag = success;

		if(!success) {
			roloadFlag = false;
			message.error(msg);
		} else {

			dispatch({
				type: PUT_RECEPTIONG_GROUP,
				msg,
				progress,
				roloadFlag
			})
		}
	});
};

/**
 *  接待组 删除
 *  @param {String} siteId //   企业ID
 *  @param {String} templateId   //   接待组id
 * */
export const deleteRecePtiongGroup = (xntemplateId) => dispatch => {

	dispatch({type: RECEPTIONGGROUP_PROGRESS, progress: LoadProgressConst.LOADING});
	let {siteId, ntoken} = loginUserProxy(),
		headUrl = configProxy().xNccSettingServer + `/sitecenter/evs/${siteId}/ctigroups/${xntemplateId}`;

	return urlLoader(headUrl, {
		method: "delete",
        headers: {token: ntoken}

    })
	.then(({jsonResult}) => {
		let {code, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
			roloadFlag = success;

		if(!success)
		{
			roloadFlag = false;
			message.error(msg);
		} else {

			dispatch({
				type: DELETE_RECEPTIONG_GROUP,
				msg,
				progress,
				roloadFlag
			})
		}
	});
};

/**
 *  接待组 根据接待组id查询 （分页
 *  @param {String} siteId //   企业ID
 *  @param {String} groupIds   //    行政组ID
 * */

export const queryRecePtiongGroupList = (groupIds, page = 1, rp = 10) => dispatch => {
	dispatch({type: RECEPTIONGGROUP_PROGRESS, progress: LoadProgressConst.LOADING});
	let {siteId, ntoken} = loginUserProxy(),
		headUrl = configProxy().xNccSettingServer + `/sitecenter/evs/${siteId}/grouplists?groupIds=${groupIds}&page=${page}&rp=${rp}&accesstoken=${ntoken}`;
	return urlLoader(headUrl,{
        headers: {token: ntoken}
    })
	.then(({jsonResult}) => {
		let {code, data, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

		if(!success)
			data = {};

		dispatch({
			type: QUERY_RECEPTIONG_GROUP,
			msg,
			progress,
			data
		})
	});
};

export const getGroupList = (templateId) => dispatch => {
	let {siteId, ntoken} = loginUserProxy(),
		headUrl = configProxy().xNccSettingServer +`/sitecenter/evs/${siteId}/users`;
	return urlLoader(headUrl,{
        headers: {token: ntoken}
    })
	.then(({jsonResult}) => {
		let {code, data, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

		if(!success)
			data = {};

		dispatch({
			type: GET_GROUOLIST,
			msg,
			progress,
			data
		})
	});
};

export const getBindGroupList = (templateId) => dispatch => {
	let {siteId, ntoken} = loginUserProxy(),
		headUrl = configProxy().xNccSettingServer +`/sitecenter/evs/${siteId}/boundusers`;
	return urlLoader(headUrl,{
        headers: {token: ntoken}
    })
	.then(({jsonResult}) => {
		let {code, data, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

		if(!success)
			data = {};

		dispatch({
			type: GET_BINDGROUPS,
			msg,
			progress,
			data
		})
	});
};

export const getCtiGroups = (templateId) => dispatch => {
	let {siteId, ntoken} = loginUserProxy(),
		headUrl = configProxy().xNccSettingServer + `/sitecenter/evs/${siteId}/ctigroups/${templateId}`;
	return urlLoader(headUrl,{
        headers: {token: ntoken}
    })
	.then(({jsonResult}) => {
		let {code, data, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

		if(!success)
			data = {};

		dispatch({
			type: GET_CTIGROUPS,
			msg,
			progress,
			data
		})
	});
}

// --------------------------Reducer-------------------------------------
let initState = Map({progress: 1});
initState.set("groupList", {});
initState.set("bindgroupList", {});
initState.set("queryList", {});
initState.set("ctiGroupList", {});
initState.set("treeGroupList", {});
initState.set("recePtionGrouproloadFlag", false)

export default function receptiongroupReducer(state = initState, action) {
	switch(action.type)
	{
		case GET_RECEPTIONG_GROUP:
			return state.set("groupList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
			.set("recePtionGrouproloadFlag", action.roloadFlag)
		case POSTADD_RECEPTIONG_GROUP:
			return state.set("progress", action.progress)
			.set("msg", action.msg)
			.set("recePtionGrouproloadFlag", action.roloadFlag)
		case DELETE_RECEPTIONG_GROUP:
			return state.set("progress", action.progress)
			.set("msg", action.msg)
			.set("recePtionGrouproloadFlag", action.roloadFlag)
		case GET_CTIGROUPS:
			return state.set("ctiGroupList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
		case PUT_RECEPTIONG_GROUP:
			return state.set("progress", action.progress)
			.set("recePtionGrouproloadFlag", action.roloadFlag)
			.set("msg", action.msg);
		case QUERY_RECEPTIONG_GROUP:
			return state.set("queryList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
		case GET_BINDGROUPS:
			return state.set("bindgroupList", action.data)
				.set("progress", action.progress)
				.set("msg", action.msg)
		case GET_GROUOLIST :
			return state.set("treeGroupList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)

	}
	return state;
}
