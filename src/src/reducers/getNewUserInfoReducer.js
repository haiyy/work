import {
    GET_ROLE_LIST, GET_EDIT_DATA, GET_USER_TYPE, GET_ROBOT_URL,
    GET_USER_SKILL_TAG
} from '../model/vo/actionTypes';

export default function getRoleList(state = {}, action)
{
	changeProgress(state, action);
    let progress;
	switch(action.type)
	{
		case GET_ROLE_LIST:
            let roleData;
            progress = changeProgress(action);
            if (action.result&&action.result.code == 200){
                roleData = action.result.data
            }
            return {
				data: roleData,
                progress
			};
		default:
			return state;
	}
}
export function getEditData(state={}, action)
{
    let progress;
    switch(action.type)
    {
        case GET_EDIT_DATA:

            progress = changeProgress(action);
	        let data = state.data || {};
        	if(action.result)
	        {
	        	data = action.result.data;
	        }
            return {
                data,
                progress
            };

	    default:
            return state;
    }
}

export function getUserType(state={}, action)
{
    let progress;

    switch(action.type)
    {

        case GET_USER_TYPE:
            progress = changeProgress(action);
            let userType;
            if (action.result&&action.result.code == 200){
                userType = action.result.data
            }

            return {
                data: userType,
                progress
            };
        case GET_ROBOT_URL:
            progress = changeProgress(action);
            let url = "";
            if (action.result&&action.result.code == 200){
                url = action.result.data
            }

            return {
                robotUrl: url,
                progress,
                state
            };
        default:
            return state;
    }
}

export function getUserSkillTag(state={}, action)
{
    let progress;

    switch(action.type)
    {

        case GET_USER_SKILL_TAG:

            progress = changeProgress(action);

            let userSkillTag;
            if (action.result&&action.result.code == 200){
                userSkillTag = action.result.data
            }
            return {
                data: userSkillTag,
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
        progress["left"] = action.left;
	}
	else if(action.hasOwnProperty("right"))
	{
        progress["right"] = action.right;
	}

	return progress;
}

