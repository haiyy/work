import Model from "../../../../utils/Model";
import { urlLoader } from "../../../../lib/utils/cFetch";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import Settings from "../../../../utils/Settings";
import { fromJS } from "immutable";

const PROGRESS = "PROGRESS",
	SET_RECEPTIONTIME = "SET_RECEPTIONTIME",
	GET_RECEPTIONTIME = "GET_RECEPTIONTIME",
	ADD_RECEPTIONITEM = "ADD_RECEPTIONITEM",
	DEL_RECEPTIONITEM = "DEL_RECEPTIONITEM",
	EDIT_RECEPTIONITEM = "EDIT_RECEPTIONITEM";

//接待时间文档
// http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=79659087
/**
 * 获取接待时间
 * */
export function getReceptionTime(templateid = "")
{
	return dispatch => {
		submit(GET_RECEPTIONTIME, dispatch, "GET", null, templateid);
	}
}

export function sureCooperate()
{
	return dispatch => {
		dispatch({type: PROGRESS, progress: LoadProgressConst.LOAD_COMPLETE});
	}
}

/**
 * 设置接待时间
 * */
export function setReceptionTime(data)
{
	return dispatch => {
		submit(SET_RECEPTIONTIME, dispatch, "PUT", data);
	}
}

export function addReceptionItem(data)
{
	return dispatch => {
		data.templateid = data.templateid ? data.templateid : []; //设置默认用户群
		submit(ADD_RECEPTIONITEM, dispatch, "POST", data, "item");
	}
}

export function delReceptionItem(items)
{
	return dispatch => {
		submit(DEL_RECEPTIONITEM, dispatch, "DELETE", {items}, "item");
	}
}

export function editReceptionItem(data)
{
	return dispatch => {
		submit(EDIT_RECEPTIONITEM, dispatch, "PUT", data, "item");
	}
}

function submit(type, dispatch, method, data, templateid = "")
{
	let progress = method === "GET" ? LoadProgressConst.LOADING : LoadProgressConst.SAVING;
	
	dispatch({type: PROGRESS, progress});
	
	let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
		{siteId: siteid, ntoken} = loginUserProxy;
	
	let settingUrl = Settings.querySettingUrl("/receivetime/", siteid, "/" + templateid),
		options = {};
	
	options.method = method;
	options.headers = {token: ntoken};
	
	if(data)
	{
		data.siteid = siteid;
		options.body = JSON.stringify(data);
	}
	
	return urlLoader(settingUrl, options)
	.then(({jsonResult}) => {
		
		let {code, data: result, msg} = jsonResult,
			progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
        
        if (method === "GET")
        {
            progress = code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED
        }else
        {
            progress = code == 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED
        }
        
		
		if(ADD_RECEPTIONITEM === type && code == 200)
		{
			data.itemid = result[0];
		}
		
		dispatch({
			type: type,
			progress,
			data: data ? data : result,
			msg
		})
	});
}

let initState = fromJS({progress: 2});
initState = initState.set("data", {});

export default function receptionTimeReducer(state = initState, action) {
	let data = state.get("data") || {},
		{receptionTime: reception} = data;
	
	switch(action.type)
	{
		case ADD_RECEPTIONITEM:
			if(reception && Array.isArray(reception.items) && action.data.itemid)
			{
				reception.items = reception.items.filter(value => value.itemid);
				reception.items.push(action.data);
			}
			
			return state.set("data", data)
			.set("progress", action.progress)
			.set("msg", action.msg);
		
		case DEL_RECEPTIONITEM:
			
			if(reception && Array.isArray(reception.items) && action.progress !== LoadProgressConst.LOAD_FAILED)
			{
				let items = reception.items,
					delList = action.data.items;
				
				for(var i = items.length - 1; i >= 0; i--)
				{
					if(delList.includes(items[i].itemid))
					{
						items.splice(i, 1);
					}
				}
				
				reception.items = [...items];
			}
			
			return state.set("data", data)
			.set("progress", action.progress)
			.set("msg", action.msg);
		
		case EDIT_RECEPTIONITEM:
			data = state.get("data") || {};
			
			if(reception && Array.isArray(reception.items) && action.progress !== LoadProgressConst.LOAD_FAILED)
			{
				let items = reception.items,
					index = items.findIndex(value => (Array.isArray(action.data.itemid) && action.data.itemid.includes(value.itemid))
						|| action.data.itemid === value.itemid),
					itemId = action.data.itemid;
				
				Array.isArray(itemId) && (action.data.itemid = itemId[0]);
				reception.items[index] = action.data;
			}
			
			return state.set("data", data)
			.set("progress", action.progress)
			.set("msg", action.msg);
		
		case SET_RECEPTIONTIME:
		case GET_RECEPTIONTIME:
			
			if(action.progress === LoadProgressConst.LOAD_COMPLETE)
			{
				state = state.set("data", action.data);
			}
			
			return state.set("progress", action.progress)
			.set("msg", action.msg);
		
		case PROGRESS:
			return state.set("progress", action.progress);
		
		default:
			return state;
	}
}


