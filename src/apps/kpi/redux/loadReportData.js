const LOAD_REPORT = 'LOAD_REPORT';

//--------------------------------action--------------------------------------

//改变列表数据
export function loadReport({list, query})
{
	return dispatch => {
		dispatch({
			type: LOAD_REPORT,
			list,
			query
		});
	}
}

//--------------------------------Reducer--------------------------------------
export default function loadReportData(state = {}, action) {
	
	switch(action.type)
	{
		case LOAD_REPORT:
			
			return {
				list: action.list,
				query: action.query
			}
			
		default:
			return state;
	}
	
	return state;
}

