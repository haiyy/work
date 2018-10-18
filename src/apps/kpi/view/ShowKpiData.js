import React, { Component } from 'react';
import echarts from 'echarts';
import { Table } from 'antd';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import NoData from './NoData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loading from "../../../components/xn/loading/Loading";

class ShowKpiData extends Component {
	
	constructor(props)
	{
		super(props);
		this.state = {};
		this.item = this.props.item;
		this._echart = null;
		this.isEnterDetail = true;// 判断点击后是否进入详情
		this.onWindowResize = this.onWindowResize.bind(this);
	}
	
	componentWillReceiveProps(nextProps)
	{
		
		this.item = nextProps.item;
	}
	
	componentDidMount()
	{
		this.getDome();
	}
	
	componentDidUpdate()
	{
		
		this.getDome();
	}
	
	componentWillUnmount()
	{
		if(this._echart)
		{
			window.removeEventListener('resize', this.onWindowResize);
			this._echart.dispose();
		}
		
		this._echart = null;
	}
	
	onWindowResize()
	{
		this._echart && this._echart.resize();
	}
	
	getDome()
	{
		let {ui, name} = this.item,
			requestReportData = this.props.requestReportData,
			chartData = requestReportData[name];
		
		if(!chartData)
			return;
		
		let isChart = ui != "grid" && ui != "number",
			seriesData = chartData.length === 3 && chartData[2] || {},
			hasData = seriesData.hasOwnProperty("series");
		
		if(chartData && isChart && hasData)
		{
			let nn = `${this.item.name}_${this.props.group}`;
			
			if(!this._echart)
			{
				this._echart = echarts.init(document.getElementById(nn));
				window.addEventListener('resize', this.onWindowResize);
			}
			this._echart.clear();
			this._echart.setOption(seriesData, false);
			this._echart.on('legendselectchanged', () => {
				this.isEnterDetail = false
			});
			this._echart.on('legendscroll', () => {
				this.isEnterDetail = false
			})
		}
	}
	
	enterDetail(item)
	{
		if(this.isEnterDetail)
		{
			this.props.click(item)
		}
		this.isEnterDetail = true;
	}
	
	getScrollX(columns, item)
	{
		let scrollX = columns.reduce((acc, cur) => acc + cur.width, 0);
		
		if(parseInt(scrollX) > 100)
			return scrollX;
		
		if(!item)
			return false;
		
		let width = item.width,
			containerWidth = this.props.containerWidth;
		
		if(width > 1)
			return width;
		
		if(containerWidth)
		{
			let realWidth = containerWidth * width - 5 - 20;
			return realWidth > 0 && realWidth;
		}
		
		return false;
	}
	
	//报表显示样式
	reportDispaly(item, data)
	{
		let {ui} = item;
		if(ui !== "grid" && ui !== "number")
		{
			if(!data)
			{
				return (
					<div style={{height: '100%'}}>
						<NoData style={{height: '87%'}}/>
					</div>
				)
			}
			return (
				<div id={`${this.item.name}_${this.props.group}`}
				     style={{
					     height: "100%",
					     width: "100%",
					     borderRadius: '8px 8px 8px 8px',
					     background: "#fff!important"
				     }}
				     onClick={this.enterDetail.bind(this, item)}></div>
			);
		}
		else if(item.ui === "grid")
		{
			if(!data)
			{
				return (
					<div style={{height: '100%'}}>
						<NoData style={{height: '87%'}}/>
					</div>
				)
			}
            let columns = data.columns,
				rows = data.rows instanceof Array?data.rows.slice(0, 8):[],
				title = data.title;
            /*,
            scrollX = columns ? columns.length * 100 : 0,
            scrollY = rows.length >= 6 || rows.length === 0 ? 260 : 0*/
			/*if(rows.length === 0)
			{

				return (
					<div onClick={this.props.click.bind(this, item)}>
						<Table columns={columns}  pagination={false} scroll={{x: scrollX, y: 260}}/>
					</div>
				)
			}*/
			/*else if(rows.length >= 6)
			{*/
			return (
				<div className="kpiTableBox" style={{width: '100%'}}
				     onClick={this.enterDetail.bind(this, item)}>
					<h5 className='tableTitle'>{title}</h5>
					<Table columns={columns} dataSource={rows} pagination={false}
					       scroll={{x: this.getScrollX(columns, item)}}/>
				</div>
			)
			/*}
			else
			{
				return (
					<div style={{width: '100%', height: '88%', padding: '12px 12px'}}
						 onClick={this.props.click.bind(this, item)}>
						<Table columns={columns} dataSource={rows} pagination={false} scroll={{x: scrollX}}/>
					</div>
				)
			}*/
		}
		else
		{
			return (
				<div style={{width: '100%', height: '135px', lineHeight: '135px', textAlign: 'center'}}>
					<span style={{color: '#5d6977', fontSize: '38px', fontWeight: '600'}}>{data}</span>
				</div>
			)
		}
	}
	
	_getProgress(item)
	{
		let {requestReportData} = this.props,
			chartData = requestReportData[item.name],
			progress = chartData && chartData[0] || 1;
		
		//console.log("ShowKpiData _getProgress item = ", item.name, item.progress, item);
		
		if(!chartData || progress === LoadProgressConst.LOADING || !item.progress)
		{
			return (
				<Loading id="spin" style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					position: "absolute",
					left: '0',
					top: '0'
				}}/>
			)
		}
		else if(requestReportData[item.name].length === 1)
		{
			if(this.props.height === '180px')
			{
				return (
					<div>
						<NoData style={{backgroundSize: '300px'}}/>
					</div>
				)
			}
			return (
				<div>
					<NoData/>
				</div>
			)
		}
		
		return null;
	}
	
	render()
	{
		let item = this.item,
			{requestReportData, width, height} = this.props,
			name = `kpi_box box ${item.name}`;
		
		//console.log("ShowKpiData render item = ", item);
		
		return (
			<div style={{
				position: 'relative',
				width: width,
				height: height,
				marginRight: "10px",
				marginBottom: "10px",
				borderRadius: '8px'
			}}>
				<div className={name} style={{height: "100%", width: "100%", background: "#fff",borderRadius: '8px'}} key={item.name}>
					{
						requestReportData && requestReportData[item.name] != undefined && requestReportData[item.name].length !== 1 ? this.reportDispaly(item, requestReportData[item.name][2]) : null
					}
					{
						this._getProgress(item)
					}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	return {
		requestReportData: state.requestReportData
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowKpiData);
