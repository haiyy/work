import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fetchList} from "../../redux/kpiListReducer";
import NoData from "../NoData";
import KpiReportDetails from "./KpiReportDetails";
import {Tabs} from "antd"
import moment from "moment/moment";
import LoadReportData from "../kpiService/LoadReportData";
import {attentionReportList} from "../../redux/attentionReducer";
import {setQueryTime} from "../../redux/filterReducer";
import AttendantTableReport from "../../../callcenter/view/AttendantTableReport";

const TabPane = Tabs.TabPane;

class CommonReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeKey: "",
            date: [
                moment()
                    .startOf('d')
                    .subtract(1, 'd')
                    .add(1, 'days')
                    .format("YYYY-MM-DD HH:mm:ss"),
                moment({hour: 0, minute: 0, seconds: 0})
                    .add(1, 'day')
                    .format("YYYY-MM-DD HH:mm:ss")
            ]
        };

        props.value && this.loadData(props.value);
    }

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.value != this.props.value)
		{
			this.loadData(nextProps.value);
		}
	}

	loadData(value)
	{
		this.state.activeKey = "";
		if(value == "attentionData")
		{
			this.props.attentionReportList();
		}
		else
		{
			this.props.fetchList(value);
		}
	}

	getKpiTabPane(kpiList, value, date, activeKey)
	{
		return kpiList.map((item) => {
			let html = null;
			if (activeKey === item.name) {
				if (this.props.value == "CsReport" && item.name == "rpt_attendancttablereport") {//考勤报表
					html = <AttendantTableReport date={date}/>;
				} else {
					html = <KpiReportDetails showScreen={this.showScreen.bind(this)}
					compName={this.props.value} item={item} value={value} query={this.props.query || {}}/>;
				}
			}
			
			return (
				<TabPane tab={item.title} key={item.name}>
					{ html }
				</TabPane>
			);
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

	handleChangeTabs(currentTabKey)
	{
		this.setState({activeKey: currentTabKey});
	}

	getKpiTab()
	{
		let {list = []} = this.props,
			{value, date, activeKey} = this.state;

		if(!list.length)
			return <NoData/>;

		let index = list.findIndex(value => value.name == activeKey);
		index = index > -1 ? index : 0;

		activeKey = list[index].name;

		return (
			<Tabs activeKey={activeKey} onChange={this.handleChangeTabs.bind(this)}>
				{
					this.getKpiTabPane(list, value, date, activeKey)
				}
			</Tabs>
		);
	}

	render()
	{
		return (
			<div className="attention data flowAnalyze" ref="attention">
				<LoadReportData/>
				{
					this.getKpiTab()
				}
			</div>
		)
	}
}

function mapStateToProps(state) {
    return {
        list: state.reportsList.data,
        query: state.query.data || {}
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchList, attentionReportList, setQueryTime}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonReport);
