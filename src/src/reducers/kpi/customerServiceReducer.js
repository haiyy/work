import {
	CUSTOMER_SERVICE, SELECTION_COLUMN
} from '../../model/vo/actionTypes';
import { gridData } from './gridData.js'

let newData = {};
export default function customerService(state={},action){
	
	switch(action.type){
		
		case CUSTOMER_SERVICE:
			//console.log("action.result>>>>",action.result);
			console.log("action.result>>>>",gridData(action.result))
			newData = gridData(action.result);
			
			return {
				data: newData
			}
		case SELECTION_COLUMN:
			//newData = gridData(action.result);
			newData.columns = action.result;
			console.log(newData);
			console.log(action.result);
			//return {
			//	data: newData
			//}
		default:
			return state;
	}
	return state;
}

