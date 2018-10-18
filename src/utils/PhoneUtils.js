import App from "../apps/App";
import { v4 } from "uuid";
import { loginUserProxy } from "./MyUtil";
import { Encrypt } from "../apps/callcenter/lib/AES";
import { serverTimeGap } from "./ConverUtils";

/**
 * type, callid, targetUserId, targetAttendantAccount, targetAttendantNumber, caller, callee
 * type    int        0：监听 1：强插 2：强拆 3：强制置闲 4：强制置忙 5：强制签出 6：停止监听
 * callid    String        呼叫唯一标示(3,4,5为空)
 * targetUserId    String        客服ID
 * targetAttendantAccount    String        坐席工号
 * targetAttendantNumber    String        坐席分机号
 * caller    String        主叫号码(3,4,5为空)
 * callee    String        被叫号码(3,4,5为空)
 * */
export function callManager(paramsObj)
{
	if(App.phoneCall)
	{
		App.phoneCall.callManager(paramsObj);
		
	}
}

/**
 * 挂断当前会话
 * */
export function releaseCall()
{
	if(App.phoneCall)
	{
		App.phoneCall.releaseCall();
	}
}

/**
 * 呼叫内部坐席
 * @param type {int}  0：工号，1：分机号，2：客服ID
 * @param number {number} 坐席号码
 * */
export function callInner(type, number)
{
	if(App.phoneCall)
	{
		App.phoneCall.callInner(type, number);
	}
}

/**
 * 外呼电话号码
 * @param callee {string} 外呼电话号码
 * @param dspNumber {string} 外显
 * @param sourceType {string} 0：正常外呼 2：通过外呼任务外呼 1：通过回访计划外呼 3：通过crm外呼 4：通过互动记录外呼
 * @param sourceData {string} 调用外呼接口时携带的数据，如外呼任务ID，回访计划ID，sourceType为1或者2时sourceData不能为空，其他时候为空
 * */
export function callOut(callee, dspNumber = "", sourceType=0, sourceData="", )
{
	if(App.phoneCall)
	{
		App.phoneCall.callOut(callee, dspNumber, sourceType, sourceData);
	}
}

/**
 * 设置坐席状态
 * @param {int} value
 * @example
 * FREE = 210;  //正常置闲状态，可以接打电话
 * BUSY = 310;  //正常置忙状态，不可以接电话，可以打电话
 * REST = 320;  //不可以接电话，可以打电话
 * MEETING = 330;  //会议状态，不可以接电话，可以打电话
 * LOGOUT = 10;  //正常签出状态
 * */
export function setStatus(value, reason = "normal")
{
	if(App.phoneCall)
	{
		App.phoneCall.setStatus(value, reason);
	}
}

/**
 * 获取当前状态
 * disconnect为电话不可用
 * */
export function getStatus()
{
	if(App.phoneCall)
	{
		return App.phoneCall.status;
	}
	
	return "disconnect";
}

/**
 * 是否正在接听电话
 */
export function isInTheCall()
{
	if (App.phoneCall)
	{
		return App.phoneCall.isInTheCall;
	}

	return false;
}

/**
 * @param {String} type eventType
 * @param {Function} listener fn(eventtype, content)
 *
 * */
export function on(type, listener)
{
	if(App.phoneCall)
	{
		App.phoneCall.on(type, listener);
	}
}

export function releasePhone()
{
	if(App.phoneCall)
	{
		App.phoneCall.release();
	}
	
	App.phoneCall = null;
}

export function removeListener(type, listener)
{
	if(App.phoneCall)
	{
		App.phoneCall.removeListener(type, listener);
	}
}

export function removeAllListeners(type)
{
	if(App.phoneCall)
	{
		App.phoneCall.removeAllListeners(type, listener);
	}
}

export function getCrmPassCode(phone, customerId = "")
{
	if(!phone)
		return "";
	
	let {siteId, userId} = loginUserProxy(),
		passCodeStr = (new Date().getTime() - serverTimeGap()) + "+" + siteId + "+" + userId + "+" + (customerId || siteId + "_" + v4()) + "+" + phone;
	
	return Encrypt(passCodeStr);
}

export function getWoPassCode(customerId)
{
	if(!customerId)
		return "";
	console.log("test t:",serverTimeGap()," d:",new Date());
	let {siteId, userId} = loginUserProxy(),
		passCodeStr = (new Date().getTime() - serverTimeGap()) + "+" + siteId + "+" + userId + "+" + customerId;
	
	return Encrypt(passCodeStr);
}