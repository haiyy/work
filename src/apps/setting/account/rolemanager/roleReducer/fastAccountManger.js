import { GET_FAST_ACCOUNT } from '../../../../../model/vo/actionTypes';


export default function fastAccountManger(state={},action){
  switch(action.type){
      case GET_FAST_ACCOUNT:
          return {
	          data: action.data
          }
      default:
          return state;
  }
    return state;
}
