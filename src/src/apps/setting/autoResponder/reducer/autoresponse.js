import { SET_AUTO_RESPONSE, SET_AUTO_RESPONSE_GREET, GET_TEMPLATE_AUTO_WELCOME, GET_AUTO_WELCOME, GET_AUTO_RESPONSE, GET_TEMPLATE_AUTO_RESPONSE, RESET_ANWER_PROGRESS } from '../../../../model/vo/actionTypes';



//获取欢迎语开启级别
export function getAutoWelcome(state = {}, action)
{
    let progress;
	switch(action.type)
	{
		case GET_AUTO_WELCOME:
            let actionData = {};
            if (action.result&&action.result.success)
            {
                actionData = action.result.data
            }

            progress = changeProgress(action);

			return {
				data: actionData,
                progress
			};
        
		case GET_TEMPLATE_AUTO_WELCOME:
            
            progress = changeProgress(action);
			return {
				data: action.data,
                progress
			};
        
		default:
			return state;
	}
}

//获取自动应答开启级别
export function getResponselevel(state = {}, action)
{
    let progress;
	switch(action.type)
	{
		case GET_AUTO_RESPONSE:
            let actionData = {};
            if (action.result&&action.result.success)
            {
                actionData = action.result.data
            }

            progress = changeProgress(action);

			return {
				data: actionData,
                progress
			};
		case GET_TEMPLATE_AUTO_RESPONSE:

            progress = changeProgress(action);

			return {
				data: action.data,
                progress
			};
		default:
			return state;
	}
}

//开启企业、用户群、客服自动应答和企业、用户群问候语
export function autoresponse(state = {}, action)
{
    let progress;
	switch(action.type)
	{
		case SET_AUTO_RESPONSE:

            progress = changeProgress(action);

			return {
				data: action.data,
                progress
			};
            
        case RESET_ANWER_PROGRESS:

            progress = changeProgress(action);

            return {
                ...state,
                progress
            };
		case SET_AUTO_RESPONSE_GREET:

            progress = changeProgress(action);

			return {
				data: action.data,
                progress
			};
		default:
			return state;
	}
}

function changeProgress(action)
{
    let progress = {};
    if(action.hasOwnProperty("left"))
    {
        progress = action.left;
    }

    return progress;
}
