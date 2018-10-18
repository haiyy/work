import { Map } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../utils/MyUtil";
import Settings from '../../../../utils/Settings';

//接口地址
//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95946476

const VISITPLAN_PROGRESS = 'VISITPLAN_PROGRESS',
	VISITPLAN_GET_LIST = 'VISITPLAN_GET_LIST',
	VISITPLAN_GET_TIMES = 'VISITPLAN_GET_TIMES',
	UPDATE_DATE = "UPDATE_DATE_RECORD",
	VISITPLAN_OPERATION = 'VISITPLAN_OPERATION';

/**
 *  回访计划 列表
 *  @param {String} userId //   企业ID
 *  @param {int} result //      通话类型：0呼入，1呼出
 *  @param {int} startTime //   开始时间
 *  @param {int} endTime //     截止时间
 *  @param {int} currentPage // 当前页码
 *  @param {int} pageSize //    每页显示数量，默认是10
 * */
export function getVisilPlanList(result = 1, startTime = -1, endTime = -1, currentPage = 1, pageSize = 10)
{
    return dispatch => {
        dispatch({type: VISITPLAN_PROGRESS, progress: LoadProgressConst.LOADING});

        let {ntoken,siteId,userId} = loginUserProxy(),
        headUrl = Settings.getVisitPlanUrl(`${siteId}/list/${userId}`,`?result=${result}&startTime=${startTime}&endTime=${endTime}&currentPage=${currentPage}&pageSize=${pageSize}`);

        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
            .then(({jsonResult}) => {
                let {code, data, msg} = jsonResult,
                    success = code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
                if(!success) {
                    data = {};
                } else {
                    // let {list} = data;
                    // if (list) {
                    //     list=list.map(item=>{
                    //         item.phoneNumber=phonetype(item.phoneNumber)
                    //     })
                    // }
                }
                dispatch({
                    type: VISITPLAN_GET_LIST,
                    data,
                    msg,
                    progress,
                    roloadFlag:false,
                })
            });
    }
}

// /plan/add/{userId}
/**
 *  回访计划 操作
 *  @param {String} planId //
 *  @param {String} action //    delete/execute/change
 *  @param {long}   planTime //
 * */
export function operationVisilPlanList(data)
{
	return dispatch => {

		dispatch({type: VISITPLAN_PROGRESS, progress: LoadProgressConst.LOADING});

        let {ntoken} = loginUserProxy(),
        url = Settings.getVisitPlanUrl(`operation/${data.planId}`);
		return urlLoader(url, {
			body: JSON.stringify(data),
            method: "post",
            headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, msg} = jsonResult,
                progress = code == 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED,
                roloadFlag=progress;

            if (code == 200&&data.action == "change") {//修改成功
                progress = LoadProgressConst.LOAD_COMPLETE;
                dispatch({
                    type: VISITPLAN_OPERATION,
                    progress,
                    msg,
                    roloadFlag,
                    plan:data
                })
            } else {
                dispatch({
                    type: VISITPLAN_PROGRESS,
                    progress,
                    msg,
                    roloadFlag
                })
            }
		});
	}
}

// /plan/visit/times/{userId}
/**
 *  回访计划 获取未执行数量  注:!!!未使用!!!
 *  @param {String} userId //
 * */

export function getTimesVisilPlanList()
{
	return dispatch => {
		dispatch({type: VISITPLAN_PROGRESS, progress: LoadProgressConst.LOADING});

		let userId = loginUserProxy().userId, headUrl = `/plan/visit/times/${userId}`;

		return urlLoader(headUrl)
		.then(({jsonResult}) => {
			jsonResult = {
				"msg": "ok",
				"code": 200,
				"data": {
					"times": 792
				}
			}

			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			if(!success)
				data = [];
			dispatch({
				type: VISITPLAN_GET_TIMES,
				data,
				msg
			})
		});
	}
}



export function updateProgress() {
    return dispatch=>{
        dispatch({
            type: VISITPLAN_PROGRESS,
            msg: "",
            progress: LoadProgressConst.LOAD_COMPLETE
        });
    }
}

export function updateDate(startTamp, endTamp, selectValue)
{
	return dispatch => {
		dispatch({type: UPDATE_DATE, data: {startTamp, endTamp, selectValue}});
	}
}

let initState = Map({progress: LoadProgressConst.LOAD_COMPLETE});
initState = initState.set("dataList", {});
initState = initState.set("recordList", {});
initState = initState.set("visitPlanReloadFlag",false);

export default function visitPlanReducer(state = initState, action) {
    switch(action.type){
        case VISITPLAN_GET_LIST:
        return state.set("dataList",action.data)
                .set("progress", action.progress)
                .set("visitPlanReloadFlag",action.reloadFlag)
                .set("msg", action.msg);

        case VISITPLAN_OPERATION:
            let dataList = state.get("dataList")||{};
            if (dataList.list&&dataList.list.length>0) {
                for (let i = 0;i < dataList.list.length;i++) {
                    if (dataList.list[i].planId == action.plan.planId) {
                        dataList.list[i].planTime = action.plan.planTime;
                        dataList.list[i].remarks = action.plan.remarks;
                        break;
                    }
                }
            }
            return state.set("dataList",dataList)
                    .set("progress", action.progress)
                    .set("visitPlanReloadFlag",action.reloadFlag)
                    .set("msg", action.msg);

        case UPDATE_DATE:
            return state.set("datePicker", action.data);
            
        case VISITPLAN_PROGRESS:
            return state.set("progress", action.progress)
                        .set("msg",action.msg);


    }
        return state

}
