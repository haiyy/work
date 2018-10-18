import {
  GET_ESSENTIAL ,ESSENTIAL, NEW_ESSENTIAL, DEL_ESSENTIAL
} from '../../../../model/vo/actionTypes';

let data = [];

export default function rules(state={},action)
{

    let progress;
    
  switch(action.type){
      case ESSENTIAL:

          progress = changeProgress(action);

          return {
              ...state,
              progress
          };

      case GET_ESSENTIAL:

          if (action.result && action.result.success)
          {
              data = action.result.data;
          }

          progress = changeProgress(action);

          return { data, progress };

	  case NEW_ESSENTIAL:

          if (action.result && action.result.success) {

              let result = action.result.data;

              data.map((item)=> {
                  if (item.key == action.key) {
                      item.subset.push(result);
                  }
              });
          }

          progress = changeProgress(action);

		  return { data, progress };

      case DEL_ESSENTIAL:
          if (action && action.success)
          {
              data.map((item)=> {
                  if (item.key == action.key) {
                      item.subset.map((m, n)=> {
                          if (m.keyid == action.result)
                          {
                              item.subset.splice(n, 1)
                          }
                      })
                  }
              });
          }

          progress = changeProgress(action);

		  return { data, progress };

      default:
          return state;
  }
}

function changeProgress(action)
{
    console.log("changeProgress action = " + action.left + ", right = " + action.right);

    let progress = {};

    if(action.hasOwnProperty("left"))
    {
        progress = action.left;
    }

    return progress;
}
