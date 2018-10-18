//报表筛选条件当前项是否已选
export function filterItem(title, valueData) {
    for (let j = 0; j < valueData.length; j++) {
        if (valueData[j].name === title) {
            return true;
        }
    }
}

function getData(data, name, item) {
    if (data.length == 0) {
        return;
    }
    for (let i = 0; i < data.length; i++) {
        if (data[i].children && data[i].children.length != 0) {
            Array.from(data[i].children);
            getData(data[i].children, name, item)
        } else if (data[i].username != undefined && data[i].username == name) {
            item.select.value = item.select.value.length == 0 ? name : item.select.value + "," + name;
        }
    }
}


//获取行政组数据  filterReducer filterCriteria中对cs单独处理
export function getAdministrativeGroup(data)//result.data
{
    if (!data)
        return [];

    for (let i = 0; i < data.length; i++) {
        let value = data[i];
        value.key = value.groupid;
        value.value = value.label;
        if (data[i].children) {
            getAdministrativeGroup(data[i].children);
        }
    }
    return data;
}

//获取行政组下客服
export function getUser(value, groupid, data) {

    let children, child;
    if (value != undefined) {
        for (let i = 0; i < value.length; i++) {
            if (value[i].children) {
                if (groupid == value[i].groupid) {
                    children = value[i].children;
                    child = [];

                    for (let j = 0; j < children.length; j++) {
                        if (children[j].groupid) {
                            child.push(children[j]);
                        }
                    }

                    value[i].children = child.concat(data);
                }

                getUser(value[i].children, groupid, data);
            } else {
                if (groupid == value[i].groupid) {
                    value[i].children = data;
                }
            }

        }
    }
}

