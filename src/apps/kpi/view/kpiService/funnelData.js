//漏斗图
function funnelOption(value) {
    return {
        color: ['#63e0ff', '#a4e9e6', '#9ae15a', '#5ce76d', '#fae51a', '#f5c65d'],
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c}"
        },
        animation: false,
        legend: {
            y: 'bottom',
            data: value.legend
        },
        series: value.series
    };
}

export function funnelData(data) {
    let option = {
            legend: [],
            series: [
                {
                    name: '漏斗图',
                    type: 'funnel',
                    left: '10%',
                    top: 30,
                    bottom: 50,
                    width: '80%',
                    min: 0,
                    minSize: '0%',
                    maxSize: '100%',
                    sort: 'descending',
                    gap: 0,
                    labelLine: {
                        normal: {
                            length: 10,
                            lineStyle: {
                                width: 1,
                                type: 'solid'
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: '#e9e9e9',
                            borderWidth: 1
                        }
                    },
                    data: []
                }
            ]
        },
        valueName = [],
        cols = data.columns,
        rows = data.rows.length !== '0' ? data.rows[0] : {};
    let getDataName = function (cols) {
        let col, data;
        for (let i = 0; i < cols.length; i++) {
            col = cols[i];
            option.legend.push(col.title);
            data = {
                name: col.title,
                value: "0"
            };
            if (cols[i].columnType == "mtc") {
                option.series[0].data.push(data);
                valueName.push(cols[i].name);
            }
        }
    }
    getDataName(cols);

    let getDataValue = function (rows) {
        let data;
        if (!rows) {
            option.series = [];
            return funnelOption(option);
        }
        for (var i = 0; i < valueName.length; i++) {
            data = rows[valueName[i]];
            if (data == undefined) {
                data = 0;
            }
            option.series[0].data[i].value = data;
        }
    }
    getDataValue(rows);
    return funnelOption(option);
}
