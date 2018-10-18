import LogUtil from "../../../lib/utils/LogUtil";
import Settings from "../../../utils/Settings";
import { getLoadData, loginUserProxy } from "../../../utils/MyUtil";
import { fromJS, Map, is, List } from "immutable";

const GET_ALL_OPTIONS = "GET_ALL_OPTIONS",
	GET_CHECKED_OPTIONS = "GET_CHECKED_OPTIONS",
	UPDATE_CHECKED_OPTIONS = "UPDATE_CHECKED_OPTIONS",
	UPDATE_WORKDATA = "UPDATE_WORKDATA";

//--------------------------------Action--------------------------------------------
//获取工作台所有选项数据
let getAllUrl = "";
export function getAllOptions()
{
	if(!getAllUrl)
		getAllUrl = Settings.getWorkBenchAllUrl();
	
	log("getAllOptions getAllUrl = " + getAllUrl);
	
	return dispatch => loadData(dispatch, undefined, GET_ALL_OPTIONS, getAllUrl);
}

export function updatePropsCheckedOptions(info)
{
	return dispatch => dispatch({type: GET_CHECKED_OPTIONS, info});
}

//获取工作台已选中选项数据
export function getCheckedOptions(params)
{
	let url = getCheckedUrl();
	
	log("getCheckedOptions url = " + url);
	
	return dispatch => loadData(dispatch, params, GET_CHECKED_OPTIONS, url);
}

//更新工作台所有选中项数据（个性化数据）
export function updateCheckedOptions(params)
{
	let url = getCheckedUrl(),
		resolve = Promise.resolve(),
		token = loginUserProxy().token;
	
	log("updateCheckedOptions url = " + url);
	
	if(!url)
		return resolve;
	
	return getLoadData(getCheckedUrl(), params, "put", token);
}

function getCheckedUrl()
{
	return Settings.getWorkBenchUrl2();
}

let workCheckedData = null;
//更新工作台显示数据
export function updateWorkData(data)
{
	if(!data)
		data = workCheckedData;
	else
		workCheckedData = data;
	
	log(["updateWorkData data = ", data]);
	
	let url = Settings.getWorkBenchUrl() + "/rpt_top_dashboard/v1";
	
	return dispatch => loadData(dispatch, data, UPDATE_WORKDATA, url, "put");
}

function updateWorkData2Request(id, dispatch, url2 = "")
{
	if(!id && !url2)
		return;
	
	let url = url2 || Settings.getWorkBenchUrl() + "/" + id;
	
	loadData(dispatch, undefined, UPDATE_WORKDATA, url, "get");
}

function loadData(dispatch, params, type, url = null, mothed = "get")
{
	log(["loadData type = " + type + ", params = ", params, ", url = " + url]);
	
	let {ntoken: token, userId: userid, siteId} = loginUserProxy(),
		headers = {token, userid, isExport: "unexport"};
	
	if(type === UPDATE_WORKDATA)
	{
		headers.siteid = siteId
	}
	
	params = typeof params === "string" ? params : JSON.stringify(params);
	
	if(url)
	{
		getLoadData(url, params, mothed, headers)
		.then(info =>
		{
			log(["loadData type = " + type + ", info..."]);
			
			if(info && info.state === "starting")
			{
				let url2 = info.id ? "" : url;
				updateWorkData2Request(info.id, dispatch, url2);
				return;
			}
			
			if(info.code === 200 || info.state === "ok")
			{
				dispatch({type, info: info.data || info.result});
			}
		});
	}
	else
	{
		dispatch({type, info: {}});
	}
}

//--------------------------------Reducer--------------------------------------------

export default function workDataReducer(state = Map(), action)
{
	switch(action.type)
	{
		case UPDATE_WORKDATA:
			let rows = !action.info || action.info.rows,
				oldWorkData = state.get("workData");
			
			rows = typeof rows === "boolean" ? List() : fromJS(rows);
			
			if(!rows)
			{
				return state;
			}
			
			let workData = rows.has("0") && rows.get("0")
				.filter(item =>
				{
					let type = typeof item;
					return type === "string" || type === "number";
				});
			
			if(workData.size <= 0 || is(oldWorkData, workData))
				return state;
			
			return state.set("workData", workData);
		
		case GET_ALL_OPTIONS:
			const allOptions = fromJS(action.info),
				ao = state.get("allOptions");
			
			if(is(allOptions, ao))
				return state;
			
			return state.set("allOptions", allOptions);
		
		case GET_CHECKED_OPTIONS:
			let checkedOptions = fromJS(action.info),
				old = state.get("checkedOptions");
			
			if(is(checkedOptions, old))
				return state;
			
			return state.set("checkedOptions", checkedOptions);
			
		case "LOGOUT_SUCCESS":
			return Map();
		
	}
	
	return state;
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('workbenchDataReducer', info, log);
}
