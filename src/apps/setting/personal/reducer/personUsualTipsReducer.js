import {
    GET_PERSON_TIPS_TYPE, NEW_PERSON_TIPS_TYPE,
    EDIT_PERSON_TIPS_TYPE, DEL_PERSON_TIPS_TYPE, GET_PERSON_TIPS_ITEM,
    NEW_PERSON_TIPS_ITEM, EDIT_PERSON_TIPS_ITEM, DEL_PERSON_TIPS_ITEM,
    IMPORT_PERSON_TIPS, CLEAR_PERSONTIPS_PROGRESS, EDIT_PERSON_TIPS_TYPE_RANK, EDIT_PERSON_TIPS_ITEM_RANK
} from '../../../../model/vo/actionTypes';
import {by} from "../../../../utils/MyUtil";
let tipsGroup = [], progress, importProgress, errorMsg = "";
//常用话术分组
export function getPersonWords(state = {}, action) {
    switch (action.type) {

        //获取常用话术分组
        case GET_PERSON_TIPS_TYPE:

            if(action.result && action.result.success){
                tipsGroup = action.result.data;
                tipsGroup.sort(by("rank"));
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress
            };

        //创建常用话术分组
        case NEW_PERSON_TIPS_TYPE:

            if (action.result && action.result.success)
            {
                tipsGroup.push(action.result.data);
                tipsGroup.sort(by("rank"));
            }else
            {
                errorMsg = action.result && action.result.msg;
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress,
                errorMsg
            };

        //编辑常用话术分组
        case EDIT_PERSON_TIPS_TYPE:

            if (action.success)
            {
                tipsGroup ? tipsGroup.map((item)=> {
                    if (item.groupId === action.data.groupId) {
                        item.groupName = action.data.groupName;
                    }
                }) : null;
                tipsGroup.sort(by("rank"));
            }else
            {
                errorMsg = action.result && action.result.msg;
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress,
                errorMsg
            };

        //编辑常用话术分组排序
        case EDIT_PERSON_TIPS_TYPE_RANK:

            if (action.success)
            {
            }else
            {
                errorMsg = action.result && action.result.msg;
            }

            progress = changeProgress(action);

            return {
                ...state
            };



        //删除常用话术分组
        case DEL_PERSON_TIPS_TYPE:

            if (action.success)
            {
                tipsGroup ? tipsGroup.map((item, index)=> {
                    if (item.groupId === action.data.groupId) {
                        tipsGroup.splice(index, 1)
                    }
                }) : null;
                tipsGroup.sort(by("rank"));
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress
            };

        //创建常用话术
        case NEW_PERSON_TIPS_ITEM:

            if (action.result && action.result.success)
            {
                tipsGroup ? tipsGroup.map((item)=> {
                    if (item.groupId === action.result.data.groupId) {
                        if (item.fastResponses)
                        {
                            item.fastResponses.push(action.result.data);
                            item.fastResponses.sort(by("rank"));
                        }else
                        {
                            item.fastResponses = [action.result.data]
                        }
                    }
                }) : null;
                tipsGroup.sort(by("rank"));
            }else if (action.result && !action.result.success)
            {
                errorMsg = action.result.msg
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                errorMsg,
                progress
            };

        //编辑常用话术
        case EDIT_PERSON_TIPS_ITEM:

            if (action.success)
            {
                for (let i = 0; i < tipsGroup.length; i++)
                {
                    let item = tipsGroup[i];
                    if (item.groupId === action.data.groupId) {
                        for (var j = 0; j < item.fastResponses.length; j++)
                        {
                        	let tips = item.fastResponses[j];
                            if(tips.itemId === action.data.itemId)
                            {
                                tips.response = action.data.response;
                                tips.title = action.data.title;
                            }
                        }
                        item.fastResponses.sort(by("rank"));
                    }
                }
                tipsGroup.sort(by("rank"));
            }else
            {
                errorMsg = action.result && action.result.msg;
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress,
                errorMsg
            };
        //编辑常用话术排序
        case EDIT_PERSON_TIPS_ITEM_RANK:

            if (action.success)
            {

            }else
            {
                errorMsg = action.result && action.result.msg;
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress,
                errorMsg
            };

		//删除常用话术
        case DEL_PERSON_TIPS_ITEM:

            if (action.success)
            {
                tipsGroup ? tipsGroup.map((item)=> {
                    if (item.groupId === action.data.groupId) {
                        item.fastResponses.map((tips,index) => {
                            if(tips.itemId === action.data.itemId)
                            {
                                item.fastResponses.splice(index, 1);
                                item.fastResponses.sort(by("rank"));
                            }
                        });

                    }
                }) : null;
                tipsGroup.sort(by("rank"));
            }

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
                progress
            };

        //导入个人常用话术
        case IMPORT_PERSON_TIPS:

            importProgress = changeProgress(action);

            return {
                data: [...tipsGroup],
                importProgress
            };
        //清除progress
        case CLEAR_PERSONTIPS_PROGRESS:

            progress = changeProgress(action);

            return {
                data: [...tipsGroup],
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
