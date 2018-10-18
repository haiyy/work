import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import KpiCommonTabs from "./KpiCommonTabs";
import LoadReportData from "../kpiService/LoadReportData";
import {fetchList} from "../../redux/kpiListReducer";
class ConsultSummary extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			index: [],
			date: this.props.date,
			warnVisible: false
		};
	}

	componentDidMount()
	{
        this.props.fetchList("ConsultSummary");
	}


	render()
	{
        let {list} = this.props;
		return (
			<div className="attention data" ref="attention">
                <KpiCommonTabs kpiList={list}/>
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
        list: state.reportsList.data,
		query: state.query.data
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({fetchList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultSummary);
