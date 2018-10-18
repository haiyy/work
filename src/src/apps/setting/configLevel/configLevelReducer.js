import {
	GET_INDIVIDUAL_LEVEL, EDIT_CONFIG_LEVEL, GET_ALL_CONFIG_LEVEL
} from '../../../model/vo/actionTypes';
import { Map } from "immutable";

//获取配置项级别
export function getConfigLevel(state = Map(), action)
{
    let progress;
	switch(action.type)
	{
		case GET_INDIVIDUAL_LEVEL:   //获取单个配置项级别
			let data = action.data;
            
            progress = changeProgress(action);

			if(data)
			{
				state = state.set(data.item, data.level);
			}
			return state;

		case GET_ALL_CONFIG_LEVEL:  //获取所有配置项级别
			const {result: configs = []} = action;
            configs.length > 0 && configs.forEach(item =>
			{
				state = state.set(item.item, item.level)
			});
            progress = changeProgress(action);
			return state;

		case EDIT_CONFIG_LEVEL:  //编辑配置项
            progress = changeProgress(action);
			if(action.data)
			{
				let data = action.data;
				state = state.set(data.item, data.level);
			}

            state = state.set("progress", progress);
			return state;

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

