/**
 * chatPageReducer.js
 * 功能：
 * 向自己各组件发送Redux数据流
 * */
import { Map } from "immutable";

const CHATDATA_CHANGED = "chatDataChanged",
	CONNECT_STATUS = "connectStatus",
	HAS_CONVER = "hasConver",
	CHATDATA_CLEAR = "chatDataClear";

export function chatDataChanged(data)
{
	return dispatch => {
		dispatch({
			type: CHATDATA_CHANGED,
			data
		});
	};
}

export function chatDataClear()
{
	return dispatch => {
		dispatch({
			type: CHATDATA_CLEAR
		});
	};
}

export function connectStatus(data)
{
	if(!data)
		return;
	
	return dispatch => {
		dispatch({
			type: CONNECT_STATUS,
			data
		});
	};
}

export function hasConver(value)
{
	return dispatch => {
		dispatch({
			type: HAS_CONVER,
			data: value
		});
	};
}

//-----------------------------------Reducer---------------------------------------------

let initState = Map({chatData: {}, connectData: {}, hasConver: false});

export default function chatPageReducer(state = initState, action) {
	switch(action.type)
	{
		case CHATDATA_CHANGED:
			let chatData = state.get("chatData") || {};
			
			if(chatData.name !== action.data.name)
			{
				return state.set("chatData", action.data);
			}
			
			return state;
		
		case CONNECT_STATUS:
			let {data} = action,
				cData = state.get("connectData") || {};
			
			if(data.connectStatus === cData.connectStatus && data.errorCode === cData.errorCode && data.show)
				return state;
			
			return state.set("connectData", action.data);
		
		case CHATDATA_CLEAR:
			return initState;
		
		case HAS_CONVER:
			return state.set("hasConver", action.data);
		
		case 'LOGOUT_SUCCESS':
			return initState;
	}
	
	return state;
}


