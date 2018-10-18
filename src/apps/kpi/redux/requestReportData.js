import { pie_nestData } from '../view/kpiService/nestedPie.js'
import { bar_clusteredData } from '../view/kpiService/barClusteredData.js'
import { bar_stackedData } from '../view/kpiService/barStackedData'
import { barData } from '../view/kpiService/barData.js'
import { bar_hData } from '../view/kpiService/barHData.js'
import { dashboardData } from '../view/kpiService/dashboardData.js'
import { gridData } from '../view/kpiService/gridData.js'
import { numberData } from '../view/kpiService/numberData.js'
import { funnelData } from '../view/kpiService/funnelData'
import { lineData } from '../view/kpiService/lineData'
import { pieData } from '../view/kpiService/pieData'
import { mapData } from '../view/kpiService/mapData'
import { area_stackedData } from '../view/kpiService/areaStackedData'
import { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import { loginUserProxy } from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import { cardData } from "../view/kpiService/cardData";

const REQUEST_REPORT = 'REQUEST_REPORT';
const REQUEST_CHILD_REPORT = 'REQUEST_CHILD_REPORT';

//--------------------------------action--------------------------------------

//改变列表数据
export function requestReport(progress, requestData, reportData)
{
	return dispatch => {
		dispatch({
			type: REQUEST_REPORT,
			progress,
			requestData,
			reportData
		});
	}
}

//请求报表详情页报表数据
function getLoadData(id, dispatch, name)
{
	
	let {siteId, userId} = loginUserProxy(),
		url = `${Settings.getPantherUrl()}/api/report/${id}`;
	return urlLoader(
		url, {
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(result => {
			if(!result.jsonResult.hasOwnProperty('state'))
			{
				dispatch({
					type: REQUEST_CHILD_REPORT,
					name: name,
					progress: LoadProgressConst.LOAD_FAILED
					
				});
				return null;
			}
			if(result.jsonResult.state != "ok")
			{
				getLoadData(id, dispatch, name);
				
			}
			else
			{
				dispatch({
					type: REQUEST_CHILD_REPORT,
					name: name,
					progress: LoadProgressConst.LOAD_COMPLETE,
					requestData: result.jsonResult.result
					
				});
			}
		}
	)
}

export function requestChildReport({name, qry, cols = ""})
{
	return dispatch => {
		dispatch({
			type: REQUEST_CHILD_REPORT,
			name: name,
			progress: LoadProgressConst.LOADING
		});
		
		let url = `${Settings.getPantherUrl()}/api/report/${name}/v1`;
		let {siteId, userId} = loginUserProxy(),
			options = {
				headers: {
					siteId,
					userId,
					'isExport': 'unexport'
				},
				method: 'PUT',
				body: JSON.stringify({
					"name": name,
					"qry": qry
				})
			}
		return urlLoader(url, options)
		.then(
			(result) => {
				dispatch({
					type: REQUEST_CHILD_REPORT,
					name: name,
					progress: LoadProgressConst.LOAD_COMPLETE,
					requestData: result.jsonResult.result
					
				});
			})
	}
}

//--------------------------------Reducer--------------------------------------
let data = {};

//name为报表名字，数组元素0为加载状态，1为原数剧，2为按UI转化后数据
export default function requestReportData(state = {}, action)
{
	switch(action.type)
	{
		case REQUEST_REPORT:
			let ui = action.reportData.ui,
				rpt_type = action.reportData.rpt_type,
				name = action.reportData.name,
				kpiTitle = action.reportData.title;
			
			if(!data[name])
				data[name] = [];
			
			data[name][0] = action.progress;
			
			if(action.requestData === "")
			{
				return {...data};
			}
			
			data[name][1] = action.requestData;
			
			switch(ui)
			{
				case "grid":
					data[name][2] = changeOption(rpt_type, action.requestData, kpiTitle);
					return {...data};
				
				case "bar":
					data[name][2] = barData(action.requestData, kpiTitle);
					return {...data};
				
				case "bar-h":
					data[name][2] = bar_hData(action.requestData, kpiTitle);
					return {...data};
				
				case "bar-clustered":
					data[name][2] = bar_clusteredData(action.requestData, kpiTitle);
					return {...data};
				
				case "dashboard":
					data[name][2] = dashboardData(action.requestData, kpiTitle);
					return {...data};
				
				case "pie-nest":
					data[name][2] = pie_nestData(action.requestData, kpiTitle);
					return {...data};
				
				case "number":
					data[name][2] = numberData(action.requestData, kpiTitle);
					return {...data};
				
				case "bar-stacked":
					data[name][2] = bar_stackedData(action.requestData, kpiTitle);
					return {...data};
				
				case "area-stacked":
					data[name][2] = area_stackedData(action.requestData, kpiTitle);
					return {...data};
				
				case "line":
					data[name][2] = lineData(action.requestData, kpiTitle);
					return {...data};
				
				case 'line-curve':
					action.requestData.curve = true;
					data[name][2] = lineData(action.requestData, kpiTitle);
					return {...data};
				
				case "pie":
					data[name][2] = pieData(action.requestData, kpiTitle);
					return {...data};
				
				case "map":
					data[name][2] = mapData(action.requestData, kpiTitle);
					return {...data};
				
				case "funnel":
					data[name][2] = funnelData(action.requestData, kpiTitle);
					return {...data};
				
				case "card":
					data[name][2] = cardData(action.requestData, kpiTitle);
					
					return {...data};
			}
		
		case REQUEST_CHILD_REPORT:
			
			let title = action.name;
			if(!data[title])
			{
				data[title] = [];
			}
			
			data[title][0] = action.progress;
			if(!action.requestData)
			{
				return {...data};
			}
			
			data[title][1] = action.requestData;
			data[title][2] = changeOption(rpt_type, action.requestData);
			
			return {...data};
		
		default:
			return state;
	}
	
	return state;
}

function changeColumns(data)
{
	for(let i = 0; i < data.length; i++)
	{
		if(data[i] != null)
		{
			data[i].key = data[i].name;
			data[i].dataIndex = data[i].name;
		}
	}
	return data;
}

function changeOption(rpt_type, result, kpiTitle)
{
	
	let option = {};
	if(rpt_type == "detail")
	{
		option.rows = result.result.rows;
		option.columns = changeColumns(result.result.columns);
		
	}
	else
	{
		option = gridData(result, kpiTitle);
		
	}
	
	return option;
}
