//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=69927851

import { fromJS } from "immutable";
import Settings from "../../../utils/Settings";
import { urlLoader } from "../../../lib/utils/cFetch";
import { loginUserProxy, configProxy, token } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { getResultCode, dispatchAction, getAction } from "../../../utils/ReduxUtils";

const SET_PAGE_ROUTE = "SET_PAGE_ROUTE",  //路由

    GET_TABLE_HEADER = 'GET_TABLE_HEADER', //获取表格的表头字段

	GET_CONSULT_LIST = "GET_CONSULT_LIST",  //获取咨询列表
	GET_CONSULT_LIST_PROGRESS = "GET_CONSULT_LIST_PROGRESS",  //正在加载咨询列表

	GET_INVALID_CONSULT_LIST = "GET_INVALID_CONSULT_LIST",  //获取无效咨询列表
	GET_INVALID_CONSULT_LIST_PROGRESS = "GET_INVALID_CONSULT_LIST_PROGRESS",  //正在加载无效咨询列表

	GET_CONSULT_DETAIL = "GET_CONSULT_DETAIL",  //获取咨询详情
	GET_CONSULT_DETAIL_PROGRESS = "GET_CONSULT_DETAIL_PROGRESS",  //正在加载咨询详情

	ACCOUNT_GROUP_PROGRESS = "ACCOUNT_GROUP_PROGRESS",
	ACCOUNT_GROUP = "ACCOUNT_GROUP",
	ACCOUNT_GROUP_CHILDREN_PROGRESS = "ACCOUNT_GROUP_CHILDREN_PROGRESS",
	ACCOUNT_GROUP_CHILDREN = "ACCOUNT_GROUP_CHILDREN",

	GET_VISITOR_SOURCE_GROUP = "GET_VISITOR_SOURCE_GROUP",
	GET_VISITOR_SOURCE_GROUP_PROGRESS = "GET_VISITOR_SOURCE_GROUP_PROGRESS",
	GET_VISITOR_SOURCE_LIST_PROGRESS = "GET_VISITOR_SOURCE_LIST_PROGRESS",
	GET_VISITOR_SOURCE_LIST = "GET_VISITOR_SOURCE_LIST",

    UPDATE_SELECTED_CONDITIONS_CONSULT = "UPDATE_SELECTED_CONDITIONS_CONSULT", //更新已选条件
    GET_SELECTED_FUALIFICATION = "GET_SELECTED_FUALIFICATION",   //获取已选条件

    GET_COMMONUSED = 'GET_COMMONUSED', //获取咨询列表常用搜索
    UPDATE_COMMON_USED_CONDITIONS_CONSULT = "UPDATE_COMMON_USED_CONDITIONS_CONSULT",   //更新常用搜索
    ADD_COMMON_USED_CONDITIONS = "ADD_COMMON_USED_CONDITIONS",   //添加常用搜索
    DEL_COMMON_USED_CONDITIONS = "DEL_COMMON_USED_CONDITIONS",   //删除常用搜索

    GET_CONSULT_CONVERSATION_COUNT = "GET_CONSULT_CONVERSATION_COUNT"; //获取左侧菜单数量

// 设置当前页面的路由 判断当前的页面是否是详情页面
export function setPageRoute(pageRoute)
{
	return dispatch => {
		dispatch({
			type: SET_PAGE_ROUTE,
			pageRoute
		});
	};
}

/*获取列表的表头信息*/
export function getTableHeader()
{
    return dispatch => {
	    let {siteId} = loginUserProxy(),
         url = configProxy().nCrocodileServer + '/conversation/getKfField?siteId=' + siteId;

        return urlLoader(url, {headers: {token: token()}})
            .then(getResultCode)
            .then(result => {
                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(GET_TABLE_HEADER, progress, result.data));
            })
    }
}

/*更新列表的表头信息*/
export function updateTableHeader(filedIds)
{
    return dispatch => {
	    let {siteId} = loginUserProxy(),
            url = configProxy().nCrocodileServer + '/conversation/updateKfField';

        return urlLoader(url, {method: "POST", body: JSON.stringify(filedIds), headers: {token: token()}})
            .then(getResultCode)
            .then(result => {
                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED,
                    url = configProxy().nCrocodileServer + '/conversation/getKfField?siteId=' + siteId;

                if (result.code === 200)
                    urlLoader(url, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {
                            let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                            dispatch(getAction(GET_TABLE_HEADER, progress, result.data));
                        })
                // dispatch(getAction(GET_TABLE_HEADER, progress, result.data));
                return Promise.resolve(result)
            })
    }
}

/**
 *获取有效和无效咨询列表
 * @param isEffective
 * @param {JSON} params
 */
export function getConsultList(effective, search = {}, extra = null, isSearchComp = false)
{
	return dispatch => {
		let type = GET_CONSULT_LIST, progressType = GET_CONSULT_LIST_PROGRESS,
            {siteId} = loginUserProxy(), addSearch = {siteId},
			url = configProxy().nCrocodileServer + '/conversation/getConversationList';

        if (!isSearchComp)
        {
            addSearch = {siteId, menuRemark: effective};
            delete search.effective
        }else
        {
            addSearch = {siteId};
            delete search.menuRemark
        }

		// if(effective == 1)
		// {
		// 	type = GET_CONSULT_LIST;
		// 	progressType = GET_CONSULT_LIST_PROGRESS;
		// 	addSearch = {siteId, effective: 1}
		// }
		// else if (effective == 0)
		// {
		// 	type = GET_INVALID_CONSULT_LIST;
		// 	progressType = GET_INVALID_CONSULT_LIST_PROGRESS;
		// 	addSearch = {siteId, effective: 0}
		// }
        //

		dispatch(getAction(progressType, LoadProgressConst.LOADING));

		Object.assign(search, addSearch);

		urlLoader(url, {method: "POST", body: JSON.stringify(search), headers: {token: token()}})
		.then(getResultCode)
		.then(result => {
			let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED,
				data;

			extra = extra ? extra : {};
			extra.search = search;

			if(result.code === 200)
			{
				data = result.data || {};
				data.currentPage = search.pageNo || 1;
				//data.starttime = search && [search.startTime, search.endTime];
				data.extra = extra;
			}

			dispatch(getAction(type, progress, data || {}));
		});
	}
}

export function getConsultDetail(conversationId, guestId)
{
	return dispatch => {
		let {siteId} = loginUserProxy();

		dispatch(getAction(GET_CONSULT_DETAIL_PROGRESS, LoadProgressConst.LOADING));

		let url = configProxy().nCrocodileServer + `/conversation/getDetail?siteId=${siteId}&conversationId=${conversationId}&order=1`;
		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {
			let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

			dispatch(getAction(GET_CONSULT_DETAIL, progress, result.data || {}, {conversationId, guestId}));
            return Promise.resolve(result)
		})
	}
}

export function getAccountGroup()
{
	return dispatch => {
		dispatch(getAction(ACCOUNT_GROUP_PROGRESS, LoadProgressConst.LOADING));

		let {siteId: siteid, ntoken} = loginUserProxy();

		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/group');

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getResultCode)
		.then(dispatchAction.bind(null, dispatch, ACCOUNT_GROUP, true));
	}
}

export function getAccountList(data)
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy(),
			groupid = data && data.groupid ? data.groupid + "/" : "",
			settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/user/' + groupid + 1 + "/" + 200);

		dispatch(getAction(ACCOUNT_GROUP_CHILDREN_PROGRESS, LoadProgressConst.LOADING, data && data.groupid));

		urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getResultCode)
		.then((result) => {
			let success = result && result.code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(ACCOUNT_GROUP_CHILDREN, progress, result.data || {}, data && data.groupid));
		})
	}
}

//获取访客来源类型列表
export function getVisitorSourceGroup()
{
	return dispatch => {
		let {siteId: siteid, ntoken} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/source/", siteid, "");

		dispatch(getAction(GET_VISITOR_SOURCE_GROUP_PROGRESS, LoadProgressConst.LOADING));

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getResultCode)
		.then(dispatchAction.bind(null, dispatch, GET_VISITOR_SOURCE_GROUP, true));
	}
}

//获取访客来源列表
export function getVisitorSourceList(source_type_id)
{
	return dispatch => {
		dispatch(getAction(GET_VISITOR_SOURCE_LIST_PROGRESS, LoadProgressConst.LOADING));

		let {siteId: siteid, ntoken} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/source/", siteid, "/sourcetype/" + source_type_id);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getResultCode)
		.then((result) => {
			let success = result && result.code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_VISITOR_SOURCE_LIST, progress, result.data || {}, source_type_id));
		})
	}
}

/*更新已选条件*/
export function updateSelectedConditions(data)
{
	data = data || [];

	return dispatch => {
		dispatch({
			type: UPDATE_SELECTED_CONDITIONS_CONSULT,
			data
		})
	}
}

/*保存常用搜索*/
export function saveCommonUsedConditions(commonUsedObj = {})
{
    return dispatch => {
        let url = configProxy().nCrocodileServer + '/commonSearch/saveCommonSearch';

        return urlLoader(url, {method: "POST", body: JSON.stringify(commonUsedObj), headers: {token: token()}})
            .then(getResultCode)
            .then(result => {

                let progress = result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                commonUsedObj.id = result.data;

                dispatch(getAction(ADD_COMMON_USED_CONDITIONS, progress, commonUsedObj));
                return Promise.resolve(result);
            })
    }
}

/*删除常用搜索*/
export function deleteCommonUsedConditions(id)
{
    return dispatch => {
        let url = configProxy().nCrocodileServer + '/commonSearch/delete/' + id;

        urlLoader(url, {method: "POST", headers: {token: token()}})
            .then(getResultCode)
            .then(result => {
                let progress = result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                dispatch(getAction(DEL_COMMON_USED_CONDITIONS, progress, id));
            })
    }
}

/*查询常用搜索*/
export function queryCommonUsedConditions()
{
    return dispatch => {

        let {userId: kfid} = loginUserProxy(),
            headers =  {token: token()},
            url = configProxy().nCrocodileServer + '/commonSearch/getCommonSearchAll?flag=0';

        return urlLoader(url, {method: 'get', headers})
            .then(getResultCode)
            .then((result) => {

                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction( GET_COMMONUSED, progress, result.data || {}));
            })
    }
}

/*更新常用搜索*/
export function updateCommonUsedConditions(data) {
    data = data || [];

    return dispatch => {
        dispatch({
            type: UPDATE_COMMON_USED_CONDITIONS_CONSULT,
            data
        })
    }
}

export function getConversationCount(countObj = {})
{
    return dispatch => {

        let {userId: kfid, siteId} = loginUserProxy(),
            headers =  {token: token()},
            url = configProxy().nCrocodileServer + '/conversation/getConversationCount';

        countObj.siteId = siteId;

        return urlLoader(url, {method: 'POST', headers, body: JSON.stringify(countObj)})
            .then(getResultCode)
            .then((result) =>
            {
                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_CONSULT_CONVERSATION_COUNT, progress, result.data || {}));
            })
    }
}

//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
	validConsult: {
		data: [],
		total: 0,
		progress: 2,
		starttime: [],
		extra: {selectValue:'今天'}
	},
	invalidConsult: {
		data: [],
		total: 0,
		progress: 2,
		starttime: [],
		extra: {selectValue:'今天'}
	},
	consultDetail: {
		data: [],
		progress: 2,
		extra: {selectValue:'今天'}
	},
	pageRoute: 'main',
	account: {
		data: [],
		progress: 2,
		childrenProgress: 2,
		groupId: ""
	},
	visitorSource: {
		progress: 2,
		childrenProgress: 2,
		groupId: ""
	},
	checkedData: {
		visitorSource: [],
		region: []
	},
	selectedConditions: [],
    commonUsed: [],
    conversationCount: {}
});
let commonUsedList = [];
export default function consultReducer(state = initState, action) {
	switch(action.type)
	{
		case SET_PAGE_ROUTE :
			return state.setIn(["pageRoute"], action.pageRoute);

        case GET_TABLE_HEADER :
            return state.setIn(["headerList"], action.result);

		case GET_CONSULT_LIST_PROGRESS:
			return state.setIn(["validConsult", "progress"], action.progress);

		case GET_CONSULT_DETAIL_PROGRESS:
			return state.setIn(["consultDetail", "progress"], action.progress);

		case GET_INVALID_CONSULT_LIST_PROGRESS:
			return state.setIn(["invalidConsult", "progress"], action.progress);

		case GET_CONSULT_LIST:
			let extra1 = action.result.extra ? action.result.extra : state.getIn(["validConsult", "extra"]);

			return state.setIn(["validConsult", "progress"], action.progress)
			.setIn(["validConsult", "data"], action.result.list)
			.setIn(["validConsult", "total"], action.result.total)
			.setIn(["validConsult", "currentPage"], action.result.currentPage)
			.setIn(["validConsult", "extra"], extra1)
			.setIn(["validConsult", "starttime"], action.result.starttime);

		case GET_INVALID_CONSULT_LIST:
			let extra = action.result.extra ? action.result.extra : state.getIn(["invalidConsult", "extra"]);

			return state.setIn(["invalidConsult", "progress"], action.progress)
			.setIn(["invalidConsult", "data"], action.result.list)
			.setIn(["invalidConsult", "total"], action.result.total)
			.setIn(["invalidConsult", "currentPage"], action.result.currentPage)
			.setIn(["invalidConsult", "extra"], extra)
			.setIn(["invalidConsult", "starttime"], action.result.starttime);

        case GET_COMMONUSED:
            commonUsedList = action.result;
            return state.set("commonUsed", commonUsedList);

        case ADD_COMMON_USED_CONDITIONS:
            if (action.progress == 5)
            {
                action.result.searchContent = JSON.stringify(action.result.searchContent);
                commonUsedList.push(action.result);
            }

            return state.set("commonUsed", commonUsedList);

        case DEL_COMMON_USED_CONDITIONS:
            if (action.progress == 5)
            {
                // let index = commonUsedList.findIndex(item => item.id === action.result);
                // commonUsedList.splice(index, 1);
            }


            return state.set("commonUsed", commonUsedList);

        case GET_CONSULT_DETAIL:
            //action
            return state.setIn(["consultDetail", "progress"], action.progress)
                .setIn(["consultDetail", "messageList"], action.result.messageList)
                .setIn(["consultDetail", "extra"], action.extra)
                .setIn(["consultDetail", "conversation"], action.result.converInfo)/*
                .setIn(["consultDetail", "conversation"], action.result.conversation)*/;

        case ACCOUNT_GROUP_PROGRESS:
            return state.setIn(["account", "progress"], action.progress);

        case ACCOUNT_GROUP_CHILDREN_PROGRESS:
            return state.setIn(["account", "childrenProgress"], action.progress)
                .setIn(["account", "groupId"], action.result);

        case ACCOUNT_GROUP:
            return state.setIn(["account", "progress"], action.progress)
                .setIn(["account", "data"], action.result);

        case ACCOUNT_GROUP_CHILDREN:
            groupItem = {};
            let group = state.getIn(["account", "data"]) || [],
                groupid = action.extra,
                curGroup = find(groupid, group) || {};

            if(!Array.isArray(curGroup.children))
                curGroup.children = [];

            if(Array.isArray(action.result))
            {
                action.result.forEach(item => {
                    addToGroup(item, curGroup.children)
                });
            }

            return state.setIn(["account", "childrenProgress"], action.progress);

        case GET_VISITOR_SOURCE_LIST:
            groupItem = {};

            let group_ = state.getIn(["visitorSource", "data"]) || [],
                source_type_id = action.extra,
                curGroup_ = find(source_type_id, group_, "source_type_id");

            if(!Array.isArray(curGroup_.children))
                curGroup_.children = [];

            if(Array.isArray(action.result))
            {
                action.result.forEach(item => {
                    addVisitorSource(item, curGroup_.children)
                });
            }

            return state.setIn(["visitorSource", "childrenProgress"], action.progress);

        case GET_VISITOR_SOURCE_GROUP:
            return state.setIn(["visitorSource", "progress"], action.progress)
                .setIn(["visitorSource", "data"], action.result);

        case GET_SELECTED_FUALIFICATION:
            //咨询记录
            return state.setIn(["checkedData", action.key], action.data);

        case UPDATE_SELECTED_CONDITIONS_CONSULT: //已选条件
            return state.set("selectedConditions", action.data);

        case UPDATE_COMMON_USED_CONDITIONS_CONSULT: //常用搜索
            return state.set("commonUsedConditions", action.data);

        case GET_CONSULT_CONVERSATION_COUNT: //左侧菜单下级数量
            return state.set("conversationCount", action.result);
    }

    return state;
}

function addToGroup(value, group)
{
	let isInclude = group.find(item => item.userid === value.userid || item.hasOwnProperty("children") && item.groupid === value.groupid);

	if(!isInclude)
	{
		group.push(value);
	}
}

function addVisitorSource(value, group)
{
	let isInclude = group.find(item => item.ename === value.ename);

	if(!isInclude)
	{
		group.push(value);
	}
}

let groupItem = {};

function find(groupid, group, key = "groupid")
{
	group.forEach(item => {
		if(item.hasOwnProperty("children"))
		{
			if(item[key] == groupid)
			{
				groupItem = item;
			}
			else if(item.children.length > 0)
			{
				find(groupid, item.children, key);
			}
		}
	});

	return groupItem;
}
