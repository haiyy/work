
import { gridData } from './gridData.js'
import cFetch, { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import moment from 'moment'
import {loginUserProxy} from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"

const GET_REPORT_DETAILS = 'GET_REPORT_DETAILS',
	REPORT_DETAILS = 'REPORT_DETAILS';

//--------------------------------action--------------------------------------
//根据报表随机id请求报表业务数据
function getLoadData(id, dispatch, name){
	
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
					type: REPORT_DETAILS,
					progress: LoadProgressConst.LOAD_FAILED,
					name: name
					
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
					type: REPORT_DETAILS,
					progress: LoadProgressConst.LOAD_COMPLETE,
					result: result.jsonResult,
					name: name
					
				});
			}
		}
	)
}

//获取详细数据报表随机id
export function reportDetails({name, qry, cols=""})
{
    return dispatch => {

        dispatch({
            type: GET_REPORT_DETAILS,
            name: name,
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
                    type: REPORT_DETAILS,
                    progress: LoadProgressConst.LOAD_COMPLETE,
                    result: result.jsonResult,
                    name: name
                });
            })
    }
}

//--------------------------------Reducer--------------------------------------
let newData = {};
export default function reportDetailsReducer(state={},action)
{
	
	switch(action.type){
		case GET_REPORT_DETAILS:
			newData.progress = action.progress;
			return {
				data: { ...newData }
			}
		case REPORT_DETAILS:
			newData.progress = action.progress;
			newData.data = gridData(action.result);
			newData.name = action.name;
			return {
				data: { ...newData }
			}
		default:
			return state;
	}
	return state;
}

