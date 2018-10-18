//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=69927851

import { fromJS } from "immutable";
import Settings from "../../../utils/Settings";
import { urlLoader } from "../../../lib/utils/cFetch";
import { loginUserProxy, configProxy, token } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { getResultCode, dispatchAction, getAction } from "../../../utils/ReduxUtils";
import {createMessageId} from "../../../lib/utils/Utils";

const GET_SUMMARY_ALL_TREE_DATA = "GET_SUMMARY_ALL_TREE_DATA",//获取咨询总结类型值
    GET_VISITOR_SOURCE_TREE_DATA = "GET_VISITOR_SOURCE_TREE_DATA",//获取访客来源全部数据
    GET_ESSENTIAL_ALL_PAGE = "GET_ESSENTIAL_ALL_PAGE";//获取关键页面数据

/*获取咨询总结类型值*/
export function getSummaryAllVisitorSource()
{
    return dispatch => {

        dispatch(getAction( GET_VISITOR_SOURCE_TREE_DATA, LoadProgressConst.LOADING ));

        let {siteId} = loginUserProxy(),
            headers =  {token: token()},
            url = Settings.querySettingUrl("/source/", siteId, "?terminal=client");

        return urlLoader(url, {method: 'GET', headers})
            .then(getResultCode)
            .then((result) => {

                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction( GET_VISITOR_SOURCE_TREE_DATA, progress, result.data || {}));
            })
    }
}

/*获取咨询总结类型值*/
export function getSummaryAllTreeData()
{
    return dispatch => {

        dispatch(getAction( GET_SUMMARY_ALL_TREE_DATA, LoadProgressConst.LOADING ));

        let {userId: kfid, siteId} = loginUserProxy(),
            headers =  {token: token()},
            url = Settings.querySettingUrl("/summary/", siteId, "/entire");

        return urlLoader(url, {method: 'GET', headers})
            .then(getResultCode)
            .then((result) => {

                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction( GET_SUMMARY_ALL_TREE_DATA, progress, result.data || {}));
            })
    }
}

/*获取全部关键页面*/
export function  getAllKeyPageData() {
    return dispatch => {
        dispatch(getAction(GET_ESSENTIAL_ALL_PAGE, LoadProgressConst.LOADING));
        let {siteId, ntoken} = loginUserProxy();

        let settingUrl = Settings.querySettingUrl("/keyPage/",siteId, "");
        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(getResultCode)
            .then(dispatchAction.bind(null, dispatch, GET_ESSENTIAL_ALL_PAGE, true));
    };
}
//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
    visitorSourceData: [],
    visitorSourceDefault: [],
    summaryAllData: [],
    summaryDefaultData: [],
    keyPageData: [],
    progress: 2
}),
    defaultShowItems = [],
    defaultShowSummary = [];
export default function searchTreeDataReducer(state = initState, action) {
	switch(action.type)
	{
        case GET_VISITOR_SOURCE_TREE_DATA:

            if (action.result)
            {
                getDealedVisitorSource(action.result);
                defaultShowItems = getDefaultShowItems(action.result)
            }

            return state.set("visitorSourceData", action.result || [])
                .set("visitorSourceDefault", defaultShowItems || [])
                .set("progress", action.progress);

        case GET_SUMMARY_ALL_TREE_DATA:
            if (action.result && action.result.length)
            {
                getDealedSummary(action.result);
                defaultShowSummary = getDefaultShowItemsSummary(action.result);
            }

            return state.set("summaryAllData", action.result || [])
                .set("summaryDefaultData", defaultShowSummary)
                .set("progress", action.progress);

        case GET_ESSENTIAL_ALL_PAGE:

            return state.set("keyPageData", action.result || [])
                .set("progress", action.progress);
    }

    return state;
}

function getDealedSummary(summaryArr)
{
    summaryArr.forEach(item => {
        if (item.type == 0)
        {
            delete item.children;
        }
        if (item.children && item.children.length)
        {
            getDealedSummary(item.children)
        }
    })
}

function getDealedVisitorSource(visitorSource)
{
    visitorSource.forEach(visitorGroup => {

        let {items = [], children = []} = visitorGroup;

        if (children.length)
            children.forEach(item => {
                item.source_type_id = item.source_type_id.toString();
            });

        if (items.length)
            items.forEach(visitorItem => {
                let itemObj = {
                    ename: visitorItem.ename.toString(),
                    typename: visitorItem.cname
                };
                visitorGroup.children.push(itemObj)
            });

        delete visitorGroup.items;

        if (children && children.length)
            getDealedVisitorSource(children)
    });
}


function getDefaultShowItems(dataSource)
{
    let defaultItmes = [];

    dataSource.forEach(item => {
         if (item.children && item.children.length)
         {
             item.children.forEach(childItem => {
                    if (!childItem.children)
                    {
                        let child = {
                            label: childItem.typename,
                            value: childItem.ename,
                            key: childItem.ename
                        };
                        defaultItmes.push(child)
                    }else
                    {
                        getDefaultShowItems(childItem.children)
                    }
             })
         }
    });
    if(defaultItmes.length > 4)
        defaultItmes.slice(0, 4);

    return defaultItmes.length > 4 ? defaultItmes.slice(0, 4) : defaultItmes;
}

function getDefaultShowItemsSummary(dataSource = [])
{
    let defaultItmes = [];

    dataSource.forEach(item => {
        if (item.children && item.children.length)
        {
            item.children.forEach(childItem => {
                if (childItem.type === 0)
                {
                    let child = {
                        label: childItem.content,
                        value: childItem.summaryid,
                        key: createMessageId()
                    };
                    defaultItmes.push(child)
                }else
                {
                    getDefaultShowItemsSummary(childItem.children)
                }
            })
        }
    });

    if(defaultItmes.length > 4)
        defaultItmes.slice(0, 4);

    return defaultItmes.length > 4 ? defaultItmes.slice(0, 4) : defaultItmes;
}



