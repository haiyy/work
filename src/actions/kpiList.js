import {
	GET_KPI, KPI_LIST,REPOET_VALUE
} from '../model/vo/actionTypes'
import cFetch, { urlLoader } from '../lib/utils/cFetch'
import Settings from '../utils/Settings'
import Model from "../utils/Model"
import moment from 'moment'

let countMax = 20;
let data = [];
let names = [];

export function fetchList(result) {

	return dispatch => {
		getList(result).then((result)=>{
			dispatch({
				type: GET_KPI,
				result
			});
		},(error)=>{
			console.log(error);
		});
	};
}

//获取报表库列表
function getList(result) {
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		token = loginUserProxy.token.nPantherToken,
		url = Settings.getPantherUrl() + "/api/rptmetadata/mtc";
	
    return urlLoader(
	    url, {
	      headers: {
	        'token': token
	      }
	    }
    )
	.then(getReport)
}

function getReport(response)
{
	let listReport = response.jsonResult;
    if(!listReport || listReport.length <= 0)
    return;
	return Promise.resolve(listReport);
}

//根据报表随机id请求报表业务数据
function getLoadData(id,dispatch,name){
	let obj = data[names.indexOf(name)];
	//let index;
	for(let i = 0; i<obj[name].length; i++)
	{
		if(i == obj[name].length-1)
		{
			id = obj[name][i].offline
		}
	}
	//console.log("id>>>",id);
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		token = loginUserProxy.token.nPantherToken,
		url = `${Settings.getPantherUrl()}/api/report/${id}`;
	return urlLoader(
		url, {
		    headers: {
			    'token': token
		    }
		}
	)
	.then(
        (result) => {
	        if( result.jsonResult.state != "ok" )
	        {

		        getLoadData(id,dispatch,name);

	        }
	        else
	        {
	            dispatch({
                    type: REPOET_VALUE,
                    result: result.jsonResult,
                    name: name

                });
	        }
        }
     )
}

//获取报表随机id
export function report(name,qry) {

  return dispatch => {

	  //console.log("data>>query>>",qry);
	  let date1 = moment().startOf('d').subtract(1, 'd').add(1, 'days').format("YYYY-MM-DD HH:mm:ss"),
		  date2 = moment().format("YYYY-MM-DD HH:mm:ss");
	  let query = qry.length ? qry : `datetime|between|${date1},${date2}`;
	  
       let body,
	       loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
	       siteId = loginUserProxy.siteId,
	       token = loginUserProxy.token.nPantherToken,
	       url = `${Settings.getPantherUrl()}/api/report/${name}/v1`;
       
	   query = query + '&&business|=|' + siteId;
	
	   body = {
		   "name":name,
		   "qry":query
	   }
	   
	       body = JSON.stringify(body);
	       
       return urlLoader(
		   url, {
		       method: 'put',
		       headers: {
		         'token': token,
		         'Content-Type':'application/json'
		       },
		       body: body
	       }
       ).then(
	       (result) => {
	       	let id = result.jsonResult.id;
            let value = {};

            if(data.length == 0)
            {
	            value[name] = [];
	            value[name].push(
		            {
		                "offline" : id
		            }
	            );
	            names.push(name);
	            data.push(value);
            }else
            {
		         if( names.indexOf(name) == -1)
		         {
			         value[name] = [];
			         value[name].push(
				         {
					         "offline" : id
				         }
			         );
			         names.push(name);
			         //console.log("value>>>>",value);
			         data.push(value);
		         }else
		         {
		            let obj = data[names.indexOf(name)];
		            obj[name].push({
			            "offline" : id
		            });
		         }
            }

	        getLoadData(id,dispatch,name);

     }
    )
  }
}
