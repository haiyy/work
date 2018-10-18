import {
    GET_LEAVE_MESSAGE, EDIT_LEAVE_MESSAGE
} from '../../../model/vo/actionTypes';

let data;

export default function leaveMessageData(state = {}, action)
{
	let progress;

	switch(action.type)
	{
		case GET_LEAVE_MESSAGE:
            if (action.result && action.result.success)
            {
                data = action.result.data;
            }
			progress = changeProgress(action);

			return {data, progress};

        case EDIT_LEAVE_MESSAGE:
			progress = changeProgress(action);
			return {
				data, progress
			};
	}

	return state;
}

function changeProgress(action)
{
	let progress = {};
	if(action["left"] != undefined)
	{
		progress = action.left;

	}

	return progress;
}
