import {
	GET_KPI, KPI_LIST, REPOET_VALUE, GET_CLIENTTAB, GET_PEND_CLIENTTAB, GET_COMPETENCE_TAB
} from '../../../model/vo/actionTypes'
import { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import { loginUserProxy } from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import { log } from "../../../lib/utils/LogUtil"

//--------------------------------action--------------------------------------

export function fetchList(result)
{
	return dispatch => {
		
		dispatch({
			type: GET_KPI,
			progress: LoadProgressConst.LOADING
		});
		
		getList(result)
		.then(result => {
			
			let progress = LoadProgressConst.LOAD_COMPLETE,
				data = result.result;
			
			if(!data || !Array.isArray(data))
			{
				progress = LoadProgressConst.LOAD_FAILED;
				data = [];
			}
			
			dispatch({
				type: KPI_LIST,
				progress: progress,
				result: data
			});
		});
	};
}

export function manualUpdateList(value)
{
	return dispatch => {
		
		dispatch({
			type: KPI_LIST,
			progress: LoadProgressConst.LOAD_COMPLETE,
			result: value
		});
	};
}

//获取报表库列表
function getList(groupName)
{
	let {siteId, userId} = loginUserProxy(),
		// url = Settings.getPantherUrl() + "/api/rptmetadata/rpt_col_group/" + groupName;
		url = Settings.getPantherUrl() + "/api/clientShow/menutree/" + groupName;
	
	return urlLoader(
		url, {
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(getReport)
}

export function getDashboardLibrary(dashboardName)
{
	return dispatch => {
		
		dispatch({
			type: GET_KPI,
			progress: LoadProgressConst.LOADING
		});
		
		getDashboardList(dashboardName)
		.then(result => {
			
			let progress = LoadProgressConst.LOAD_COMPLETE,
				data = result.reports;
			
			if(!data || !Array.isArray(data))
			{
				progress = LoadProgressConst.LOAD_FAILED;
				data = [];
			}
			
			dispatch({
				type: KPI_LIST,
				progress: progress,
				result: data
			});
		});
	};
}

function getDashboardList(groupName)
{
	let {siteId, userId} = loginUserProxy(),
		// url = Settings.getPantherUrl() + "/api/rptmetadata/rpt_col_group/" + groupName;
		url = Settings.getPantherUrl() + "/api/v1/dashboard/" + groupName + "/layout";
	
	return urlLoader(
		url, {
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(getReport)
}

function getReport(response)
{
	let listReport = response.jsonResult;
	return Promise.resolve(listReport);
}

//kpiTab显示
function getKpiTab(tabType)
{
	//kpi-release.ntalker.com/api/clientShow/list  kpi-dev.ntalker
	let url = Settings.getPantherUrl() + '/api/clientShow/' + tabType,
		{siteId, userId} = loginUserProxy();
	return urlLoader(
		url, {
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(getTab)
}

export function kpiTabList()
{
	return dispatch => {
		dispatch({
			type: GET_PEND_CLIENTTAB,
			progress: LoadProgressConst.LOADING
		});
		
		getKpiTab("list")
		.then(result => {
			let progress = LoadProgressConst.LOAD_COMPLETE,
				data = result.result,
				exportLimit = result.isExport;
			
			dispatch({
				type: GET_CLIENTTAB,
				progress: progress,
				data,
				exportLimit
			});
		});
	};
}

export function kpiCompetenceTab()
{
	return dispatch => {
		dispatch({
			type: GET_COMPETENCE_TAB,
			progress: LoadProgressConst.LOADING
		});
		
		getKpiTab("menutree")
		.then((result = {}) => {
			let progress = LoadProgressConst.LOAD_COMPLETE,
				data = result.menu_key;
			
			dispatch({
				type: GET_COMPETENCE_TAB,
				progress: progress,
				data
			});
		});
	};
}

function getTab(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

//--------------------------------Reducer--------------------------------------

let initState = {
	kpiTabs: [], newData: [],
	progress: LoadProgressConst.LOAD_COMPLETE, exportLimit: false
};

export default function reportsList(state = initState, action) {
	
	switch(action.type)
	{
		case GET_KPI:
			return {
				...state,
				progress: action.progress
			};
		
		case KPI_LIST:
			
			return {
				...state,
				data: action.result,
				progress: action.progress
			};
		
		case GET_PEND_CLIENTTAB:
			return {
				...state,
				progress: action.progress,
				kpiTabs: action.data || []
			};
		
		case GET_CLIENTTAB:
			
			return {
				...state,
				progress: action.progress,
				kpiTabs: action.data,
				exportLimit: action.exportLimit
			};
		
		case GET_COMPETENCE_TAB:
			
			return {
				...state,
				kpiLimit: action.data
			};
		
		default:
			return state;
	}
	
}
