import { getAction, getResultCode, dispatchAction } from "../../../utils/ReduxUtils";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { fromJS } from "immutable";
import { urlLoader } from "../../../lib/utils/cFetch";
import { loginUserProxy, configProxy, token } from "../../../utils/MyUtil";

const GET_HISTORY_DETAIL = "GET_HISTORY_DETAIL",
	GET_CONVER_LIST = "GET_CONVER_LIST",
	CONVER_LIST_CLEAR_DATA = "CONVER_LIST_CLEAR_DATA",
	GET_HISTORY_DETAIL_PROGRESS = "GET_HISTORY_DETAIL_PROGRESS";

export function getConverHistory(converId)
{
	return dispatch =>
	{
		let url = `${configProxy().nCrocodileServer}/conversation/message/list?siteId=${loginUserProxy().siteId}&conversationId=${converId}&page=1&per_page=1000&order=1`;
		
		dispatch(getAction(GET_HISTORY_DETAIL_PROGRESS, LoadProgressConst.LOADING));
		
		urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(dispatchAction.bind(null, dispatch, GET_HISTORY_DETAIL, true));
	}
}

export function clearData()
{
	return dispatch =>
	{
		dispatch({
			type: CONVER_LIST_CLEAR_DATA
		});
	}
}

export function getConverList(userId)
{
	return dispatch =>
	{
		let url = `${configProxy().nCrocodileServer}/conversation/convers/list?siteId=${loginUserProxy().siteId}&guestId=${userId}&count=5`;
		
		urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(dispatchAction.bind(null, dispatch, GET_CONVER_LIST, true));
	}
}

let initState = fromJS({
	converList: [],
	history: [],
	progress: 2
});

initState = initState.set("history", [])
.set("converList", []);

export default function converHistoryReducer(state = initState, action)
{
	switch(action.type)
	{
		case GET_HISTORY_DETAIL_PROGRESS:
			return state.set("progress", action.progress);
		
		case GET_HISTORY_DETAIL:
			return state.set("history", action.result)
			.set("progress", action.progress);
		
		case GET_CONVER_LIST:
			return state.set("converList", action.result);
		
		case CONVER_LIST_CLEAR_DATA:
			return initState;
	}
	
	return state;
}
