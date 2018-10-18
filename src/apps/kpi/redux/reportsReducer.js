import { GET_KPI, KPI_LIST, REPOET_VALUE } from '../../../model/vo/actionTypes'

let newData = [];
export default function reportsList(state={},action){
  switch(action.type){
      case GET_KPI:
	      return {
		      progress: action.progress,
		      data: newData
	      }
      case KPI_LIST:
          newData = action.result;
	      return {
		      data: [...newData],
		      progress: action.progress,
	      }
      default:
          return state;
  }
    return state;
}
