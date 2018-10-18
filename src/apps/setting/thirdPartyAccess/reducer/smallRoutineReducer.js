/*
 *接口文档：http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=50791037
 * */

import { loginUserProxy, configProxy, token } from "../../../../utils/MyUtil";
import { getResultCode, getAction } from "../../../../utils/ReduxUtils";
import { urlLoader } from "../../../../lib/utils/cFetch";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { fromJS } from "immutable";

const GET_DEVELOPER_SMALLROUTINE_LIST = 'GET_DEVELOPER_SMALLROUTINE_LIST', //获取开发者微信列表

	DELETE_SMALLROUTINE_INFO = 'DELETE_SMALLROUTINE_INFO', //删除微信信息

	SET_SMALLROUTINE_INFO = 'SET_SMALLROUTINE_INFO', //接入设置
    EDIT_SMALLROUTINE_INFO = 'EDIT_SMALLROUTINE_INFO', //编辑

	GET_SMALLROUTINE_ACCESS = 'GET_SMALLROUTINE_ACCESS', //获取微信接入信息
	GET_SMALLROUTINE_ACCESS_PROGRESS = 'GET_SMALLROUTINE_ACCESS_PROGRESS', //获取微信接入信息

	GET_SMALLROUTINE_INFO = 'GET_SMALLROUTINE_INFO', //获取开发者微信信息
	GET_SMALLROUTINE_INFO_PROGRESS = 'GET_SMALLROUTINE_INFO_PROGRESS'; //获取开发者微信信息Progress

/*获取开发者微信列表*/
export function getDeveloperWeChatList()
{
	return dispatch => {
		let {siteId: siteid} = loginUserProxy(),
			url = configProxy().nThirdPartyUrl + '/smallprogram/getwechatlist?siteid=' + siteid;
		// url = 'https://thirdparty-release.ntalker.com/smallprogram/getwechatlist?siteid=' + siteid;

		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_DEVELOPER_SMALLROUTINE_LIST, progress, result || {}));
		})
	}
}

/*删除微信信息*/
export function deleteWeChatInfo(openid)
{
	return dispatch => {
		let url = configProxy().nThirdPartyUrl + '/smallprogram/deletewechat';
		// let url = 'https://thirdparty-release.ntalker.com/smallprogram/deletewechat';

		return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(openid)})
		.then(getResultCode)
		.then(result => {

			let progress = result.code === 200 ? LoadProgressConst.SAVING_SUCCESS : result.code === 404 ? LoadProgressConst.DUPLICATE : LoadProgressConst.SAVING_FAILED;

			Object.assign(result, openid);
			dispatch(getAction(DELETE_SMALLROUTINE_INFO, progress, result));
		})
	}
}

/*接入设置*/
export function setWeChatInfo(data = {})
{
	return dispatch => {
		let {siteId: siteid} = loginUserProxy(),
			url = configProxy().nThirdPartyUrl + '/smallprogram/addwechatinfo';
		// url = 'https://thirdparty-release.ntalker.com/smallprogram/setwechatinfo';

		data.siteid = siteid;

		return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(data)})
		.then(getResultCode)
		.then(result => {

			let progress = codeMap[result.code];

			Object.assign(result, data);
			progress = progress ? progress : LoadProgressConst.SAVING_FAILED;
			dispatch(getAction(SET_SMALLROUTINE_INFO, progress, result || {}));

			return Promise.resolve(result)
		})
	}
}

/*编辑*/
export function editWeChatInfo(data = {})
{
    return dispatch => {
        let {siteId: siteid} = loginUserProxy(),
            url = configProxy().nThirdPartyUrl + '/smallprogram/editwechatinfo';
        // url = 'https://thirdparty-release.ntalker.com/smallprogram/editwechatinfo';

        data.siteid = siteid;

        return urlLoader(url, {method: "POST", headers: {token: token()}, body: JSON.stringify(data)})
            .then(getResultCode)
            .then(result => {

                let progress = codeMap[result.code];

                Object.assign(result, data);
                progress = progress ? progress : LoadProgressConst.SAVING_FAILED;
                dispatch(getAction(EDIT_SMALLROUTINE_INFO, progress, result || {}));

                return Promise.resolve(result)
            })
    }
}

const codeMap = {
	200: LoadProgressConst.SAVING_SUCCESS,
	404: LoadProgressConst.DUPLICATE
};

/*获取微信接入信息*/
export function getWechatAccessInfo()
{
	return dispatch => {
		let url = configProxy().nThirdPartyUrl + '/smallprogram/getwechataccessinfo';
		// let url = 'https://thirdparty-release.ntalker.com/smallprogram/getwechataccessinfo';
		dispatch(getAction(GET_SMALLROUTINE_ACCESS_PROGRESS, LoadProgressConst.LOADING));

		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {
			let {code, data} = result,
				progress = code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_SMALLROUTINE_ACCESS, progress, JSON.parse(data) || {}));
		})
	}
}

/*获取开发者微信信息*/
export function getWechatInfo(openid)
{
	return dispatch => {
		let url = configProxy().nThirdPartyUrl + '/smallprogram/getwechatinfo?openid=' + openid;
		// let url = 'https://thirdparty-release.ntalker.com/smallprogram/getwechatinfo?openid=' + openid;

		dispatch(getAction(GET_SMALLROUTINE_INFO_PROGRESS, LoadProgressConst.LOADING));

		return urlLoader(url, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let {code, data} = result,
				progress = code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_SMALLROUTINE_INFO, progress, JSON.parse(data) || {}));
		})
	}
}

/*修改接待组*/
export function editWechatGroup(data = {})
{
    return dispatch => {
        let {siteId: siteid} = loginUserProxy(),
            url = configProxy().nThirdPartyUrl + '/wechat/editwechatgroup';
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

initState = initState.set("weChatData", {})
.set("developerWXList", []);

let data = [],
	detailData = [];
export default function smallRoutineReducer(state = initState, action) {
	switch(action.type)
	{
		case GET_DEVELOPER_SMALLROUTINE_LIST:
			data = action.result && action.result.data ? JSON.parse(action.result.data) : [];

			return state.setIn(["progress"], action.progress)
			.setIn(['developerWXList'], data);

		case DELETE_SMALLROUTINE_INFO:

			let delData = [...data];
			if(action.result && action.result.code === 200)
			{
				let delIndex = delData.findIndex(item => item.openid === action.result.openid);
				delData.splice(delIndex, 1);
				data = delData;
			}

			return state.setIn(["progress"], action.progress)
			.setIn(['developerWXList'], delData);

		case SET_SMALLROUTINE_INFO:
			let newData;
			if(action.result && action.result.code === 200)
			{
				newData = action.result.info && JSON.parse(action.result.info) || {};
				newData.type = action.result.mode;
				newData.openid = newData.openId;

				data.push(newData)
			}

			return state.setIn(["progress"], action.progress)
			.setIn(["developerWXList"], data);

        case EDIT_SMALLROUTINE_INFO:
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

		case GET_SMALLROUTINE_ACCESS:
			return state.setIn(["progress"], action.progress)
			.set("weChatData", action.result);

		case GET_SMALLROUTINE_ACCESS_PROGRESS:
			return state.setIn(["progress"], action.progress)
			.set("weChatData", {});

		case GET_SMALLROUTINE_INFO:
			return state.setIn(["progress"], action.progress)
			.setIn(["weChatData"], action.result);

		case GET_SMALLROUTINE_INFO_PROGRESS:
			return state.setIn(["progress"], action.progress)
			.set("weChatData", {});
	}

	return state;
}
