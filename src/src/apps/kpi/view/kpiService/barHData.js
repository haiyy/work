


// 横向柱状图
import chartStyle from './chartStyle'

function barOption(value) {
    let xData = value.xAxis ? value.xAxis : [];
    let option;
    return (
        option = {
            title:{
                ...chartStyle.title,
                text:value.title
            },
            legend: chartStyle.legend,
            color:chartStyle.barHColor,
            backgroundColor:chartStyle.backgroundColor,
            tooltip: {
                /*                trigger: 'axis',
                                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                },
                                formatter: "{b} : {c}"*/
            },
            animation: chartStyle.animation,
            grid: {
                top: 75,
                left: '3%',
                right: '3%',
                bottom: 30,
                containLabel: true,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            yAxis: {
                /*                    type: chartStyle.type,
                                    axisLine: chartStyle.xAxis.axisLine,
                                    axisLabel: {
                                        show: true,
                                        formatter: function (value) {
                                            value = value === undefined ? ' ' : value;
                                            let str = value;

                                            if (value !== undefined && value.length > 5) {
                                                str = value.slice(0, 5) + '...';

                                            }
                                            return '{value|' + str + '}';
                                        },
                                        rich: {
                                            value: {
                                                color: '#4d4d4d',
                                                lineHeight: 10
                                            }
                                        }
                                    },
                                    axisTick: {
                                        show: false
                                    },*/
                ...chartStyle.xAxis,
                data: xData
            },
            xAxis: [chartStyle.yAxis],
            series: {
                type: 'bar',
                barMaxWidth: '20px',
                data: value.series
            }
        }
    );
}


export function bar_hData(data,kipTitle) {
    let option = {
        title:kipTitle,
        xAxis: [],
        series: [],
        legend: []
    };
    let cols = data.columns,
        rows = data.rows,
        dms = "",
        mtc = "";
    let getGroups = function (cols) {
        if (!cols) return null;
        let col;
        for (let i = 0; i < cols.length; i++) {
            col = cols[i];
            if (col.columnType == "dms") {
                dms = col.name;
            }
            if (col.columnType == "mtc") {
                mtc = col.name;
            }
        }
    }
    getGroups(cols);
    let getData = function (rows) {
        if (!rows) return null;
        if (rows.length == 0) {
            option.series.push(0);
            return barOption(option);
        }
        let row;
       // let colors = chartStyle.barHColor;
        for (let i = rows.length-1; i >= 0; i--) {
            row = rows[i];
            if (!row[dms]) {
                row[dms] = "";
            }
            if (!row[mtc]) {
                row[mtc] = 0;
            }
            option.xAxis.push(row[dms]);
            option.series.push({
                name: row[dms],
                value: row[mtc],
                /*itemStyle: {
                    normal: {
                        color: colors[i]
                    },
                },*/
            });
            option.legend.push({
                name: row[dms],
                icon: 'rect',
            })
        }
    }
    getData(rows);

    return barOption(option);
}

