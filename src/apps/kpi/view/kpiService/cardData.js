//卡片
export function cardData(data = {}) {
    let {columns = [], rows = []} = data,
        dealedData = [],
        dataItem = {};

    columns.forEach(item =>
    {
        let dataItem = {
            title: item.title
        };

        switch (item.dataType) {
            case "Long":
                dataItem.value = rows[0] && rows[0][item.name] ? rows[0][item.name] : 0;
                break;

            case "Percent":
                dataItem.value = rows[0] && rows[0][item.name] ? percentTypeData(rows[0][item.name]) : 0;
                break;

            case "time_client":
                dataItem.value = timeTypeData(rows[0][item.name]);
                break;
        }

        dealedData.push(dataItem)
    });

    return dealedData
}

/*百分比转换*/
function percentTypeData(data = 0)
{
    return parseFloat((parseFloat(data) * 100).toFixed(2)) + "%"
}

/*时间转换 毫秒*/
function timeTypeData(time)
{
    let interval = time ? time/1000 : 0,
        days = Math.floor(interval / (3600 * 24)),
        hours = Math.floor((interval - days * 3600 * 24) / 3600),  //取得剩余小时数 60 * 60
        minutes = parseInt(interval / 60) % 60,  //取得剩余分钟数
        seconds = parseInt(interval % 60),  //取得剩余秒数
        dsep = "d",
        hsep = "h",
        msep = "m",
        ssep = "s";

    if(days > 0)
    {

        return days + dsep + hours + hsep + minutes + msep + seconds + ssep;
    }
    else if(hours > 0)
    {

        return hours + hsep + minutes + msep + seconds + ssep;
    }
    else
    {
        if(minutes <= 0)
        {
            return seconds + ssep;
        }

        return minutes+ msep +seconds + ssep;
    }
}
