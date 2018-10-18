import { Map } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95947617

const  CALLCENTER_PROGRESS = "CALLCENTER_PROGRESS",
       GET_CALLLISTEN_RECORD = "GET_CALLLISTEN_RECORD",
       GET_MONITOR_STATICS = "GET_MONITOR_STATICS",
       UPDATE_CALLLISTEN_RECORD = "UPDATE_CALLLISTEN_RECORD",
       GET_RECEPTION_LIST = "GET_RECEPTION_LIST";


//获取接待组列表
export function getReceptionList() {
    return dispatch => {
        let {ntoken,siteId} = loginUserProxy(),
        headUrl = Settings.getCallSettingUrl(`${siteId}/allctigroups`);
        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
        .then(({jsonResult})=>{
            let {code, data} = jsonResult;
            dispatch({
                type:GET_RECEPTION_LIST,
                data:data || []
            });
        });
    }
}
/**
 * 获取客服监听数据
 * @param {int} operation 1:实时监控，2：呼叫监听
 * @param {string} templateId 坐席名称或者坐席工号
 * @param {int} onlineStatus （默认不传为全部）0离线，1在线，2忙碌，3小休，4会议
 * @param {int} callStatus 
 * @param {int} currentPage 当前页码
 * @param {int} pageSize 每页显示数量
 */
export function getCallListenRecord(operation, templateId = "", onlineStatus = 0,callStatus = 0, currentPage = 1, pageSize = 10) {
    return dispatch => {
        dispatch({type: CALLCENTER_PROGRESS, progress: LoadProgressConst.LOADING});

        let {ntoken,siteId,userId} = loginUserProxy(), 
        headUrl = Settings.getCallServerUrl(`monitor/${siteId}/waiters/${userId}/`,`?siteId=${siteId}&userId=${userId}&operation=${operation}&templateId=${templateId}&onlineStatus=${onlineStatus}&callStatus=${callStatus}&currentPage=${currentPage}&pageSize=${pageSize}`);

        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
                .then(({jsonResult})=>{
                    let {code, data, msg} = jsonResult,
                        progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                    dispatch({
                        type:GET_CALLLISTEN_RECORD,
                        progress,
                        data:data||{},
                        msg
                    });
                });
    }
}

/**
 * 查询坐席状态信息
 * @param {string} waiterId 需要查询的坐席的userId
 * @param {fun} callback 查询到信息以后结果返回
 */
export function getCallListenStatus(waiterId, callback, type, json) {
    let {ntoken,siteId,userId} = loginUserProxy(), 
    headUrl = Settings.getCallServerUrl(`monitor/${siteId}/query/${userId}/`),
    data = {userId, siteId, waiterId};

    return urlLoader(headUrl,{
        body: JSON.stringify(data),
        method: "post",
        headers: {token: ntoken}
    })
    .then(({jsonResult})=>{
        let {code, data} = jsonResult;
        if (code == 200) {
            callback(data.callStatus, type, json);
        } else {
            callback(-1);
        }
    });
}

/**
 * 获取监控统计数据
 */
export function getMonitorStatistics() {
    return dispatch=>{
        let {ntoken,siteId,userId} = loginUserProxy(),
        headUrl = Settings.getCallServerUrl(`monitor/${siteId}/statistics/${userId}/`,`?siteId=${siteId}&userId=${userId}`);
        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
               .then(({jsonResult})=>{
                    let {data,msg} = jsonResult;
                        dispatch({
                            type:GET_MONITOR_STATICS,
                            data:data||{},
                            msg
                        });
               });
    }
} 

export function updateCallListenRecord(data) {
    return dispatch=>{
        dispatch({
            type:UPDATE_CALLLISTEN_RECORD,
            data:data||{}
        });
    }
}

// --------------------------Reducer-------------------------------------
let initState = Map({
	progress: LoadProgressConst.LOAD_COMPLETE
});

initState = initState.set("callListenRecord", {});
initState = initState.set("monitorstatic",{});
initState = initState.set("receptionlist",[]);

export default function callListenReducer(state = initState,action) {
    switch(action.type) {
        case GET_MONITOR_STATICS:
            return state.set("monitorstatic", action.data)
                        .set("msg", action.msg);

        case GET_CALLLISTEN_RECORD:
            return state.set("calllistenRecord", action.data)
                        .set("progress", action.progress)
                        .set("msg", action.msg);

        case UPDATE_CALLLISTEN_RECORD:
            return state.set("calllistenRecord", {...action.data});

        case GET_RECEPTION_LIST:
            return state.set("receptionlist",action.data);
            
        case CALLCENTER_PROGRESS:
            return state.set("progress",action.progress);
    }
    return state;
}
