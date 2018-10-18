// 折线图
import chartStyle from './chartStyle'

function lineOption(value) {

    //毫秒改为秒
    for (let i = 0; i < value.series.length; i++) {
        let item = value.series[i];
        if (value.dataType.indexOf(item.name) > -1) {
            item.data = item.data.map(itemValue => {
                return Math.floor(itemValue / 1000)
            })
        }
    }
    //小数改为百之比
    for (let i = 0; i < value.series.length; i++) {
        let item = value.series[i];
        if (value.typePercent.indexOf(item.name) > -1) {
            item.data = item.data.map(itemValue => {
                let temp = itemValue * 100;
                return temp === 0 ? 0 : temp === 100 ? 100 : (temp).toFixed(2)
            })
        }
    }
    if (value.typePercent.length !== 0) {
        if (value.legend.length === 1) {//一列数据时左y轴为百分比
            value.yAxis[0] = {
                ...chartStyle.yAxis,
                axisLabel: {
                    formatter: '{value}%',
                    margin: 10,
                    textStyle: {
                        color: '#666666'
                    }
                }
            }

        } else {
            value.yAxis[1] = {
                ...chartStyle.yAxis,
                axisLabel: {
                    formatter: '{value}%',
                    margin: 10,
                    textStyle: {
                        color: '#666666'
                    }
                }
            }
        }


    }


    let option;
    return (
        option = {
            title: {
                ...chartStyle.title,
                text: value.title
            },
            backgroundColor: chartStyle.backgroundColor,
            color: chartStyle.color,
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params, ticket, callback) {
                    let res = params[0].name, seriesName;
                    for (let i = 0, l = params.length; i < l; i++) {
                        seriesName = params[i].seriesName;
                        if (value.dataType.length !== 0 && value.dataType.indexOf(seriesName) !== -1) {
                            let time,
                                targetValue = parseInt(params[i].value),
                                days = Math.floor(targetValue / (3600 * 24)),
                                hours = Math.floor((targetValue - days * 3600 * 24) / 3600),  //取得剩余小时数 60 * 60
                                minutes = parseInt(targetValue / 60) % 60,  //取得剩余分钟数
                                seconds = targetValue % 60;

                            if (days == 0) {
                                if (hours == 0) {
                                    if (minutes == 0) {
                                        res += '<br/>' + seriesName + ' : ' + seconds + " s";
                                        continue;
                                    }
                                    res += '<br/>' + seriesName + ' : ' + minutes + " m " + seconds + " s";
                                    continue;
                                }
                                res += '<br/>' + seriesName + ' : ' + hours + " h " + minutes + " m " + seconds + " s";
                                continue;
                            }
                            res += '<br/>' + seriesName + ' : ' + days + " d " + hours + " h " + minutes + " m " + seconds + " s";
                        } else if (value.typePercent.length !== 0 && value.typePercent.indexOf(seriesName) !== -1) {
                            let targetValue1 = params[i].value;
                            res += '<br/>' + seriesName + ' : ' + targetValue1 + ' %'
                        }
                        else {
                            res += '<br/>' + seriesName + ' : ' + (params[i].value ? params[i].value : 0);
                        }
                    }
                    return res;

                }
            },
            grid: chartStyle.grid,
            animation: chartStyle.animation,
            legend: {
                ...chartStyle.legend,
                data: value.legend,
                selected: value.selected
            },
            xAxis: {
                ...chartStyle.xAxis,
                data: value.xAxis
            },
            yAxis: value.yAxis,
            series: value.series
        }
    );
}

export function lineData(data, kipTitle) {
    let option,
        cross;

    option = {
        title: kipTitle,
        legend: [],
        xAxis: [],
        series: [],
        yAxis: [chartStyle.yAxis],
        dataType: [],//时间名称组
        typePercent: [],//百分比名称组
        selected: {},//legend默认选定项
    };
    let valueData = [],
        cols = data.columns,
        rows = data.rows;
    let getGroups = function (cols) {
        let col, value, yAxis = [];
        if (!cols) return;
        for (let i = 0; i < cols.length; i++) {
            col = cols[i];
            if (col.columnType === "mtc") {
                value = {
                    name: col.title,
                    type: "line",
                    data: [],
                    animation: false,
                    smooth: data.curve || ''
                };
                if (col.dataType === 'time_client') {
                    option.dataType.push(col.title);
                }
                if (col.dataType === 'Percent') {
                    option.typePercent.push(col.title);
                }
                if (yAxis.length === 0) {
                    yAxis.push(cols[i].dataType);
                } else if (yAxis.length === 1 && yAxis[0] !== cols[i].dataType) {
                    yAxis.push(cols[i].dataType);
                    option.yAxis.push(chartStyle.yAxis);
                }
                if (yAxis.length == 2 && cols[i].dataType == yAxis[1]) {
                    value.yAxisIndex = 1;
                }
                option.legend.push(col.title);
                option.series.push(value);
                valueData.push(col.name);
                //option.selected[col.title]=5>i
            } else {
                cross = cols[i].name;
                // option.selected[col.title]=5>i
            }
        }
    };
    getGroups(cols);
    let getData = function (rows) {
        let row;
        if (!rows) return;
        if (rows.length == '0') {
            for (let i = 0; i < valueData.length; i++) {
                option.series[i].data.push(0);
            }
            return lineOption(option);
        }
        for (let m = 0; m < rows.length; m++) {
            row = rows[m];
            option.xAxis.push(row[cross]);
            for (let i = 0; i < valueData.length; i++) {
                option.series[i].data.push(row[valueData[i]]);
            }
        }
    }
    getData(rows);

    return lineOption(option);
}
