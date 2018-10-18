import {
	GET_ACCOUNT, ADD_GROUP, EDITOR_GROUP, REMOVE_GROUP, ACCOUNT_PROGRESS, EDITOR_GROUP_RANK
} from '../../../../model/vo/actionTypes';
import {by} from "../../../../utils/MyUtil";

let groupData, data, loop;

export default function plat(state = {}, action)
{
	let progress;

	switch(action.type)
	{
		case ACCOUNT_PROGRESS:

			progress = changeProgress(action);

			return {...state, progress};


        case GET_ACCOUNT:
            if (action.result.code == 200)
            {
                groupData = action.result.data;
                loop = (groupData) => groupData.map((item, n) =>
                {
                    if(item.children === [])
                    {
                        delete item.children;
                    }
                    else if(item.children)
                    {
                        loop(item.children);
                    }
                });
                loop(groupData);
                groupData.sort(by("rank"));
            }

			progress = changeProgress(action);
			return {
				data: groupData, progress
			};

		case ADD_GROUP:

            if (action.success)
            {
                let {newGroupInfo, data, progress}=action,
                    newGroup = {
                        groupid:data,
                        groupname: newGroupInfo.groupname,
                        parentid: newGroupInfo.parentid
                    };

                if(!newGroup.parentid)
                {
                    groupData.push(newGroup);
                    groupData.sort(by("rank"));
                }
                else
                {
                    loop = groupData => groupData ? groupData.map((item) =>
                    {
                        if(item.groupid == newGroup.parentid)
                        {
                            if(item.children)
                            {
                                item.children.push(newGroup);
                            }
                            else
                            {
                                item.children = [newGroup];
                            }
                        }else if(item.children) {
                            loop(item.children)
                        }
                    }) : null;

                    loop(groupData);
                    groupData.sort(by("rank"));
                }
            }

			progress = changeProgress(action);

			return {
				data: groupData, progress
			};

		case EDITOR_GROUP:
			progress = changeProgress(action);
			return {
				data: groupData, progress
			};

        case EDITOR_GROUP_RANK:

			progress = changeProgress(action);
            groupData.sort(by("rank"));
			return {
				data: groupData, progress
			};

		case REMOVE_GROUP:

            let delGroupId = action.data;

            if (action&&action.success)
            {
                loop = (groupData) => groupData.map((item, n) =>
                {
                    if(item.groupid === delGroupId)
                    {
                        groupData.splice(n, 1);
                    }
                    else if(item.children)
                    {
                        loop(item.children);
                    }
                });

                loop(groupData);

                groupData.sort(by("rank"));
            }

            progress = changeProgress(action);

			return {
				data: groupData, progress
			};
	}

	return state;
}

function changeProgress(action)
{
	console.log("changeProgress action = " + action.left + ", right = " + action.right);

	let progress = {};
	if(action["left"] != undefined)
	{
		progress["left"] = action.left;

	}
	else if(action["right"] != undefined)
	{
		progress["right"] = action.right;
	}

	return progress;
}
