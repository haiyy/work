// 饼图
import chartStyle from './chartStyle'
function pie_Option(value) {
    let option,
        data = value.legend ? value.legend : [];
    if (data === 'infinity') data = '';
    return (
        option = {
            title:{
                ...chartStyle.title,
                text:value.title
            },
            color: chartStyle.color,
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            animation: chartStyle.animation,
            legend: {
                ...chartStyle.legend,
/*                formatter: function(name) { // legend中的formatter传入一个name属性
                	let data = value.series_data; // 获取series中的data
                	let totalValue = data.reduce((acc, item) => { // 计算data中总数
                		acc += item.value;
                		return acc;
                	}, 0);
                	let targetValue;  // 对应图例的值
                	data.map(item => {
                		if (item.name == name) {
                			targetValue = item.value; // 对相应的图例赋值
                		}
                	});
                	let p = Math.round(targetValue / totalValue * 10000) / 100.00 + "%"; // 百分比
                	return name + ' ' + p;
                },*/
                data: data
            },
            grid:chartStyle.grid,
            series: [
                {
                    type: 'pie',
                    radius: '45%',
                    center: ['50%', '60%'],
                    selectedMode: 'single',
                    data: value.series_data,
                    labelLine: {
                        normal: {
                            length:10,
                            length2:40
                        }
                    },
                    label: {
                        normal: {
                            formatter:'{d}%',
                            color:'#666666',
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }
    );
}

export function pieData(data,kipTitle) {
    let option = {
            title:kipTitle,
            legend: [],
            series_data: []
        },
        cols = data.columns,
        rows = data.rows,
        series_title={};
    let getDataName = function (cols) {
        let col;
        for (let i = 0; i < cols.length; i++) {
            col = cols[i];
            if(col.columnType == "dms"){
                     series_title.name=col.name
                 }
            if (col.columnType == "mtc") {
                series_title.value=col.name
            }
        }
    }
    getDataName(cols);
    let getDataValue = function (rows) {
        if(!rows.length)return option.series_data.push({name:'暂无数据',value:0});
        for (let i = 0; i < rows.length; i++) {
            let rowItem=rows[i];
            if (rows != undefined) {
                option.series_data.push({
                   name: rowItem[series_title.name],
                  value:rowItem[series_title.value]
                })
                option.legend.push(rowItem[series_title.name]);
            }
        }
    };
    getDataValue(rows);

    return pie_Option(option);
}
