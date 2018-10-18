import Lang from "../../../../im/i18n/Lang";

/**
 * data = {}
 * */
const NETWORK_ERROR = "network_error";

export function sendNetWork(data)
{
	if(!data)
	{
		data = {};
	}
	else
	{
		let {title = "网络", code, content = ""} = data;
		
		if(code)
		{
			content = Lang.getError(code);
			data.content = content;
			data.title = title;
		}
	}
	return dispatch =>
	{
		dispatch({
			type: NETWORK_ERROR,
			data
		});
	}
}

export default function netWorkReducer(state = {}, action)
{
	switch(action.type)
	{
		case NETWORK_ERROR:
			return {error: action.data};
	}
	
	return state;
}