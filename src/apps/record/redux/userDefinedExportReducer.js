//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=69927851

import { fromJS } from "immutable";
import Settings from "../../../utils/Settings";
import { urlLoader } from "../../../lib/utils/cFetch";
import { loginUserProxy, configProxy, token } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { getResultCode, dispatchAction, getAction } from "../../../utils/ReduxUtils";

const GET_USER_DEFINED_EXPORT = "GET_USER_DEFINED_EXPORT";   //删除常用搜索

/**
 * 查询常用搜索
 * flag 1=所有字段；2=列表展示的字段；3=导出展示的字段
 * */
export function getUserDefinedExport(flag)
{
    return dispatch => {

        dispatch(getAction( GET_USER_DEFINED_EXPORT, LoadProgressConst.LOADING ));

        let {userId: kfid, siteId} = loginUserProxy(),
            headers =  {token: token()},
            url = configProxy().nCrocodileServer + '/conversation/getAllField?siteId=' + siteId + '&flag=' + flag;

        return urlLoader(url, {method: 'get', headers})
            .then(getResultCode)
            .then((result) => {

                let success = result && result.code == 200,
                    progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction( GET_USER_DEFINED_EXPORT, progress, result.data || {}));
            })
    }
}
//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
    exportData: [],
    progress: 2
});
export default function getExportOption(state = initState, action) {
	switch(action.type)
	{
        case GET_USER_DEFINED_EXPORT:

            return state.set("exportData", action.result)
                .set("progress", action.progress);
    }

    return state;
}

