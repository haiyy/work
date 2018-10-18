import { fromJS, Map } from "immutable";
import { urlLoader } from '../../../../lib/utils/cFetch';
import Settings from '../../../../utils/Settings';
import LogUtil from "../../../../lib/utils/LogUtil";

const GET_TRANSFER = 'getTransfer',
	GET_USERS_BY_GROUPID = "getUsersByGroupId",
    GET_SHOP_USERS_BY_GROUPID = "GET_SHOP_USERS_BY_GROUPID";

//-------------------------actions------------------------------------
export function getAdminGroup()
{
	return dispatch =>
	{
		urlLoader(Settings.getAdminGroupUrl())
		.then(({jsonResult}) =>
		{
			if(jsonResult.code === 200)
			{
				dispatch({
					type: GET_TRANSFER,
					result: jsonResult.data
				});
			}
			else
			{
				log("getAdminGroup 获取行政组数据失败");
			}
		});
	};
}

export function getUsersByGroupId(value)
{
	return dispatch =>
	{
		urlLoader(Settings.getUsersByGroupIdUrl(value))
		.then(({jsonResult}) =>
		{
			if(jsonResult.code === 200)
			{
				dispatch({
					type: GET_USERS_BY_GROUPID,
					result: jsonResult.data
				});
			}
			else
			{
				log("getUsersByGroupId 获取组成员数据失败");
			}
		});
	};
}

/*获取商户下用户群列表*/
export function getShopGroupByGroupId(siteid)
{
    return dispatch =>
    {
        urlLoader(Settings.getShopGroupByGroupIdUrl(siteid))
            .then(({jsonResult}) =>
            {
                if(jsonResult)
                {
                    let result = {
                        siteid,
                        jsonResult
                    };

                    dispatch({
                        type: GET_SHOP_USERS_BY_GROUPID,
                        result
                    });
                }
                else
                {
                    log("getUsersByGroupId 获取组成员数据失败");
                }
            });
    };
}

//-----------------------------reducer-----------------------------

export default function cooperateReducer(state = Map(), action)
{
	switch(action.type)
	{
		case GET_TRANSFER:
			state = state.set("groups", fromJS(action.result.groups));
			break;

		case GET_USERS_BY_GROUPID:
			let result = action.result;
			if(result && result.groupId)
			{
				state = state.set(result.groupId, fromJS(result.users));
			}
			break;

        case GET_SHOP_USERS_BY_GROUPID:
			let shopResult = action.result;

			if(shopResult && shopResult.siteid)
			{
				state = state.set(shopResult.siteid, fromJS(shopResult.jsonResult));
			}
			break;
	}

	return state;
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("cooperateReducer", info, log);
}
