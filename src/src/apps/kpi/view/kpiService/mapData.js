// 地图
function map_Option(value)
{
	let  option;
	return (
		option = {

			tooltip : {
				trigger: 'item'
			},
			animation: false,
			legend: {
				orient: 'vertical',
				x:'left',
				data: value.legend
			},
			dataRange: {
				min: 0,
				max: 2500,
				x: 'left',
				y: 'bottom',
				text:['高','低'],           // 文本，默认为数值文本
				calculable : true
			},
			toolbox: {
				show: true,
				orient : 'vertical',
				x: 'right',
				y: 'center'
			},
			series : value.data
		}

	);
}


export function mapData(data)
{

	let option = {
			data : [],
			legend: []
		},
		series = [],
		region = '',
		cols = data.columns,
		rows = data.rows;
	let getGroups = function (cols) {
		let col, value;
		for (let i = 0; i < cols.length; i++) {
			col = cols[i];
			if (cols[i].columnType == "mtc") {
				value = {
					name: col.title,
					type: 'map',
					mapType: 'china',
					itemStyle:{
						normal:{label:{show:true}},
						emphasis:{label:{show:true}}
					},
					data: []
				};
				option.data.push(value);
				series.push(col.name);
				option.legend.push(col.title);
			}
			else
			{
				region = col.name;
			}
		}
	}
	getGroups(cols);
	let getData = function (rows) {
		let row;
		for (let m = 0; m < rows.length; m++) {
			row = rows[m];
			for (var i = 0; i < series.length; i++) {
				option.data[i].data.push(
					{
						name: row[region],
						value: row[series[i]]
					}

				);
			}
		}
	}
	getData(rows);

	return map_Option(option);
}
