//层叠区域图
function area_stackedOption(value)
{
    value === undefined ? "" : value;
	let  option;
	return (
		option = {
			//backgroundColor: '#3c8ce8',
			color: ['#63e0ff','#b4fffc','#98ffa4','#c8ff97','#faee7a','#ffe2a5'],
			tooltip: {
				trigger: 'axis'
			},
			grid: {
				top: '8%',
				left: '3%',
				right: '4%',
				bottom: '8%',
				containLabel: true
			},
			legend: {
				y: 'bottom',
				textStyle:{
					color: '#fff'
				},
				data:value.legend
			},
			xAxis: [
				{
					type: 'category',
					data : value.xAxis,
					axisLine: {
						lineStyle: {
							color: '#6fddf9'
						}
					},
					axisLabel: {
						textStyle: {
							color: '#fff'
						}
					},
					axisTick: {
						show: false
					}
				}
			],
			yAxis : value.yAxis,
			series : value.series

		}
	);
}
export function area_stackedData(data)
{
	let option,
		cross;
	//if(data.result.rows.length >= 1)
	//{
	option = {
		legend : [],
		xAxis: [],
		series: [],
		yAxis: [{
			type : 'value',
			axisLine: {
				lineStyle: {
					color: '#6fddf9'
				}
			},
			axisLabel: {
				textStyle: {
					color: '#fff'
				}
			},
			axisTick: {
				show: false
			},
			splitLine: {
				lineStyle:{
					type:'dashed',
                    color:'#6fddf9'
				}
			}
		}]
	};
	let	valueData = [],
		cols = data.columns,
		rows = data.rows;
	let getGroups = function(cols)
	{
		let col, value, yAxis = [];
		for(let i = 0; i < cols.length; i++)
		{
			if(cols[i].columnType == "mtc")
			{
				col = cols[i];
				value = {
					name: col.title,
					type: "line",
					stack: '总量',
					data: [],
					areaStyle: {normal: {}},
					animation: false
				};
				yAxis.push(cols[i].dataType);
				yAxis = Array.from(new Set(yAxis));
				if( yAxis.length > 1 && cols[i].dataType == yAxis[1] )
				{
					option.yAxis.push({type : 'value', axisLine: { lineStyle: { color: '#6fddf9' }}, axisLabel: {textStyle: {color: '#fff'}}, axisTick: {show: false}, splitLine: {lineStyle:{type:'dashed',color:'#6fddf9'}}});
					value.yAxisIndex = 1;
				}
				option.legend.push(col.title);
				option.series.push(value);
				valueData.push(col.name);
			}else
			{
				cross = cols[i].name;
			}
		}
	}
	getGroups(cols);
	let getData = function(rows)
	{
		if(rows.length == '0')
		{
			option.series = [];
			return area_stackedOption(option);
		}
		let row;
		for(let m = 0; m < rows.length; m++)
		{
			row = rows[m];
			option.xAxis.push(row[cross]);
			for(let i = 0; i < valueData.length; i++)
			{
				option.series[i].data.push(row[valueData[i]]);
			}
		}
	}
	getData(rows);

	return area_stackedOption(option);
}
