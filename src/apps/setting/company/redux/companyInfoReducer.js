import {fromJS, Map} from "immutable";
import Settings from "../../../../utils/Settings";
import {urlLoader} from "../../../../lib/utils/cFetch";
import Model from "../../../../utils/Model";
import{log} from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";

const GET_REGION = "getRegion",
    GET_PROVINCE = "getProvince",
    GET_CITY = "getCity",
    GET_INFO_REQUEST = "getInfoRequest";

//--------------------------------action--------------------------------------

//获取企业信息数据
export function getCompanyInfomation() {
    return dispatch => {
        dispatch({
            type: GET_INFO_REQUEST,
            progress: LoadProgressConst.LOADING
        });

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId, token} = loginUserProxy;

        token = token.nloginToken;

        let url = Settings.queryPathSettingUrl("/enterprise/" + siteId);
        urlLoader(url, {headers: {token}})
            .then(result => {
                onDealCompany(result, dispatch);
            });
    }
}

/**
 * 修改企业信息???
 * @param data
 * @returns {Promise}
 */
export function modifyCompanyInfo(data) {
    return dispatch => {
        dispatch({
            type: GET_INFO_REQUEST,
            progress: LoadProgressConst.SAVING
        });

        let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
            {siteId, token} = loginUserProxy;

        data.siteid = siteId;
        token = token.nloginToken;

        let body = JSON.stringify(data);
        let url = Settings.queryPathSettingUrl("/enterprise/" + siteId);

        return urlLoader(url, {
            body: body,
            headers: {token, "Content-Type": "application/json"},
            method: "put"
        })
            .then(result => {
                onDealCompany(result, dispatch, true);
            });
    };
}

function onDealCompany(result, dispatch, edit = false) {

    let action = {
        type: GET_INFO_REQUEST,
        progress: LoadProgressConst.LOAD_COMPLETE,
    };

    if (!result || !result.jsonResult) {
        action.progress = LoadProgressConst.LOAD_FAILED;
    }
    else {
        let {code, data = {}} = result.jsonResult;

        if (code === 200) {
            action.progress = edit ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.LOAD_COMPLETE;
            action.result = data;
        }
        else {
            action.progress = edit ? LoadProgressConst.SAVING_FAILED : LoadProgressConst.LOAD_FAILED;
        }
    }

    dispatch(action);
}

//获取国家地域数据
export function getRegion(index) {
    return dispatch => {
        getData(index)
            .then(({jsonResult: result = []}) => {
                dispatch({
                    type: GET_REGION,
                    result
                });
            });
    }
}

//获取省地域数据
export function getProvince(index) {
    return dispatch => {
        getData(index)
            .then(({jsonResult: result = []}) => {
                dispatch({
                    type: GET_PROVINCE,
                    result
                });
            });
    }
}

//获取市地域数据
export function getCity(index) {
    return dispatch => {
        getData(index)
            .then(({jsonResult: result = []}) => {
                dispatch({
                    type: GET_CITY,
                    result
                });
            });
    }
}


export function getData(index)
{
    let settingUrl = Settings.querySettingUrl("/region", "", "");

	return urlLoader(settingUrl + "/" + index);
}

export function getSummaryData(groupId)
{
    let loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
        {siteId} = loginUserProxy,
        settingUrl = Settings.querySettingUrl("/summary/", siteId, "/node?summaryid=" + groupId);

    return urlLoader(settingUrl);
}


function findRegion(parentRegion, data, parentid)
{
    parentRegion.forEach(item=>
    {
        if (item.id === parentid)
        {
            item.children = data
        }else if (item.children && item.children.length > 0)
        {
            findRegion(item.children, data, parentid);
        }
    });

    return parentRegion;

}

let regions = [{id:"1",name:"中国",parentId:"0"}]; //[0, 1, 100]
export function getUserRegionData(index, arr = [])
{
    let settingUrl = Settings.querySettingUrl("/region", "", "");

    return urlLoader(settingUrl + "/" + index)
        .then(result=>
        {
            if (result.jsonResult && result.jsonResult.length>0)
            {
                let data = result.jsonResult || [],
                    parentid = data.length > 0 ? data[0].parentId : -1;

                if (parentid === -1)
                    return ;//... ???

                 regions = findRegion(regions, data, parentid);
            }

            if (arr.length <= 0)
            {
                return Promise.resolve(regions);
            }

            return getData(arr.shift(), arr);
        });
}

//--------------------------------Reducer--------------------------------------

export default function companyInfoReducer(state = Map(), action) {
    switch (action.type) {
        case GET_INFO_REQUEST:
            state = state.set("progress", action.progress);

            if (action.result) {
                return state.set("companyInfo", fromJS(action.result));
            }
            
            return state;

        case GET_REGION:
            return state.set("region", fromJS(action.result));

        case GET_PROVINCE:
            return state.set("province", fromJS(action.result));

        case GET_CITY:
            return state.set("city", fromJS(action.result));
    }

    return state;
}
