import {
	QUEUE_LIST_COLUMNS, QUEUE_LIST, GET_ALL_QUEUE_COLUMNS
} from '../model/vo/actionTypes'
import { urlLoader } from '../lib/utils/cFetch'
import Settings from '../utils/Settings'
import Model from "../utils/Model"
import moment from 'moment'

//根据报表随机id请求报表业务数据
function getLoadData(id, dispatch)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		token = loginUserProxy.token.nPantherToken,
		url = `${Settings.getPantherUrl()}/api/report/${id}`;
	
	return urlLoader(url, {headers: {token}})
	.then(result =>
		{
			if(result.jsonResult.state != "ok")
			{
				getLoadData(id, dispatch);
			}
			else
			{
				dispatch({
					type: QUEUE_LIST,
					result: result.jsonResult
				});
			}
		}
	);
}

//获取顶部排队列表随机id
export function queueList({name, cols = ""})
{
	return dispatch =>
	{
		let date = moment()
		.startOf('d')
		.add(1, 'days')
		.format("YYYY-MM-DD HH:mm:ss");
		
		let query = `datetime|between|2017-01-01 00:00:00,${date}`,
			body = {name, "qry": query, cols},
			loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			token = loginUserProxy.token.nPantherToken,
			url = `${Settings.getPantherUrl()}/api/report/${name}/v1`;
		
		body = JSON.stringify(body);
		
		return urlLoader(url, {method: 'put', headers: {token}, body})
		.then(result =>
			{
				let id = result.jsonResult.id;
				
				getLoadData(id, dispatch);
			}
		);
	}
}
