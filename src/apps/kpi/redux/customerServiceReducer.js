import cFetch, { urlLoader } from '../../../lib/utils/cFetch'
import Settings from '../../../utils/Settings'
import {loginUserProxy} from "../../../utils/MyUtil"
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import {gridData} from "../view/kpiService/gridData";

const CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
      SELECTION_COLUMN = 'SELECTION_COLUMN',
	  GET_DATA = 'GET_DATA';

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
	.then(
		(result) => {
			if( result.jsonResult.state != "ok" )
			{
				getLoadData(id,dispatch);

			}
			else
			{
				dispatch({
					type: CUSTOMER_SERVICE,
					progress: LoadProgressConst.LOAD_COMPLETE,
					result: result.jsonResult
				});
			}
		}
	)
}

//获取客服往来明细报表随机id
export function customerService({ qry, cols = "" }) {
	return dispatch => {

		dispatch({
			type: GET_DATA,
			progress: LoadProgressConst.LOADING
		});

        let url = `${Settings.getPantherUrl()}/api/report/rpt_cooperation/v1`;
        let {siteId, userId} = loginUserProxy(),
            options={
                headers:{
                    'siteid': siteId,
                    'userid': userId,
                    'isExport':"unexport"
                },
                method:'PUT',
                body:JSON.stringify({
                    "name": "rpt_cooperation",
                    "qry": qry
                })
            };
        return urlLoader(url,options).
        then(
            (result)=>{

                dispatch({
                    type: CUSTOMER_SERVICE,
                    progress: LoadProgressConst.LOAD_COMPLETE,
                    result: result.jsonResult
                });
            })
	}
}


//--------------------------------Reducer--------------------------------------
let newData = {};
export default function customerServiceReducer(state={},action){

	switch(action.type){
		case GET_DATA:
			return {
				data: newData,
				progress: action.progress
			};
		case CUSTOMER_SERVICE:
			newData = gridData(action.result.result);

			return {
				data: newData,
				progress: action.progress
			};
		case SELECTION_COLUMN:
			//newData = gridData(action.result);
			newData.columns = action.result;
		default:
			return state;
	}
	return state;
}

