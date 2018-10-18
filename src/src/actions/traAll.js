import {
	SET_NTID, GET_TRAALL, GET_TRAWEB, REFRESH_TRAIL
} from '../model/vo/actionTypes';
import { urlLoader } from '../lib/utils/cFetch';
import Settings from '../utils/Settings';

function getTraAll(ntid, result)
{
	return {
		type: GET_TRAALL,
		ntid,
		result
	};
}

function getTraWeb(ntid, result)
{
	return {
		type: GET_TRAWEB,
		ntid,
		result
	};
}

export function fetchNtid(ntid)
{
	return {
		type: SET_NTID,
		ntid
	}
}

export function fetchTraAll(ntid, page)
{
	return (dispatch, getState) => {
		return urlLoader(
			Settings.getSkyEyeUrl(ntid, "all", page),
			{
				headers: {
					"token": Settings.getSkyEyeToken()
				}
			}
		)
		.then((response) => {
				dispatch(getTraAll(ntid, response.jsonResult));
			}
		);
	};
}

export function fetchTraWeb(ntid, page)
{
	return (dispatch, getState) => {
		return urlLoader(
			Settings.getSkyEyeUrl(ntid, "all", page),
			{
				headers: {
					"token": Settings.getSkyEyeToken()
				}
			}
		)
		.then((response) => {
				dispatch(getTraWeb(ntid, response.jsonResult));
			}
		);
	};
}

export function refreshTrailData()
{
	return {
		type: REFRESH_TRAIL
	}
}
