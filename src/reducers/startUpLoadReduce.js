import { fromJS } from "immutable";
import LoadProgressConst from "../model/vo/LoadProgressConst";
import {getResultCode, getAction} from "../utils/ReduxUtils";
import {loginUserProxy, configProxy, token} from "../utils/MyUtil";
import {urlLoader} from "../lib/utils/cFetch";

/**
 * LoadDataProxy加载数据
 * */
const GET_FLASHSERVER_COMPLETE = "getFlashServerComplete";
const GET_LOGO_COMPLETE = "getLogoComplete";
const GET_MAINNAVDATA_COMPLETE = "getMainNavDataComplete";
const GET_TOOLFUNCSDATA_COMPLETE = "getToolFuncsDataComplete";
const GET_CHATRIGHTTABS_COMPLETE = "getChatRightTabsComplete";  //右侧页签
const GET_FUNC_SWITCHER_COMPLETE = "GET_FUNC_SWITCHER_COMPLETE";  //功能开关
const GET_RECORD_FUNC_SWITCHER = "GET_RECORD_FUNC_SWITCHER";  //互动记录功能开关
const GET_RECORD_FUNC_SWITCHER_PROGRESS = "GET_RECORD_FUNC_SWITCHER_PROGRESS";  //互动记录功能开关
const GET_RECORD_CENTER_PERMISSION ="GET_RECORD_CENTER_PERMISSION";

//-------------------action---------------------

export function getFlashServerComplete(data)
{
	return dispatch =>
	{
		dispatch({
			type: GET_FLASHSERVER_COMPLETE,
			data
		});
	};
}

export function getMainNavDataComplete(data)
{
	return dispatch =>
	{
		dispatch({
			type: GET_MAINNAVDATA_COMPLETE,
			data
		});
	};
}


export function getLogoComplete(data)
{
	return dispatch =>
	{
		dispatch({
			type: GET_LOGO_COMPLETE,
			data
		});
	};
}

export function getToolFuncsDataComplete(data)
{
	return dispatch =>
	{
		dispatch({
			type: GET_TOOLFUNCSDATA_COMPLETE,
			data
		});
	};
}

export function getChatRightTabsComplete(data)
{
	return dispatch =>
	{
		dispatch({
			type: GET_CHATRIGHTTABS_COMPLETE,
			data
		});
	};
}

export function getFuncSwitcherComplete(data)
{
	return dispatch =>
	{
		dispatch({
			type: GET_FUNC_SWITCHER_COMPLETE,
			data
		});
	};
}

/*获取客服权限*/
export function getRecordSwither() {
    return dispatch =>
    {
        let {siteId} = loginUserProxy(),
            url = configProxy().nCrocodileServer + '/conversation/getKfPermission?siteId='+ siteId;

        dispatch(getAction(GET_RECORD_FUNC_SWITCHER_PROGRESS, LoadProgressConst.LOADING));

        return urlLoader(url, {headers: {token: token()}})
            .then(getResultCode)
            .then(result => {
                let {code, data} = result,
                    progress = code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_RECORD_FUNC_SWITCHER, progress, data || {}));
            })
    }
}

export function getCallCenterPermission(){
	return dispatch =>
    {
        let {siteId,userId,ntoken} = loginUserProxy(),
            url = configProxy().xNccSettingServer + `/sitecenter/evs/${siteId}/ccfunctions/${userId}`;

		return urlLoader(url, {headers: {token: ntoken}})
            .then(result => {
				let {jsonResult} = result,
					{data,code} = jsonResult,
					progress = code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
					
				
                dispatch({type:GET_RECORD_CENTER_PERMISSION,data});
            })
    }
}

let initState = fromJS({
	flashServerData: {},
	mainNavData: {},
	toolFuncsData: fromJS([]),
	chatRightTabs: {}
});

initState = initState.set("tabs", [])
.set("workbench", 0)
.set("personal", [])
.set("asidenavsetting", 0)
.set("communicationRecored", {})
.set("setting", [])
.set("settingOperation", [])
.set("logourl", "")
.set("record", {progress:2, data: []})
.set("callcenter",[]);

//-------------------reducer---------------------

export default function startUpLoadData(state = initState, action)
{
	switch(action.type)
	{
		case GET_FLASHSERVER_COMPLETE:
			return state.set("flashServerData", action.data);

		case GET_MAINNAVDATA_COMPLETE:
			return state.set("mainNavData", action.data);

		case GET_TOOLFUNCSDATA_COMPLETE:
			return state.set("toolFuncsData", action.data);

		case GET_CHATRIGHTTABS_COMPLETE:
			return state.set("chatRightTabs", action.data);

		case GET_LOGO_COMPLETE:
			return state.set("logourl", action.data);
		
		case GET_RECORD_CENTER_PERMISSION:
			return state.set("callcenter", action.data)

		case GET_FUNC_SWITCHER_COMPLETE:
			let {
				tabs, workbench, personal, setting, asidenavsetting, communicationRecored, settingOperation
            } = action.data;

			return state.set("tabs", tabs)
			.set("workbench", workbench)
			.set("personal", personal)
			.set("setting", setting)
			.set("settingOperation", settingOperation)
			.set("asidenavsetting", asidenavsetting)
			.set("communicationRecored", communicationRecored);

        case GET_RECORD_FUNC_SWITCHER:
            return state.set("record", action.result)
                .set("progress", action.progress);

        case GET_RECORD_FUNC_SWITCHER_PROGRESS:
            return state.set("progress", action.progress);

		case 'LOGOUT_SUCCESS':
			return initState;
	}

	return state;
}
