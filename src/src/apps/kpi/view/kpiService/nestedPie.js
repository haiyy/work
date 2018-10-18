// 嵌套饼图
import chartStyle from './chartStyle'
function pie_nestOption(value)
{
	let option;
	return (
		option = {
            title:{
                ...chartStyle.title,
                text:value.title
            },
            color: chartStyle.pieColor,
            backgroundColor:chartStyle.backgroundColor,
			tooltip: {
				trigger: 'item',
				formatter: function(params, ticket, callback) {

					let res = params.name,
						targetValue = params.value,
						totalValue = value.series_2,
						p = "0%";
					if(targetValue !== 0)
					{
						p = Math.round(targetValue / totalValue[0].value * 10000) / 100.00 + "%"; // 百分比
					}

					if(value.hasOwnProperty("dataType"))
					{
						let days = parseInt(targetValue / (1000 * 60 * 60 * 24)),
                            hours = parseInt(((targetValue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
                            minutes = parseInt(((targetValue % (1000 * 60 * 60)) / (1000 * 60))),
                            seconds = parseInt(((targetValue % (1000 * 60)) / 1000));
						if(days == 0)
						{
							if(hours == 0)
							{
								if(minutes == 0)
								{
									return res + ":" + " " + p + "<br/>" + " " + seconds + " s " + "  (" + p + ")";
								}
								return res + ":" + " " + p + "<br/>" + " " + minutes + " m " + seconds + " s ";
							}
							return res + ":" + " " + p + "<br/>" + " " + hours + " h " + minutes + " m " + seconds + " s ";
						}
						return res + ":" + " " + p + "<br/>" + " " + days + " d " + hours + " h " + minutes + " m " + seconds + " s ";
					}
					return res + ":" + targetValue + " " + "(" + p + ")";
				}
			},
			animation: false,
			legend: {
                ...chartStyle.legend,
				/*formatter: function(name) { //传入一个name属性
					let data = [...value.series_1], // 获取series中内环的data
						totalValue = value.series_2;
					let targetValue,
						p = "0%";  // 对应图例的值

					if(!totalValue.length)
					{
						return "";
					}

					if(totalValue[0].name == name)
					{
						return '{value|' + name + '}\n ' + '100%';
					}

					data.map(item => {
						if(item.name == name)
						{
							targetValue = item.value; // 对相应的图例赋值
						}
					});
					if(targetValue !== 0)
					{
						p = Math.round(targetValue / totalValue[0].value * 10000) / 100.00 + "%"; // 百分比
					}
					return '{value|' + name + '} \n ' + p;
				},*/
				data: value.legend
			},
			series: [
				{
					type: 'pie',
                    z:5,
					radius: ['15%', '30%'],
                    center: ['50%', '60%'],
					labelLine: {
						normal: {
                            length:25,
                            length2:85
						}
					},
					label: {
						normal: {
						    formatter:'{d}%',
                            color:'#666666',
						}
					},
					data: value.series_1
				},
				{
					type: 'pie',
                    z:2,
					radius: ['43%', '50%'],
                    center: ['50%', '60%'],
					labelLine: {
						normal: {
                        length:15,
                        length2:85
						}
					},
					label: {
						normal: {
                            formatter:'{d}%',
                            color:'#666666',
						}
					},
					data: value.series_2
				}
			]
		}
	);
}

export function pie_nestData(data,kipTitle)
{
    if (!data.rows || !data.columns)
        return null;

	let option = {
            title:kipTitle,
			legend: [],
			series_1: [],
			series_2: []
		},
		valueName1 = [], valueName2 = [],
		cols = data.columns,
		rows = data.rows[0];
	let getDataName = function(cols) {
		let col, series_title;
		for(let i = 0; i < cols.length; i++)
		{
			col = cols[i];
			option.legend.push(col.title);
			series_title = {
				name: cols[i].title,
				value: ""
			};
			if(cols[i].columnType == "mtc")
			{
				if(cols[i].dataType == 'time_client')
				{
					option.dataType = 'time_client';
				}
				if(cols[i].referenceFrame == "out")
				{
					option.series_2.push(series_title);
					valueName2.push(cols[i].name);
				}
				else
				{
					option.series_1.push(series_title);
					valueName1.push(cols[i].name);
				}
			}
		}
	}
	getDataName(cols);

	let getDataValue = function(rows) {
		let series1_data = 0, series2_data = 0;
		for(let i = 0; i < valueName1.length; i++)
		{
			if(rows != undefined && rows[valueName1[i]] != undefined)
			{
				series1_data = rows[valueName1[i]];
			}

			option.series_1[i].value = series1_data;
		}
		for(let i = 0; i < valueName2.length; i++)
		{
			if(rows != undefined && rows[valueName1[i]] != undefined)
			{
				series2_data = rows[valueName2[i]];
			}
			option.series_2[i].value = series2_data;
		}
	}
	getDataValue(rows);
	return pie_nestOption(option);
}
