import {
    SET_CHARTFILTER, GET_CHARTDATA, GET_CHARTTYPE, GET_CHARTERROR
} from '../model/vo/actionTypes'
import Immutable from 'immutable'

let defaultState ={
    chartModel:{
        id: -1,
        chartType: 'line',
        chartTitle: '在线时长',
        dateStart: '2016-11-11',
        dateEnd: '2016-12-10',
        width:300,
        height:300,
        imageUrl:'bd_logo1.png',
        data: []
    }
}
defaultState = Immutable.fromJS(defaultState);
export default function chart(state = defaultState, action) {
    switch (action.type) {
        case SET_CHARTFILTER: {
            return state;
        }
        case GET_CHARTDATA: {
            return state.set('chartInfo', Immutable.fromJS(action));
        }
        case GET_CHARTTYPE: {
            return state;
        }
        case GET_CHARTERROR: {
            return state;
        }
        default: {
            return state;
        }
    }
}
