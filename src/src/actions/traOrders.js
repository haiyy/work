import {
	GET_TRAORDERS, TRAORDERS
} from '../model/vo/actionTypes';
import { urlLoader } from '../lib/utils/cFetch';
import Settings from '../utils/Settings';
import { message } from 'antd';

function getTraOrders(ntid, result)
{
	return {
		type: GET_TRAORDERS,
		ntid,
		result
	};
}

export function fetchTraOrders(ntid, page)
{
	return (dispatch, getState) => {
		return urlLoader(Settings.getSkyEyeUrl(ntid, "Order", page), {headers: {"token": Settings.getSkyEyeToken()}})
		.then((response) => {
			if(response.jsonResult.error_code === 4001)
			{
				message.error(response.jsonResult.error_message);
			}
			else
			{
				const currentNtid = getState().trajectoryReducer.ntid;
				if(!currentNtid || ntid === currentNtid)
				{
					dispatch(getTraOrders(ntid, response.jsonResult));
				}
			}
		});
	};
}
