import React from 'react'
import moment from 'moment';
import { Tabs } from 'antd'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import KpiReportDetails from "./KpiReportDetails";
import LoadReportData from "../kpiService/LoadReportData";
import NoData from "../NoData";

const TabPane = Tabs.TabPane;

class KpiCommonTabs extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
            value: "",//tabPane
            date: [
                moment()
                    .startOf('d')
                    .subtract(1, 'd')
                    .add(1, 'days')
                    .format("YYYY-MM-DD HH:mm:ss"),
                moment({hour: 0, minute: 0, seconds: 0}).add(1, 'day').format("YYYY-MM-DD HH:mm:ss")
            ]
		}
	}

    componentDidMount()
    {
        let {value} = this.props;
        this.props.fetchList(value);
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

    getKpiTabPane(kpiList, value, date)
    {
        return kpiList.map((item, index) =>
            <TabPane tab={item.title} key={item.name}>
                <LoadReportData/>
                <KpiReportDetails
                    showScreen={this.showScreen.bind(this)}
                    item={item}
                    value={value}
                    date={date}
                />
            </TabPane>)
    }

    handleChangeTabs(currentTabKey)
    {
        this.setState({currentTabKey})
    }

    getKpiTab()
    {
        let {kpiList = []} = this.props,
            {value, date, currentTabKey} = this.state;

        if (!kpiList.length)
            return <NoData/>;

        return  <Tabs activeKey={currentTabKey} onChange={this.handleChangeTabs.bind(this)}>
                {
                    this.getKpiTabPane(kpiList, value, date)
                }
                </Tabs>
    }

	render()
	{
		return (
			<div className="flowAnalyze">
                {
                    this.getKpiTab()
                }
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
        state
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KpiCommonTabs);
