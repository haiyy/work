import {
  GET_PEND_TREATMENT
} from '../model/vo/actionTypes';


export default function navReducer(state={},action){
  switch(action.type){
      case GET_PEND_TREATMENT:
          return{
            data: action.result
          }
      default:
          return state;
  }
}
