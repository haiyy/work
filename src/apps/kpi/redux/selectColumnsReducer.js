//import { GET_ALL_COLUMNS, GET_SELECT_COLUMNS, SET_SELECT_COLUMNS } from './../../../constants/actionTypes';
import { urlLoader } from '../../../lib/utils/cFetch'
import Model from "../../../utils/Model"
import Settings from '../../../utils/Settings'
import {loginUserProxy} from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"

const GET_ALL_COLUMNS = 'GET_ALL_COLUMNS',
	  GET_SELECT_COLUMNS = 'GET_SELECT_COLUMNS',
	  SET_SELECT_COLUMNS = 'SET_SELECT_COLUMNS',
	  GET_ALL = 'GET_ALL',
	  GET_SELECT = 'GET_SELECT';

//----------------------------------------action------------------------------------
function getColumns(name)
{
	let url = Settings.getPantherUrl() + "/api/rptmetadata/rpt_col_group/" + name,
		{siteId, userId} = loginUserProxy();

	return urlLoader(
		url, {
			method: 'get',
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(getData);
}

//获取报表所有列
export function getAllColumns(name)
{
	return dispatch =>
	{
		dispatch({
			type: GET_ALL,
			name,
			progress: LoadProgressConst.LOADING
		});
		getColumns(name)
		.then(result =>
		{
			let progress = LoadProgressConst.LOAD_COMPLETE;

			if(!result || !result instanceof Array)
			{
				progress = LoadProgressConst.LOAD_FAILED;
				result = [];
			}

			dispatch({
				type: GET_ALL_COLUMNS,
				name: name,
				progress: progress,
				result
			});
		});
	};
}

function getData(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

//获取当前报表已显示列
export function getSelectColumns(name)
{
	return dispatch =>
	{
		dispatch({
			type: GET_SELECT,
			name,
			progress: LoadProgressConst.LOADING
		});
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{token, userId, siteId} = loginUserProxy;

		let url = `${Settings.getPersonInfoUrl()}/settings/${siteId}/${userId}/rptcol_` + name;

		return urlLoader(url, {headers: {token: JSON.stringify(token)}})
		.then(getData)
		.then(result =>
		{
			let action = {
				type: GET_SELECT_COLUMNS,
				name,
				progress: LoadProgressConst.LOAD_COMPLETE,
			};

			if(!result)
			{
				action.progress = LoadProgressConst.LOAD_FAILED;
				action.result = [];
			}
			else
			{
				let {code, data = []} = result;//初始化result

				if(code === 200)
				{
					action.progress = LoadProgressConst.LOAD_COMPLETE;
					action.result = data;
				}
				else
				{
					action.progress = LoadProgressConst.LOAD_FAILED;
					action.result = [];
				}
			}
			dispatch(action);
		});
	};
}

//保存当前报表显示列
export function setSelectColumns(name, data)
{
	return dispatch =>
	{
		dispatch({
			type: SET_SELECT_COLUMNS,
			name,
			progress: LoadProgressConst.SAVING
		});
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{token, userId, siteId} = loginUserProxy,
			tokenjson = JSON.stringify(token),
			body = data;

		body = JSON.stringify(body);

		let url = `${Settings.getPersonInfoUrl()}/settings/${siteId}/${userId}/rptcol_` + name;

		return urlLoader(url, {method: "put", body, headers: {token: tokenjson}})
		.then((result) =>
		{
			result = result.jsonResult;
			let progress;
			if(result.code === 200)
			{
				progress = LoadProgressConst.SAVING_SUCCESS;
			}else
			{
				progress = LoadProgressConst.SAVING_FAILED;
			}
			dispatch({
				type: SET_SELECT_COLUMNS,
				name,
				progress: progress,
				result: JSON.parse(body)
			})
			return result;
		})
	}
}

//---------------------------------------Reducer-----------------------------

let allColumns = {},
	selectColumns = {};

//获取报表所有显示列
export default function getAllColumnsReducer(state = {}, action)
{

	switch(action.type)
	{
		case GET_ALL_COLUMNS:
			allColumns[action.name] = action.result;
			allColumns.progress = action.progress;
			return {
				data: {...allColumns}
			}
		case GET_ALL:
			allColumns[action.name] = [];
			allColumns.progress = action.progress;
			return {
				data: {...allColumns}
			}
	}

	return state;
}

//获取当前报表显示列
export function selectColumnsReducer(state = {}, action)
{
	switch(action.type)
	{
		case GET_SELECT:
			selectColumns.progress = action.progress;
			selectColumns[action.name] = [];

			return {
				data: {...selectColumns}
			}
		case GET_SELECT_COLUMNS://页面加载开始请求数据
			selectColumns.progress = action.progress;
			selectColumns[action.name] = Array.from(action.result);

			return {
				data: {...selectColumns}
			}

		case SET_SELECT_COLUMNS:
			selectColumns.progress = action.progress;
			if(action.result)
			{
				selectColumns[action.name] = Array.from(action.result);
			}
			return {
				data: {...selectColumns}
			}
		default:
			return state;
	}
}
