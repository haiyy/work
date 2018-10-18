import { GET_ACCOUNT_TABLEDATE, REMOVE_ACCOUNT_LIST, SEND_NEW_ACCOUNT, EDITOR_ACCOUNT_LIST, EDITOR_PASSWORD, EDITOR_PASSWORD_MSG_CLEAR, GET_ACCOUNT_SEARCH_DATA, SEND_MIGRATE_ACCOUNTS, REMOVE_ACCOUNTS } from '../../../../model/vo/actionTypes';
import {by} from "../../../../utils/MyUtil";

let accountList = [], listCount = -1;
export default function getAccountList(state = {}, action)
{
	let progress;

	switch(action.type)
	{
		case GET_ACCOUNT_TABLEDATE:
            if (action.success)
            {
                accountList = action.data;
                listCount = parseInt(action.count);
                accountList.sort(by("rank"));
                accountList.forEach( (item, index) => {
                    item.rank = index + 1;
                    item.key = item.userid;
                });
            }

			progress = changeProgress(action);

			return {
				data: accountList,
                count: listCount,
                progress
			};
        case GET_ACCOUNT_SEARCH_DATA:
            if (action.success)
            {
                accountList = action.data;
                listCount = parseInt(action.count);
                accountList.sort(by("rank"));
                accountList.forEach( (item, index) => {
                    item.rank = index + 1;
                    item.key = item.userid;
                });
            }else
            {
                accountList = [];
                listCount = 0;
            }

			progress = changeProgress(action);

			return {
				data: accountList,
                count: listCount,
                progress
			};

		case REMOVE_ACCOUNT_LIST:
            if (action.result && action.result.success)
            {
                accountList && accountList.forEach((item, index) =>
                {
                    if(item.userid === action.result.userid)
                    {
                        accountList.splice(index, 1);
                    }
                });
                listCount -= 1;
                accountList.sort(by("rank"));
            }

            progress = changeProgress(action);
			return {
				data: [...accountList],
				progress,
                count: listCount
			};

        case REMOVE_ACCOUNTS:
            if (action.result && action.result.success)
            {
                let userids = action.result.userids;
                userids.forEach(delItem => {
                    accountList.forEach((item,index)=>{
                        if (item.userid === delItem)
                        {
                            accountList.splice(index, 1);
                            listCount -= 1;
                        }
                        item.rank = index + 1;
                    })
                });
                accountList.sort(by("rank"));
                accountList.forEach((item,index)=>{
                    item.rank = index + 1;
                })
            }

            progress = changeProgress(action);
			return {
				data: [...accountList],
				progress,
                count: listCount
			};

        case SEND_NEW_ACCOUNT:
			if(action.result)
			{
                action.result.rank = accountList.length+1;
                action.result.key = action.result.userid;
				accountList.push(action.result);
                listCount += 1;
                accountList.sort(by("rank"));
			}
			progress = changeProgress(action);

			return {
				data: [...accountList], progress, count: listCount
			};

        case SEND_MIGRATE_ACCOUNTS:
            if(action.success)
			{
                let {result = {userids: []}} = action,
                    {userids = []} = result;
                userids.forEach(migrateItem => {
                    accountList.forEach((item,index)=>{
                        if (item.userid === migrateItem)
                        {
                            accountList.splice(index, 1);
                            listCount -= 1;
                        }
                        item.rank = index + 1;
                    })
                });
                accountList.sort(by("rank"));
                accountList.forEach((item,index)=>{
                    item.rank = index + 1;
                })
			}
			progress = changeProgress(action);

			return {
				data: [...accountList], progress, count: listCount
			};

		case EDITOR_ACCOUNT_LIST:

			let userId = action.result && action.result.userid;

            if (action.result && action.result.success)
            {
                accountList&&accountList.forEach((item, index) =>
                {
                    if(item.userid === userId)
                    {
                        action.result.rank = index + 1;
                        action.result.key = action.result.userid;
                        accountList[index] = action.result;
                    }
                });
                accountList.sort(by("rank"));
            }

			progress = changeProgress(action);
			return {
				data: [...accountList],
				progress,
                count:listCount
			};

        case EDITOR_PASSWORD_MSG_CLEAR:

            progress = changeProgress(action);
            return {
                data: [...accountList],
                progress
            };

        case EDITOR_PASSWORD:

            progress = changeProgress(action);
            return {
                data: [...accountList],
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
		progress["left"] = action.left;
	}
	else if(action.hasOwnProperty("right"))
	{
		progress["right"] = action.right;
	}
    else if(action.hasOwnProperty("password"))
    {
        progress["password"] = action.password;
    }

	return progress;
}
