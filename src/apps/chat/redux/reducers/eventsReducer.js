import {
	SENDMESSAGE, TABSELECTED, TABCLOSED, UI_REQUEST_COOPERATE, UI_REQUEST_COOPERATE_ACTION,
	UI_REQUEST_SUBMIT_SUMMARY, UI_REQUEST_EVALUATION
} from '../../../../model/vo/actionTypes';
import ChatStatus from "../../../../model/vo/ChatStatus";

/**
 * 发送消息
 * @param {Array} params [{消息内容}, type=消息类型]
 * */
export function sendMessage(params)
{
	return dispatch =>
	{
		dispatch({type: SENDMESSAGE, params});
	};
}

/**
 * 发起协同会话
 * @param {Array} params [tabName, coopType, toUsers]
 * */
export function requestCooperate(params)
{
	return dispatch =>
	{
		dispatch({type: UI_REQUEST_COOPERATE, params});
	};
}

/**
 * 发起协同操作
 * @param {Array} params [tabName, operation]
 * */
export function requestCooperateAction(params)
{
	return dispatch =>
	{
		dispatch({type: UI_REQUEST_COOPERATE_ACTION, params});
	};
}

/**
 * 会话列表-选中标签
 * @param {String} tabName 会话标签名称
 * */
export function tabSelected(tabName)
{
	return dispatch =>
	{
		dispatch({type: TABSELECTED, params: tabName});
	};
}

/**
 * 关闭会话
 * @param {Array} params [tabName]
 * */
export function tabClosed(params)
{
	return dispatch =>
	{
		dispatch({type: TABCLOSED, params});
	};
}

export function commonEvent(type, data)
{
	return dispatch =>
	{
		dispatch({
			type,
			params: data
		});
	};
}

/**
 * 提交咨询总结
 * @param {Array} params [summary, remark, tabName = "-1"]
 * */
export function submitSummary(params)
{
	return dispatch =>
	{
		dispatch({
			type: UI_REQUEST_SUBMIT_SUMMARY,
			params
		});
	};
}

/**
 * 发起会话评价请求
 * */
export function requestEvaluate()
{
	return dispatch =>
	{
		dispatch({
			type: UI_REQUEST_EVALUATION,
			params: []
		});
	};
}

//----------------------------Reducer--------------------------------------

export default function eventsReducer(state = {}, action)
{
	if(!action.params)
	{
		return state;
	}
	
	return action;
}