import { fromJS } from "immutable";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, token, configProxy } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { getResultCode, getAction } from "../../../../utils/ReduxUtils";

const GET_WARNING_DATAS = "GET_WARNING_DATAS",
	SET_WARNING_DATAS = "SET_WARNING_DATAS";

export function getEarlyWarningParams()
{
	return dispatch => {
		let {siteId} = loginUserProxy();

		dispatch(getAction(GET_WARNING_DATAS, LoadProgressConst.LOADING));

		// let settingUrl = "https://robot-agent-std.ntalker.com/getwarning?siteid=" + siteId;
		let settingUrl = configProxy().nEagleServer + "/getwarning?siteid=" + siteId;

		return urlLoader(settingUrl, {headers: {token: token()}})
		.then(getResultCode)
		.then(result => {

			let progress = result.code == 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

			dispatch(getAction(GET_WARNING_DATAS, progress, result || {}));
		})
	}
}

export function setEarlyWarningParams(data)
{
	return dispatch => {

		let {siteId, ntoken} = loginUserProxy();
		data.siteid = siteId;

		dispatch(getAction(SET_WARNING_DATAS, LoadProgressConst.LOADING));

        // let settingUrl = "https://robot-agent-std.ntalker.com/updatewarning?siteid=" + siteId;
        // let settingUrl = "http://192.168.30.95:8001/updatewarning?siteid=" + siteId;
        let settingUrl = configProxy().nEagleServer + "/updatewarning?siteid=" + siteId;
		return urlLoader(settingUrl, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(data)})
		.then(getResultCode)
		.then(result => {

			let progress = result.code == 200 ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;

			dispatch(getAction(SET_WARNING_DATAS, progress, result));
		})
	}
}

export function clearErrorProgress()
{
	return dispatch => {
		dispatch(getAction(SET_WARNING_DATAS, LoadProgressConst.LOAD_COMPLETE));
	}
}



//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
	warningData: {},
	progress: 2,
    errorMsg: ""
});

export default function earlyWarningReducer(state = initState, action) {

    let warningData = {},
        errorMsg = "";

	switch(action.type)
	{
        case GET_WARNING_DATAS:

            if (action.result && action.result.code == 200)
            {
                warningData = action.result.warning;
            }else if( (action.result && action.result.code != 200)) {
                errorMsg = action.result.msg;
            }
			return state.setIn(["progress"], action.progress)
			.setIn(["warningData"], warningData);

		case SET_WARNING_DATAS:

            if (action.result && action.result.code != 200)
            {
                errorMsg = action.result.msg;
            }

			return state.setIn(["progress"], action.progress)
                .setIn(["errorMsg"], errorMsg);
	}

	return state;
}

