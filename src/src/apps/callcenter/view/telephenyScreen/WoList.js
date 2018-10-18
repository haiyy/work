import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getWoList } from "../../redux/reducers/telephonyScreenReducer";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import ReFresh from "../../../../components/ReFresh";
import { getProgressComp } from "../../../../utils/MyUtil";
import NTTableWithPage from "../../../../components/NTTableWithPage";
import { getNoDataComp } from "../../../../utils/ComponentUtils";

class WoList extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		let {customId} = props;
		
		this.reFreshFn(customId);
		
		this.state = {currentPage: 0};
	}
	
	reFreshFn(customId)
	{
		if(customId)
		{
			this.props.getWoList(customId);
		}
	}

	componentWillReceiveProps(nextprops) {
		let {customId} = nextprops;
		if (customId && customId != this.props.customId) {
			this.reFreshFn(customId);
		}
		return true;
	}
	
	selectOnChange(value)
	{
		let {customId} = this.props;
		this.props.getWoList(customId, value);
		
		this.setState({currentPage: value});
	}
	
	render()
	{
		let {woList, customId} = this.props,
			{progress, list, count} = woList || {};
		
		console.log("WoList customId = ", customId);
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this, customId)}/>;
		
		if(!customId || (list && list.length <= 0))
			return getNoDataComp();
		
		return (
			<div>
				<NTTableWithPage dataSource={list} total={count} columns={this.getColumn()}
				                 currentPage={this.state.currentPage} selectOnChange={this.selectOnChange.bind(this)}/>
				{
					getProgressComp(progress)
				}
			</div>
		);
	}
	
	getColumn()
	{
		if(!this._ccolumns)
		{
			this._ccolumns = [
				{
					key: 'woId',
					dataIndex: 'woId',
					title: '编号',
					width: 100,
					
				}, {
					key: 'woTitle',
					dataIndex: 'woTitle',
					title: '主题',
					width: 100,
					
				}, {
					key: 'woStatus',
					dataIndex: 'woStatus',
					title: '状态',
					width: 100,
					render: (text) => <span>{statusMap[text] || ""}</span>
				}, {
					key: 'woPriority',
					dataIndex: 'woPriority',
					title: '优先级',
					width: 100,
					render: (text) => <span>{woPriorityMap[text] || "低"}</span>
				}
			]
		}
		
		return this._ccolumns;
	}
}

const statusMap = {
		0: "待解决", 1: "解决中", 2: "已解决", 3: "已关闭", 4: "删除"
	},
	woPriorityMap = {
		0: "紧急", 1: "高", 2: "中", 3: "低",
	};

function mapStateToProps(state)
{
	let {telephonyScreenReducer} = state;
	
	return {
		woList: telephonyScreenReducer.get("woList"),
		customId: telephonyScreenReducer.get("customId")
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getWoList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WoList);
