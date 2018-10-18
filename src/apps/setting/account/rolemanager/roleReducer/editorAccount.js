import { GET_EDITOR_ROLE } from '../../../../../model/vo/actionTypes';


export default function listAccount(state={},action){
  switch(action.type){
      case GET_EDITOR_ROLE:
          return {
	          data: action.data
          }
      default:
          return state;
  }
    return state;
}
