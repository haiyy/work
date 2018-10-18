import {
	SELECTION_COLUMN, CUSTOMER_SERVICE
} from '../model/vo/actionTypes'
import cFetch, { urlLoader } from '../lib/utils/cFetch'
import { API_CONFIG } from '../data/api'
import { message } from 'antd'
import Settings from '../utils/Settings'
import Model from "../utils/Model"
import moment from 'moment'

//根据报表随机id请求报表业务数据
function getLoadData(id,dispatch){
	
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		token = loginUserProxy.token.nPantherToken,
		url = `${Settings.getPantherUrl()}/api/report/${id}`;
	return urlLoader(
		url, {
			headers: {
				'Content-Type':'application/json',
				'Accept':'application/json',
				'token': token
			}
		}
	)
	.then(
		(result) => {
			if( result.jsonResult.state != "ok" )
			{
				getLoadData(id,dispatch);
				
			}
			else
			{
				dispatch({
					type: CUSTOMER_SERVICE,
					result: result.jsonResult
					
				});
			}
		}
	)
}

//获取客服往来明细报表随机id
export function customerService({ qry, cols = "" }) {
	return dispatch => {
		//console.log(`http://192.168.30.211:8010/api/report/${name}/v1`);
		//console.log("query>>>>",qry);
		let date1 = moment().startOf('d').subtract(1, 'd').add(1, 'days').format("YYYY-MM-DD HH:mm:ss"),
			date2 = moment().format("YYYY-MM-DD HH:mm:ss");
		let query = qry.length ? qry : `datetime|between|${date1},${date2}`;
		
		let body,
			loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
			siteId = loginUserProxy.siteId,
			token = loginUserProxy.token.nPantherToken,
			url = `${Settings.getPantherUrl()}/api/report/rpt_cooperation/v1`;
		query = query + '&&business|=|' + siteId;
		
		body = {
			"name": "rpt_cooperation",
			"qry": query,
			"cols": cols
		};
		
		if(cols == "")
		{
			body = {
				"name": "rpt_cooperation",
				"qry": query
			}
		}
		body = JSON.stringify(body);
		//console.log("report>>>",qry);
		return urlLoader(
			url, {
				method: 'put',
				headers: {
					'token': token,
					'Content-Type':'application/json'
				},
				body: body
			}
		).then(
			(result) => {
				if(result.jsonResult.hasOwnProperty('id'))
				{
					let id = result.jsonResult.id;
					
					getLoadData(id,dispatch);
				}
			}
		)
	}
}
