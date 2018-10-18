const chartStyle={
    title:{
        left:20,
        top:20,
        textStyle:{
            color:'#333333',
            fontSize:16,
            fontFamily:'MicrosoftYaHei'
        }
    },
    backgroundColor:'#fff',
    color:['#2dc7c9', '#ffb880', '#ea68a2', '#c490bf', '#0684ea', '#819e69', '#e5c175', '#a6a6a6'],
    barColor:['#0086f2', '#2dc7c9', '#faa64e', '#c490bf', '#ea68a2','#e5c175','#819e69','#ffb880','#0684ea'],
    barHColor:['#819e69'],
    pieColor:['#2bc7c9','#4aadf3','#ea68a2','#faa64e','#819e69'],
    legend: {
        type:'scroll',
        icon:'rect',
        textStyle: {
            color: '#666666',
            textFont:12
        },
        left:20,
        top:66,
        itemWidth:14,
        itemGap:50,
    },
    grid: {
        top: 128,
        left: '3%',
        right: '3%',
        bottom: 30,
        containLabel: true,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
    },
    animation:false,
    tooltip:{
        backgroundColor :'#33333380',
        padding :[20,10,10,10],

    },
    xAxis: {
        type: 'category',
        axisLine: {
            lineStyle: {
                color: '#eeeeee'
            }
        },
        axisLabel: {
            textStyle: {
                color: '#666666',
                fontSize: 12
            }
        },
        axisTick: {
            show: false
        }
    },
    yAxis:{
        type: 'value',
        color:'#666666',
        minInterval: 1,
        axisLine: {
            lineStyle: {
                color: '#eeeeee'
            }
        },
        axisLabel: {
            margin:10,
            textStyle: {
                color: '#666666'
            }
        },
        axisTick: {
            show: false
        },
        splitLine: {
            lineStyle: {
                type: 'solid',
                color: '#eeeeee'
            },
        },
    },
};


export default chartStyle;
