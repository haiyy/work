import {
	DISTRIBUTION, MAKE_USERS,GET_SKILLTAG_CURSTEM,
	GET_CURSTEM, EDITOR_USER, DEL_USER, GET_USER, DATA_REQUEST, USER_CHECKED, DATATYPE_REQUEST
} from '../../../../model/vo/actionTypes';

let distributeData = [], data = {}, progress;

export default function distributeReducer(state = {}, action)
{
	switch(action.type)
	{
		//获取用户群列表
        case DISTRIBUTION:
            if (action.result&&action.result.success)
            {
                distributeData = action.result.data;

                distributeData.map((item) =>
                {
                    /*if(!item.supplierPoolName)
                     {
                     item["supplierPoolName"] = null
                     }*/
                    if(!item.allocationName)
                    {
                        item["allocationName"] = "默认分配策略"
                    }
                });
            }

            progress = changeProgress(action);

			return {
				data: distributeData,
                progress
			};

		//创建用户群
		case MAKE_USERS:

            if (action.result&&action.result.success)
            {
                data = action.result.data;
                data.supplierPoolName = data.supplierPoolName && data.supplierPoolName;
                data.allocationName = data.allocationName ? data.allocationName : "默认分配策略";
                delete data.sensitiveWords;
                distributeData.push(data);
            }

            progress = changeProgress(action);

			return {
				data: [...distributeData],
                progress
			};

		//编辑用户群
		case EDITOR_USER:

            if (action.result&&action.result.success)
            {
                data = action.result.data;
                //let diData = find
                distributeData.map((item) =>
                {
                    if(item.templateid == data.templateid)
                    {
                        item.name = data.name;
                        item.supplierPoolName = data.supplierPoolName && data.supplierPoolName;
                        item.allocationName = data.allocationName ? data.allocationName : "默认分配策略";
                    }
                });
            }

            progress = changeProgress(action);

			return {
				data: [...distributeData],
                progress
			};

		//删除用户群
		case DEL_USER:

            if (action.result && action.result.success)
            {
                distributeData.map((item, index) =>
                {
                    if(item.templateid == action.result.id)
                    {
                        distributeData.splice(index, 1)
                    }
                });
            }

            progress = changeProgress(action);
			return {
				data: [...distributeData],
                progress
			};
		//更改用户群状态
		case USER_CHECKED:

            if (action.result && action.result.success)
            {
                distributeData.map((item) =>
                {
                    if(item.templateid == action.result.data.templateid)
                    {
                        item.status = action.result.data.status
                    }
                });
            }
            progress = changeProgress(action);
			return {
				data: [...distributeData],
                progress
			};
		//获取定义客服分组
        /*case GET_CURSTEM:

         let curstemArr = [], obj = {}, userNum;
            if (action.result&&action.result.code == 200)
            {
                action.result.data ? action.result.data.map((item) =>
                {
                    obj = {
                        userId: item.userid,
                        username: item.username,
                        level: 1,
                        maxConcurrentConversationNum: item.supplierConfigInfo ? item.supplierConfigInfo.maxConcurrentConversationNum : "",
                        /!*maxConversationNum: item.supplierConfigInfo ? item.supplierConfigInfo.maxConversationNum : ""*!/
                    };
                    curstemArr.push(obj);
                }) : null;

                userNum = parseInt(action.message);

            }
            return {
                groupData: curstemArr,
				groupDataCount: userNum
            };*/

        //获取技能标签客服
        case GET_SKILLTAG_CURSTEM:

            let arr = [], obj = {}, userNum;
            if (action.result&&action.result.code == 200)
            {
                action.result.data ? action.result.data.map((item) =>
                {
                    obj = {
                        key: item.userid,
                        userId: item.userid,
                        nickname: item.nickname,
                        externalname: item.externalname,
                        level: 1,
                        maxConcurrentConversationNum: item.supplierConfigInfo ? item.supplierConfigInfo.maxConcurrentConversationNum : "",
                        tagId: item.tagid,
                        /*maxConversationNum: item.supplierConfigInfo ? item.supplierConfigInfo.maxConversationNum : ""*/
                    };
                    arr.push(obj);
                }) : null;

                userNum = parseInt(action.result.message);

                progress = changeProgress(action);

            }
            return {
                groupData: arr,
                groupDataCount: userNum,
                progress
            };
        // //获取技能标签客服
        // case GET_CURSTEM:
        //
        //     let accountArr = [], accountItem = {}, accountUserNum;
        //     if (action.result&&action.result.code == 200)
        //     {
        //         action.result.data ? action.result.data.map((item) =>
        //         {
        //             accountItem = {
        //                 key: item.userid,
        //                 userId: item.userid,
        //                 nickname: item.nickname,
        //                 externalname: item.externalname,
        //                 level: 1,
        //                 maxConcurrentConversationNum: item.supplierConfigInfo ? item.supplierConfigInfo.maxConcurrentConversationNum : "",
        //                 tagId: item.tagid,
        //                 /*maxConversationNum: item.supplierConfigInfo ? item.supplierConfigInfo.maxConversationNum : ""*/
        //             };
        //             accountArr.push(obj);
        //         }) : null;
        //
        //         accountUserNum = parseInt(action.result.message);
        //
        //         progress = changeProgress(action);
        //
        //     }
        //     return {
        //         groupData: accountArr,
        //         groupDataCount: accountUserNum,
        //         progress
        //     };
	}

	return state;
}

export function getCurstomer(state = {}, action)
{
    let userInfo;
	switch(action.type)
	{
		//查询单个用户群信息
		case GET_USER:
            if (action.result&&action.result.success)
            {
                userInfo = action.result.data;
            }

            progress = changeProgress(action);

			return {
				users: userInfo,
                progress
			};
		default:
			return state;
	}
}

export function getStrategy(state = {}, action)
{
	switch(action.type)
	{
		//获取筛选类型
		case DATATYPE_REQUEST:
			return {
				data: action.data
			};

		default:
			return state;
	}
}

export function getDatas(state = {}, action)
{
	switch(action.type)
	{
		//获取筛选类型对应数据
		case DATA_REQUEST:
			return {
				data: action.data
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
