import { Map, fromJS } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import Settings from "../../../../utils/Settings";
import { configProxy, loginUserProxy } from "../../../../utils/MyUtil";
import DatePickerComponent, { getTime } from "../../../record/public/DatePickerComponent";

const PROGRESS = "CALLCENTER_PROGRESS",
	GET_TABLE_HEADERS = "GET_TABLE_HEADERS",
	GET_SETTING_HEADERS = "GET_SETTING_HEADERS",
	GET_CALLOUT_RECORD = "GET_CALLOUT_RECORD",
	GET_INCOMING_RECORD = "GET_INCOMING_RECORD",
	GET_CALLOUT_UNANSWER_RECORD = "GET_CALLOUT_UNANSWER_RECORD",
	GET_INCOMING_UNANSWER_RECORD = "GET_INCOMING_UNANSWER_RECORD",
	GET_CALLRECORD_EXPORT = "GET_CALLRECORD_EXPORT",
	POST_TASK = "POST_TASK",
	GET_DISPLAY_HEADER = "GET_DISPLAY_HEADER",
	GET_SITE_GROUPS = "GET_SITE_GROUPS",
	UPDATE_DATE = "UPDATE_DATE_RECORD";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95945168

// /sitecenter/evs/{$siteId}/groups?accesstoken=XXX

export function getTableHeaders(callType, resultType)
{
	return dispatch => {
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOADING});
		
		let headUrl = Settings.getCallRecordHeadersUrl(callType, resultType),
			{ntoken} = loginUserProxy();
		
		return urlLoader(headUrl, {
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			
			if(!success)
				data = [];
			
			dispatch({
				type: GET_TABLE_HEADERS,
				data,
				msg,
				roloadFlag: false,
			})
		});
	}
}

export function getSitRecord(callType, resultType, headfield, type)
{
	return dispatch => {
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOADING});
		
		let headUrl = Settings.getCallRecordSitHeadersUrl(callType, resultType, headfield, type),
			{ntoken} = loginUserProxy();
		
		return urlLoader(headUrl, {
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
				roloadFlag = success;
			
			if(!success)
			{
				data = [];
				roloadFlag = false;
			}
			dispatch({
				type: GET_SETTING_HEADERS,
				data,
				msg,
				roloadFlag
				
			})
		});
	}
}

/**
 *  呼叫记录查询
 *  @param {int} callType
 *  @param {int} currentPage
 *  @param {int} startTime
 *  @param {int} endTime
 *  @param {int} callResult
 *  @param {int} pageSize
 * */
export function getCallRecord(callType = -1, currentPage = 1, startTime = '', endTime = '', resultType = -1, pageSize = 10)
{
	return dispatch => {
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOADING});
		let headUrl = Settings.getCallRecordListUrl(callType, currentPage, startTime, endTime, resultType),
			{ntoken} = loginUserProxy();
		
		return urlLoader(headUrl, {
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED,
				callType = "";
			
			if(data)
			{
				let {list} = data;
				let CalltypeSetting = ['呼入', '呼出']
				list = list.map(item => {
					item.callType = CalltypeSetting[item.callType];
				})
			}
			
			if(callType == 0 && resultType == 1)
			{
				callType = GET_INCOMING_RECORD;
			}
			else if(callType == 1 && resultType == 1)
			{
				callType = GET_INCOMING_UNANSWER_RECORD;
			}
			else if(callType == 0 && resultType == 0)
			{
				callType = GET_CALLOUT_RECORD;
			}
			else if(callType == 1 && resultType == 0)
			{
				callType = GET_CALLOUT_UNANSWER_RECORD;
			}
			
			dispatch({
				type: callType,
				progress,
				startTime,
				endTime,
				data,
				msg,
				roloadFlag: false,
			})
		});
	}
}

export function getCallRecordExprot(callId = "", callType, resultType, startTime, endTime)
{
	return dispatch => {
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOADING});
		
		let headUrl = Settings.getCallRecordExport(callId, callType, resultType, startTime, endTime),
			{ntoken} = loginUserProxy();
		
		return urlLoader(headUrl, {
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			
			if(!success)
				data = [];
			dispatch({
				type: GET_CALLRECORD_EXPORT,
				msg
			})
		});
	}
}

// 显示列 Display column
export function getDisplayColumn(callType = '', resultType = '', callback)
{
	return dispatch => {
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOADING});
		
		let headUrl = Settings.getCallRecordDisplayColumn(callType, resultType),
			{ntoken} = loginUserProxy();
		
		return urlLoader(headUrl, {
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			
			if(!success)
				data = [];

			dispatch({
				type: GET_DISPLAY_HEADER,
				msg,
				progress,
				data
			});
			
			if (success && callback) {
				callback();
			}
		});
	}
}

export function taskCallOutTask(formData)
{
	return dispatch => {
		
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOADING});
		
		let {siteId, userId, ntoken} = loginUserProxy(),
			url = `${configProxy()._xNccRecordServer}/task/${siteId}`;
		formData.userId = userId;
		return urlLoader(url, {
			body: JSON.stringify(formData),
			method: "post",
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			dispatch({
				type: POST_TASK,
				progress,
				data,
				msg,
			})
		});
	}
}

export function updateDate(startTamp, endTamp, selectValue)
{
	return dispatch => {
		dispatch({type: UPDATE_DATE, data: {startTamp, endTamp, selectValue}});
	}
}

// --------------------------Reducer-------------------------------------
let initState = Map({progress: 1});

initState = initState.set("incomingRecord", {});
initState = initState.set("calloutRecord", {});
initState = initState.set("incomingUnanswerRecord", {});
initState = initState.set("calloutUnanswerRecord", {});
initState = initState.set("tableHeaders", []);
initState = initState.set("tableDataList", {});
initState = initState.set("groupDataList", []);
initState = initState.set("displayColumnList", []);
initState = initState.set("callRecordReloadFlag", false);

let [startTamp, endTamp] = getTime(DatePickerComponent.TODAY);

initState = initState.set("datePicker", {startTamp, endTamp, selectValue: "今天"});

export default function callRecordReducer(state = initState, action) {
	
	switch(action.type)
	{
		case GET_TABLE_HEADERS:
			return state.set("tableHeaders", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
			.set("callRecordReloadFlag", action.roloadFlag);
		
		case GET_SETTING_HEADERS:
			return state.set("progress", action.progress)
			.set("msg", action.msg)
			.set("callRecordReloadFlag", action.roloadFlag);
		
		case GET_CALLOUT_RECORD:
		case GET_INCOMING_RECORD:
		case GET_CALLOUT_UNANSWER_RECORD:
		case GET_INCOMING_UNANSWER_RECORD:
			return state.set("tableDataList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
			.set("callRecordReloadFlag", action.roloadFlag);
		
		case UPDATE_DATE:
			return state.set("datePicker", action.data);
		
		case GET_SITE_GROUPS:
			return state.set("groupDataList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg)
			.set("callRecordReloadFlag", action.roloadFlag);
		
		case GET_CALLRECORD_EXPORT:
			return state.set("progress", action.progress)
			.set("msg", action.msg);
		
		case POST_TASK:
			return state.set("progress", action.progress)
			.set("msg", action.msg);
		
		case GET_DISPLAY_HEADER:
			return state.set("displayColumnList", action.data)
			.set("msg", action.msg)
			.set("progress", action.progress);
		
		case PROGRESS:
			return state.set("progress", action.progress);
	}
	
	return state;
}
