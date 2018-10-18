import { List, fromJS } from "immutable";
import PendingConverData from "../../../../model/vo/PendingConverData";
import { token } from "../../../../utils/MyUtil";
import { urlLoader } from "../../../../lib/utils/cFetch";
import Settings from "../../../../utils/Settings";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import OpenConverType from "../../../../model/vo/OpenConverType";

const ADD_CONVER = "pendingAddConver",
	GET_CONVERS = "pendingGetConvers",
	GET_CONVERS_PROGRESS = "pendingGetConversProgress",
	SET_CUR_CONVER = "setCurConver",
	REMOVE_CONVER = "pendingRemoveConvers";

/**
 * 设置当前会话
 * @param {ChatDataManager} chatData
 * */
export function setCurConver(chatData)
{
	return dispatch => {
		dispatch({
			type: SET_CUR_CONVER,
			data: chatData
		});
	}
}

export function addConver(converData)
{
	return dispatch => {
		dispatch({
			type: ADD_CONVER,
			data: converData
		});
	}
}

export function getPendingConvers(per_page, page)
{
	return dispatch => {
		
		let url = Settings.getPendingConversUrl(per_page, page);
		
		dispatch({
			type: GET_CONVERS_PROGRESS,
			data: LoadProgressConst.LOADING
		});
		
		urlLoader(url, {headers: {token: token()}})
		.then(({jsonResult}) => {
			if(!jsonResult)
				return;
			
			let {data} = jsonResult,
				conversations = [];
			
			if(data && Array.isArray(data.customers))
			{
				conversations = data.customers;
			}
			
			dispatch({
				type: GET_CONVERS,
				data: {
					conversations,
					pagenumbers: data && data.pagenumbers || 1,
					progress: LoadProgressConst.LOAD_COMPLETE
				}
			});
		});
	}
}

export function removeConver(list)
{
	return dispatch => {
		dispatch({
			type: REMOVE_CONVER,
			list
		});
	}
}

function dealConvers(list, convers)
{
	if(Array.isArray(list))
	{
		list.forEach(data => {
			let userid = data.userid;
			
			if(findIndex(userid, convers) === -1)
			{
				if(!data || !data.conversation)
					return;
				
				let converData = new PendingConverData(data);
				
				convers = convers.push(converData);
			}
		});
	}
	
	return convers;
}

function findIndex(userId, convers)
{
	return convers.findIndex(conver => conver.userId === userId);
}

let initState = fromJS({list: List(), curConver: {}});
initState = initState.set("curConver", {});
initState = initState.set("pagenumbers", 1);

export default function pendingConverReducer(state = initState, action) {
	switch(action.type)
	{
		case ADD_CONVER:
			
			if(!action.data)
				return state;
			
			let converData = action.data,
				list = state.get("list"),
				index = findIndex(converData.userId, list);
			
			if(index !== -1)
			{
				list = list.remove(index);
			}
			
			return state.set("list", list.unshift(converData));
		
		case REMOVE_CONVER:
			let list1 = action.list,
				index1,
				stateList = state.get("list");
			
			if(Array.isArray(list1))
			{
				list1.forEach(data => {
					index1 = findIndex(data.userid, state);
					
					stateList = stateList.remove(index1);
				})
			}
			
			return state.set("list", stateList);
		
		case GET_CONVERS:
			let list2 = state.get("list"),
				{conversations, progress, pagenumbers} = action.data;
			
			return state.set("list", dealConvers(conversations, list2))
			.set("pagenumbers", pagenumbers)
			.set("progress", progress);
		
		case GET_CONVERS_PROGRESS:
			
			return state.set("progress", action.data);
		
		case SET_CUR_CONVER:
			let data = action.data,
				curConver = state.get("curConver") || {};
			
			if(data && data.sessionId === curConver.sessionId)
			{
				return state;
			}
			else
			{
				if(curConver.openType === OpenConverType.VISITOR_PASSIVE_REQUEST)
				{
					curConver.close();
				}
			}
			
			return state.set("curConver", data);
		
		case "LOGOUT_SUCCESS":
			return initState;
		
	}
	
	return state;
}
