import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import ColleagueConverListProxy from "../../../../model/proxy/ColleagueConverListProxy";
import Model from "../../../../utils/Model";
import { loginUserProxy } from "../../../../utils/MyUtil";
const LIST_CHANGED = 1;

export function refreshColleagueConver(updateTime)
{
	return dispatch =>
	{
		let token = loginUserProxy().ntoken;
		
		urlLoader(Settings.getColleagueConverUrl(), {headers: {token}})
		.then(({jsonResult}) =>
		{
			if(jsonResult.code === 200)
			{
				let colConverList = Model.retrieveProxy(ColleagueConverListProxy.NAME);
				colConverList.update(jsonResult.data);
				
				dispatch({
					type: LIST_CHANGED,
					updateTime
				});
			}
		});
	};
}

//--------------------------------Reducer--------------------------------------

export default function colleagueConverReducer(state = {}, action)
{
	switch(action.type)
	{
		case LIST_CHANGED:
			return {updateTime: action.updateTime};
	}
	
	return state;
}