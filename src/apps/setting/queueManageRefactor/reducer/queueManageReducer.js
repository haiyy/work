import { fromJS } from "immutable";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, token } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { getResultCode, getAction } from "../../../../utils/ReduxUtils";
import LogUtil from "../../../../lib/utils/LogUtil";

const QUEUE_MANAGE_PROGRESS = "QUEUE_MANAGE_PROGRESS",
    GET_QUEUE_MANAGE_LIST = "GET_QUEUE_MANAGE_LIST",
    ADD_QUEUE = "ADD_QUEUE",
    EDIT_QUEUE = "EDIT_QUEUE",
    DEL_QUEUE = "DEL_QUEUE",
    GET_QUEUE_WORD = "GET_QUEUE_WORD",
    SET_QUEUE_WORD = "SET_QUEUE_WORD",
    GET_QUEUE_RULES = "GET_QUEUE_RULES",
    SET_QUEUE_RULES = "SET_QUEUE_RULES";

export function getQueueManageList(data)
{
    return dispatch => {
        let {siteId, ntoken} = loginUserProxy();

        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/queuestrategy/", siteId, "?page=" + data.page + "&rp=" + data.rp);

        log("getQueueManageList settingUrl = " + settingUrl);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(getResultCode)
            .then(result =>
            {
                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                //log("getQueueManageList settingUrl = " + settingUrl, LogUtil.ERROR);
                dispatch(getAction(GET_QUEUE_MANAGE_LIST, progress, result || {}));
            })
    }
}

export function addQueue(data)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/queuestrategy/", siteId);

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(ADD_QUEUE, progress));
                return Promise.resolve(result)
            })
    }
}

//编辑排队策略
export function editQueue(queueInfo = {}, isStatus)
{
    return dispatch => {
        let {siteId, ntoken} = loginUserProxy();

        queueInfo.siteid = siteId;
        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.SAVING));

        let settingUrl = Settings.querySettingUrl("/queuestrategy/", siteId);

        if (isStatus)
            settingUrl = Settings.querySettingUrl("/queuestrategy/", siteId, "?status=status");

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(queueInfo)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(EDIT_QUEUE, progress, result || {}));
                return Promise.resolve(result)
            })
    }
}

//删除排队策略
export function delQueue(delQueue)
{
    return dispatch => {
        let {siteId, ntoken} = loginUserProxy();

        delQueue.siteid = siteId;
        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.SAVING));

        let settingUrl = Settings.querySettingUrl("/queuestrategy/", siteId);

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(delQueue)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(DEL_QUEUE, progress, result || {}));
                return Promise.resolve(result)
            })
    }
}

//获取排队话术
export function getQueueWord()
{
    return dispatch => {
        let {siteId, ntoken} = loginUserProxy();

        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/queuestrategy/note/", siteId);
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_QUEUE_WORD, progress, result || {}));

                return Promise.resolve(result);
            })
    }
}

//设置排队话术
export function setQueueWord(data)
{
    return dispatch =>
    {
        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy(),
            settingUrl = Settings.querySettingUrl("/queuestrategy/note/", siteId);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result =>
            {
                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(SET_QUEUE_WORD, progress, result || {}));
            });
    }
}

//获取排队规则
export function getQueueRules()
{
    return dispatch => {
        let {siteId, ntoken} = loginUserProxy();

        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/queuestrategy/rule/", siteId);
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_QUEUE_RULES, progress, result || {}));
                return Promise.resolve(result)
            })
    }
}

//设置排队规则
export function setQueueRules(data)
{
    return dispatch =>
    {
        dispatch(getAction(QUEUE_MANAGE_PROGRESS, LoadProgressConst.SAVING));

        let {siteId, ntoken} = loginUserProxy(),
            settingUrl = Settings.querySettingUrl("/queuestrategy/rule/", siteId);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result =>
            {
                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(SET_QUEUE_RULES, progress, result || {}));
            });
    }
}

//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
    progress: 2,
    queueList: [],
    total: 0,
    queueWord: {},
    queueRules: {}
});

export default function queueManageReducer(state = initState, action) {

    let queueRules = {},
        queueWord = [],
        queueList = [],
        totalCount = 0;

    switch(action.type)
    {
        case QUEUE_MANAGE_PROGRESS:
            return state.setIn(["progress"], action.progress);

        case GET_QUEUE_MANAGE_LIST:
            if (action.result.success && action.result.data)
            {
                queueList = action.result.data.customtabList;
                queueList && queueList.forEach((item, index) => item.key = index);
                totalCount = action.result.data.count;
            }

            return state.setIn(["progress"], action.progress)
                .setIn(["queueList"], queueList)
                .setIn(["total"], totalCount);

        case ADD_QUEUE:
            return state.setIn(["progress"], action.progress);

        case EDIT_QUEUE:
            return state.setIn(["progress"], action.progress);

        case DEL_QUEUE:
            return state.setIn(["progress"], action.progress);

        case GET_QUEUE_WORD:
            if (action.result && action.result.success)
            {
                queueWord = action.result.data;
            }

            return state.setIn(["progress"], action.progress)
                .setIn(["queueWord"], queueWord);

        case SET_QUEUE_WORD:
            return state.setIn(["progress"], action.progress);

        case GET_QUEUE_RULES:
            if (action.result.success)
            {
                queueRules = action.result.data;
            }

            return state.setIn(["progress"], action.progress)
                .setIn(["queueRules"], queueRules);

        case SET_QUEUE_RULES:
            return state.setIn(["progress"], action.progress);

        default:
            return state;
    }
}

function log(log, info = LogUtil.INFO)
{
    LogUtil.trace("queueManageReducer", info, log);
}
