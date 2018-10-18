import {
	GET_INFOMATION, SET_INFOMATION, GET_INFOMATION_PROGRESS,
	GET_CHATSET, SET_CHATSET, GET_CHATSET_PROGRESS,
	GET_REPLY_CODE, GET_REPLY_CODE_PROGRESS, SET_REPLY_CODE,
	GET_THEME, GET_THEME_PROGRESS, THEME_SETTING,
	GET_INTELLIGENT, GET_INTELLIGENT_PROGRESS, SET_INTELLIGENT
} from '../../../../model/vo/actionTypes';
import { urlLoader } from "../../../../lib/utils/cFetch";
import Settings from '../../../../utils/Settings';
import { loginUserProxy, getLoadData } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";

//个人信息获取数据
export function getInfomation()
{
	return dispatch =>
	{
		dispatch(getAction(GET_INFOMATION_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, userId} = loginUserProxy(),
			settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + "/user/" + userId);

		getLoadData(settingUrl)
		.then(dispatchAction.bind(null, dispatch, GET_INFOMATION, true));
	}
}

//个人信息提交数据
export function setInfomation(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_INFOMATION_PROGRESS, LoadProgressConst.SAVING));

		let {siteId, userId, ntoken} = loginUserProxy(),
			body = JSON.stringify(data);

		let settingUrl = Settings.queryPathSettingUrl("/enterprise/" + siteId + "/user/" + userId);
		urlLoader(settingUrl, {method: "PUT", body, headers: {token: ntoken}})
		.then(getCode)
		.then(dispatchAction.bind(null, dispatch, GET_INFOMATION, false, data));
	};
}

// 清除个人信息progress
export function clearInformationProgress()
{
    return dispatch =>
    {
        dispatch(getAction(GET_INFOMATION_PROGRESS, LoadProgressConst.LOAD_COMPLETE));
    };
}

//聊天设置
export function getChatSet()
{
	return dispatch =>
	{
		dispatch(getAction(GET_CHATSET_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, userId} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/settings/", siteId, "/" + userId + "/chatset");

		getLoadData(settingUrl)
		.then(dispatchAction.bind(null, dispatch, GET_CHATSET, true));
	}
}

//设置聊天信息
export function setChatSet(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_CHATSET_PROGRESS, LoadProgressConst.SAVING));

		let {siteId, userId, ntoken} = loginUserProxy(),
			body = JSON.stringify(data),
			settingUrl = Settings.querySettingUrl("/settings/", siteId, "/" + userId + "/chatset");

		urlLoader(settingUrl, {method: "PUT", body, headers: {token: ntoken}})
		.then(getCode)
		.then(dispatchAction.bind(null, dispatch, SET_CHATSET, false));
	}
}

export function resetChatSetProgress()
{
	return dispatch =>
	{
		dispatch(getAction(GET_CHATSET_PROGRESS, LoadProgressConst.LOAD_COMPLETE));
	};
}

//自动回复获取数据
export function getAnswer()
{
	return dispatch =>
	{
		dispatch(getAction(GET_REPLY_CODE_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, userId} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/auto/reply/", siteId, "/user/" + userId + "?item=" + 2);

		getLoadData(settingUrl)
		.then(dispatchAction.bind(null, dispatch, GET_REPLY_CODE, true));
	}
}

//自动回复修改数据
export function setAnswer(data)
{
	return dispatch =>
	{
		dispatch(getAction(GET_REPLY_CODE_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, userId, ntoken} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/auto/reply/", siteId, "/user/" + userId);

		data.siteid = siteId;
		data.userid = userId;

		urlLoader(settingUrl, {method: "PUT", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(getCode)
        .then(result =>
        {
            let success = result && result.code == 200,
                progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

            dispatch(getAction(GET_REPLY_CODE, progress, data.autoReply));
        })
	}
}

//清除自动回复progress
export function clearAnswerProgress()
{
    return dispatch =>
    {
        dispatch(getAction(GET_REPLY_CODE_PROGRESS, LoadProgressConst.LOAD_COMPLETE));
    }
}

//个人皮肤获取数据
export function fetchTheme()
{
	return dispatch =>
	{
		dispatch(getAction(GET_THEME_PROGRESS, LoadProgressConst.LOADING));

		let {siteId, userId} = loginUserProxy(),
			settingUrl = Settings.querySettingUrl("/settings/", siteId, "/" + userId + "/skin");

		getLoadData(settingUrl)
		.then(dispatchAction.bind(null, dispatch, GET_THEME, true));
	}
}

//个人皮肤设置数据
export function themeSetting(datas)
{
	return dispatch =>
	{
		dispatch(getAction(GET_THEME_PROGRESS, LoadProgressConst.SAVING));

		let {siteId: siteid, userId: userid, ntoken} = loginUserProxy(),
			body = JSON.stringify(datas),
			settingUrl = Settings.querySettingUrl("/settings/", siteid, "/" + userid + "/skin");

		return urlLoader(settingUrl, {method: "PUT", body, headers: {token: ntoken}})
		.then(getCode)
		.then(result =>
		{
			let success = result && result.code == 200,
				progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED,
				data = result.data;
			dispatch(getAction(GET_THEME, progress, data));
		})
	}
}

//清除个人皮肤
export function clearThemeProgress()
{
    return dispatch =>
    {
        dispatch(getAction(GET_THEME_PROGRESS, LoadProgressConst.LOAD_COMPLETE));
    }
}

//智能切换获取数据
export function getIntelligent()
{
	return dispatch =>
	{
		dispatch(getAction(GET_INTELLIGENT_PROGRESS, LoadProgressConst.LOADING));

		let {userId, siteId} = loginUserProxy(),
			url = Settings.getPersonInfoUrl() + "/settings/" + siteId + "/" + userId + "/intelligent";

		getLoadData(url)
		.then(dispatchAction.bind(null, dispatch, GET_INTELLIGENT, true));
	}
}

//智能切换修改数据
export function setIntelligent(data)
{
	return dispatch =>
	{

		dispatch(getAction(GET_INTELLIGENT_PROGRESS, LoadProgressConst.SAVING));

		let {ntoken, userId, siteId} = loginUserProxy(),
			url = Settings.getPersonInfoUrl() + "/settings/" + siteId + "/" + userId + "/intelligent";

		return urlLoader(url, {method: "put", body: JSON.stringify(data), headers: {token: ntoken}})
		.then(getCode)
		.then(dispatchAction.bind(null, dispatch, SET_INTELLIGENT, false));
	};
}

//清除智能切换progress
export function clearIntelligentProgress()
{
    return dispatch =>
    {
        dispatch(getAction(GET_INTELLIGENT_PROGRESS, LoadProgressConst.LOAD_COMPLETE));
    };
}

function getCode(response)
{
	let jsonResult = response.jsonResult;
	return Promise.resolve(jsonResult);
}

function dispatchAction(dispatch, type, load, result, result1)
{
	let progress = 2,
		success = result && result.code == 200;
	
	if(result1)
	{
		success = result1 && result1.code == 200;
	}

	if(load)
	{
		progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
	}
	else
	{
		progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
	}

	dispatch(getAction(type, progress, result.data || result));

	return Promise.resolve({success, result: result})
}

function getAction(type, progress, data)
{
	return {type, data, progress}
}
