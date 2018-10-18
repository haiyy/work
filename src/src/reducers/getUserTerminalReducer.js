import {
    GET_USERTERMINAL
} from '../model/vo/actionTypes';

let userTerminalData = [];

export default function getUserTerminal(state = {}, action)
{
	switch(action.type)
	{
		//获取用户终端列表
        case GET_USERTERMINAL:
            userTerminalData = action.result;
			return {
				data: userTerminalData
			};


		default:
			return state;
	}
}

