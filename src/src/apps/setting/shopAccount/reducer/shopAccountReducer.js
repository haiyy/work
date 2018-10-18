import { fromJS } from "immutable";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, token } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { getResultCode } from "../../../../utils/ReduxUtils";
const GET_SHOP_PROGRESS = "GET_SHOP_PROGRESS",
    GET_SHOP_GROUP = "GET_SHOP_GROUP",
    ADD_SHOP_GROUP = "ADD_SHOP_GROUP",
    DEL_SHOP_GROUP = "DEL_SHOP_GROUP",
    EDIT_SHOP_GROUP = "EDIT_SHOP_GROUP",

    GET_SHOP_ITEM = "GET_SHOP_ITEM",
    ADD_SHOP_ITEM = "ADD_SHOP_ITEM",
    DEL_SHOP_ITEM = "DEL_SHOP_ITEM",
    EDIT_SHOP_ITEM = "EDIT_SHOP_ITEM",

    GET_SHOP_ACCOUNT_LIST = "GET_SHOP_ACCOUNT_LIST",
    ADD_SHOP_ACCOUNT = "ADD_SHOP_ACCOUNT",
    DEL_SHOP_ACCOUNT = "DEL_SHOP_ACCOUNT",
    EDIT_SHOP_ACCOUNT = "EDIT_SHOP_ACCOUNT";

/****************************商户分组操作***********************************/

export function clearErrorNewGroupProgress() {
    return dispatch =>
    {
        dispatch(getAction(GET_SHOP_PROGRESS, "left", LoadProgressConst.LOAD_COMPLETE));
    }
}

export function getShopGroup()
{
	return dispatch => {
		let {siteId} = loginUserProxy();

		dispatch(getAction(GET_SHOP_PROGRESS, "left", LoadProgressConst.LOADING));

		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');
		return urlLoader(settingUrl, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

            dispatch(getAction(GET_SHOP_GROUP, "left", progress, result));

		})
	}
}

export function addShopGroup(newGroupInfo = {})
{
	return dispatch => {
		dispatch(getAction(GET_SHOP_PROGRESS, "left", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy();

		let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');

        newGroupInfo.siteid = siteId;

		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(newGroupInfo)})
		.then(getResultCode)
        .then(result => {
            let progress;

            if (result.code === 200)
            {
                progress = LoadProgressConst.SAVING_SUCCESS;
                newGroupInfo.groupid = result.data;

                let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');
                return urlLoader(settingUrl, {headers: {token: token()}})
                    .then(getResultCode)
                    .then(result => {

                        let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                        dispatch(getAction(GET_SHOP_GROUP, "left", progress, result));
                    })

            }else if (result.code === 400)
            {
                progress = LoadProgressConst.DUPLICATE;
            }else if (result.code === 401)
            {
                progress = LoadProgressConst.LEVEL_EXCEED;
            }else if (result.code === 406)
            {
                progress = LoadProgressConst.ACCOUNT_EXCEED;
            }else
            {
                progress = LoadProgressConst.SAVING_FAILED;
            }

            dispatch(getAction(GET_SHOP_PROGRESS, "left", progress));
        });
	}
}

export function delShopGroup(groupid)
{
	return dispatch => {
		dispatch(getAction(GET_SHOP_PROGRESS, "left", LoadProgressConst.SAVING));

		let {siteId, ntoken} = loginUserProxy(),
            settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');

		return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(groupid)})
		.then(getResultCode)
        .then(result => {

            let success = result.code === 200,
                progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code == 405 ? LoadProgressConst.UNDELETED : LoadProgressConst.SAVING_FAILED;

            if (success)
            {
                let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');
                return urlLoader(settingUrl, {headers: {token: token()}})
                    .then(getResultCode)
                    .then(result => {

                        let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                        dispatch(getAction(GET_SHOP_GROUP, "left", progress, result));
                    })
            }

            dispatch(getAction(GET_SHOP_PROGRESS, "left", progress));
        });
	}
}

export function editShopGroup(data)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();
        data.siteid = siteId;

        dispatch(getAction(GET_SHOP_PROGRESS, "left", LoadProgressConst.SAVING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');
        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : result.code == 400 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                if (success)
                {
                    let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/group');
                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {

                            let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_SHOP_GROUP, "left", progress, result));
                        })
                }

                dispatch(getAction(GET_SHOP_PROGRESS, "left", progress));
            })
    }
}
/****************************商户操作***********************************/

export function clearErrorNewItemProgress() {
    return dispatch =>
    {
        dispatch(getAction(GET_SHOP_ITEM, "right", LoadProgressConst.LOAD_COMPLETE));
    }
}

export function enableShopItem(data, siteid)
{
    return dispatch => {

        let {ntoken} = loginUserProxy();

        dispatch(getAction(GET_SHOP_ITEM, "right", LoadProgressConst.SAVING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/merchant/switch');

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                dispatch(getAction(GET_SHOP_ITEM, "right", progress));
            })
    }
}

export function getSearchShopItem(queryInfo)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy(),
            settingUrl;
        queryInfo.siteid = siteId;
        dispatch(getAction(GET_SHOP_ITEM, "right", LoadProgressConst.LOADING));

        settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/searchMerchants');

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(queryInfo)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_SHOP_ITEM, "right", progress, result || {}));
            })
    }
}

export function getShopItem(queryInfo)
{
    return dispatch => {

        let {siteId} = loginUserProxy(),
            settingUrl;

        dispatch(getAction(GET_SHOP_ITEM, "right", LoadProgressConst.LOADING));

        settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/'+ queryInfo.groupid + "/" + queryInfo.page + "/" + queryInfo.size);

        if (!queryInfo.groupid)
            settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/' + queryInfo.page + "/" + queryInfo.size);

        return urlLoader(settingUrl, {headers: {token: token()}})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_SHOP_ITEM, "right", progress, result || {}));
            })
    }
}

export function addShopItem(data, pageData, groupid)
{
    return dispatch => {

        let {siteId, ntoken} = loginUserProxy();

        dispatch(getAction(ADD_SHOP_ITEM, "right", LoadProgressConst.SAVING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + data.siteid + '/merchant');

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code === 401 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;
                result.newItem = data;

                if (success)
                {
                    settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/'+ groupid + "/" + pageData + "/" + 10);

                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {

                            let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_SHOP_ITEM, "right", progress, result || {}));
                        })
                }else
                {
                    dispatch(getAction(ADD_SHOP_ITEM, "right", progress));
                }
            })
    }
}

export function delShopItem(delObj, pageData, groupid, isSearch, searchInfo)
{
    return dispatch => {
        dispatch(getAction(ADD_SHOP_ITEM, "right", LoadProgressConst.SAVING));

        let {ntoken, siteId} = loginUserProxy(),
            settingUrl = Settings.queryPathSettingUrl('/enterprise/' + delObj.siteid + '/merchant');

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(delObj)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
                if (success)
                {
                    if (isSearch)
                    {
                        settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteId + '/searchMerchants');

                        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(searchInfo)})
                            .then(getResultCode)
                            .then(result => {

                                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                                dispatch(getAction(GET_SHOP_ITEM, "right", progress, result || {}));
                            })
                    }else
                    {
                        settingUrl = !groupid ?
                            Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/' + pageData + "/" + 10) :
                            Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/'+ groupid + "/" + pageData + "/" + 10);

                        return urlLoader(settingUrl, {headers: {token: token()}})
                            .then(getResultCode)
                            .then(result => {

                                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                                dispatch(getAction(GET_SHOP_ITEM, "right", progress, result || {}));
                            })
                    }
                }else
                {
                    dispatch(getAction(ADD_SHOP_ITEM, "right", progress));
                }
                dispatch(getAction(ADD_SHOP_ITEM, "right", progress));
            });
    }
}

export function editShopItem(data, pageData, groupid)
{
    return dispatch => {

        let {ntoken, siteId} = loginUserProxy();

        dispatch(getAction(ADD_SHOP_ITEM, "right", LoadProgressConst.SAVING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + data.siteid + '/merchant');
        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code === 401 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                if (success)
                {
                    settingUrl = !groupid ?
                        Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/' + pageData + "/" + 10) :
                        Settings.queryPathSettingUrl('/enterprise/' + siteId + '/platform/'+ groupid + "/" + pageData + "/" + 10);

                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {

                            let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_SHOP_ITEM, "right", progress, result || {}));
                        })
                }else
                {
                    dispatch(getAction(ADD_SHOP_ITEM, "right", progress));
                }
            })
    }
}

/****************************商户下账号操作***********************************/
export function getShopAccountListEmpty()
{
    return dispatch => {
        dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", LoadProgressConst.LOAD_COMPLETE, []));
    }
}

export function getShopAccountList(siteid)
{
    return dispatch => {

        let settingUrl;

        dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", LoadProgressConst.LOADING));

        settingUrl = Settings.queryPathSettingUrl('/enterprise/' + siteid + '/merchant/user');

        return urlLoader(settingUrl, {headers: {token: token()}})
            .then(getResultCode)
            .then(result => {
                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress, result || {}));
            })
    }
}

export function addShopAccount(data)
{
    return dispatch => {

        let {ntoken} = loginUserProxy();

        dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", LoadProgressConst.SAVING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + data.siteid + '/merchant/user');

        return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                if (success)
                {
                    settingUrl = Settings.queryPathSettingUrl('/enterprise/' + data.siteid + '/merchant/user');

                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {


                            let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress, result || {}));
                        })
                }
                dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress));
            })
    }
}

export function delShopAccount(useridObj)
{
    return dispatch => {
        dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", LoadProgressConst.SAVING));

        let {ntoken} = loginUserProxy(),
            settingUrl = Settings.queryPathSettingUrl('/enterprise/' + useridObj.siteid + '/merchant/user');

        return urlLoader(settingUrl, {method: "DELETE", headers: {token: ntoken}, body: JSON.stringify(useridObj)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                if (success)
                {
                    settingUrl = Settings.queryPathSettingUrl('/enterprise/' + useridObj.siteid + '/merchant/user');

                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {

                            let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress, result || {}));
                        })
                }

                dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress));
            });
    }
}

export function editShopAccount(data)
{
    return dispatch => {

        let {ntoken} = loginUserProxy();

        dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", LoadProgressConst.SAVING));

        let settingUrl = Settings.queryPathSettingUrl('/enterprise/' + data.siteid + '/merchant/user');
        return urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let success = result.code === 200,
                    progress = success ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

                if (success)
                {
                    settingUrl = Settings.queryPathSettingUrl('/enterprise/' + data.siteid + '/merchant/user');

                    return urlLoader(settingUrl, {headers: {token: token()}})
                        .then(getResultCode)
                        .then(result => {

                            let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.LOAD_FAILED;

                            dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress, result || {}));
                        })
                }

                dispatch(getAction(GET_SHOP_ACCOUNT_LIST, "right", progress));
            })
    }
}

//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
		shopGroupList: [],
		shopItemList: [],
		shopAccountList: [],
        totalCount: 0,
		progress: 2,
        shopAccountProgress: 2

    }),
    shopGroupList = [],
    shopItemList = [],
    shopAccountItemList = [],
    totalCount = 0;

export default function shopAccountReducer(state = initState, action) {

    let progress;

	switch(action.type)
	{
		case GET_SHOP_PROGRESS:
            progress = changeProgress(action);

			return state.setIn(["progress"], progress)
                .setIn(["shopGroupList"], shopGroupList);

        case GET_SHOP_GROUP:
            if (action.result && action.result.code === 200)
                shopGroupList = action.result.data;
            progress = changeProgress(action);

			return state.setIn(["shopGroupList"], shopGroupList)
                .setIn(["progress"], progress);

        case GET_SHOP_ITEM:

            if (action.result && action.result.code === 200)
            {
                shopItemList = action.result.data;
                totalCount = action.result.message;
            }
            progress = changeProgress(action);

            return state.setIn(["shopItemList"], shopItemList)
                .setIn(["totalCount"], totalCount)
                .setIn(["progress"], progress);

        case ADD_SHOP_ITEM:
            progress = changeProgress(action);

            return state.setIn(["progress"], progress);

        case DEL_SHOP_ITEM:
            return state;

        case EDIT_SHOP_ITEM:
            return state;

        case GET_SHOP_ACCOUNT_LIST:

            if (action.result && action.result.data)
                shopAccountItemList = action.result.data;

            return state.setIn(["shopAccountList"], shopAccountItemList)
                .setIn(["shopAccountProgress"], action.right);

        case ADD_SHOP_ACCOUNT:
            return state;

        case DEL_SHOP_ACCOUNT:
            return state;

        case EDIT_SHOP_ACCOUNT:
            return state;
    }

    return state;
}

function dispatchAction(dispatch, type, proType, load, result)
{
    let progress = 2,
        success = result && result.code == 200;

    if(load)
    {
        progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
    }
    else
    {
        progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
    }

    dispatch(getAction(type, proType, progress, result));

    return Promise.resolve({success, result: result})
}

function getAction(type, progressType, progress, result)
{
    return {type, result, [progressType]: progress}
}

function changeProgress(action)
{
    console.log("changeProgress action = " + action.left + ", right = " + action.right);

    let progress = {};
    if(action["left"] != undefined)
    {
        progress["left"] = action.left;

    }
    else if(action["right"] != undefined)
    {
        progress["right"] = action.right;
    }

    return progress;
}
