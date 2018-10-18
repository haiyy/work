import Settings from "../../../utils/Settings";
import { loginUserProxy, getLoadData } from "../../../utils/MyUtil";
import { Map, fromJS } from "immutable";

const QUEUE_LIST = 'QUEUE_LIST',
	QUEUE_LIST_COLUMNS = 'QUEUE_LIST_COLUMNS';

//获取排队列表已选项
export function getSelectedColumns()
{
	return dispatch =>
	{
		let {userId, siteId} = loginUserProxy(),
			url = `${Settings.getPersonInfoUrl()}/settings/${siteId}/${userId}/rptcol_rpt_queue_detail`;
		
		return getLoadData(url)
		.then(result =>
		{
			if(result.code === 200)
			{
				dispatch({
					type: QUEUE_LIST_COLUMNS,
					data: result.data
				});
			}
		});
	};
}

//设置列表已选项
export function setSelectedColumns(data)
{
	return dispatch =>
	{
		let body = JSON.stringify({data}),
			url = `${Settings.getPersonInfoUrl()}/settings/${siteId}/${userId}/rptcol_rpt_queue_detail`;
		
		return getLoadData(url, body, "PUT")
		.then((result) =>
		{
			result = result.jsonResult;
			
			if(result.code === 200)
			{
				dispatch({
					type: QUEUE_LIST_COLUMNS,
					data
				})
			}
			
			return result;
		});
	};
}

//获取访客排队列表
export function getQueueList(cols = [], name = "rpt_queue_detail")
{
	return dispatch =>
	{
		let body = {name, cols},
			url = `${Settings.getPantherUrl()}/api/report/${name}/v1`;
		
		body = JSON.stringify(body);
		
		return getLoadData(url, body, "put")
		.then(result =>
		{
			let {code, data = {}} = result;
			
			if(code === 200)
			{
				if(Array.isArray(data.rows))
				{
					dispatch({
						type: QUEUE_LIST,
						data: data.rows
					});
					
				}
			}
		});
	}
}

//-----------------------------------Reducer---------------------------------------------

export default function queueListReducer(state = Map(), action)
{
	if(!action.data)
		return state;
	
	switch(action.type)
	{
		case QUEUE_LIST:
			return state.set("queueList", action.data);
		
		case QUEUE_LIST_COLUMNS:
			return state.set("queueColumns", fromJS(action.data));
	}
	
	return state;
}