import { GET_CHATSET, GET_CHATSET_PROGRESS, GET_INFOMATION, GET_INFOMATION_PROGRESS, GET_INTELLIGENT, GET_INTELLIGENT_PROGRESS, GET_REPLY_CODE, GET_REPLY_CODE_PROGRESS, GET_THEME, GET_THEME_PROGRESS, SET_CHATSET, SET_INFOMATION, SET_INTELLIGENT, SET_REPLY_CODE, THEME_SETTING } from '../../../../model/vo/actionTypes';
import { fromJS } from "immutable";
import { loginUser, postMessage } from "../../../../utils/MyUtil";
import UserInfo from "../../../../model/vo/UserInfo";
import VersionControl from "../../../../utils/VersionControl";


let initState = fromJS({
	infomation: {},
	chatSet: {},
	answer: {},
	theme: {},
	intelligent: {}
});

export default function personalReducer(state = initState, action)
{
	let {progress, data} = action;

	switch(action.type)
	{
		case GET_INFOMATION_PROGRESS:
			return state.setIn(["infomation", "progress"], progress);

		case GET_INFOMATION:
			loginUser()
			.merge(new UserInfo(data), true);
			
			return state.setIn(["infomation", "progress"], progress)
			.setIn(["infomation", "data"], data);

		case GET_CHATSET_PROGRESS:
			return state.setIn(["chatSet", "progress"], progress);

		case GET_CHATSET:
			return state.setIn(["chatSet", "progress"], progress)
			.setIn(["chatSet", "data"], data);

		case SET_CHATSET:
			VersionControl.initChatSet(data);
			
			return state.setIn(["chatSet", "progress"], progress)
			.setIn(["chatSet", "data"], data);

		case GET_REPLY_CODE_PROGRESS:
			return state.setIn(["answer", "progress"], progress);

		case GET_REPLY_CODE:
			return state.setIn(["answer", "progress"], progress)
			.setIn(["answer", "data"], data);

		case SET_REPLY_CODE:
			return state.setIn(["answer", "progress"], progress)
			.setIn(["answer", "data"], data);

		case GET_THEME_PROGRESS:
			return state.setIn(["theme", "progress"], progress);

		case GET_THEME:
		    postMessage({type:"skinChange", skin:(data&&data.personalskin) || 0}, "*");
		    
			return state.setIn(["theme", "progress"], progress)
			.setIn(["theme", "data"], data);

		case GET_INTELLIGENT_PROGRESS:
			return state.setIn(["intelligent", "progress"], progress);

		case GET_INTELLIGENT:
			return state.setIn(["intelligent", "progress"], progress)
			.setIn(["intelligent", "data"], data);

		case SET_INTELLIGENT:
			return state.setIn(["intelligent", "progress"], progress)
			.setIn(["intelligent", "data"], data);

		case 'LOGOUT_SUCCESS':
			return initState;

		default:
			return state;
	}

}
