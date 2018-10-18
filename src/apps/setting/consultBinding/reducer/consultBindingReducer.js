import { fromJS } from "immutable";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, token } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { getResultCode, dispatchAction, getAction } from "../../../../utils/ReduxUtils";
import {by} from "../../../../utils/MyUtil";
const GET_CONSULT_BINDING_PROGRESS = "GET_CONSULT_BINDING_PROGRESS",
    GET_CONSULT_BINDING_LIST = "GET_CONSULT_BINDING_LIST",
    GET_CONSULT_BINDING_DETAIL = "GET_CONSULT_BINDING_DETAIL",
    GET_BINDING_SHOP_GROUP = "GET_BINDING_SHOP_GROUP",
    GET_SHOP_GROUP_ITEM = "GET_SHOP_GROUP_ITEM";

/****************************获取咨询绑定列表***********************************/

export function getConsultBindingList()
{
	return dispatch => {
		let {siteId} = loginUserProxy();

		dispatch(getAction(GET_CONSULT_BINDING_PROGRESS, LoadProgressConst.LOADING));

		let settingUrl = Settings.querySettingUrl("/bind/", siteId);
		return urlLoader(settingUrl, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_CONSULT_BINDING_LIST, progress, result || {}));
		})
	}
}

/****************************获取咨询绑定详情***********************************/

export function getConsultBindingDetail(templateid)
{
	return dispatch => {
		let {siteId} = loginUserProxy();

		dispatch(getAction(GET_CONSULT_BINDING_PROGRESS, LoadProgressConst.LOADING));

		let settingUrl = Settings.querySettingUrl("/bind/", siteId, "/" + templateid);

		return urlLoader(settingUrl, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_CONSULT_BINDING_DETAIL, progress, result || {}));
		})
	}
}

/****************************修改咨询绑定信息***********************************/


export function editConsultBinding(data)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();

        data.siteid = siteId;

        dispatch(getAction(GET_CONSULT_BINDING_PROGRESS, LoadProgressConst.SAVING));

        let settingUrl = Settings.querySettingUrl('/bind/' , siteId , "/" + data.templateid);

        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                if (success)
                {
                    settingUrl = Settings.querySettingUrl("/bind/", siteId);
                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {

                            let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_CONSULT_BINDING_LIST, progress, result || {}));
                        })
                }

                dispatch(getAction(GET_CONSULT_BINDING_PROGRESS, progress));
            })
    }
}


/****************************获取商户分组操作***********************************/

export function getBindingShopGroup(type)
{
    return dispatch => {
        let {siteId, userId} = loginUserProxy();

        dispatch(getAction(GET_CONSULT_BINDING_PROGRESS, LoadProgressConst.LOADING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/groupmerchant/' + userId + "/" + type);
        return urlLoader(settingUrl, {headers: {token: token()}})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_BINDING_SHOP_GROUP, progress, result || {}));
            })
    }
}

export function clearConsultBindingErr()
{
    return dispatch =>
    {
        dispatch(getAction(GET_CONSULT_BINDING_PROGRESS, LoadProgressConst.LOAD_COMPLETE));
    }
}

/****************************Reducer***********************************/

let initState = fromJS({
		consultBindingList: [],
        consultBindingDetail: {},
        consultBindingShop: [],
        consultBindingShopItem: [],
        totalCount: 0,
		progress: 2,
        addChildProgress: 2
    }),
    shopGroupList = [];

export default function consultBindingReducer(state = initState, action) {

	switch(action.type)
	{
		case GET_CONSULT_BINDING_PROGRESS:
			return state.setIn(["progress"], action.progress);

        case GET_CONSULT_BINDING_LIST:
			return state.setIn(["consultBindingList"], action.result.data)
                .setIn(["progress"], action.progress);

        case GET_CONSULT_BINDING_DETAIL:
			return state.setIn(["consultBindingDetail"], action.result.data)
                .setIn(["progress"], action.progress);

        case GET_BINDING_SHOP_GROUP:
            shopGroupList = action.result.data;

			return state.setIn(["consultBindingShop"], shopGroupList)
                .setIn(["progress"], action.progress);
    }

    return state;
}

