import { GET_QUALITYTEST, NEW_QUALITYTEST, EDITOR_QUALITYTEST, REMOVE_QUALITYTEST } from '../../../../model/vo/actionTypes';
import {by} from "../../../../utils/MyUtil";
let quality = [], progress;

function getNewRank(data)
{
    data.sort(by("rank"));
    data.map((item,index)=>{
        item.rank = index + 1
    });

    return data;
}

export function qualityTest(state = {}, action)
{
	switch(action.type)
	{
        case GET_QUALITYTEST:
            if (action.result && action.result.success)
            {
                quality = action.result.data;
                getNewRank(quality);
            }

            progress = changeProgress(action);

			return {
				data: quality,
                progress
			};

		case NEW_QUALITYTEST:
            if (action.result && action.result.success)
            {
                quality.push(action.result.data);
                getNewRank(quality);
            }

            progress = changeProgress(action);

			return {
				data: [...quality],
                progress
			};

		case EDITOR_QUALITYTEST:
            if (action.success)
            {
                quality.map((item) =>
                {
                    if(item.qualityId == action.data.qualityId)
                    {
                        item.content = action.data.content;
                        item.standard = action.data.standard;
                    }
                });
            }

            progress = changeProgress(action);

			return {
				data: [...quality],
                progress
			};

		case REMOVE_QUALITYTEST:
            if (action.success)
            {
                quality.map((item, index) =>
                {
                    if(item.qualityId == action.data.qualityId)
                    {
                        quality.splice(index, 1);
                        getNewRank(quality);
                    }
                });
            }

            progress = changeProgress(action);

			return {
				data: [...quality],
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
