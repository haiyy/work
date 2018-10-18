import { Map } from 'immutable';
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";

const GET_PLAYSCREENLIST = "GET_PLAYSCREENLIST";
const CLEAR_PLAYSCREENLIST = "CLEAR_PLAYSCREENLIST";
const GET_PLAYSCREEN_WAITNUMBER = "GET_PLAYSCREEN_WAITNUMBER";//排队数

/**
 * 添加最近弹屏记录
 * @param {string} phoneNumber 电话号码
 * @param {string} time 时间
 */
export function getPhoneScreenRecord(data)
{
	return dispatch => {
		dispatch({
			type: GET_PLAYSCREENLIST,
			data
		});
	}
}

export function playScreenClearData()
{
	localStorage.removeItem("PhonePlayScreenList");

	return dispatch => {
		dispatch({
			type: CLEAR_PLAYSCREENLIST
		});
	}
}

//查询排队信息
export function getPlayScreenWaitNumber()
{
	let {userId, siteId,ntoken} = loginUserProxy(),
		data = {userId, siteId},
		headurl = Settings.getCallServerUrl(`${siteId}/lineup/${userId}`);
	return dispatch => {
		return urlLoader(headurl, {
			body: JSON.stringify(data),
			headers: {token: ntoken},
			method: "post"
		})
		.then(({jsonResult}) => {
			let {data} = jsonResult;

			dispatch({
				type: GET_PLAYSCREEN_WAITNUMBER,
				data: data || {}
			});
		});
	}
}

// --------------------------Reducer-------------------------------------
let initState = Map({
	playScreenList: []
});

let list = localStorage.getItem("PhonePlayScreenList") || {},
	playScreenList = list;

initState = initState.set("playScreenList", playScreenList);
initState = initState.set("playScreenWaitNumer", {});

export default function phonePlayScreenReducer(state = initState, action) {

	switch(action.type)
	{
		case GET_PLAYSCREENLIST:
			let list = state.get("playScreenList") || {};
			list = addRecent(action.data, list);
			return state.set("playScreenList", {...list});

		case CLEAR_PLAYSCREENLIST:
			let s = state.set("playScreenList", {});
			initState = initState.set("playScreenList", {});
			console.log("playScreenList = ", s.toJS());

			return s;

		case GET_PLAYSCREEN_WAITNUMBER:
			return state.set("playScreenWaitNumer", action.data);
	}
	return state;
}

function addRecent(data, list)
{
	let userId = loginUserProxy().userId, array = [];
	list = (typeof list == "string") ? JSON.parse(list) : list;
	if (list && list[userId] && list[userId].length > 0) {
		array = list[userId];
	}
	let index = array.findIndex(value => value.callid === data.callid)

	if(index > -1)
		return list;

	array.unshift(data);

	if(array.length > 20)
	{
		array.splice(-1, 1);
	}

	let json = {};
	json[userId] = array;

	localStorage.setItem("PhonePlayScreenList", JSON.stringify(json));
	return json;
}
