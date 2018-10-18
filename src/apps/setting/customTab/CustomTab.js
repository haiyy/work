import React from 'react';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { Button, Table,  Switch } from 'antd';
import "./style/customTab.scss";
import { getCustomerTabList, delTab, editCustomerStatus } from "./tabReducer/customerTabReducer";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class CustomTab extends React.PureComponent {
	
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
			title: <span className="title">{getLangTxt("name")}</span>,
			dataIndex: 'tabname'
		}, {
			key: 'useable',
			title: <span className="title">{getLangTxt("whether_use")}</span>,
			dataIndex: 'useable',
			render: (useable, record) => {
				return (
					<Switch checked={useable === 1} onChange={this.changeUseable.bind(this, record)}/>
				)
			}
		}, {
			key: 'remove',
			title: getLangTxt("operation"),
			render: (record) => {
				return (
					<div className="customTabOperate">
						<i className="icon-bianji iconfont" onClick={this.handleEditTab.bind(this, record)}/>
						<i className="icon-shanchu iconfont" onClick={this.handleDelTab.bind(this, record)}/>
					</div>
				)
			}
		}];
	}
	
	changeUseable(record, checked)
	{
		let checkedStatus = checked ? 1 : 0,
			obj = {
				tabid: record.tabid,
				useable: checkedStatus
			};
		
		this.props.editCustomerStatus(obj)
		.then(result => {
			if(result.success)
			{
				Object.assign(record, obj);
				this.setState({isUpdate: !this.state.isUpdate})
			}
			else
			{
				warning({
					title: getLangTxt("err_tip"),
					iconType: 'exclamation-circle',
					className: 'errorTip',
					content: getLangTxt("20034"),
					okText: getLangTxt("sure"),
					width: '320px'
				});
			}
		});
	}
	
	//新增标签页
	handleAddTab()
	{
		let path = [{"title": getLangTxt("setting_access_set"), "key": "accessSetting"},
			{
				"title": getLangTxt("setting_custom_tab"), "key": "customtab",
				"fns": ["custom_tab_edit", "custom_tab_check"]
			}];
		this.props.route(path, true);
	}
	
	//编辑标签页
	handleEditTab(record)
	{
		let path = [{"title": getLangTxt("setting_access_set"), "key": "accessSetting"},
			{"title": getLangTxt("setting_custom_tab"), "key": "customtab", "fns": ["custom_tab_edit", "custom_tab_check"]}];
		this.props.route(path, true, record);
	}
	
	//删除标签页
	handleDelTab(record)
	{
		let {customerTabData} = this.props,
			tabList = customerTabData.getIn(["tabList"]) || [],
			totalCount = customerTabData.getIn(["total"]) || 0,
			{currentPage = 0} = this.state;
		confirm(
			{
				title: getLangTxt("del_tip"),
				width: '320px',
				iconType: 'exclamation-circle',
				className: 'warnTip',
				content: getLangTxt("del_content"),
				onOk: () => {
					let obj = {tabid: record.tabid};
					this.props.delTab(obj)
					.then(result => {
						
						if(result.success)
						{
							if(currentPage < totalCount / 10 && tabList.length >= 9)
							{
								let obj = {
									page: currentPage,
									rp: 10
								};
								this.props.getCustomerTabList(obj);
							}
						}
						else
						{
							warning({
								title: getLangTxt("err_tip"),
								iconType: 'exclamation-circle',
								className: 'errorTip',
								content: getLangTxt("20034"),
								okText: getLangTxt("sure"),
								width: '320px'
							});
						}
					});
				}
			}
		);
	}
	
	reFreshFn()
	{
		let path = [{"title": getLangTxt("setting_company"), "key": "sub1"}, {"title": getLangTxt("setting_custom_tab"), "key": "customtab"}],
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
				<Button type="primary" className="addCustomBtn" onClick={this.handleAddTab.bind(this)}>
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
	return bindActionCreators({getCustomerTabList, delTab, editCustomerStatus}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomTab);

