import {
  GET_PEND_TREATMENT,PEND_TREATMENT
} from '../model/vo/actionTypes';
import cFetch from '../lib/utils/cFetch'
import { API_CONFIG } from '../data/api'
import { message } from 'antd'

function getPendTreatment(result) {
  return {
    type: GET_PEND_TREATMENT,
    result
  };
}

export function pendTreatment(result) {
  return dispatch => {
    dispatch({
      type:PEND_TREATMENT,
      result
    });
    return cFetch(API_CONFIG.pendTreatment, { method: "GET"}).then((response) => {
      if (response.jsonResult.error_code === 4001) {
        message.error(response.jsonResult.error_message);
      } else {
        dispatch(getPendTreatment(response.jsonResult));
      }
    });
  };
}

