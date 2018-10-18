import { GET_WEBVIEW, SET_WEBVIEW, CLEAR_WEBVIEW_PROGRESS } from '../../../../model/vo/actionTypes';

export function getWebview(state={},action){

    let webviewData = [], progress;

    switch(action.type){

      case GET_WEBVIEW:

          if (action.result && action.result.success)
          {
              webviewData = action.result.data;
          }

          progress = changeProgress(action);

          return {
	          data: webviewData,
              progress
          };

      case SET_WEBVIEW:

          if (action && action.success)
          {
              webviewData = action.data;
          }

          progress = changeProgress(action);


          return {
              data: webviewData,
              progress
          };

        case CLEAR_WEBVIEW_PROGRESS:

            progress = changeProgress(action);

            return {
                ...state,
                progress
            };


      default:
          return state;
  }
}

function changeProgress(action)
{
    console.log("changeProgress action = " + action.left);

    let progress = {};
    if(action.hasOwnProperty("left"))
    {
        progress = action.left;
    }

    return progress;
}
