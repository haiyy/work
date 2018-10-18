import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import AttentionData from './AttentionData'
import ReportsLibrary from './ReportsLibrary'
import CustomerService from './CustomerService'
import WeeklyMonthly from './WeeklyMonthly'
import KpiTopRight from './KpiTopRight'
import ReportDetails from './ReportDetails'
import LineDetailsData from './LineDetailsData'
import Pubsub from "../../../lib/utils/Pubsub"
import LoadReportData from "../view/kpiService/LoadReportData"
import LogUtil from "../../../lib/utils/LogUtil"
import { kpiTabList } from "../redux/kpiListReducer"
import { Tabs } from 'antd'
import NoData from './NoData'
import "../../../utils/css/kpi/kpi.less"

const TabPane = Tabs.TabPane;

class KpiPage extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			display: false,
			value: "",//tabPane
			date: [
				moment()
				.startOf('d')
				.subtract(1, 'd')
				.add(1, 'days')
				.format("YYYY-MM-DD HH:mm:ss"),
                moment({hour: 0, minute: 0, seconds: 0}).add(1, 'day').format("YYYY-MM-DD HH:mm:ss")
			],
			activeKey: "AttentionData",
			query: [],
			showDetail: false,
			isTabClick: false
		};
		this.lineData = {};

		Pubsub.subscribe('ShowDetail', this.lineDetails.bind(this));
	}

	componentWillMount()
	{
		/*console.log('复杂的模式 =',moment()
		 .startOf('d')
		.subtract(1, 'd')
		 .add(1, 'days')
		.format("YYYY-MM-DD HH:mm:ss"), moment()
		 .format("YYYY-MM-DD HH:mm:ss"));
		console.log('简单的',moment());*/

		this.props.kpiTabList();
	}

	componentWillUnmount()
	{
		Pubsub.unsubscribe('ShowDetail');
	}

	//查看某一行数据详情
	lineDetails(notifyName, data)
	{
		this.lineData = data;
		this.setState({
			showDetail: true
		})

	}

	//关闭某一行数据详情
	colseLineDetails()
	{
		this.setState({
			showDetail: false
		})
	}

	showDetails(item, value)
	{

		if(item.ui == "number")
			return;
		this.setState({
			item: item,
			value: value
		})
	}

	showScreen(query)
	{
		let stateValue = {display: !this.state.display};

		if(query.length != 0)
		{
			stateValue.query = query;
		}

		this.setState(stateValue);
	}

	quickDate(date)
	{
		this.setState({
			date
		})
	}

	changeKey(key)
	{
		this.setState({
			activeKey: key,
			display: false,
			showDetail: false,
			value: '',
			isTabClick: true
		})
	}

	_showPages(activeKey, exportLimit)
	{
		let {value} = this.state;
		switch(activeKey)
		{
			case "AttentionData":
				return <AttentionData showDetails={this.showDetails.bind(this)} date={this.state.date}

				                      value={value}/>;

			case "ReportsLibrary":
				return <ReportsLibrary showDetails={this.showDetails.bind(this)} date={this.state.date}
				                       value={value} activeKey={activeKey}/>;

			case "WeeklyMonthly":
				return <WeeklyMonthly date={this.state.date} value={value} exportLimit={exportLimit}/>;

            case "CustomerService":
				return <CustomerService date={this.state.date} exportLimit={exportLimit}/>;//客服来往明细
		}
	}

	render()
	{
		try
		{
			let showDetail = this.state.showDetail,
				data = [],
				{isTabClick, value, activeKey} = this.state;

			if(this.props.kpiTabs && this.props.kpiTabs.length === 0)
			{
				return (
					<div className="kpi">
						<NoData/>
					</div>
				)
			}
			if(this.props.kpiTabs)
			{
				data = this.props.kpiTabs;
				/*this.setState({
					activeKey : data[0].key
				})*/
				for(let i = 0; i < data.length; i++)
				{
					//title不存在时key填充
					data[i].title ? data[i].title : data[i].key;

					//key不存在时删除此项数据
					if(!data[i].key)
					{
						data.split(i, 1);
					}
				}
			}

			let arr = data.filter((item, index) => {
					return item.show == 1
				}),
				defaultActiveKey = arr[0] && arr[0].key,
                {exportLimit} = this.props;

			let tabPanes = data.map(item => {

				return (
					<TabPane tab={item.title} key={item.key}>
						{
							activeKey == `${item.key}` ? this._showPages(item.key, exportLimit) : null
						}
					</TabPane>
				)
			});

			return (
				<div className="kpi">
					<Tabs onTabClick={this.changeKey.bind(this)} activeKey={isTabClick ? activeKey : defaultActiveKey}>
						{
							tabPanes
						}
					</Tabs>
					<LoadReportData/>
					{
						value !== "" ?
							<ReportDetails showDetails={this.showDetails.bind(this)}
							               showScreen={this.showScreen.bind(this)}
							               item={this.state.item}
							               value={value}
							               date={this.state.date}/> : null
					}
					<KpiTopRight quickDate={this.quickDate.bind(this)} value={value}/>
					{
						showDetail ?
							<LineDetailsData date={this.state.date} query={this.state.query} lineData={this.lineData}
							                 close={this.colseLineDetails.bind(this)}/> : null
					}
				</div>

			);
		}
		catch(e)
		{
			LogUtil.trace("KpiPage", LogUtil.ERROR, "render stack = " + e.stack);
		}

		return null;
	}
}

function mapStateToProps(state)
{
	return {
		query: state.query.data,
		kpiTabs: state.reportsList.kpiTabs,
		progress: state.reportsList.progress,
        exportLimit: state.reportsList.exportLimit
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({kpiTabList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KpiPage);
