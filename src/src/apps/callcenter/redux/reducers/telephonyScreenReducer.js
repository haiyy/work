import { Map, List } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader, urlLoaderForTimeout } from "../../../../lib/utils/cFetch";
import { configProxy, loginUserProxy } from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";
import { message } from 'antd';
import { getWoPassCode } from "../../../../utils/PhoneUtils";

//接口地址
//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95945168
const TELEPHONYSCREEN_PROGRESS = 'TELEPHONYSCREEN_PROGRESS',
	TELEPHONYSCREEN_PROGRESS_GET_LIST = 'TELEPHONYSCREEN_PROGRESS_GET_LIST',
	TELEPHONYSCREEN_PROGRESS_PUT = 'TELEPHONYSCREEN_PROGRESS_PUT',
	TELEPHONYSCREEN_FLAG = "TELEPHONYSCREEN_FLAG",
	TELEPHONY_CALLRECORD_GET_LIST = "TELEPHONY_CALLRECORD_GET_LIST",
	TELEPHONY_VISITPLAN_ADD = "TELEPHONY_VISITPLAN_ADD",
	TELEPHONY_HISTORY_GET_LIST = "TELEPHONY_HISTORY_GET_LIST",
	GET_WO_PASSCODE = "GET_WO_PASSCODE",
	SET_CUSTOMID = "SET_CUSTOMID",
	GET_CRM_PASSCODE = "GET_CRM_PASSCODE",
	GET_CRM_USERINFO = "GET_CRM_USERINFO",
	GET_WO_LIST = "GET_WO_LIST",
	GET_WO_LIST_PROGRESS = "GET_WO_LIST_PROGRESS",
	CONSULTATIONRELOAD = "CONSULTATIONRELOAD",
	VISITPLAN_HISTORY_RECORD = "VISITPLAN_HISTORY_RECORD",
	SETBRAEDCRUNB_FLAG = "SETBRAEDCRUNB_FLAG",
	PHONE_CALL_CHANGE = "PHONE_CALL_CHANGE";

/**
 *  电话弹屏幕 通话记录
 *  @param {String} userId //       坐席ID
 *  @param {String} taskId //       任务ID
 *  @param {String} callNumber //   通话号码
 *  @param {int} callType //     呼叫类型：0:呼入，1:呼出
 * */
//getPhoneRecord
export const getListTelephony = (callNumber, currentPage = 1, pageSize = 10) => dispatch => {
	dispatch({type: TELEPHONYSCREEN_PROGRESS, progress: LoadProgressConst.LOADING});
	
	let {siteId, userId, ntoken} = loginUserProxy(),
		headUrl = `${configProxy()._xNccRecordServer}/callrecord/${siteId}/history/record/${callNumber}?userId=${userId}&currentPage=${currentPage}&pageSize=${pageSize}`;
	
	return urlLoader(headUrl, {
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
			type: TELEPHONYSCREEN_PROGRESS_GET_LIST,
			data,
			msg,
			reloadFlag: false,
			progress
		})
	});
}

/**
 *  回访计划 添加
 *  @param {String} userId //
 *  @param {String} vistorName //
 *  @param {long}   phoneNumber //
 *  @param {long}   planTime //
 *  @param {long}   remarks //
 *  @param {long}   siteId //
 * */
export const addVisilPlan = (data) => dispatch => {
	
	dispatch({type: TELEPHONYSCREEN_PROGRESS, progress: LoadProgressConst.LOADING});
	
	let {siteId, ntoken} = loginUserProxy(),
		url = Settings.getVisitPlanUrl(`add/${loginUserProxy().userId}`);
	data.siteId = siteId;
	
	return urlLoader(url, {
		body: JSON.stringify(data),
		method: "post",
		headers: {token: ntoken}
	})
	.then(({jsonResult}) => {
		let {code, data, msg} = jsonResult,
			reloadFlag = false,
			progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
		if(code == 200)
		{
			reloadFlag = true;
			message.success(msg);
		}
		else
		{
			reloadFlag = false;
			message.error(msg);
		}
		dispatch({
			type: TELEPHONY_VISITPLAN_ADD,
			progress,
			msg,
			reloadFlag
		})
	});
}

/**
 *  呼叫详细记录查询  该接口可用于查询呼叫记录的基本信息。
 *  @param {String} userId //客服ID
 *  @param {int} siteId //   企业ID
 *  @param {int} callId //   通话ID
 *  @param {int} accesstoken //
 * */
export const getCallRecordDetails = (callId, flag) => dispatch => {
	
	dispatch({type: TELEPHONYSCREEN_PROGRESS, progress: LoadProgressConst.LOADING});
	
	let {siteId, userId, ntoken} = loginUserProxy(),
		headUrl = `${configProxy()._xNccRecordServer}/callrecord/${siteId}/scream/${callId}?userId=${userId}`;
	
	//接口需要修改
	return urlLoader(headUrl, {
		headers: {token: ntoken}
	})
	.then(({jsonResult}) => {
		
		let {code, data, msg} = jsonResult,
			success = code == 200,
			progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
		
		dispatch({
			type: TELEPHONY_CALLRECORD_GET_LIST,
			data: data || {},
			msg,
			flag,
			progress
		})
	});
}

/**
 *  历史回访计划
 *  @param {String} userId //    坐席ID
 *  @param {String} callNumber //    电话号码
 *  @param {long}   siteId //    企业ID
 * */
export const getHistoryList = (callNumber, currentPage = 1, pageSize = 10) => dispatch => {
	dispatch({type: TELEPHONYSCREEN_PROGRESS, progress: LoadProgressConst.LOADING});
	let {siteId, userId, ntoken} = loginUserProxy(),
		headUrl = `${configProxy()._xNccRecordServer}/plan/visit/history/${callNumber}?siteId=${siteId}&userId=${userId}&currentPage=${currentPage}&pageSize=${pageSize}`
	
	return urlLoader(headUrl, {
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
			type: TELEPHONY_HISTORY_GET_LIST,
			data,
			msg,
			reloadFlag: false,
			progress
		})
	});
}

export function phoneCallChange(data)
{
	return dispatch => {
		dispatch({type: PHONE_CALL_CHANGE, data});
	}
}

export const setscreenFlag = (flagType = false) => dispatch => {
	
	dispatch({
		type: TELEPHONYSCREEN_FLAG,
		flag: flagType
	})
}

export const setBraedCrumbFlag = (flagType = false) => dispatch => {
	
	dispatch({
		type: SETBRAEDCRUNB_FLAG,
		flag: flagType
	})
}

export function updateCustomId(value)
{
	return dispatch => {
		dispatch({type: SET_CUSTOMID, data: value});
	}
}

export function getWoList(customerId, pageIndex = 0)
{
	return dispatch => {
		dispatch({type: GET_WO_LIST_PROGRESS, progress: LoadProgressConst.LOADING});
		
	

		let {siteId} = loginUserProxy(),
			url = Settings.getSearchWorkOrderForCRM(),
			body = {
				siteId,
				customerId,
				pageIndex,
				pageSize: 10,
				likeName: ""
			};
		
		return urlLoaderForTimeout(url, {
			method: 'post', body: JSON.stringify(body)
		}, "application/json; charset=UTF-8", 10000)
		.then(({jsonResult}) => {
			let {count, data} = jsonResult;
			
			dispatch({
				type: GET_WO_LIST,
				data: data || [],
				count: count || 0,
				progress: LoadProgressConst.LOAD_COMPLETE
			})
		});
	}
}

export function callRecordHistory(callNumber, currentPage = 1)
{
	return dispatch => {
		dispatch({type: TELEPHONYSCREEN_PROGRESS, progress: LoadProgressConst.LOADING});
		
		let {userId, siteId, ntoken} = loginUserProxy(),
			headUrl = `${configProxy()._xNccRecordServer}/callrecord/${siteId}/callNumber/${callNumber}?userId=${userId}&currentPage=${currentPage}`;
		
		return urlLoader(headUrl, {
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			
			if(!success)
			{
				data = [];
			}
			
			dispatch({
				type: VISITPLAN_HISTORY_RECORD,
				data,
				msg,
			})
		});
	}
}

export function editConsultationReload()
{
	return dispatch => {
		dispatch({
			type: CONSULTATIONRELOAD,
			reloadFlag: true
		})
		
	}
}

// --------------------------Reducer-------------------------------------

let initState = Map({progress: LoadProgressConst.LOAD_COMPLETE,});
initState = initState.set("dataList", {});  //
initState = initState.set("recordList", {});
initState = initState.set("screenFLag", false);
initState = initState.set("braedCurnbFLag", false);
initState = initState.set("visitList", {});
initState = initState.set("crmPasscode", "");
initState = initState.set("woPasscode", "");
initState = initState.set("customId", "");
initState = initState.set("crmInfo", {});
initState = initState.set("woList", {progress: 2, list: [], count: 0});
initState = initState.set("phoneCallInfo", {});
initState = initState.set("recordInfoList", {});
initState = initState.set("telePhonyreloadFlag", false);
initState = initState.set("consultationreloadFlag", false);

let recordInfo = {};

export default function telephonyScreenReducer(state = initState, action) {
	switch(action.type)
	{
		case GET_CRM_PASSCODE:
			return state.set("crmPasscode", action.data);
		
		case GET_WO_PASSCODE:
			return state.set("woPasscode", action.data);
		
		case TELEPHONYSCREEN_PROGRESS_GET_LIST:
			return state.set("dataList", action.data)
			.set("progress", action.progress)
			.set("consultationreloadFlag", action.reloadFlag)
			.set("msg", action.msg);
		
		case TELEPHONYSCREEN_FLAG:
			return state.set("screenFLag", action.flag);
		case CONSULTATIONRELOAD:
			return state.set("consultationreloadFlag", action.reloadFlag)
		
		case SETBRAEDCRUNB_FLAG:
			return state.set("braedCurnbFLag", action.flag);
		
		case TELEPHONY_HISTORY_GET_LIST:
			return state.set("visitList", action.data)
			.set("progress", action.progress)
			.set("telePhonyreloadFlag", action.reloadFlag)
			.set("msg", action.msg);
		
		case TELEPHONY_CALLRECORD_GET_LIST:
			if(action.flag)
			{
				state = state.set("recordInfoList", action.data);
			}
			else
			{
				state = state.set("recordListWithCallId", action.data)
			}
			return state.set("progress", action.progress)
			.set("msg", action.msg);
		
		case TELEPHONY_VISITPLAN_ADD:
			return state.set("progress", action.progress)
			.set("telePhonyreloadFlag", action.reloadFlag)
			.set("msg", action.msg);
		
		case TELEPHONYSCREEN_PROGRESS:
			return state.set("progress", action.progress);
		
		case GET_WO_LIST:
			var woList = {};
			woList.progress = action.progress;
			woList.list = action.data;
			woList.count = action.count;
			
			return state.set("woList", woList);
		
		case GET_WO_LIST_PROGRESS:
			let woList = state.get("woList");
			woList.progress = action.progress;
			
			return state.set("woList", woList);
		
		case PHONE_CALL_CHANGE:
			let phonenumber = state.get("phoneCallInfo").phonenumber,
				newPhonenumber = action.data.phonenumber;
			
			//前后不是一个电话是需要重新查询customId
			if(phonenumber !== newPhonenumber)
			{
				state = state.set("customId", "")
				.set("woPasscode", "");
			}
			
			return state.set("phoneCallInfo", action.data);
		
		case SET_CUSTOMID:
			return state.set("customId", action.data)
			.set("woPasscode", getWoPassCode(action.data));
		
		case VISITPLAN_HISTORY_RECORD:
			return state.set("recordList", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg);
		
		case GET_CRM_USERINFO:
			return state.set("crmInfo", action.data);
	}
	
	return state
}
