import {
  LOAD_NEXT_NEW,CURRENT_NEW,CLOSE_NEW
} from '../model/vo/actionTypes';
import cFetch from '../lib/utils/cFetch'
import { API_CONFIG } from '../data/api'
import { message } from 'antd'

function nextNew(result) {
  return {
    type: LOAD_NEXT_NEW,
    result,
  };
}
export function fetchReport(result) {
  return dispatch => {
    dispatch({
      type:CURRENT_NEW,
      result,
    });
    return cFetch(API_CONFIG.kpi, { method: "GET"}).then((response) => {
      if (response.jsonResult.error_code === 4001) {
        dispatch(usersError(response.jsonResult.error_message));
        message.error(response.jsonResult.error_message);
      } else {
        dispatch(nextNew(response.jsonResult));
      }
    });
  };
}
