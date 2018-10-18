import { GET_SENSITIVEWORD, SET_SENSITIVEWORD } from '../../../../model/vo/actionTypes';

let sensitiveData = [];

export function sensitiveWord(state = {}, action)
{
	
	let progress;
	
	switch(action.type)
	{
		case GET_SENSITIVEWORD:
			if(action.result && action.result.success)
			{
				sensitiveData = action.result.data;
			}
			
			progress = changeProgress(action);
			
			return {
				data: sensitiveData,
				progress
			};
		case SET_SENSITIVEWORD:
			
			if(action.success)
			{
				sensitiveData = action.data.sensitiveWords
			}
			
			progress = changeProgress(action);
			
			return {
				data: sensitiveData,
				progress
			};
		default:
			return state;
	}
}

function changeProgress(action)
{
	let progress = {};
	if(action.hasOwnProperty("left"))
	{
		progress = action.left;
	}
	
	return progress;
}
