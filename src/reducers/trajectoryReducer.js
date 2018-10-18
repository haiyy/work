import { GET_TRAJECTORY, TRAJECTORY, GET_TRACONTENT, TRACONTENT, GET_TRAORDERS, GET_TRASHOPS, GET_TRAALL, GET_TRAWEB, REFRESH_TRAIL, SET_NTID } from '../model/vo/actionTypes';
import TrailSessionList from "../model/trail/TrailSessionList";
import TrailRecordList from "../model/trail/TrailRecordList";
import { TimeConvert } from "../components/common/utils";

var trailnp1 = false,
	trailnp2 = false,
	trailnp3 = false,
	trailnp4 = false;

function isNextPage(data)
{
	if(data && data.length === 5)
	{
		return true;
	}
	else
	{
		return false;
	}
}

export default function trajectoryReducer(state = {}, action)
{
	let newData = {};
	switch(action.type)
	{
		case TRAJECTORY:
			return {
				...state,
				trailnp1,
				trailnp2,
				trailnp3,
				trailnp4
			}
		case SET_NTID:
			return {
				...state,
				ntid: action.ntid,
				traOrders: [],
				traShops: [],
				traAll: [],
				traWeb: []
			}
		case GET_TRAJECTORY:
			newData = {
				trajectory: action.result
			}
			
			return {
				...state,
				...newData,
			}
		case TRACONTENT:
			return {
				...state,
			}
		case GET_TRACONTENT:
			newData = {
				traContent: action.result
			}
			
			return {
				...state,
				...newData,
			}
		case GET_TRAORDERS:
			let traOrderData = {};
			
			try
			{
				let nextOrderLists = action.result.map((recordList, index) =>
				{
					return new TrailRecordList(recordList);
				});
				
				traOrderData = {
					traOrders: nextOrderLists
				};
			}catch(e)
			{
			
			}
			
			trailnp4 = isNextPage(action.result);
			
			return {
				...state,
				...traOrderData,
				trailnp4
			}
		case GET_TRASHOPS:
			let traShopData = {};
			
			try
			{
				let nextShopLists = action.result.map((recordList, index) =>
				{
					return new TrailRecordList(recordList);
				});
				
				traShopData = {
					traShops: nextShopLists
				};
			}catch(e)
			{
			
			}
			
			trailnp3 = isNextPage(action.result);
			
			return {
				...state,
				...traShopData,
				trailnp3
			}
		case GET_TRAALL:
			let nextSessionList = new TrailSessionList(action.result.sessions);
			
			let traAllData = {
				traAll: nextSessionList,
				traStatistics: {
					orderCreate: action.result['order_create'],
					staytimeAvg: action.result['staytime_avg'] == -1 ? "0时0分0秒" : TimeConvert.secondTohms(Math.round(parseInt(action.result['staytime_avg']) / 1000), 'zh', false),
					pageLoad: action.result['page_load'],
					chatOpen: action.result['chat_open']
				}
			};
			
			trailnp1 = isNextPage(action.result.sessions);
			
			return {
				...state,
				...traAllData,
				trailnp1
			}
		case GET_TRAWEB:
			let nextWebList = new TrailSessionList(action.result.sessions);
			
			//// 如果请求轨迹数据，访客身份一致，需要与原数据进行合并
			//if(action.ntid === state.ntid && state.traWeb && state.traWeb instanceof TrailSessionList)
			//{
			//	nextWebList.sessions = state.traWeb.merge(nextWebList.sessions);
			//}
			
			let traWebData = {
				traWeb: nextWebList
			};
			
			trailnp2 = isNextPage(action.result.sessions);
			
			return {
				...state,
				...traWebData,
				trailnp2
			}
		case REFRESH_TRAIL:
			let refreshData = {
				traOrders: [],
				traShops: [],
				traAll: [],
				traWeb: []
			}
			
			return {
				...state,
				...refreshData
			}
			break;
		
		case "LOGOUT_SUCCESS":
			return {};
		
		default:
			return state
	}
	
	return state;
}
