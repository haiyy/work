import { Map } from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";

const PERSONAL_CALL_SETTING_PROGRESS = "PERSONAL_CALL_SETTING_PROGRESS",
	GET_PERSONAL_CALL_SETTING = "GET_PERSONAL_CALL_SETTING",
	PUT_PERSONAL_CALL_SETTING = "PUT_PERSONAL_CALL_SETTING",
	GET_CALLOUT_TELPHONE_LIST = "GET_CALLOUT_TELPHONE_LIST",
	UPDATE_PERSONAL_CALL_SETTING = "UPDATE_PERSONAL_CALL_SETTING";

export function getPersonalCallSetting()
{
	return dispatch => {
		dispatch({type: PERSONAL_CALL_SETTING_PROGRESS, progress: LoadProgressConst.LOADING});
		
		let {ntoken, siteId, userId} = loginUserProxy(),
		personalInfoUrl = Settings.getCallSettingUrl(`${siteId}/usersetting/${userId}`);
		
		return urlLoader(personalInfoUrl,{
			headers: {token: ntoken}
		})
		.then(({jsonResult}) => {
			let {code, data, msg} = jsonResult,
				success = code == 200,
				progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
			if (code == 503||code == 402) {//有企业不存在和坐席不存在的情况
				progress = LoadProgressConst.SAVING_FAILED;
			}
			dispatch({
				type: GET_PERSONAL_CALL_SETTING,
				data: data || {},
				msg,
				progress
			})
		});
	}
}

/**
 *  设置 个人设置
 *  @param {String} siteId //企业ID
 *  @param {String} UserId //小能客户账号
 *  @param {int} answermode //服务模式 0软 1SIP电话
 *  @param {int} dspNumber //外呼号码显示 此处为空则使用企业设置
 *  @param {int} workTime    //整理时间设置 单位为秒 默认30
 *  @param {int} autoAnswerFlag //来电自动接听 默认1 接听 0不接听
 *  @param {int} autoStatusAfterLogin //登陆后默认状态 0空闲 1忙碌 默认为1
 * */
export function putPersonalCallSetting(formData)
{
	return dispatch => {
		
		dispatch({type: PERSONAL_CALL_SETTING_PROGRESS, progress: LoadProgressConst.LOADING});
		
		let {siteId, ntoken, userId} = loginUserProxy(),
			setPersonalInfoPhoneUrl = Settings.getCallSettingUrl(`${siteId}/usersetting/${userId}`);
		
		formData.userId = userId;
		formData.siteId = siteId;
		
		return urlLoader(setPersonalInfoPhoneUrl, {
			body: JSON.stringify(formData),
			headers: {token: ntoken},
			method: "put"
		})
		.then(({jsonResult}) => {
			let {code, msg} = jsonResult,
				progress = code == 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
			
			dispatch({
				type: PUT_PERSONAL_CALL_SETTING,
				progress,
				msg
			});
		});
	}
}

/**
 *  设置 查询企业所有中继号码 //查询企业所有中继号码及其他有关信息
 *  @param {String} siteId //企业ID
 * */
export function getCalloutTelPhoneList()
{
	return dispatch => {
		let {siteId} = loginUserProxy(),
			headUrl = Settings.getCallSettingUrl(`${siteId}/relaynumber`);
		
		return urlLoader(headUrl)
		.then(({jsonResult}) => {
			let {data} = jsonResult;
			
			dispatch({
				type: GET_CALLOUT_TELPHONE_LIST,
				data: data||[],
			})
		});
	}
}

export function updateProgress()
{
	return dispatch => {
		dispatch({
			type: PERSONAL_CALL_SETTING_PROGRESS,
			msg: "",
			progress: LoadProgressConst.LOAD_COMPLETE
		});
	}
}

export function updatePersonalCallSetting(datalist) {
	return dispatch => {
		dispatch({
			type: UPDATE_PERSONAL_CALL_SETTING,
			data:datalist
		});
	}
}

// --------------------------Reducer-------------------------------------
let initState = Map({
	progress: LoadProgressConst.LOAD_COMPLETE 
});

initState.set("msg", "");
initState.set("telPhoneList", []);
initState.set("personalcallSetting", {});

export default function PersonalCallSettingReducer(state = initState, action) {
	
	switch(action.type)
	{
		case GET_PERSONAL_CALL_SETTING:
			return state.set("personalcallSetting", action.data)
			.set("progress", action.progress)
			.set("msg", action.msg);
		
		case PUT_PERSONAL_CALL_SETTING:
			return state.set("progress", action.progress)
			.set("msg", action.msg);
		
		case PERSONAL_CALL_SETTING_PROGRESS:
			return state.set("progress", action.progress);
			
		case  GET_CALLOUT_TELPHONE_LIST:
			return state.set("telPhoneList", action.data);

		case UPDATE_PERSONAL_CALL_SETTING:
			return state.set("personalcallSetting", {...action.data});
			
	}
	
	return state;
}
