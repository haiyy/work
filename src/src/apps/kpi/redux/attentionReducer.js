import { GET_ATTENTION, ATTENTION_LIST, UNSUBSCRIBE, SUBSCRIBE, UNSUBSCRIBE_PROGRESS, SUBSCRIBE_PROGRESS, RESET_SUBSCRIBE_PROGRESS, GET_KPI, KPI_LIST } from '../../../model/vo/actionTypes';
import { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import { loginUserProxy } from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import { log } from "../../../lib/utils/LogUtil"

//--------------------------------action--------------------------------------

//获取我关注的报表列表
function getList()
{
	let url = Settings.getPantherUrl() + "/api/rptmetadata/mtc/concern",
		{siteId, userId} = loginUserProxy();
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

//获取我关注的报表
export function attentionReportList(result)
{
	return dispatch => {
		
		dispatch({
			type: GET_KPI,
			progress: LoadProgressConst.LOADING
		});
		
		dispatch({
			type: GET_ATTENTION,
			progress: LoadProgressConst.LOADING
		});
		
		getList(result)
		.then(result => {
			let progress = LoadProgressConst.LOAD_COMPLETE,
				data = result;
			
			if(!result || !Array.isArray(result))
			{
				progress = LoadProgressConst.LOAD_FAILED;
				data = [];
			}
			
			dispatch({
				type: KPI_LIST,
				progress: progress,
				result:data
			});
			
			dispatch({
				type: ATTENTION_LIST,
				progress: progress,
				data
			});
		});
	};
}

function getReport(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

//添加关注 addAttention
export function subscribe(name, value)
{
	return dispatch => {
		
		dispatch({
			type: SUBSCRIBE_PROGRESS,
			progress: LoadProgressConst.SAVING
		});
		
		let {siteId, userId} = loginUserProxy();
		let body = {
			"reportName": name,
			"operation": "concern",
			"user": userId
		};
		
		let url = Settings.getPantherUrl() + "/api/rptsetting";
		
		urlLoader(url, {
			method: 'post',
			headers: {
				'siteid': siteId,
				'userid': userId
			},
			body: JSON.stringify(body)
		})
		.then(({jsonResult: {code}}) => {
			let progress = code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			
			dispatch({
				type: SUBSCRIBE,
				data: value,
				progress
			});
			
		})
	}
}

//改变报表列表
export function changeAttention(state, data)
{
	return dispatch => {
		if(state)
		{
			dispatch({
				type: SUBSCRIBE,
				data
			});
		}
		else
		{
			dispatch({
				type: UNSUBSCRIBE,
				data
			});
		}
	}
}

export function resetProgress()
{
	return dispatch => {
		dispatch({
			type: RESET_SUBSCRIBE_PROGRESS,
			progress: LoadProgressConst.LOAD_COMPLETE
		});
	}
}

//删除关注
export function unsubscribe(name)
{
	let {siteId, userId} = loginUserProxy(),
		url = `${Settings.getPantherUrl()}/api/rptsetting/${userId}/${name}/concern`;
	
	return dispatch => {
		
		dispatch({
			type: UNSUBSCRIBE_PROGRESS,
			progress: LoadProgressConst.LOADING
		});
		
		return urlLoader(url, {
			method: 'delete',
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		})
		.then(({jsonResult: {code}}) => {
			let progress = code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			
			dispatch({
				type: UNSUBSCRIBE,
				data: name,
				progress
			});
		})
	}
}

//--------------------------------Reducer--------------------------------------
//返回一个新的state
let newData = [];
export default function attentionList(state = {}, action) {
	
	switch(action.type)
	{
		case GET_ATTENTION:
			return {
				progress: action.progress,
				data: newData
			}
		case ATTENTION_LIST:
			newData = action.data;
			return {
				progress: action.progress,
				data: [...newData]
			}
		case SUBSCRIBE:
			newData.push(action.data);
			
			return {
				progress: action.progress,
				data: [...newData]
			}
		
		case SUBSCRIBE_PROGRESS:
		case UNSUBSCRIBE_PROGRESS:
		case RESET_SUBSCRIBE_PROGRESS:
			return {...state, progress: action.progress};
		
		case UNSUBSCRIBE:
			for(let i = newData.length; i--;)
			{
				if(newData[i].name === action.data)
				{
					newData.splice(i, 1);
					break;
				}
			}
			
			return {
				progress: action.progress,
				data: [...newData]
			}
		default:
			return state;
	}
	return state;
}
