import React from 'react';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { Button, Table, Modal, Switch } from 'antd';
import "./style/customTab.scss";
import { getCustomerTabList } from "./tabReducer/customerTabReducer";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

class CustomTabReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			currentPage: 1
		};
	}
	
	componentDidMount()
	{
		let obj = {
			page: 1,
			rp: 10
		};
		this.props.getCustomerTabList(obj);
	}
	
	getColumn()
	{
		return [{
			key: 'rank',
			title: <span className="title">{getLangTxt("serial_number")}</span>,
			dataIndex: 'rank',
			render: (record) => {
				let {currentPage = 0} = this.state,
					rankNum,
					calcCurrent = (currentPage - 1) * 10;
				calcCurrent === 0 ? rankNum = record : rankNum = calcCurrent + record;
				return <div>{rankNum}</div>
			}
		}, {
			key: 'tabname',
			title: <span className="title">{getLangTxt("rightpage_goods_name")}</span>,
			dataIndex: 'tabname'
		}, {
			key: 'useable',
			title: <span className="title">{getLangTxt("whether_use")}</span>,
			dataIndex: 'useable',
			render: (useable, record) => {
				return (
					<Switch checked={useable === 1} disabled/>
				)
			}
		}, {
			key: 'remove',
			title: getLangTxt("operation"),
			render: (record) => {
				return (
					<div className="customTabOperate">
						<i className="icon-bianji iconfont"/>
						<i className="icon-shanchu iconfont"/>
					</div>
				)
			}
		}];
	}
	
	reFreshFn()
	{
		let path = [{"title": getLangTxt("setting_company"), "key": "sub1"},
				{"title": getLangTxt("setting_custom_tab"), "key": "customtab"}],
			obj = {
				page: 1,
				rp: 10
			};
		
		this.props.route(path);
		this.props.getCustomerTabList(obj);
		this.setState({currentPage: 1});
	}
	
	render()
	{
		let {customerTabData} = this.props,
			tabList = customerTabData.getIn(["tabList"]).length ? customerTabData.getIn(["tabList"]) : [],
			progress = customerTabData.getIn(["progress"]),
			totalCount = customerTabData.getIn(["total"]);
		
		const pagination = {
			total: totalCount,
			showQuickJumper: true,
			current: this.state.currentPage,
			showTotal: (total) => {
				return getLangTxt("total", total);
			},
			onChange: (currentPage) => {
				let obj = {page: currentPage, rp: 10};
				
				this.props.getCustomerTabList(obj);
				this.setState({currentPage})
			}
		};
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="customTabWrap">
				<Button disabled type="primary" className="addCustomBtn">
					{getLangTxt("setting_custom_tab_add")}
				</Button>
				<ScrollArea
					speed={1} smoothScrolling
					horizontal={false} className="customTabScrollArea"
				>
					<Table dataSource={tabList} columns={this.getColumn()} pagination={pagination}/>
				</ScrollArea>
				{getProgressComp(progress)}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		customerTabData: state.customerTabReducer
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getCustomerTabList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomTabReadOnly);

