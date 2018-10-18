import { fromJS } from "immutable";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, token } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { getResultCode, dispatchAction, getAction } from "../../../../utils/ReduxUtils";
import {by} from "../../../../utils/MyUtil";
const GET_CUSTOMER_TAB_PROGRESS = "GET_CUSTOMER_TAB_PROGRESS",
      GET_CUSTOMER_TAB_LIST = "GET_CUSTOMER_TAB_LIST",
      GET_CUSTOMER_TAB_PARAMS = "GET_CUSTOMER_TAB_PARAMS",
      ADD_TAB = "ADD_TAB",
      DEL_TAB = "DEL_TAB",
      EDIT_CUSTOMER_STATUS = "EDIT_CUSTOMER_STATUS",
      EDIT_TAB = "EDIT_TAB";

export function getCustomerTabParams()
{
	return dispatch => {
		let {siteId} = loginUserProxy();

		dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, LoadProgressConst.LOADING));

		let settingUrl = Settings.querySettingUrl("/customtab/", siteId, "/config");
		return urlLoader(settingUrl, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_CUSTOMER_TAB_PARAMS, progress, result || {}));
		})
	}
}

export function getCustomerTabList(data)
{
	return dispatch => {
		dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.querySettingUrl("/customtab/", siteId, "?page=" + data.page + "&rp=" + data.rp);

		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(getResultCode)
        .then(result => {

            let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

            dispatch(getAction(GET_CUSTOMER_TAB_LIST, progress, result || {}));
        });
	}
}

export function editCustomerStatus(data)
{
	return dispatch => {
		dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, ntoken} = loginUserProxy(),
            settingUrl = Settings.querySettingUrl("/customtab/", siteId, "/switch");

        data.siteid = siteId;

		return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(getResultCode)
        .then(result => {

            let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

            dispatch(getAction(EDIT_CUSTOMER_STATUS, progress));
            return Promise.resolve(result)
        });
	}
}

export function addTab(data)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/customtab/", siteId);
        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, progress));
                return Promise.resolve(result)
            })
    }
}

export function delTab(data)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/customtab/", siteId);
        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                Object.assign(result, data);
                dispatch(getAction(DEL_TAB, progress, result || {}));

                return Promise.resolve(result)
            })
    }
}

export function editTab(data)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        dispatch(getAction(GET_CUSTOMER_TAB_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/customtab/", siteId);
        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(EDIT_TAB, progress));
                return Promise.resolve(result)
            })
    }
}

//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
		tabList: [],
		total: 0,
        paramsData: [],
		progress: 2
    });

export default function customerTabReducer(state = initState, action) {

    let tabList = [],
        totalCount = 0;
	switch(action.type)
	{
		case GET_CUSTOMER_TAB_PROGRESS:
			return state.setIn(["progress"], action.progress);

        case GET_CUSTOMER_TAB_PARAMS:
			return state.setIn(["paramsData"], action.result.data);

		case GET_CUSTOMER_TAB_LIST:

            if (action.result && action.result.success)
            {
                tabList = action.result.data && action.result.data.customtabList || [];
                totalCount = action.result.data && action.result.data.count || 0;
                if (tabList.length > 0){
                    tabList.sort(by("rank"));
                    tabList.forEach((item, index) => {
                        item.rank = index + 1;
                        item.key = index;
                    })
                }

                return state.setIn(["progress"], action.progress)
                    .setIn(["tabList"], tabList)
                    .setIn(["total"], totalCount);
            }

            return state;

        case DEL_TAB:

            tabList = state.getIn(['tabList']) || [];
            totalCount = state.getIn(['total']);
            if (action.result && action.result.success)
            {
                tabList.sort(by("rank"));
                tabList.forEach((item, index) => {
                    if (item.tabid === action.result.tabid)
                    {
                        tabList.splice(index, 1)
                    }
                });
                tabList.forEach((item, index) => item.rank = index + 1);
                totalCount -= 1;
            }
            return state.setIn(["progress"], action.progress)
                .setIn(["tabList"], tabList)
                .setIn(["total"], totalCount);

        case EDIT_CUSTOMER_STATUS:
            return state.setIn(["progress"], action.progress);

    }

    return state;
}

