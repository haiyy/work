import {
    GET_ALL_TIPS_DATA, GET_SEARCH_TIPS, GET_TIPS_GROUP_DATA, NEW_TIPS_GROUP, EDIT_TIPS_GROUP, REMOVE_TIPS_GROUP,
    GET_TIPS, GET_NEW_TIPS, GET_EDITOR_TIPS, REMOVE_TIPS, IMPORT_COMMON_WORD, EDIT_TIPS_GROUP_RANK, GET_EDITOR_TIPS_RANK
} from '../../../../model/vo/actionTypes';
import {by} from "../../../../utils/MyUtil";
import {isJsonString} from "../../../../utils/HyperMediaUtils";
let tipsGroup = [], Tips = [], obj = {}, errorMsg = "",tipsCount = 0;

//常用话术分组
export function getTipsGroup(state = {}, action) {

    let groupProgress;

    switch (action.type)
    {
        case GET_TIPS_GROUP_DATA:  //获取常用话术分组

            if(action.result && action.result.success){
                tipsGroup = action.result.data || [];
            }

            tipsGroup.sort(by('rank'));
            groupProgress = changeProgress(action);

            return {
                data: tipsGroup,
                groupProgress
            };

        case NEW_TIPS_GROUP:  //创建常用话术分组

            if(action.result && action.result.success){
                let actionData = action.result.data;

                obj = {
                    groupId: actionData.groupId,
                    groupName: actionData.groupName,
                    rank: actionData.rank
                };

                tipsGroup.push(obj);
                tipsGroup.sort(by('rank'));
            }else if (action.result && !action.result.success)
            {
                errorMsg = action.result.msg;
            }
            groupProgress = changeProgress(action);
            return {
                data: tipsGroup,
                groupProgress,
                errorMsg
            };

//编辑常用话术分组
        case EDIT_TIPS_GROUP:

            if (action.success){
                tipsGroup.sort(by('rank'));
                tipsGroup ? tipsGroup.map((item, index)=> {
                    if (item.groupId == action.data.groupId) {
                        item.groupName = action.data.groupName;
                    }
                }) : null;
            }

            groupProgress = changeProgress(action);
            return {
                data: tipsGroup,
                groupProgress
            };
//批量修改常用话术分组排序
        case EDIT_TIPS_GROUP_RANK:

            groupProgress = changeProgress(action);

            return {
                ...state,
                groupProgress
            };

//删除常用话术分组
        case REMOVE_TIPS_GROUP:

            if (action.success)
            {
                let delData = action.data.groupId;

                tipsGroup.sort(by('rank'));
                tipsGroup ? tipsGroup.forEach((item, index)=> {
                    if (item.groupId === delData) {
                        tipsGroup.splice(index, 1)
                    }
                }) : null;
            }

            groupProgress = changeProgress(action);
            return {
                data: tipsGroup,
                groupProgress
            };
        case IMPORT_COMMON_WORD:

            if (action.result && action.result.success)
            {
                let actionData = action.result.data;
                for (var i = 0; i < actionData.length; i++)
                {
                    delete actionData[i].fastResponses;
                    tipsGroup.push(actionData[i]);
                }
                tipsGroup.sort(by('rank'));
            }

            return {
                data: [...tipsGroup],
                state
            };

        default:
            return state;
    }
}

//常用话术列表
export function getTips(state = {}, action) {

    let progress;

    switch (action.type) {

//获取常用话术列表
        case GET_ALL_TIPS_DATA:
            if (action.result && action.result.success)
            {
                Tips = action.result.data.fastResponses;
                tipsCount = action.result.data.count;

                Tips.sort(by('rank'));

                Tips ? Tips.map((item, index)=> {
                    let parseItem;
                    if(item.response && item.response.slice(0,1) === "{"){
                        parseItem = JSON.parse(item.response);

                    }else{
                        parseItem = item.response;
                    }
                    item.response = parseItem;
                    item.key = item.itemId;
                    item.index = index + 1;
                }) : null;

            }

            progress = changeProgress(action);

            return {
                data: Tips,
                tipsCount,
                progress
            };

        case GET_SEARCH_TIPS:

            if (action.result && action.result.success)
            {
                Tips = action.result.data.fastResponses;
                tipsCount = action.result.data.count;

                Tips.sort(by('rank'));

                Tips ? Tips.map((item, index)=> {
                    let parseItem;
                    if(item.response && item.response.slice(0,1) === "{"){
                        parseItem = JSON.parse(item.response);

                    }else{
                        parseItem = item.response;
                    }
                    item.response = parseItem;
                    item.key = item.itemId;
                    item.index = index + 1;
                }) : null;
            }

            progress = changeProgress(action);
            return {
                data: Tips,
                tipsCount,
                progress
            };

        case GET_TIPS:

            if (action.result && action.result.success)
            {
                Tips = action.result.data.fastResponses;

                tipsCount = Tips.length;

                Tips.sort(by('rank'));

                Tips ? Tips.map((item, index)=> {
                    let parseItem;
                    if(isJsonString(item.response))
                    {
                        parseItem = JSON.parse(item.response);
                    }else{
                        parseItem = item.response;
                    }
                    item.response = parseItem;
                    item.key = item.itemId;
                    item.index = index + 1;
                }) : null;
            }

            progress = changeProgress(action);

            return {
                data: [...Tips],
                tipsCount,
                progress
            };

//创建常用话术
        case GET_NEW_TIPS:

            if (action.result && action.result.success)
            {
                let actionData = action.result.data;

                actionData.type != 1 ? actionData.response = JSON.parse(actionData.response) : obj.response = actionData.response;

                Tips.push(actionData);
                tipsCount += 1;

                Tips.sort(by('rank'));

                Tips.forEach((item, index) => {
                    item.index = index + 1;
                    item.key = item.itemId;
                })

            }else if (action.result && !action.result.success)
            {
                errorMsg = action.result.msg;
            }

            progress = changeProgress(action);

            return {
                data: [...Tips],
                tipsCount,
                errorMsg,
                progress
            };

//编辑常用话术
        case GET_EDITOR_TIPS:

            if (action.success)
            {
                let currentItem = Tips && Tips.find(item=>item.itemId === action.data.itemId), obj = {};
                obj.title = action.data.title;
                obj.rank = action.data.rank;
                obj.type = action.data.type;
                obj.groupId = action.data.groupId;
                obj.itemId = action.data.itemId;
                action.data.type != 1 ? obj.response = JSON.parse(action.data.response) : obj.response = action.data.response;

                if (currentItem)
                {
                    Object.assign(currentItem, obj)
                }else
                {
                    obj.rank = Tips.length + 1;
                    Tips.push(obj);
                    tipsCount += 1;

                }
                Tips.sort(by('rank'));
                Tips.forEach((item, index) => {
                    item.index = index + 1;
                    item.key = item.itemId;
                })
            }


            progress = changeProgress(action);

            return {
                data: [...Tips],
                tipsCount,
                progress
            };
//编辑常用话术排序
        case GET_EDITOR_TIPS_RANK:

            if (action.success)
            {
                Tips.sort(by('rank'));
            }

            progress = changeProgress(action);

            return {
                data: [...Tips],
                tipsCount,
                progress
            };

//删除常用话术
        case REMOVE_TIPS:

            if (action.success)
            {
                Tips ? Tips.map((item, index)=> {
                    if (item.itemId === action.data.itemId) {
                        Tips.splice(index, 1);
                    }
                }) : null;

                Tips.sort(by('rank'));
                Tips.forEach((item, index) => {
                    item.index = index + 1;
                    item.key = item.itemId;
                });
                tipsCount -= 1;
            }

            progress = changeProgress(action);

            return {
                data: [...Tips],
                tipsCount,
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

