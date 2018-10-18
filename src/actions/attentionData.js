import {
  GET_ATTENTION, ATTENTION_LIST, UNSUBSCRIBE, SUBSCRIBE
} from '../model/vo/actionTypes';
import {urlLoader} from '../lib/utils/cFetch';
import Model from "../utils/Model";
import Settings from '../utils/Settings';


//获取我关注的报表列表
function getList(result) {
	//console.log(result);
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		url = Settings.getPantherUrl() + "/api/rptmetadata/mtc/concern",
		token = loginUserProxy.token.nPantherToken;
  return urlLoader(
	  url, {
      headers: {
        'token': token
      }
    }
  )
	.then(getReport)
}

//获取我关注的报表
export function attentionList(result) {
	//console.log("attentionData>>>attentionList");
  return dispatch => {
    getList(result).then((result)=>{

			dispatch({
				type: GET_ATTENTION,
				result
			});
		},(error)=>{
			console.log(error);
		});
  };
}

function getReport(response)
{

	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

//添加关注 addAttention
export function subscribe(name){
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		userId = loginUserProxy.userId,
		token = loginUserProxy.token.nPantherToken;

    let body = {
	    "reportName": name,
	    "operation": "concern",
	    "user": userId
    };
    let url = Settings.getPantherUrl() + "/api/rptsetting";
	return urlLoader(url, {
	    method: 'post',
	    headers: {
          'token': token,
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify(body)
	})
	.then(getReport)
}


//删除关注
export function unsubscribe(name){
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		userId = loginUserProxy.userId,
		token = loginUserProxy.token.nPantherToken,
		url = `${Settings.getPantherUrl()}/api/rptsetting/${userId}/${name}/concern`;

	return urlLoader(url, {
	    method: 'delete',
		headers: {
			'token': token
		}
	})
	.then(getReport)
}
