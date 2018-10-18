import { FILTER_REPORT, FILTER_CONDITIONS, FILTER_DATA, GROPU_USER, NEW_FILTER_REPORT } from '../../model/vo/actionTypes';

let newData = {};
export default function filterConditions(state={},action){
  // console.log(action);
  switch(action.type){
      case FILTER_CONDITIONS:
	      newData = action.result;
	      //console.log(action.result);
	      //let items = action.result.items;
	      //if(newData.items)
	      //{
	      //
	      //}
	      //for(let i=0; i<items.length;i++)
	      //{
	      //	if(items[i].name == "name"){
		   //     items.splice(i, 1);
	      //  }
	      //}
	      //action.result.items = items;
	      return {
		      data: action.result
	      }
      default:
          return state;
  }
    return state;
}

export function query(state={},action){
	switch(action.type)
	{
		case FILTER_REPORT:
			newData = action.result;
			return {
				data: action.result
			}
		case NEW_FILTER_REPORT:
			newData = action.result;
			return {
				data: action.result
			}
		default:
			return state;
	}
}

//export function groupUser(state={},action)
//{
//	switch(action.type)
//	{
//		case GROPU_USER:
//			console.log("data>>>>>>",action);
//			//return {
//			//	data: action.result
//			//}
//		default:
//			return state;
//	}
//}

export function filterCriteria(state={},action)
{
	switch(action.type)
	{
		case FILTER_DATA:
			console.log("data>>>>>>",action.result);
		return {
			data: action.result
		}
		default:
			return state;
	}
}