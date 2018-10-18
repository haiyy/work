import {GET_ALL_COMMON_WORLD, GET_PERSON_COMMON_WORLD} from '../model/vo/actionTypes';
import {by} from '../utils/MyUtil';
let Company = [], Person = [], loop;
export function getUsualTips(state = {}, action) {      //获取企业常用话术列表

    switch (action.type) {
        case GET_ALL_COMMON_WORLD:
            let parseResItem;
            action.data.sort(by("rank"));
            loop = function (tableData) {

                Company = [];

                tableData ?
                    tableData.map(function (item, index) {
                        if (item.fastResponses) {
                            if (item.fastResponses.length > 0) {
                                item.fastResponses.map((resItem,i)=>{
                                    if(resItem.type != 1){
                                        /*console.log("非文本项");*/
                                        parseResItem = JSON.parse(resItem.response);

                                    }else{
                                        parseResItem = resItem.response;
                                        /*console.log("纯文本项")*/
                                    }
                                    resItem.response = parseResItem;
                                });
                                Company.push(item);
                            } else {
                                delete item.fastResponses
                            }
                        }
                    }) : null;
            };

            loop(action.data);

            return {
                data: [...Company]
            };

        default:
            return state;
    }
}
export function getPersonUsualTips(state = {}, action) {    //获取个人常用话术列表

    switch (action.type) {


        case GET_PERSON_COMMON_WORLD:
            let parseResItem;
            if(action && action.data){
                action.data.sort(by("rank"));
            }

            loop = function (tableData) {
                Person = [];

                tableData ?
                    tableData.map(function (item, index) {
                        /*console.log(item);*/
                        if (item.fastResponses) {
                            if (item.fastResponses.length > 0) {
                                item.fastResponses.map((resItem,i)=>{
                                    if(resItem.type != 1){
                                        /*console.log("非文本项");*/
                                        parseResItem = JSON.parse(resItem.response);

                                    }else{
                                        parseResItem = resItem.response;
                                        /*console.log("纯文本项")*/
                                    }
                                    resItem.response = parseResItem;
                                });
                                Person.push(item);
                            } else {
                                delete item.fastResponses
                            }
                        }
                    }) : null;
            };

            loop(action.data);
            /*console.log(Person);*/
            return {
                data: [...Person]
            };

        default:
            return state;
    }
}
