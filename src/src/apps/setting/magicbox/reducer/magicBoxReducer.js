import { fromJS } from "immutable";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, token } from "../../../../utils/MyUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { getResultCode, getAction } from "../../../../utils/ReduxUtils";
import LogUtil from "../../../../lib/utils/LogUtil";

const GET_MAGIC_BOX_LIST = "GET_MAGIC_BOX_LIST";

export function getMagicBoxList(data)
{
    return dispatch => {
        let {siteId, ntoken} = loginUserProxy();

        dispatch(getAction(GET_MAGIC_BOX_LIST, LoadProgressConst.LOADING));

        let settingUrl = Settings.querySettingUrl("/magicbox/", siteId);

        log("getMagicBoxList settingUrl = " + settingUrl);

        return urlLoader(settingUrl, {headers: {token: ntoken}})
            .then(getResultCode)
            .then(result =>
            {
                let progress = result.code === 200 ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;

                dispatch(getAction(GET_MAGIC_BOX_LIST, progress, result || {}));
            })
    }
}

//------------------------------------------Reducer------------------------------------------------------

let initState = fromJS({
    progress: 2,
    magicBoxList: [],
    total: 0
});

export default function magicBoxReducer(state = initState, action) {

    let magicBoxList = [];

    switch(action.type)
    {
        case GET_MAGIC_BOX_LIST:

            if (action.result && action.result.success)
            {
                magicBoxList = action.result.data || [];
            }

            return state.setIn(["progress"], action.progress)
                .setIn(["magicBoxList"], magicBoxList);

        default:
            return state;
    }
}

function log(log, info = LogUtil.INFO)
{
    LogUtil.trace("magicBoxReducer", info, log);
}
