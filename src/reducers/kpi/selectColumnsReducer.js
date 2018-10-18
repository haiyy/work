import { GET_ALL_COLUMNS, GET_SELECT_COLUMNS, SET_SELECT_COLUMNS } from './../../constants/actionTypes';

let allColumns = {},
	selectColumns = {};

//获取报表所有显示列
export default function getAllColumns(state={},action){
	// console.log(action);
	switch(action.type){
		case GET_ALL_COLUMNS:
			allColumns[action.name] = action.result;
			return {
				data:  {...allColumns}
			}
		default:
			return state;
	}
	return state;
}


//获取当前报表显示列
export function getSelectColumns(state={},action)
{
	switch(action.type)
	{
		case GET_SELECT_COLUMNS:

			selectColumns[action.name] = Array.from(action.result);
			return {
				data:  {...selectColumns}
			}
		case SET_SELECT_COLUMNS:

			selectColumns[action.name] = Array.from(action.result);
			return {
				data:  {...selectColumns}
			}
		default:
			return state;
	}
}
