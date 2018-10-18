import {
	GET_ALL_COLUMNS, GET_SELECT_COLUMNS, SET_SELECT_COLUMNS, SUBSCRIBE
} from '../model/vo/actionTypes';
import { urlLoader } from '../lib/utils/cFetch';
import Model from "../utils/Model";
import Settings from '../utils/Settings';

function getColumns(name)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		url = Settings.getPantherUrl() + "/api/rptmetadata/rpt_col_group/" + name,
		//url = "https://kpi-release.ntalker.com/api/rptmetadata/rpt_col_group/rpt_cooperation",
		token = loginUserProxy.token.nPantherToken;

	return urlLoader(
		url, {
			method: 'get',
			headers: {
				'token': token
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
		getColumns(name)
		.then(result =>
		{

			dispatch({
				type: GET_ALL_COLUMNS,
				name: name,
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
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			{token, userId, siteId} = loginUserProxy;

		let url = `${Settings.getPersonInfoUrl()}/settings/${siteId}/${userId}/rptcol_` + name;

		return urlLoader(url, {headers: {token: JSON.stringify(token)}})
		.then(getData)
		.then(result =>
		{
			let value = [];
			if(result.code == '200')
			{
				value = result.data;
			}

			dispatch({
				type: GET_SELECT_COLUMNS,
				name,
				result: value
			});
		});
	};
}

//保存当前报表显示列
export function setSelectColumns(name, data)
{
	return dispatch =>
	{
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
			if(result.code === 200)
			{
				dispatch({
					type: SET_SELECT_COLUMNS,
					name,
					result: JSON.parse(body)
				})

			}

			return result;
		})
	}
}
