import { GET_ACCOUNT_LIST } from '../../../../../model/vo/actionTypes';


export default function listAccount(state={},action){
  switch(action.type){
      case GET_ACCOUNT_LIST:
          return {
	          data: action.data
          }
      default:
          return state;
  }
    return state;
}
