import { gridData } from './gridData.js'
import cFetch, { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import moment from 'moment'
import {loginUserProxy} from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"

const GET_WEEKLY = 'GET_WEEKLY',
	  REPOET_WEEKLY = 'REPOET_WEEKLY';

//--------------------------------action--------------------------------------
//根据报表随机id请求报表业务数据
function getLoadData(id,dispatch){

	let {siteId, userId} = loginUserProxy(),
		url = `${Settings.getPantherUrl()}/api/report/${id}`;
	return urlLoader(
		url, {
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(result =>
		{
			if(!result.jsonResult.hasOwnProperty('state'))
			{
				dispatch({
					type: REPOET_WEEKLY,
					progress: LoadProgressConst.LOAD_FAILED

				});
				return null;
			}
			if( result.jsonResult.state != "ok" )
			{
				getLoadData(id,dispatch);

			}
			else
			{
				dispatch({
					type: REPOET_WEEKLY,
					progress: LoadProgressConst.LOAD_COMPLETE,
					result: result.jsonResult

				});
			}
		}
	)
}

//获取周报/月报报表随机id
export function weeklyMonthly({ qry, cols = "" }, weeklyName) {
	return dispatch => {
        dispatch({
            type: GET_WEEKLY,
            progress: LoadProgressConst.LOADING
        });
        let url = `${Settings.getPantherUrl()}/api/report/${weeklyName}/v1`;
        let {siteId, userId} = loginUserProxy(),
            options={
                headers:{
                    'siteid': siteId,
                    'userid': userId,
                    'isExport':"unexport"
                },
                method:'PUT',
                body:JSON.stringify({
                    "name": {weeklyName},
                    "qry": qry
                })
            };
        return urlLoader(url,options)
            .then(
            (result)=>{
                dispatch({
                    type: REPOET_WEEKLY,
                    progress: LoadProgressConst.LOAD_COMPLETE,
                    result: result.jsonResult
                });
            })
	}
}

//--------------------------------Reducer--------------------------------------
let newData = {};
export default function weeklyDetails(state={},action){

	switch(action.type){
		case GET_WEEKLY:
			return {
				data: newData,
				progress: action.progress
			};
		case REPOET_WEEKLY:
			newData = gridData(action.result);
			return {
			    data: newData,
				progress: action.progress
			};
		default:
			return state;
	}
}

