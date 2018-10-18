/**智能分配实时数据*/

import {
	GET_REALTIME_INTELLDIS_DATA
} from '../model/vo/actionTypes';

import { urlLoader } from '../lib/utils/cFetch';
import { realTimeIntellDisUrl } from '../utils/Settings';


function getData(action, isFetching, data = null)
{
	return {
		type: action,
		isFetching: isFetching,
		data
	};
}


let timeInterval = 5, //服务器请求时间间隔5s
	count = 0,
	timeIntervalIndex = -1,
	_formData = null,
	dispatchTo = null;

export function startRealTimeDataFetch(formData)
{
	count = 0;
	
	_formData = formData;
	
	getRealTimeData();
	
	if(timeIntervalIndex === -1)
	{
		timeIntervalIndex = setInterval(startRealTimeDataTimer, 1000);
	}
	
	return dispatch =>
	{
		dispatchTo = dispatch;
	};
}

export function stopRealTimeDataFetch()
{
	clearInterval(timeIntervalIndex);
	timeIntervalIndex = -1;
	count = 0;
	dispatchTo = null;
}

function startRealTimeDataTimer()
{
	count >= timeInterval ? getRealTimeData() : count++;
}

/**
 * 获取智能分配数据
 * @param {FormData} param {vsGroup, siteId, csGroup, dispatchPolicy, cs, cols}
 * @return
 *  用户（访客）群: vs_group=group_bj
 *  商户名：business=kf_8001
 *  接待组：cs_group=group1
 *  分配策略：dispatch_policy=熟客优先
 *  客服名：cs=kf_8001_cs001
 *  指标项：cols=consult_vs_count,msg_vs_count,queue_vs_count......，指标项之间以逗号分隔
 * */
export function getRealTimeData()
{
	return urlLoader(realTimeIntellDisUrl, {method: "PUT"})
	.then((response) =>
	{
		dispatchTo(getData(GET_REALTIME_INTELLDIS_DATA, false, response.jsonResult));
	});
}

//
//
//export function getRealTimeData(url)
//{
//	return dispatch =>
//	{
//		dispatch(getData(GET_REALTIME_DATA_REQUEST, true));
//		return cFetch(url, {method: "GET"})
//		.then((response) =>
//		{
//			if(response.jsonResult.error_code === 4001)
//			{
//				dispatch(getData(GET_REALTIME_DATA_FAILURE, false, response.jsonResult.error_message));
//				message.error(response.jsonResult.error_message);
//			}
//			else
//			{
//				dispatch(getData(GET_REALTIME_DATA_SUCCESS, false, response.jsonResult));
//			}
//		});
//	};
//}
//
//export function getGroupInfo(url)
//{
//	return dispatch =>
//	{
//		dispatch(getData(GET_GROUPINFO_REQUEST, true));
//		return cFetch(url, {method: "GET"})
//		.then((response) =>
//		{
//			if(response.jsonResult.error_code === 4001)
//			{
//				dispatch(getData(GET_GROUPINFO_FAILURE, false, response.jsonResult.error_message));
//				message.error(response.jsonResult.error_message);
//			}
//			else
//			{
//				dispatch(getData(GET_GROUPINFO_SUCCESS, false, response.jsonResult));
//			}
//		});
//	};
//}
//
//export function getCustomerInfo(url)
//{
//	return dispatch =>
//	{
//		dispatch(getData(GET_CUSTOMERINFO_REQUEST, true));
//		return cFetch(url, {method: "GET"})
//		.then((response) =>
//		{
//			if(response.jsonResult.error_code === 4001)
//			{
//				dispatch(getData(GET_CUSTOMERINFO_FAILURE, false, response.jsonResult.error_message));
//				message.error(response.jsonResult.error_message);
//			}
//			else
//			{
//				dispatch(getData(GET_CUSTOMERINFO_SUCCESS, false, response.jsonResult));
//			}
//		});
//	};
//}