import {
  LOADING, REFRESH, LOAD_NEXT_PAGE,REFRESH_LIST,CLEAR_DATA
} from '../model/vo/actionTypes';
import {urlLoader} from '../lib/utils/cFetch';
import { API_CONFIG } from '../data/api.js';
import Settings from '../utils/Settings';

function nextPage(result,key,currentPage) {
  return {
    type: LOAD_NEXT_PAGE,
    key: key,
    list: result.list,
    currentPage: currentPage,
    pagination: {
        requireTotalCount: result.requireTotalCount,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
        totalCount: result.totalCount
    }
  };
}

function refreshList(result, key,currentPage) {
  return {
    type: REFRESH_LIST,
    key: key,
    list: result.list,
    currentPage: currentPage ,
    pagination: {
        requireTotalCount: result.requireTotalCount,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
        totalCount: result.totalCount
    }

  };
}
export function loadNextPage(key, url, params, call,currentPage){
  return dispatch => {
    dispatch({
            type: LOADING,
            key: key,
            loading: true
    });
    return cFetch(API_CONFIG.goods,params, { method: "GET"}).then((response) => {
      if (response.jsonResult.error_code === 4001) {
        // console.log("获取数据失败");
      } else {
        dispatch(nextPage(response.jsonResult, key,currentPage));
        call && call(response.jsonResult);
      }
      // console.log(params);
      // console.log(currentPage);
      // console.log(response.jsonResult);
    });
  };

}

export function refresh(key, url, params, call,currentPage){
  return dispatch => {
    dispatch({
            type: REFRESH,
            key: key,

        });
    return urlLoader(Settings.getProductUrl(), {
      headers:
        {
          "token": Settings.getSkyEyeToken()
        }
      }).then((response) => {
      if (!response.jsonResult) {
        // console.log("获取数据失败");
      } else {
        let param = {};

        if (response.jsonResult.params) {
          params = response.jsonResult.params;
        }

        let productinfo = {
          requireTotalCount: false,
          pageSize: 1,
          hasMore: false,
          totalCount: 1,
          list: [
            params
          ]
        };

        dispatch(refreshList(productinfo, key,currentPage));
        call && call(productinfo);
      }
      // console.log(currentPage);
    });
  };

}
export function clearData(eventKey){
    return {
        type: CLEAR_DATA,
        eventKey: eventKey
    }
}
