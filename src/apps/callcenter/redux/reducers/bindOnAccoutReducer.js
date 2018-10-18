import { Map} from 'immutable';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy ,configProxy} from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";

// /sitecenter/evs/{$siteId}/usersetting/{$userId}?accesstoken=XXX

const BINDONACCOUT_PROGRESS = "BINDONACCOUT_PROGRESS",
    GET_BINDONACCOUT_BINDING = "GET_BINDONACCOUT_BINDING",//多条件查询绑定关系
    PUT_BINDONACCOUT_BINDING="PUT_BINDONACCOUT_BINDING", //用于进行帐号绑定的操作
    DELETE_BINDONACCOUT_BINDING="DELETE_BINDONACCOUT_BINDING",//解绑
    GET_GROUPNAME_BINDG = "GET_GROUPNAME_BINDG",//查询企业所有行政组
    GET_GROUPCUSTER_LIST = "GET_GROUPCUSTER_LIST",//查询行政组内所有客服
    GET_GROUPCUSTERMER_UNBIND_LIST = "GET_GROUPCUSTERMER_UNBIND_LIST";//查询行政组内未绑定客服

/**
 *  账号绑定 多条件查询绑定关系
 *  @param {String} key       //   坐席工号，分机号码，小能客服帐号，内部名，外部名
 *  @param {String} page	 // 当前页码
 *  @param {String} rp //    每页显示数量，默认是10
 * */
export const getBindOnAccoutList = (key="",page=1,rp=10) => dispatch => {
    dispatch({type: BINDONACCOUT_PROGRESS, progress: LoadProgressConst.LOADING});
    let {ntoken, siteId} = loginUserProxy(),
    data={},
    headUrl = configProxy().xNccSettingServer +`/sitecenter/evs/${siteId}/bound`;

    data.key=key;
    data.page=page;
    data.rp=rp;
    
    return urlLoader(headUrl,{
        headers: {token: ntoken},
        body: JSON.stringify(data),
		method: "post",
    })
        .then(({jsonResult}) => {
            let {code, data, msg} = jsonResult,
                success = code == 200,
                progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
            
            dispatch({
                type: GET_BINDONACCOUT_BINDING,
                data:data||{},
                msg,
                progress
            })
        });
};

/**
 *  账号绑定 解绑
 *  @param {String} siteId //   企业ID
 *  @param {String} extensionNumber   //   分机号码
 * */
export const deleteBindOnAccout = (data) => dispatch => {
    dispatch({type: BINDONACCOUT_PROGRESS, progress: LoadProgressConst.LOADING});

    let {siteId,ntoken} = loginUserProxy(),
        headUrl = Settings.getCallSettingUrl(`${siteId}/binding/${data.extensionNumber}`);
    data.siteId=siteId;
    return urlLoader(headUrl,{
        body:JSON.stringify(data),
        headers: {token: ntoken},
        method:"delete"
    })
        .then(({jsonResult}) => {
            let {code, msg} = jsonResult,
                success = code == 200,
                progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.SAVING_FAILED;

            if(success) {
                dispatch({
                    type:DELETE_BINDONACCOUT_BINDING,
                    msg,
                    progress,
                    extensionNumber:data.extensionNumber
                });
            } else {
                dispatch({
                    type:BINDONACCOUT_PROGRESS,
                    msg:msg?msg:"操作失败",
                    progress
                });
            }
        });
};

/**
 *  账号绑定 绑定
 *  @param {String} siteId //   企业ID
 *  @param {String} extensionNumber   //   分机号码
 *  @param {json} userData   //   小能客服帐号信息
 * */
export const putBindOnAccout = (extensionNumber,userData) => dispatch => {
    dispatch({type: BINDONACCOUT_PROGRESS, progress: LoadProgressConst.LOADING});

    let {siteId,ntoken} = loginUserProxy(),
        headUrl = Settings.getCallSettingUrl(`${siteId}/binding`),
        data = {siteId:siteId, extensionNumber:extensionNumber, userId:userData.userId};
    return urlLoader(headUrl,{
        body:JSON.stringify(data),
        headers: {token: ntoken},
        method:"POST"
    })
        .then(({jsonResult}) => {
            let {code, msg} = jsonResult,
                success = code == 200,
                progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.SAVING_FAILED;

            if(success){
                dispatch({
                    type: PUT_BINDONACCOUT_BINDING,
                    msg,
                    progress,
                    extensionNumber,
                    userData
                });
            } else {
                dispatch({
                    type:BINDONACCOUT_PROGRESS,
                    msg:msg?msg:"操作失败",
                    progress
                });
            }
        });
};

//查询企业所有行政组
export function getGroupNameBinding() {
    return dispatch=>{
        let {ntoken, siteId} = loginUserProxy(),
        headUrl = Settings.getCallSettingUrl(`${siteId}/groups`);
        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
        .then(({jsonResult}) => {
            let {data} = jsonResult;
                for (const item in data) {
                    data[item].children = [];
                }
                dispatch({
                    type:GET_GROUPNAME_BINDG,
                    data
                });
        });
    }
}

/**
 * 查询行政组内所有客服
 * @param {string} groupId 行政组ID
 */
export function getGroupCustomerList(groupId,resolve) {
    return dispatch=>{
        let {ntoken,siteId} = loginUserProxy(),
        headUrl = Settings.getCallSettingUrl(`${siteId}/groups/${groupId}`);
        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
        .then(({jsonResult}) => {
            let {data} = jsonResult;
            dispatch({
                type:GET_GROUPCUSTER_LIST,
                data:data||[],
                groupId
            });
            resolve();
        });
    }
}

/**
 * 查询行政组内未绑定客服
 * @param {string} groupId 行政组ID
 */
export function getGroupCustomerUnbindList(groupId,resolve) {
    return dispatch=>{
        let {ntoken, siteId} = loginUserProxy(),
        headUrl = Settings.getCallSettingUrl(`${siteId}/unboundusers/${groupId}`);
        return urlLoader(headUrl,{
            headers: {token: ntoken}
        })
        .then(({jsonResult}) => {
            let {data} = jsonResult;
            dispatch({
                type:GET_GROUPCUSTERMER_UNBIND_LIST,
                data:data||[],
                groupId
            });
            resolve();
        });
    }
}

export function updateProgress() {
    return dispatch=>{
        dispatch({
            type:BINDONACCOUT_PROGRESS,
            msg:"",
            progress:LoadProgressConst.LOAD_COMPLETE
        });
    }
}

// --------------------------Reducer-------------------------------------
let initState = Map({progress:1});
initState = initState.set("binDingList",{});
initState = initState.set("groupnameList",[]);

export default function bindOnAccoutReducer(state = initState, action){
    switch (action.type) {
        case GET_BINDONACCOUT_BINDING:
            initState = initState.set("binDingList",action.data);
            return state.set("binDingList",action.data)
                    .set("msg",action.msg)
                    .set("progress",action.progress);

        case PUT_BINDONACCOUT_BINDING:
            let bindingList = initState.get("binDingList") || {};
            if (bindingList.list) {
                for(let i = 0;i < bindingList.list.length;i++) {
                    const element = bindingList.list[i];
                    if (element.extensionNumber == action.extensionNumber) {
                        bindingList.list[i].enabled = "1";
                        bindingList.list[i].nickName = action.userData.nickName;
                        bindingList.list[i].externalName = action.userData.externalName;
                        bindingList.list[i].roleName = action.userData.roleName;
                        bindingList.list[i].groupName = action.userData.groupName;
                        bindingList.list[i].userName = action.userData.userName;
                        bindingList.list[i].attendantAccount = action.userData.attendantAccount;
                        break;
                    }
                }
            }
            initState = initState.set("binDingList",bindingList);
            return state.set("binDingList",bindingList)
                .set("msg",action.msg)
                .set("progress",action.progress);

        case  DELETE_BINDONACCOUT_BINDING :
            let bindList = initState.get("binDingList") || {};
            if (bindList.list) {
                for(let i = 0;i < bindList.list.length;i++) {
                    const element = bindList.list[i];
                    if (element.extensionNumber == action.extensionNumber) {
                        bindList.list[i].enabled = "0";
                        bindList.list[i].nickName = "";
                        bindList.list[i].externalName = "";
                        bindList.list[i].roleName = "";
                        bindList.list[i].groupName = "";
                        bindList.list[i].userName = "";
                        bindList.list[i].attendantAccount = "";
                        break;
                    }
                }
            }
            initState = initState.set("binDingList",bindList);
            return state.set("binDingList",bindList)
                .set("msg",action.msg)
                .set("progress",action.progress);
                    
        case GET_GROUPNAME_BINDG:
            return state.set("groupnameList",action.data);

        case GET_GROUPCUSTERMER_UNBIND_LIST:
        case GET_GROUPCUSTER_LIST:
            let dataList = state.get("groupnameList");
            if (action.data && action.data.length > 0) {
                for (const item in dataList) {
                    if (dataList[item].groupId == action.groupId) {
                        dataList[item].children = action.data||[];
                        break;
                    }
                }
            }
            return state.set("groupnameList", [...dataList]);

        case BINDONACCOUT_PROGRESS:
            return state.set("progress", action.progress)
                     .set("msg",action.msg);
    }
    return state
}
