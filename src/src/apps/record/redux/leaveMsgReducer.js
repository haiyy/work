import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../lib/utils/cFetch";
import { loginUserProxy, configProxy, token } from "../../../utils/MyUtil";
import { fromJS } from "immutable";
import { getResultCode, dispatchAction, getAction } from "../../../utils/ReduxUtils";

const SET_PAGE_ROUTE = "SET_PAGE_ROUTE",  //路由

    GET_DEALED_LEAVE_MSG_LIST = "GET_DEALED_LEAVE_MSG_LIST",  //获取已处理留言列表
    GET_DEALED_LEAVE_MSG_LIST_PROGRESS = "GET_DEALED_LEAVE_MSG_LIST_PROGRESS",  //正在加载留言列表

    GET_PENDING_LEAVE_MSG_LIST = "GET_PENDING_LEAVE_MSG_LIST",  //获取待处理留言列表
    GET_PENDING_DEAL_LEAVE_MSG_LIST_PROGRESS = "GET_PENDING_DEAL_LEAVE_MSG_LIST_PROGRESS",  //正在加载待处理留言列表

    GET_LEAVE_MSG_DETAIL = "GET_LEAVE_MSG_DETAIL",  //获取留言详情
    GET_LEAVE_MSG_DETAIL_PROGRESS = "GET_LEAVE_MSG_DETAIL_PROGRESS",  //正在加载留言详情

    SUBMIT_DEAL_RECORD = "SUBMIT_DEAL_RECORD",  //处理留言
    SUBMIT_DEAL_RECORD_PROGRESS = "SUBMIT_DEAL_RECORD_PROGRESS",  //正在处理留言
    SAVE_LEAVE_MSG_DETAIL = "SAVE_LEAVE_MSG_DETAIL",

    ACCOUNT_GROUP_PROGRESS = "ACCOUNT_GROUP_PROGRESS",
    ACCOUNT_GROUP = "ACCOUNT_GROUP",
    ACCOUNT_GROUP_CHILDREN_PROGRESS = "ACCOUNT_GROUP_CHILDREN_PROGRESS",
    ACCOUNT_GROUP_CHILDREN = "ACCOUNT_GROUP_CHILDREN",

    UPDATE_SELECTED_CONDITIONS_LEAVEMSG = "UPDATE_SELECTED_CONDITIONS_LEAVEMSG", //更新已选条件

    GET_SELECTED_FUALIFICATION = "GET_SELECTED_FUALIFICATION",   //获取已选条件

    GET_COMMONUSED_LEAVEMSG = "GET_COMMONUSED_LEAVEMSG",
    UPDATE_COMMON_USED_CONDITIONS_LEAVEMSG = "UPDATE_COMMON_USED_CONDITIONS_LEAVEMSG",   //更新常用搜索
    ADD_COMMON_USED_CONDITIONS_LEAVEMSG = "ADD_COMMON_USED_CONDITIONS_LEAVEMSG",   //添加常用搜索
    DEL_COMMON_USED_CONDITIONS_LEAVEMSG = "DEL_COMMON_USED_CONDITIONS_LEAVEMSG";   //删除常用搜索

// 设置当前页面的路由 判断当前的页面是否是详情页面
export function setPageRoute(pageRoute, isproccessed)
{
    return dispatch =>
    {
        dispatch({
            type: SET_PAGE_ROUTE,
            pageRoute,
            isproccessed
        });
    };
}

//获取留言列表
export function getLeaveMsgList(isproccessed = true, search = {}, extra = null, isSearchComp = false)
{
    return dispatch =>
    {
        let type, progressType, addSearch = {},
            {siteId: siteid} = loginUserProxy(),
            url = configProxy().nCrocodileServer + '/leaveMessage/list';

       /* if(isproccessed)
        {*/
            type = GET_DEALED_LEAVE_MSG_LIST;
            progressType = GET_DEALED_LEAVE_MSG_LIST_PROGRESS;
       /* }
        else
        {
            type = GET_PENDING_LEAVE_MSG_LIST;
            progressType = GET_PENDING_DEAL_LEAVE_MSG_LIST_PROGRESS;
        }*/

        addSearch = {siteid};

        if(!isSearchComp)
            addSearch.isproccessed = isproccessed;

        dispatch(getAction(progressType, LoadProgressConst.LOADING));

        Object.assign(search, addSearch);

        urlLoader(url, {method: "POST", body: JSON.stringify(search), headers: {token: token()}})
            .then(getResultCode)
            .then(result=> {
                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED, data;

                extra = extra ? extra : {};
                extra.search = search;

                if (result.code === 200)
                {
                    data = result.data || {};
                    data.page = search && search.page || 1;
                    data.time = search && search.time || [];
                    data.extra = extra;
                }

                dispatch(getAction(type, progress, data || {}));
            });
    }
}

//获取留言详情
export function getLeaveDetail(guestId, leaveMessageId)
{
    return dispatch =>
    {
        if(!guestId || !leaveMessageId)
        {
            dispatch(getAction(GET_LEAVE_MSG_DETAIL, LoadProgressConst.LOAD_COMPLETE, {}));
            return;
        }

        dispatch(getAction(GET_LEAVE_MSG_DETAIL_PROGRESS, LoadProgressConst.LOADING));

        let siteId = loginUserProxy().siteId,
            url = `${configProxy().nCrocodileServer}/leaveMessage/detail?siteId=${siteId}&guestId=${guestId}&leaveMessageId=${leaveMessageId}`;

        return urlLoader(url, {headers: {token: token()}})
            .then(getResultCode)
            .then(result =>
            {
                let progress = LoadProgressConst.LOAD_COMPLETE, data;

                if(result.code === 200)
                {
                    data = result.data;
                }
                else
                {
                    progress = LoadProgressConst.LOAD_FAILED;
                    data = [guestId, leaveMessageId];
                }

                dispatch(getAction(GET_LEAVE_MSG_DETAIL, progress, data));
            })
    };
}

//列表详情页面 处理互动记录
export function submitDealRecord(leaveMessageId, guestId, content, proccessType, dealId)
{
    return dispatch =>
    {
        dispatch(getAction(SAVE_LEAVE_MSG_DETAIL, LoadProgressConst.SAVING));

        let url = configProxy().nCrocodileServer + '/leaveMessage/proccess';
        let obj = {
            leaveMessageId,
            guestId,
            content,
            proccessType,
            dealId
        };

        urlLoader(url, {method: "post", body: JSON.stringify(obj), headers: {token: token()}})
            .then(getResultCode)
            .then(jsonResult =>
            {
                let progress = jsonResult.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED,
                    message = jsonResult.message;

                dispatch(getAction(SAVE_LEAVE_MSG_DETAIL, progress, message));
            })
    }
}

export function clearMessageTip()
{
    return dispatch =>
    {
        dispatch(getAction(SAVE_LEAVE_MSG_DETAIL, LoadProgressConst.SAVING));
    }
}
/*更新常用搜索*/
export function updateSelectedConditions(data)
{
    data = data || [];

    return dispatch => {
        dispatch({
            type: UPDATE_SELECTED_CONDITIONS_LEAVEMSG,
            data
        })
    }
}

/*更新常用搜索*/
export function updateCommonUsedConditions(data)
{
    data = data || [];

    return dispatch => {
        dispatch({
            type: UPDATE_COMMON_USED_CONDITIONS_LEAVEMSG,
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

                dispatch(getAction(ADD_COMMON_USED_CONDITIONS_LEAVEMSG, progress, commonUsedObj));
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
                dispatch(getAction(DEL_COMMON_USED_CONDITIONS_LEAVEMSG, progress, id));
            })
    }
}

/*查询常用搜索*/
export function queryCommonUsedConditions()
{
    return dispatch => {

        let {userId: kfid} = loginUserProxy(),
            headers =  {token: token()},
            url = configProxy().nCrocodileServer + '/commonSearch/getCommonSearchAll?flag=1';

        return urlLoader(url, {method: 'get', headers})
            .then(getResultCode)
            .then((result) => {

                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction( GET_COMMONUSED_LEAVEMSG, progress, result.data || {}));
            })
    }
}
//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
    leaveDealedMsg: {
        data: [],
        total: 0,
        progress: 2,
        extra: {selectValue:'今天'}
    },
    leavePendingMsg: {
        data: [],
        total: 0,
        progress: 2,
        extra: {selectValue:'今天'}
    },
    leaveDetail: {
        data: [],
        progress: 2,
        extra: {selectValue:'今天'}
    },
    account: {
        data: [],
        progress: 2,
        childrenProgress: 2,
        groupId: ""
    },
    pageRoute: 'main',
    selectedConditions: [],
    commonUsedConditions: []
});

let commonUsedList = [];
export default function leaveMsgReducer(state = initState, action)
{
    switch(action.type)
    {
        case SET_PAGE_ROUTE :
            let pageRoute = action.pageRoute;
            return state.setIn(["pageRoute"], action.pageRoute)
                .setIn(["isproccessed"], action.isproccessed);

        case GET_DEALED_LEAVE_MSG_LIST_PROGRESS:
            return state.setIn(["leaveDealedMsg", "progress"], action.progress);

        case GET_PENDING_DEAL_LEAVE_MSG_LIST_PROGRESS:
            return state.setIn(["leavePendingMsg", "progress"], action.progress);

        case GET_LEAVE_MSG_DETAIL_PROGRESS:
            return state.setIn(["leaveDetail", "progress"], action.progress);

        case GET_DEALED_LEAVE_MSG_LIST:
            let extra1 = action.result.extra ? action.result.extra : state.getIn(["leaveDealedMsg", "extra"]),
                {search = {}} = extra1;

            return state.setIn(["leaveDealedMsg", "progress"], action.progress)
                .setIn(["leaveDealedMsg", "data"], action.result.list)
                .setIn(["leaveDealedMsg", "total"], action.result.total)
                .setIn(["leaveDealedMsg", "currentPage"], action.result.page)
                .setIn(["leaveDealedMsg", "extra"], extra1)
                .setIn(["leaveDealedMsg", "isproccessed"], search.isproccessed)
                .setIn(["leaveDealedMsg", "time"], action.result.time);

        case GET_PENDING_LEAVE_MSG_LIST:
            let extra = action.result.extra ? action.result.extra : state.getIn(["leavePendingMsg", "extra"]);

            return state.setIn(["leavePendingMsg", "progress"], action.progress)
                .setIn(["leavePendingMsg", "data"], action.result.list)
                .setIn(["leavePendingMsg", "total"], action.result.total)
                .setIn(["leavePendingMsg", "currentPage"], action.result.page)
                .setIn(["leavePendingMsg", "extra"], extra)
                .setIn(["leavePendingMsg", "time"], action.result.time);

        case GET_LEAVE_MSG_DETAIL:
            return state.setIn(["leaveDetail", "progress"], action.progress)
                .setIn(["leaveDetail", "data"], action.result)
                .setIn(["leaveDetail", "search"], action.result)
                .setIn(["leaveDetail", "extra"], action.extra);

        case SAVE_LEAVE_MSG_DETAIL:
            return state.setIn(["leaveDetail", "progress"], action.progress)
                .setIn(["leaveDetail", "message"], action.result)
                .setIn(["leaveDetail", "extra"], action.extra);

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

        case GET_SELECTED_FUALIFICATION:
            //留言
            return state.setIn(["checkedData", action.key], action.data);

        case UPDATE_SELECTED_CONDITIONS_LEAVEMSG: //已选条件
            return state.set("selectedConditions", action.data);

        case UPDATE_COMMON_USED_CONDITIONS_LEAVEMSG: //常用搜索
            return state.set("commonUsedConditions", action.data);

        case GET_COMMONUSED_LEAVEMSG:
            commonUsedList = action.result;
            return state.set("commonUsed", commonUsedList);

        case ADD_COMMON_USED_CONDITIONS_LEAVEMSG:
            if (action.progress == 5)
            {
                action.result.searchContent = JSON.stringify(action.result.searchContent);
                commonUsedList.push(action.result);
            }

            return state.set("commonUsed", commonUsedList);

        case DEL_COMMON_USED_CONDITIONS_LEAVEMSG:
            if (action.progress == 5)
            {
                // let index = commonUsedList.findIndex(item => item.id === action.result);
                // commonUsedList.splice(index, 1);
            }


            return state.set("commonUsed", commonUsedList);
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
