
import { gridData } from './gridData.js'
import cFetch, { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import moment from 'moment'
import {loginUserProxy} from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"

const GET_LINE_DETAILS = 'GET_LINE_DETAILS',
	LINE_DETAILS = 'LINE_DETAILS';

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
					type: LINE_DETAILS,
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
					type: LINE_DETAILS,
					progress: LoadProgressConst.LOAD_COMPLETE,
					result: result.jsonResult.result

				});
			}
		}
	)
}

//获取周报/月报报表随机id
export function lineDetailsData({name, qry, cols = "" })
{
	return dispatch => {
		dispatch({
			type: GET_LINE_DETAILS,
			progress: LoadProgressConst.LOADING
		});

        let url = `${Settings.getPantherUrl()}/api/report/${name}/v1`;
        let {siteId, userId} = loginUserProxy(),
            options={
                header:{
                    'siteid': siteId,
                    'userid': userId,
                    'isExport':"unexport"
                },
                method:'PUT',
                body:JSON.stringify({
                    "name": name,
                    "qry": qry
                })
            }
        return urlLoader(url,options).
        then(
            (result)=>{
                dispatch({
                    type: LINE_DETAILS,
                    progress: LoadProgressConst.LOAD_COMPLETE,
                    result: result.jsonResult.result
                });
            })
    }
}

//--------------------------------Reducer--------------------------------------
let newData = {};
export default function lineDetails(state={},action){

	switch(action.type){
		case GET_LINE_DETAILS:
			return {
				progress: action.progress
			}
		case LINE_DETAILS:
			newData = gridData(action.result);
			return {
				data: {...newData},
				progress: action.progress
			}
		default:
			return state;
	}
	return state;
}

