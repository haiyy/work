import {
	GET_TRASHOPS, TRASHOPS
} from '../model/vo/actionTypes';
import { urlLoader } from '../lib/utils/cFetch';
import Settings from '../utils/Settings';
import { message } from 'antd';

function getTraShops(ntid, result)
{
	return {
		type: GET_TRASHOPS,
		ntid,
		result
	};
}

export function fetchTraShops(ntid, page)
{
	return (dispatch, getState) => {
		return urlLoader(Settings.getSkyEyeUrl(ntid, "Product", page), {headers: {"token": Settings.getSkyEyeToken()}})
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
					dispatch(getTraShops(ntid, response.jsonResult));
				}
			}
		});
	};
}
