import { fromJS } from "immutable";

const SET_COMMON_RECORD_TIME = "SET_COMMON_RECORD_TIME";   //删除常用搜索

/**
 * 查询常用搜索
 * flag 1=所有字段；2=列表展示的字段；3=导出展示的字段
 * */
export function setRecordCommonTime(consultTime, leaveMsgTime, selectedValue) {
    return dispatch => {

        dispatch({
            type: SET_COMMON_RECORD_TIME,
            consultTime,
            leaveMsgTime,
            selectedValue
        });
    }
}
//------------------------------------------Reducer------------------------------------------------------

let timeStamp = new Date(new Date().setHours(0, 0, 0, 0)),
    startTamp = timeStamp.getTime(),
    endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000,
    initState = fromJS({
    consultTime: {
        startTime: parseInt(startTamp),
        endTime: parseInt(endTamp)
    },
    leaveMsgTime: {
        time: [
            {
                "sign": ">=",
                "value": parseInt(startTamp)
            },
            {
                "sign": "<=",
                "value": parseInt(endTamp)
            }
        ]
    },
    selectedValue: "今天"
});
export default function getRecordCommonTime(state = initState, action) {
	switch(action.type)
	{
        case SET_COMMON_RECORD_TIME:

            return state.set("consultTime", action.consultTime)
                .set("leaveMsgTime", action.leaveMsgTime)
                .set("selectedValue", action.selectedValue);
    }

    return state;
}

