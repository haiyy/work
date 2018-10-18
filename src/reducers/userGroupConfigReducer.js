import { GET_USERGROUPLIST } from '../model/vo/actionTypes';

export default function userGroupConfigReducer(state = {}, action)
{
	switch(action.type)
	{
		//获取用户群列表
		case GET_USERGROUPLIST:
			return {
				data: action.result
			};
		default:
			return state;
	}
}
