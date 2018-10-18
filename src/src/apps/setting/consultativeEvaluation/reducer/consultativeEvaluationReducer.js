import {
    GET_EVALUATION, EDIT_EVALUATION, CLEAR_EVALUATION_PROGRESS
} from '../../../../model/vo/actionTypes';

let evaluateList = {}, obj = {}, progress;

//评价
export function getEvaluateList(state = {}, action) {
    switch (action.type) {

//获取评价
        case GET_EVALUATION:

            if (action.result && action.result.success)
            {
                evaluateList = action.result.data;
            }

            progress = changeProgress(action);
            return {
                data: evaluateList,
                progress
            };

//编辑评价
        case EDIT_EVALUATION:

            if (action&&action.success)
            {
                evaluateList = action.data;
            }

            progress = changeProgress(action);

            return {
                data: evaluateList,
                progress
            };

        case CLEAR_EVALUATION_PROGRESS:

            progress = changeProgress(action);

            return {
                data: evaluateList,
                progress
            };

        default:
            return state;
    }
}

function changeProgress(action)
{
    console.log("changeProgress action = " + action.left + ", right = " + action.right);

    let progress = {};
    if(action.hasOwnProperty("left"))
    {
        progress = action.left;
    }
    return progress;
}
