import {
	FILTER_REPORT, FILTER_CONDITIONS, FILTER_DATA, GROPU_USER, NEW_FILTER_REPORT
} from '../model/vo/actionTypes';
import cFetch, { urlLoader } from '../lib/utils/cFetch'
import { API_CONFIG } from '../data/api'
import { message } from 'antd'
import Settings from '../utils/Settings';
import Model from "../utils/Model";
import LoginUserProxy from "../model/proxy/LoginUserProxy";


function getRange(value, siteid, groupid)
{
	switch(value)
	{
		case "行政组":
			return(
				`/enterprise/${siteid}/group`
			)
			break;
		//case "用户群":
		//	return(
		//		`/template/${siteid}`
		//	)
		//	break;
		case "客服":
			return(
				`/enterprise/${siteid}/group`

			)
			break;
	}
}

//获取筛选具体数据
export function filterData(value)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		siteId = loginUserProxy.siteId,
		tokenObj = loginUserProxy.token,
		tokenjson = JSON.stringify(tokenObj);
	let data = {
		siteid: siteId
	};

	let url = Settings.queryPathSettingUrl(getRange(value, siteId));
	return urlLoader(url,
		{headers: {token: tokenjson}}
	)
	.then(getFilder)
	//.then(getData)
	.catch((error) =>
	{
		return error;
	});
}


//根据行政组获取行政组下客服
export function getAccount(groupId)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		siteId = loginUserProxy.siteId,
		tokenObj = loginUserProxy.token,
		tokenjson = JSON.stringify(tokenObj);
	let url = Settings.queryPathSettingUrl(`/enterprise/${siteId}/user/group/${groupId}`);

	return urlLoader(url,
		{headers: {token: tokenjson}}
	)
	.then(getFilder)
	.catch((error) =>
	{
		return error;
	});
}

//获取过滤条件
function filterConditions(result)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		token = loginUserProxy.token.nPantherToken,
		url = `${Settings.getPantherUrl()}/api/query/currUser`;
	return urlLoader(
		url, {
			method: 'get',
			headers: {
				'token': token,
				'Content-Type': 'application/json'
			}
		}
	)
	.then(getFilder)
	.catch((error) =>
	{
		return error;
	});
}

export function fetchFilter(result)
{
	return dispatch => {
		filterConditions().then((result)=>{
			if(result.code == 200)
			{
				dispatch({
					type: FILTER_CONDITIONS,
					result
				});
			}


		},(error)=>{
			console.log(error);
		});
	};
}

//在设置中保存当前用户查询
export function addQuery(data)
{
	let bodyValue = data.concat([]);
	for(let i = 0; i < bodyValue.length; i++)
	{
		bodyValue[i].data = [];
		//console.log("body>>>>",bodyValue[i].data);
	}
	//console.log("body>>>>",bodyValue, data);
	return dispatch => {
		let body = {
			items: bodyValue
		};
		let LoginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			tokenObj = LoginUserProxy.token,
			userid = LoginUserProxy.userId, siteId = LoginUserProxy.siteId,
			tokenjson = JSON.stringify(tokenObj);
		body = JSON.stringify(body);
		//console.log("query>>>>",body);
		let url = Settings.getPersonInfoUrl();
		return urlLoader(url + "/settings/"+siteId+"/"+userid+"/query", {method: "post", body: body, headers: {token: tokenjson}})
		.then((result) => {
			result = result.jsonResult;
			if(result.code == 200){
				dispatch({
					type: FILTER_REPORT,
					result: {
						items: data
					}
				})

			}

		})
		.catch((error) =>
		{
			return error;
		});
	}
}

//从设置中获取当前用户的查询
export function pullQuery()
{
	return dispatch =>
	{
		let LoginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			tokenObj = LoginUserProxy.token,
			userid = LoginUserProxy.userId, siteId = LoginUserProxy.siteId,
			tokenjson = JSON.stringify(tokenObj);
		let url = Settings.getPersonInfoUrl();

		return urlLoader(url + "/settings/" + siteId + "/" + userid + "/query", {
			method: "get", headers: {token: tokenjson}
		})
		.then((result) =>
		{
			result = result.jsonResult;
			//console.log("pullQuery>>>>",result)
			if(result.code == 200)
			{
				dispatch({
					type: NEW_FILTER_REPORT,
					result: result.data
				})
			}
		})
		.catch((error) =>
		{
			return error;
		});
	}
}


function getFilder(response)
{
	//console.log(response);
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

export function getData(result)
{
	//let jsonResult = response.jsonResult,
	//	result = Promise.resolve(jsonResult);
	return dispatch => {
		//console.log("data>>>>",result);
		dispatch({
			type: FILTER_DATA,
			result
		});
	};

}


