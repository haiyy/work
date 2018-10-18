//获取工作台所有选项数据
import Settings from "../../../utils/Settings";
import {loginUserProxy} from "../../../utils/MyUtil";

let getAllUrl = "";
export function getAllOptions()
{
    if(!getAllUrl)
        getAllUrl = Settings.querySettingUrl("/settings/", loginUserProxy().siteId, "/workbench");

    log("getAllOptions getAllUrl = " + getAllUrl);

    return dispatch => loadData(dispatch, undefined, GET_ALL_OPTIONS, getAllUrl);
}
