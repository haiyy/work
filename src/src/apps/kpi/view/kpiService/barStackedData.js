//层叠柱状图
function bar_stackedOption(value)
{

	let  option;
	return (
		option = {
			backgroundColor: '#7dc754',
			color: ['#fae51a','#ffcc5f',"#aeff66",'#66ff78','#b4fffc','#63e0ff'],
			tooltip: {
				trigger: 'axis',
				axisPointer : {            // 坐标轴指示器，坐标轴触发有效
					type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				}
			},
			animation: false,
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
						show: true,
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
export function bar_stackedData(data)
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
					color: '#87da5a'
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
					color:'#a7eb81'
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
					type: "bar",
					stack: '总量',
					data: [],
					animation: false
				};
				yAxis.push(cols[i].dataType);
				yAxis = Array.from(new Set(yAxis));
				if( yAxis.length > 1 && cols[i].dataType == yAxis[1] )
				{
					option.yAxis.push({type : 'value', axisLine: { lineStyle: { color: '7bb4f4' }}, axisLabel: {textStyle: {color: '#fff'}},
						axisTick: {show: false}, splitLine: {lineStyle:{type:'dashed', color:'#a7eb81'}}});
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
			return bar_stackedOption(option);
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

	return bar_stackedOption(option);
}
