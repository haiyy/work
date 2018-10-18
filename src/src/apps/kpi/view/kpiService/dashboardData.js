// 仪表盘
function dashboardOption(value)
{
	let option;
	return (
		option = {
			tooltip: {
				formatter: "{a} <br/>{b} : {c}%"
			},
			animation: false,
			series: [
				{
					name: '业务指标',
					type: 'gauge',
					detail: {
						formatter: '{value}%',
						offsetCenter: ['250%', '-70%'],
						textStyle: {
							color: '#5d6977',
							fontSize: '24',
							fontWeight: '600'
						}
					},
					title: {
						show: true,
						offsetCenter: ['250%', '-30%'],
						textStyle: {
							color: "#fe7979",
						}
					},
					center: ['40%', '70%'],
					radius: '100%',
					data: [{value: value.data, name: value.name}],
					startAngle: '180',
					endAngle: '0',
					axisLine: {
						show: false,
						lineStyle: {
							color: [[value.data / 100, "#fe7979"], [1, "#eef1f4"]],
							width: 12
						}
					},
					axisTick: {
						show: false
					},
					axisLabel: {
						show: false
					},
					splitLine: {
						show: false
					},
					pointer: {
						length: '50%'
					},
					itemStyle: {
						normal: {
							color: '#dde1e6'
						}
					}
				}
			]
		}
	);
}

export function dashboardData(data)
{
	let option = {
		data: 85,
		name: 30
	};
	return dashboardOption(option);
}
