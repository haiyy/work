import {GET_ROLE_LIMIT_DATA, ROLE_MANAGER, GET_EDITOR_ROLE, DELETE_ROLE, SET_NEW_ROLE, SET_EDITOR_ROLE, SET_EDITOR_ROLE_STATUS} from '../../../../../model/vo/actionTypes';

let actionData = [], progress, roleListCount, roleErrorMsg = "";
export function newRoleManger(state = {}, action) {

    switch (action.type) {

        case ROLE_MANAGER:

            if (action.result && action.result.code == 200) {
                actionData = action.result.data;
                roleListCount = parseInt(action.result.message);

                actionData.forEach((item, index) => {
                    item.rank = index + 1;
                    item.key = item.roleid
                })
            }

            progress = changeProgress(action);
            return {
                roleList: actionData,
                roleListCount,
                progress
            };

        case SET_NEW_ROLE:

            if (action.success)
            {
                // action.newGroupInfo.usernumber = 0;
                // action.newGroupInfo.roleid = action.data;
                // action.newGroupInfo.rank = actionData.length + 1;
                // action.newGroupInfo.key = action.data;
                // actionData.push(action.newGroupInfo);
                // roleListCount += 1;
            }else
            {
                if (action.left === 7)
                {
                    roleErrorMsg = "该角色已存在！"
                }else if (action.left === 13)
                {
                    roleErrorMsg = "未选择角色权限！"
                }
                else
                {
                    roleErrorMsg = "创建失败！"
                }
            }

            progress = changeProgress(action);

            return {
                roleList: actionData,
                roleListCount,
                progress,
                roleErrorMsg
            };

        case SET_EDITOR_ROLE:

            if (action && action.success)
            {
                actionData.forEach(item=>{
                    if (item.roleid === action.newGroupInfo.roleid)
                    {
                        item.rolename = action.newGroupInfo.rolename;
                        item.description = action.newGroupInfo.description;
                        item.status = action.newGroupInfo.status;
                    }
                });
            }else
            {
                if (action.left === 7)
                {
                    roleErrorMsg = "该角色已存在！"
                }else if (action.left === 13)
                {
                    roleErrorMsg = "未选择角色权限！"
                }
                else
                {
                    roleErrorMsg = "创建失败！"
                }
            }

            progress = changeProgress(action);

            return {
                roleList: [...actionData],
                roleListCount,
                progress,
                roleErrorMsg
            };

        case SET_EDITOR_ROLE_STATUS:

            if (!action.success)
            {
                roleErrorMsg = "角色状态修改失败"
            }

            progress = changeProgress(action);

            return {
                roleList: [...actionData],
                roleListCount,
                progress,
                roleErrorMsg
            };

        case DELETE_ROLE:
            if (action.success)
            {
                actionData.map((item,index) => {
                    if (item.roleid === action.newGroupInfo.roleid)
                    {
                        actionData.splice(index,1);
                        roleListCount -= 1;
                    }
                })
            }

            progress = changeProgress(action);

            return {
                roleList: [...actionData],
                roleListCount,
                progress
            };

        default:
            return state;
    }
}

export function getRoleManger(state = {}, action) {
    let actionData;
    switch (action.type) {

        case GET_ROLE_LIMIT_DATA:

            if (action.result && action.result.code == 200)
            {
                actionData = action.result.data;
            }

            progress = changeProgress(action);

            return {
                limitData: actionData,
                progress
            };

        case GET_EDITOR_ROLE:

            return {
                limitData: action.result,
                progress
            };

        default:
            return state;
    }
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
