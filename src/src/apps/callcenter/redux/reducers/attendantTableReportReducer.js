import { Map } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95947617#id-%E5%91%BC%E5%8F%AB%E5%B9%B3%E5%8F%B0-%E5%9D%90%E5%B8%AD%E7%8A%B6%E6%80%81%E4%BA%8B%E4%BB%B6API%E5%AE%9A%E4%B9%89-2.4%E6%9F%A5%E8%AF%A2%E8%80%83%E5%8B%A4%E4%BF%A1%E6%81%AF

const GET_ATTENDANCETABLE_DATA = "GET_ATTENDANCETABLE_DATA",//查询考勤信息
      ATTENDANCE_PROGRESS = "ATTENDANCE_PROGRESS";

/**
 * 查询考勤信息
 * @param {list} userIds 需要查询的userId,不传为查询所有
 * @param {long} startTime 开始时间(这天开始时间戳)
 * @param {long} endTime 结束时间戳（这个和上面的如果都不传则查询当天）
 * @param {int} currentPage 当前页，不传为1
 * @param {int} pageSize 不传为10
 */
export function getAttendanceData(userIds, startTime, endTime, currentPage = 1, pageSize=10) {
    return dispatch => {
        let {ntoken, siteId, userId} = loginUserProxy(),
            url = Settings.getCallServerUrl(`${siteId}/attendance/${userId}`,`?accessToken=${ntoken}`),
            data = { userIds, startTime, endTime, currentPage, pageSize};

        return urlLoader(url, {
            // headers: {token: ntoken},
            body: JSON.stringify(data),
            method: "post"
        })
        .then(({jsonResult})=>{
            let {code, msg, data} = jsonResult,
            progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

            dispatch({
                type: GET_ATTENDANCETABLE_DATA,
                msg,
                data: data || {},
                progress
            });
        });
    }
}

let initState = Map({
    progress:LoadProgressConst.LOAD_COMPLETE
});

initState = initState.set("attendanceDataList",{});

export default function attendantTableReportReducer(state = initState, action) {
    switch(action.type) {
        case GET_ATTENDANCETABLE_DATA:
            return state.set("attendanceDataList", action.data)
                .set("progress", action.progress)
                .set("msg", action.msg);
            
        case ATTENDANCE_PROGRESS:
            return state.set("progress", action.progress);
    } 
    return state;
}