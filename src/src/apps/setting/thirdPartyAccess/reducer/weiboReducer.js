/*
*接口文档：http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=80478339
* */

import { loginUserProxy, configProxy, token } from "../../../../utils/MyUtil";
import { getResultCode, getAction } from "../../../../utils/ReduxUtils";
import { urlLoader } from "../../../../lib/utils/cFetch";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { fromJS } from "immutable";

const GET_COMPANY_WEIBO_LIST = 'GET_COMPANY_WEIBO_LIST', //获取企业开通微博列表
	GET_COMPANY_WEIBO_LIST_PROGRESS = 'GET_COMPANY_WEIBO_LIST_PROGRESS',

	DELETE_WEIBO_INFO = 'DELETE_WEIBO_INFO', //删除微博信息

	SET_WEIBO_INFO = 'SET_WEIBO_INFO', //微博接入设置
    EDIT_WEIBO_INFO = 'EDIT_WEIBO_INFO', //编辑

	GET_WEIBO_ACCESS = 'GET_WEIBO_ACCESS', //获取微博接入信息

	GET_WEIBO_ACCESS_PROGRESS = 'GET_WEIBO_ACCESS_PROGRESS',

	GET_WEIBO_INFO = 'GET_WEIBO_INFO', //获取开发者微博信息

	GET_WEIBO_INFO_PROGRESS = 'GET_WEIBO_INFO_PROGRESS';

/*获取企业开通微博列表*/
export function getCompanyWeiBoList()
{
	return dispatch => {
		let {siteId: siteid} = loginUserProxy(),
			url = configProxy().nThirdPartyUrl + '/weibo/getweibolist?siteid=' + siteid;
		// url = 'https://thirdparty-release.ntalker.com/weibo/getweibolist?siteid='+ siteid;

		dispatch(getAction(GET_COMPANY_WEIBO_LIST, LoadProgressConst.LOADING));

		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_COMPANY_WEIBO_LIST, progress, result || {}));
		})
	}
}

/*删除微博信息*/
export function deleteWeiBoInfo(openid)
{
	return dispatch => {
		let url = configProxy().nThirdPartyUrl + '/weibo/deleteweibo';
		// let url = 'https://thirdparty-release.ntalker.com/weibo/deleteweibo';

		dispatch(getAction(DELETE_WEIBO_INFO, LoadProgressConst.SAVING));

		return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(openid)})
		.then(getResultCode)
		.then(result => {
			let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

			Object.assign(result, openid);
			dispatch(getAction(DELETE_WEIBO_INFO, progress, result));
		})
	}
}

/*微博接入设置*/
export function setWeiBoInfo(data = {})
{
	return dispatch => {
		let {siteId: siteid} = loginUserProxy(),
			url = configProxy().nThirdPartyUrl + '/weibo/addweiboinfo';
		// url = 'https://thirdparty-release.ntalker.com/weibo/setweiboinfo';

		dispatch(getAction(SET_WEIBO_INFO, LoadProgressConst.SAVING));

		data.siteid = siteid;

		return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(data)})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

			Object.assign(result, data);
			result.time = new Date().getTime();
			dispatch(getAction(SET_WEIBO_INFO, progress, result));
			return Promise.resolve(result)
		})
	}
}

/*微博接入设置*/
export function editWeiBoInfo(data = {})
{
    return dispatch => {
        let {siteId: siteid} = loginUserProxy(),
            url = configProxy().nThirdPartyUrl + '/weibo/editweiboinfo';
        // url = 'https://thirdparty-release.ntalker.com/weibo/editweiboinfo';

        dispatch(getAction(EDIT_WEIBO_INFO, LoadProgressConst.SAVING));

        data.siteid = siteid;

        return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

                Object.assign(result, data);
                dispatch(getAction(EDIT_WEIBO_INFO, progress, result));
                return Promise.resolve(result)
            })
    }
}

/*获取微博接入信息*/
export function getWeiboAccessInfo()
{
	return dispatch => {
		let url = configProxy().nThirdPartyUrl + '/weibo/getweiboaccessinfo';
		// let url = 'https://thirdparty-release.ntalker.com/weibo/getweiboaccessinfo';

		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {
			let {code, data} = result,
				progress = code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_WEIBO_ACCESS, progress, JSON.parse(data)));
		})
	}
}

/*获取开发者微博信息*/
export function getWeiBoInfo(openid)
{
	return dispatch => {
		let url = configProxy().nThirdPartyUrl + '/weibo/getweiboinfo?openid=' + openid;
		// let url = 'https://thirdparty-release.ntalker.com/weibo/getweiboinfo?openid=' + openid;

		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {
			let {code, data} = result,
				progress = code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_WEIBO_INFO, progress, JSON.parse(data) || {}));
		})
	}
}

/*修改接待组*/
export function editWeiBoGroup(data = {})
{
    return dispatch => {
        let {siteId: siteid} = loginUserProxy(),
            url = configProxy().nThirdPartyUrl + '/weibo/editweibogroup';
        // url = 'https://thirdparty-release.ntalker.com/wechat/editwechatgroup';

        data.siteid = siteid;

        return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                return Promise.resolve(result)
            })
    }
}

//------------------------------------------Reducer------------------------------------------------------
let initState = fromJS({
	progress: 2
});

initState = initState.set("weiboData", {})
.set("developerWXList", []);

let data = [],
	detailData = [];

export default function weiboReducer(state = initState, action) {
	switch(action.type)
	{
		case GET_COMPANY_WEIBO_LIST:
			data = action.result && action.result.data ? JSON.parse(action.result.data) : [];

			return state.setIn(["progress"], action.progress)
			.setIn(['developerWXList'], data);

		case DELETE_WEIBO_INFO:

			let delData = [...data];
			if(action.result && action.result.code === 200)
			{
				let delIndex = delData.findIndex(item => item.openid === action.result.openid);
				delData.splice(delIndex, 1);
				data = delData;
			}

			return state.setIn(["progress"], action.progress)
			.setIn(['developerWXList'], data);

		case SET_WEIBO_INFO:
			let newData;
			if(action.result && action.result.code === 200)
			{
				newData = JSON.parse(action.result.info);
				newData.type = action.result.type;
				newData.openid = newData.openId;
				newData.time = new Date().getTime();

				data.push(newData)
			}
			return state.setIn(["progress"], action.progress)
			.setIn(['developerWXList'], data);

        case EDIT_WEIBO_INFO:
            let editData;

            if(action.result && action.result.code === 200)
            {
                editData = JSON.parse(action.result.info);
                editData.type = action.result.mode;
                editData.openid = editData.openId;

                let itemInfo = data.find(item => item.openid === editData.openid);
                Object.assign(itemInfo, editData);

            }
            return state.setIn(["progress"], action.progress)
                .setIn(['developerWXList'], data);

        case GET_WEIBO_ACCESS:
			return state.setIn(["progress"], action.progress)
			.set("weiboData", action.result);

		case GET_WEIBO_ACCESS_PROGRESS:
			return state.setIn(["progress"], action.progress)
			.set("weiboData", {});

		case GET_WEIBO_INFO:
			return state.setIn(["progress"], action.progress)
			.setIn(["weiboData"], action.result);

		case GET_WEIBO_INFO_PROGRESS:
			return state.setIn(["progress"], action.progress)
			.set("weiboData", {});
	}

	return state;
}
