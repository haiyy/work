//整合报表筛选条件
import moment from 'moment'

export default function getQuery(query = [], date = []) {
    let nextQry = '';
    if (date.length !== 0) {
        nextQry = `datetime|between|${date.toString()}`

    }
    if (query !== 0) {
        if (nextQry.length !== 0)
            query = query.filter(qry => qry.name !== "datetime");

        let select;
        for (let i = 0; i < query.length; i++) {
            select = query[i];
            if (select.value.length !== 0 || select.value === ',') {
                nextQry = nextQry ? `${nextQry}&&${select.name}|${select.operation}|${select.value}` : `${select.name}|${select.operation}|${select.value}`
            }
        }
    }

    if (nextQry.length === 0) {
        let date1 = moment().startOf('d').subtract(1, 'd').add(1, 'days').format("YYYY-MM-DD HH:mm:ss"),
            date2 = moment().format("YYYY-MM-DD HH:mm:ss");

        nextQry = `datetime|between|${date1},${date2}`;
    }

    return nextQry;
}

export function dateTime(query, date)//筛选出query中datetime项并字符串格式返回没有则添加一项筛选条件
{
    let index = query.findIndex(getDate);//返回时datetime的项
    if (index >= 0) {
        query[index].value = date.toString();
    }
    else {
        let value = {
            id: 0,
            name: "datetime",
            operation: "in",
            multiSelect: false,
            ui: "datetime",
            value: date.toString()
        }
        query.splice(0, 0, value);//向query项中添加一个value项，从0开始，删除0项，添加value项
    }
    return query;
}

export function querySiteid(query, siteid)//筛选出query中datetime项并字符串格式返回没有则添加一项筛选条件
{
    if (!query)
        return;

    if (!siteid)
        siteid = "all";

    let queryArr = query.split("&&") || [],
        siteIdItemIndex = queryArr.findIndex(item => item.includes("platform")),
        siteValue = "shops|in|";

    if (siteIdItemIndex > -1)
        queryArr.splice(siteIdItemIndex, 1);

    siteValue += siteid;
    queryArr.push(siteValue);

    return queryArr.join("&&");
}

function getDate(element) {
    return element.name === 'datetime';
}
