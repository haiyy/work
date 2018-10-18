// import {
// 	 REPOET_WEEKLY
// } from '../constants/actionTypes';
// import { urlLoader } from '../lib/utils/cFetch'
// import Settings from '../utils/Settings'
// import Model from "../utils/Model"
// import moment from 'moment'
//
//
// //根据报表随机id请求报表业务数据
// function getLoadData(id,dispatch){
//
// 	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
// 		token = loginUserProxy.token.nPantherToken,
// 		url = `${Settings.getPantherUrl()}/api/report/${id}`;
// 	return urlLoader(
// 		url, {
// 			headers: {
// 				'token': token
// 			}
// 		}
// 	)
// 	.then(
// 		(result) => {
// 			if( result.jsonResult.state != "ok" )
// 			{
// 				getLoadData(id,dispatch);
//
// 			}
// 			else
// 			{
// 				dispatch({
// 					type: REPOET_WEEKLY,
// 					result: result.jsonResult
//
// 				});
// 			}
// 		}
// 	)
// }
//
// //获取周报/月报报表随机id
// export function weeklyMonthly({ qry, cols = "" }) {
// 	return dispatch => {
// 		let date1 = moment().startOf('d').subtract(1, 'd').add(1, 'days').format("YYYY-MM-DD HH:mm:ss"),
// 			date2 = moment().format("YYYY-MM-DD HH:mm:ss");
// 		let query = qry.length ? qry : `datetime|between|${date1},${date2}`;
// 		let body,
// 			loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
// 			token = loginUserProxy.token.nPantherToken,
// 			siteId = loginUserProxy.siteId,
// 			url = `${Settings.getPantherUrl()}/api/report/rpt_cs_month/v1`;
// 		query = query + '&&business|=|' + siteId;
//
// 		body = {
// 			"name":"rpt_cs_month",
// 			"qry":query,
// 			"cols":cols
// 		};
//
// 		if(cols == "")
// 		{
// 			body = {
// 				"name": "rpt_cooperation",
// 				"qry": query
// 			}
// 		}
// 		body = JSON.stringify(body);
//
//
// 		return urlLoader(
// 			url, {
// 				method: 'put',
// 				headers: {
// 					'token': token,
// 					'Content-Type':'application/json'
// 				},
// 				body: body
// 			}
// 		).then(
// 			(result) => {
// 				if(result.jsonResult.hasOwnProperty('id'))
// 				{
// 					let id = result.jsonResult.id;
//
// 					getLoadData(id,dispatch);
// 				}
// 			}
// 		)
// 	}
// }
