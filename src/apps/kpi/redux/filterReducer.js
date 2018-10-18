import { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import Model from "../../../utils/Model"
import {loginUserProxy} from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import{ log } from "../../../lib/utils/LogUtil"
import { getAdministrativeGroup } from  '../view/kpiService/filter'
import moment from "moment/moment";

const FILTER_REPORT = 'FILTER_REPORT',
	FILTER_CONDITIONS = 'FILTER_CONDITIONS',
	NEW_FILTER_REPORT = 'NEW_FILTER_REPORT',
	GET_FILTER = 'GET_FILTER',
	FILTER_DATA = 'FILTER_DATA',
	GET_CONDITIONS = 'GET_CONDITIONS',
	SET_QUERY_TIME = 'SET_QUERY_TIME';

//---------------------------------------Action-----------------------------

function getRange(value, siteid, groupid)
{
	switch(value)
	{
		//行政组
		//case "行政组":
		//	return (
		//		`/enterprise/${siteid}/group`
		//	);
		//	break;
		//客服
		case "cs":
			return (
				`/enterprise/${siteid}/group`
			);
			break;
	}
}

//获取筛选具体数据
export function filterData(name)//如果是cs，对路径单独规划
{
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy();
		let url = Settings.queryPathSettingUrl(getRange(name, siteId));

		return urlLoader(url,
			{headers: {token: ntoken}}
		)
		.then(getFilder)
		.then((result) =>
		{
			if(result.code === 200)
			{
				dispatch({
					type: FILTER_DATA,
					result: result.data,
					name
				});
			}
		}, (error) =>
		{
			console.log(error);
		});
	}
}

//获取用户群列表
export function distribute()
{
	return dispatch =>
	{
		let {siteId, ntoken} = loginUserProxy();
		let settingUrl = Settings.querySettingUrl("/template/",siteId,"?terminal=template");

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getFilder)
		.then((result) =>
		{
			if(result.code === 200)
			{
				let data = result.data.map((item) =>{
					item.title = item.name;     //name为需传入的值
					item.name = item.templateid;    //下拉选框显示的值
					return item;
				});
				dispatch({
					type: FILTER_DATA,
					result: data,
					name: 'cs_group'
				});
			}
		}, (error) =>
		{
			console.log(error);
		});
	}
}

//获取地域
export function getRegionData(index = 1)
{
	return dispatch =>
	{
		let settingUrl = Settings.querySettingUrl("/region", "", "");

		return urlLoader(settingUrl + "/" + index)
		.then(getFilder)
		.then(result =>
		{
			if(result.length !== 0)
			{
				let data = [{id:"1",name:"中国",parentId:"0"}];
				data[0].children = result;
				dispatch({
					type: FILTER_DATA,
					result: data,
					name: 'region2'
				});
			}
		});
	}
}

//获取访客来源列表
export function getVisitorSourceList()
{
	return dispatch =>{
		let {siteId, ntoken} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/source/", siteId, "/sourcetype/-1");

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getFilder)
		.then((result) =>
		{
			if(result.code === 200)
			{
				let data = result.data.map((item) =>{
					item.name = item.ename;     //name为需传入的值
					item.title = item.cname;    //下拉选框显示的值
					return item;
				});
				dispatch({
					type: FILTER_DATA,
					result: data,
					name: 'search_from'
				});
			}
		})
	}
}

//获取关键页面信息
export function  keyPage() {
	return dispatch => {
		let {siteId, ntoken} = loginUserProxy();
		let settingUrl = Settings.querySettingUrl("/keyPage/",siteId, "");
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getFilder)
		.then((result) =>
		{
			if(result.code === 200)
			{
				let data = result.data.map((item) =>{
					item.title = item.name;    //下拉选框显示的值
					return item;
				});
				dispatch({
					type: FILTER_DATA,
					result: data,
					name: 'key_page_level'
				});
			}
		})
	};
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
}

//获取可选过滤条件（第一个下拉选框可选值）
function filter_conditions(name)
{
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		siteId = loginUserProxy.siteId,
		userId = loginUserProxy.userId,
		url = `${Settings.getPantherUrl()}/api/query/${name}`;

	return urlLoader(
		url, {
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(getFilder)
}

export function fetchFilter(name)
{
	return dispatch =>
	{
		filter_conditions(name)
		.then((result) =>
		{
			if(result.items)
			{
				dispatch({
					type: FILTER_CONDITIONS,
					result: result.items
				});
			}
		}, (error) =>
		{
			console.log(error);
		});
	};
}


export function dashBoardFetchFilter(name, id)
{
    return dispatch =>
    {
        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            siteId = loginUserProxy.siteId,
            userId = loginUserProxy.userId,
            url = `${Settings.getPantherUrl()}/api/v1/dashboard/${name}/${id}/condition`;

        ///api/v1/dashboard/{name}/{id}/condition
        urlLoader(url, { headers: { 'siteid': siteId, 'userid': userId}})
            .then(getFilder)
            .then((result) =>
            {
                let filterResult = result.items ? result.items : [];

                dispatch({
                    type: FILTER_CONDITIONS,
                    result: filterResult
                });
            }, (error) =>
            {
                console.log(error);
            });
    };
}


//保存当前用户查询
export function addQuery(data, name)
{
	return dispatch =>
	{
		dispatch({
			type: FILTER_REPORT,
			result: data,
			name
		});

	}
}

//保存当前用户查询
export function setQueryTime(date, isChangeTime)
{
	return dispatch =>
	{
		dispatch({
			type: SET_QUERY_TIME,
			result: {date, isChangeTime}
		});

	}
}

function getFilder(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

//---------------------------------------Reducer-----------------------------

let newQuery = {},
	criteria = {
		client:[{
			name: "web",
			title: "Web"
		},{
			name: "wap",
			title: "Wap"
		},{
			name: "Android App",
			title: "Android App"
		},{
			name: "iOS App",
			title: "IOS App"
		},{
			name: "wechat",
			title: "微信"
		}]
	};
//报表筛选条件可选项
export default function filterConditions(state = {}, action)
{
	switch(action.type)
	{
		case FILTER_CONDITIONS:
			let conditions = action.result;
			return {
				data: [...conditions]
			};
		default:
			return state;
	}
}

export function query(state = {}, action)
{
	switch(action.type)
	{
		case FILTER_REPORT:
			let name = action.name;
			newQuery[name] = action.result;

			return {
				data: {...newQuery}
			};
		default:
			return state;
	}
}
let queryDate = {
	date: [
		moment()
		.startOf('d')
		.subtract(1, 'd')
		.add(1, 'days')
		.format("YYYY-MM-DD HH:mm:ss"),
		moment({hour: 0, minute: 0, seconds: 0})
		.add(1, 'day')
		.format("YYYY-MM-DD HH:mm:ss")
	],
	isChangeTime:"1"
};

export function queryTime(state = {queryDate}, action)
{
	switch(action.type)
	{
		case SET_QUERY_TIME:
			if (action.result)
				queryDate = action.result;

			return {
				queryDate
			};

		default:
			return state;
	}
}

//筛选条件按name存储的筛选具体数据
export function filterCriteria(state = {data: criteria}, action)
{
	switch(action.type)
	{
		case FILTER_DATA:
			let name = action.name;
			criteria[name] = action.result;

			if(name === 'cs')
			{
				criteria[name] = getAdministrativeGroup(action.result);//filter.js
			}

			return {
				data: {...criteria}
			};
		default:
			return state;
	}
}
