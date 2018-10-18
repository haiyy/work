import { Map } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { configProxy, loginUserProxy } from "../../../../utils/MyUtil";
import { phonetype } from "../../../../utils/StringUtils";
import moment from "moment";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95946458
const CALLOUT_TASK_PROGRESS = "PROGRESS_CALLOUTTASK",
	GET_CALLOUT_TASK = "GET_CALLOUT_TASK",
	GET_CALLOUT_TASK_DETAILS = "GET_CALLOUT_TASK_DETAILS",
	PUT_CALLOUT_TASK = "PUT_CALLOUT_TASK",
	ENCLOSURE_CALLOUT_TASK = "ENCLOSURE_CALLOUTTASK",
	QUERY_CALLOUT_TASK = "QUERY_CALLOUTTASK",
	EXPORTEXCEL_CALLOUT_TASK = "EXPORTEXCEL_CALLOUT_TASK",
	EXPORTEXCEL_DETAILS = "EXPORTEXCEL_DETAILS",
	UPDATE_CALLOUT_TASK = "UPDATE_CALLOUT_TASK",
    DOWNLOAD_CALLOUT_TASK="DOWNLOAD_CALLOUT_TASK",
	SITTABLE_CALLOUT_TASK = "SITTABLE_CALLOUT_TASK";

/**
 *   外呼任务
 *  @param {String} siteId //企业ID
 *  @param {String} resource //来源    1客户中心；2呼损列表；3客户导入；4外呼接口；5营销外呼
 *  @param {int} status //状态    1待分配；2未开始；3进行中；4已完成；5已过期；6滞后完成；7暂停
 *  @param {int} taskName //任务名称
 *  @param {int} currentPage  //当前页，默认1
 *  @param {int} pageSize //每页的条数，默认10
 * */
export function getCallOutTaskList(resource = -1, status = -1, taskName = '', currentPage = 1, pageSize = 10)
{
	return dispatch => {

		dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

		let {siteId, ntoken,userId} = loginUserProxy(),
			headUrl = `${configProxy().xNccRecordServer}/tasks/${siteId}/?userId=${userId}&resource=${resource}
			&status=${status}&taskName=${taskName}&currentPage=${currentPage}&pageSize=${pageSize}`;

		return urlLoader(headUrl,{
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

			//fifter 后的数据

			dispatch({
				type: GET_CALLOUT_TASK,
				data,
				msg,
				progress,
                roloadFlag:false,
			})
		});
	}
}

/**
 *  通话记录 外呼任务
 *  @param {String} siteId //企业ID
 *  @param {String} taskName //任务名称
 *  @param {int} startTime //开始时间
 *  @param {int} endTime //截止时间
 *  @param {int} describe    //描述
 *  @param {int} enclosure //附件
 *  @param {int} userIds //客服
 *  @param {int} hideNumberEnabled //隐号设置(0:启用；1:停用)
 * */
export function enclosureCallOutTask(formData)
{
	return dispatch => {

		dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

		let {siteId, userId,ntoken} = loginUserProxy(),
			url = `${configProxy().xNccRecordServer}/task/${siteId}`;
		formData.userId = userId;
		return urlLoader(url, {
			body: JSON.stringify(formData),
			method: "post",
            headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
                roloadFlag=false;

            if(code == 200){
                   roloadFlag=true;
               }
			dispatch({
				type: ENCLOSURE_CALLOUT_TASK,
				progress,
				data,
				msg,
                roloadFlag
			})
		});
	}
}

/**
 *  通话记录 导出
 *  @param {String} siteid //  企业ID
 *  @param {String} resource //来源   1客户中心；2呼损列表；3客户导入；4外呼接口；5营销外呼
 *  @param {int}    status //        1待分配；2未开始；3进行中；4已完成；5已过期；6滞后完成；7暂
 *  @param {String} taskName //      任务名称
 * */
export function exportExcelCalloutTask(resource='',status='',taskName='')
{
    return dispatch=>{
        let {userId,siteId} = loginUserProxy(),

            url = `${configProxy().xNccRecordServer}/tasks/export/${siteId}/?userId=${userId}&resource=${resource}&status=${status}&taskName=${taskName}`;

            return url;
    }
}


/**
 *  坐席任务  导出
 *  @param {String} taskId //
 *  @param {key} resource //  客户名称/电话号码
 * */
export function exportExcelDetails(key)
{
	return dispatch => {

		dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

		let {siteId,ntoken} = loginUserProxy(),
			url = `${configProxy().xNccRecordServer}/tasks/items/export/${siteId}/?key=${key}`;
		return urlLoader(url,{
            headers: {token: ntoken}
        })
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			dispatch({
				type: EXPORTEXCEL_DETAILS,
				progress,
				msg,
			})
		});
	}
}

/**
 *  通话记录 外呼任务 操作
 *  @param {String} taskId //任务ID
 *  @param {String} action //delete/stop/start
 * */
export function updateCalloutTask(taskId, types)
{
	return dispatch => {

		dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

		let url = `${configProxy().xNccRecordServer}/task/u/${taskId}`,
            {siteId,ntoken} = loginUserProxy(),
			datas = {
				action: types
			};
		return urlLoader(url, {
			body: JSON.stringify(datas),
			method: "post",
            headers: {token: ntoken}

        })
		.then(({jsonResult}) => {
			let {code, msg} = jsonResult,
				progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
                roloadFlag=false;

            if(code == 200){
                roloadFlag=true;
            }

			dispatch({
				type: UPDATE_CALLOUT_TASK,
				progress,
				msg,
                roloadFlag
			})
		});
	}
}

/**
 *  通话记录 外呼任务查看
 *  @param {String} taskId //任务ID
 * */
export function queryCallOutTask(taskId)
{
	return dispatch => {

		dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

		let url = `${configProxy().xNccRecordServer}/task/details/${taskId}`,
            {siteId,ntoken} = loginUserProxy();

            return urlLoader(url,{
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
				type: QUERY_CALLOUT_TASK,
				progress,
				data,
				msg,
				taskId,
			})
		});
	}
}

/**
 *  通话记录 外呼任务 坐席列表
 *  @param {String} taskId //任务ID
 *  @param {int} type // 未接通0；已接通1；未呼叫2
 *  @param {int} key // 访客名称/电话号码
 *  @param {String} userId // 坐席ID
 *  @param {int} currentPage // 默认1
 *  @param {int} pageSize // 默认10
 * */
export function sitTableCallOutTask(taskId, type = -1, key = '', currentPage = 1, pageSize = 10)
{
	return dispatch => {

		dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

		let {ntoken,siteId} = loginUserProxy(),
			url = `${configProxy().xNccRecordServer}/tasks/items/${taskId}/?type=${type}&key=${key}&currentPage=${currentPage}&pageSize=${pageSize}`;
		return urlLoader(url,{
            headers: {token: ntoken}
        })
		.then(({jsonResult}) => {

			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			if(!success)
			{
				data = {}
			}


			dispatch({
				type: SITTABLE_CALLOUT_TASK,
				progress,
				data,
				msg,
			})
		});
	}
}

//修改


export function CalloutTaskPut(taskId,form)
{
    return dispatch => {

        dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

        let {userId,siteId,ntoken} = loginUserProxy(),
            url = `${configProxy().xNccRecordServer}/task/${taskId}`;

        form.siteId=siteId;
        form.userId=userId;

        return urlLoader(url, {
            body: JSON.stringify(form),
            method: "put",
            headers: {token: ntoken}

        }).then(({jsonResult}) => {
                let {code, msg} = jsonResult,
                    progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
                    roloadFlag=false;

                if(code == 200){
                    roloadFlag=true;
                }

                dispatch({
                    type: PUT_CALLOUT_TASK,
                    progress,
                    msg,
                    roloadFlag
                })
            });
    }
}
//下载模板
export function downloadTemplate()
{
    return dispatch => {

        dispatch({type: CALLOUT_TASK_PROGRESS, progress: LoadProgressConst.LOADING});

        let   url = `${configProxy().xNccRecordServer}/task/downloadTemplate`;
        return urlLoader(url)
            .then(({jsonResult}) => {

                let {code,msg} = jsonResult,
                    success = code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
                if(!success)
                {
                    data = {}
                }



                dispatch({
                    type: DOWNLOAD_CALLOUT_TASK,
                    progress,
                    msg,
                })
            });
    }
}

// --------------------------Reducer-------------------------------------
let initState = Map({
	progress: 1
});
initState = initState.set("dataList", {},);
initState = initState.set("queryList", {},);
initState = initState.set("sitList", {},);
initState = initState.set("taskId", "")
initState = initState.set("calloutTaskReloadFlag",false);
export default function callOutTaskReducer(state = initState, action) {

	switch(action.type)
	{
		case GET_CALLOUT_TASK:
			return state.set("dataList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
            .set("calloutTaskReloadFlag",action.roloadFlag)

		case ENCLOSURE_CALLOUT_TASK:
			return state.set("progress", action.progress)
			.set("msg", action.msg)
            .set("calloutTaskReloadFlag",action.roloadFlag)

		case  QUERY_CALLOUT_TASK:
			return state.set("queryList", action.data)
			.set("progress", action.progress)
			.set("taskId", action.taskId)
			.set("msg", action.msg);

		case EXPORTEXCEL_CALLOUT_TASK:
			return state.set("progress", action.progress)
			.set("msg", action.msg)

        case PUT_CALLOUT_TASK:
            return state.set("progress", action.progress)
                .set("msg", action.msg)
                .set("calloutTaskReloadFlag",action.roloadFlag)

		case UPDATE_CALLOUT_TASK:
			return state.set("progress", action.progress)
			.set("msg", action.msg)
            .set("calloutTaskReloadFlag",action.roloadFlag)

		case SITTABLE_CALLOUT_TASK:
			return state.set("sitList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
        case DOWNLOAD_CALLOUT_TASK:
            return state.set("progress", action.progress)
            .set("msg", action.msg)

		case EXPORTEXCEL_DETAILS:
			return state.set("progress", action.progress)
			.set("msg", action.msg)
	}

	return state
}
