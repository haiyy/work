/**
 * loadDataReducer.js
 * 功能：
 * 加载数据[访客来源，地域]
 * */
import { fromJS } from "immutable";
import LoadProgressConst from "../model/vo/LoadProgressConst";
import Settings from "../utils/Settings";
import { urlLoader } from "../lib/utils/cFetch";
import { loginUserProxy } from "../utils/MyUtil";
import { GET_CHATSUMMARY_ALL } from "../model/vo/actionTypes";
import { getResultCode } from "../utils/ReduxUtils";

const GET_REGION = "GET_REGION",
	GET_REGION_PROGRESS = "GET_REGION_PROGRESS",
	GET_SUMMARY = "GET_SUMMARY",
	GET_SUMMARY_PROGRESS = "GET_SUMMARY_PROGRESS";

export function getRegion()
{
	return dispatch => {
		dispatch({
			type: GET_REGION_PROGRESS,
			progress: LoadProgressConst.LOADING
		});

		let url = Settings.querySettingUrl("/region", "", "");
		return urlLoader(url)
		.then(({jsonResult: data = []}) => {
			let tree;
			
			data = data || [];
			tree = getRegionChildren("0", data);
			regionLoop(tree, data);
			
			dispatch({
				type: GET_REGION,
				data: tree,
				progress: LoadProgressConst.LOAD_COMPLETE
			});
		});
	};
}

function regionLoop(tree, data)
{
	tree.map(value => {
		if(hasChildren(value.id, data))
		{
			value.children = getRegionChildren(value.id, data);
			
			regionLoop(value.children, data);
		}
	})
	
}

function hasChildren(key, data)
{
	return data.findIndex(v => v.parentId === key) > -1;
}

function getRegionChildren(key = "0", data)
{
	return data.filter(value => value.parentId === key);
}

export function getSummary()
{
	return dispatch => {
		dispatch({
			type: GET_SUMMARY_PROGRESS,
			progress: LoadProgressConst.LOADING
		});

		let {siteId, ntoken} = loginUserProxy();

		let url = Settings.querySettingUrl("/summary/", siteId, "/entire");

		return urlLoader(url, {headers: {token: ntoken}})
		.then(({jsonResult: data = []}) => {
			dispatch({
				type: GET_SUMMARY,
				data,
				progress: LoadProgressConst.LOAD_COMPLETE
			});
		});
	};
}

//-----------------------------------Reducer---------------------------------------------

let initState = fromJS({
	region: {
		progress: 2,
		data: []
	},
	summary: {
		progress: 2,
		data: []
	}
});

initState = initState.setIn(["region", "data"], []);

export default function loadDataReducer(state = initState, action) {

	switch(action.type)
	{
		case GET_REGION:
			return state.setIn(["region", "progress"], action.progress)
			.setIn(["region", "data"], action.data);

		case GET_REGION_PROGRESS:
			return state.setIn(["region", "progress"], action.progress);

		case GET_SUMMARY:
			return state.setIn(["summary", "progress"], action.progress);

		case GET_SUMMARY_PROGRESS:
			return state.setIn(["summary", "data"], action.progress);

		case 'LOGOUT_SUCCESS':
			return initState;
	}

	return state;
}


