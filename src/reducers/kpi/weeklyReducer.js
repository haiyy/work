import {
	GET_WEEKLY, REPOET_WEEKLY
} from '../../model/vo/actionTypes';
import { gridData } from './gridData.js'

let newData = {};
export default function weeklyDetails(state={},action){
	 
	switch(action.type){
		case GET_WEEKLY:
			return {
				data: action.result
			}
		case REPOET_WEEKLY:
			newData = gridData(action.result);
			//console.log("weeklyDetails>>>>",newData);
			return {
				data: newData
			}
		default:
			return state;
	}
	return state;
}

