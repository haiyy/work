import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import NTTableWithPage from "../../../../components/NTTableWithPage"
import { getHistoryList } from "../../redux/reducers/telephonyScreenReducer";
import { formatTimestamp } from "../../../../utils/MyUtil";
import {getTableTdContent} from "../../../../utils/ComponentUtils";
class TelephonyVisitComponent extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			currentPage: 1,
		}
	}

	componentDidMount()
	{
		this.getVisitPlanList(); //回访计划
	}

	getVisitList()
	{
		return [

			{
				key: 'planTime',
				dataIndex: 'planTime',
				title: '计划时间',
				width: 150,
                render:((text)=>{
                    return <p style={{minWidth:125}}>{formatTimestamp(text, true)}</p>
                })
			}, {
				key: 'remarks',
				dataIndex: 'remarks',
				title: '备注',
				width: 150,
				render:(text,current)=>(getTableTdContent(current.remarks,150))
			}, {
				key: 'nickName',
				dataIndex: 'nickName',
				title: '创建人',
				width: 100,
				render:(text,current)=>(getTableTdContent(current.nickName,100))
			},, {
				key: 'result',
				dataIndex: 'result',
				title: '回访结果',
				width: 100,
			},

		]
	}

	getVisitPlanList(currentPage = 1)
	{
		let {actions, phonenumber} = this.props;

		actions.getHistoryList(phonenumber, currentPage);
	}
  
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.reloadFlag && !this.props.reloadFlag)
		{
			this.getVisitPlanList(1)
		}
	}

	selectOnChange(value)
	{

		this.setState({
			currentPage: value
		})

		this.getVisitPlanList(value)
	}

	render()
	{
		let {visitList} = this.props,
			{currentPage} = this.state,
			{list, totalRecord} = visitList;

		return (
			<div className="telephonyVisit">
				<NTTableWithPage currentPage={currentPage} dataSource={list} total={totalRecord}
				                 selectOnChange={this.selectOnChange.bind(this)} columns={this.getVisitList()}/>
			</div>
		);

	}
}

const mapStateToProps = (state) => {
	let {telephonyScreenReducer} = state;

	return {
		visitList: telephonyScreenReducer.get("visitList") || {},
		reloadFlag:telephonyScreenReducer.get("telePhonyreloadFlag") || false,
	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({
		getHistoryList
	}, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(TelephonyVisitComponent);
