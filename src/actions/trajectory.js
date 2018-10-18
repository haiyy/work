import {
  GET_TRAJECTORY, TRAJECTORY
} from '../model/vo/actionTypes';
import { message } from 'antd'
import { cFetch } from "../lib/utils/cFetch";

function getTrajectory(result)
{
	return {
		type: GET_TRAJECTORY,
		result,
	};
}

export function fetchTrajectory(result)
{
	return dispatch => {
		dispatch({
			type: TRAJECTORY,
			result,
		});
		return cFetch(API_CONFIG.trajectory, {method: "GET"})
		.then((response) => {
			if(response.jsonResult.error_code === 4001)
			{
				message.error(response.jsonResult.error_message);
			}
			else
			{
				dispatch(getTrajectory(response.jsonResult));
			}
		});
	};
}
