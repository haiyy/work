import {GET_ALL_BLACKLIST, ADD_BLACKLIST, REMOVE_BLACKLIST, CLEAR_PROGRESS, GET_SEARCH_BLACKLIST} from "../../../../model/vo/actionTypes";

let blacklist = [], listCount = 0, progress;
export default function blacklistReducer(state = {}, action)
{
    switch(action.type)
    {
        case GET_SEARCH_BLACKLIST:

            progress = changeProgress(action);

            return {blacklist, progress};
            break;

        case GET_ALL_BLACKLIST:

            if (action.result && action.result.code === 200)
            {
                blacklist = action.result.data;
                listCount = parseInt(action.result.msg);
                blacklist.length > 0 && blacklist.forEach((item, index) => {
                    item.rank = index + 1;
                    item.key = index;
                })
            }
            progress = changeProgress(action);

            return {blacklist, progress, listCount};
            break;

        case ADD_BLACKLIST:

            let errorMsg = '';
            if(!(action && action.success))
            {
                errorMsg = action && action.msg
            }

            progress = changeProgress(action);

            return {...state, progress, errorMsg};
            break;
        case REMOVE_BLACKLIST:


            progress = changeProgress(action);

            return {blacklist, progress, listCount};
            break;

        case CLEAR_PROGRESS:

            progress = changeProgress(action);

            return {blacklist, progress, listCount};
            break;

    }
    return state;
}

function changeProgress(action)
{

    let progress = {};
    if(action["progress"] != undefined)
    {
        progress = action.progress;

    }

    return progress;
}
