import React from 'react'
import { Table, Button, Input, Switch,  Popover, Tooltip } from 'antd'
import { bindActionCreators } from 'redux'
import ScrollArea from 'react-scrollbar'
import { sendNewRoleManger, sendEditorRoleManger, deleteRoleManger, getRoleManager, sendEditorRoleMangerStatus } from './roleAction/roleManger'
import { connect } from 'react-redux'
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
import './style/rolemanager.scss'
import { getLangTxt, getProgressComp } from "../../../../utils/MyUtil";
import { truncateToPop } from "../../../../utils/StringUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../../components/xn/modal/Modal";

class RoleManage extends React.PureComponent {

	static NEW_ROLE = 0;  //新建行政组
	static EDIT_ROLE = 1;  //编辑行政组

	constructor(props)
	{
		super(props);
		this.state = {
			currentPage: 1
		};
	}

	//新建和编辑
	newModal()
	{
		let path = [
			{"title": "setting_account_manager", "key": "sub2"},
			{"title": "setting_add1_role", "key": "rolemanage", "fns": ["newrolemanage"], custom: true}
		];
		this.props.route(path);
	}

	editorModal(record)
	{
		let path = [
			{"title": "setting_account_manager", "key": "sub2"},
			{"title": "setting_edit_role", "key": "rolemanage", "fns": ["newrolemanage"], custom: true}
		];
		this.props.route(path, true, record);
	}

	//删除
	showRemove(record)
	{
		let {roleList = [], roleListCount = 0} = this.props,
			{currentPage = 1} = this.state,
			isUpdate = currentPage < roleListCount / 10;

		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			okText: getLangTxt("sure"),
			className: record.usernumber == 0 ? 'warnTip' : 'errorTip roleErrorTip',
			content: record.usernumber == 0 ? getLangTxt("del_content") : getLangTxt("setting_role_note1") + record.rolename + getLangTxt("setting_role_note2"),
			onOk: () => {
				if(record.usernumber == 0)
				{
					this.props.deleteRoleManger(record.roleid, isUpdate, currentPage);
					if(roleList.length === 1)
					{
						currentPage = currentPage > 1 ? currentPage - 1 : currentPage;
						let obj = {page: currentPage, rp: 10};
						this.props.getRoleManager(obj);
						this.setState({currentPage})
					}
				}
			}
		});
	}

	onChange(record, checked)
	{
		record.status = checked ? 1 : 0;
		this.props.sendEditorRoleMangerStatus(record);
		this.setState({isCheckOk: !this.state.isCheckOk})
	}

	componentDidMount()
	{
		let obj = {page: 1, rp: 10};
		this.props.getRoleManager(obj);
	}

	savingErrorTips(msg)
	{
		warning({
			title: getLangTxt("err_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'errorTip',
			okText: getLangTxt("sure"),
			content: msg,
			onOk: () => {
				this.setState({currentPage: 1});
				let obj = {page: 1, rp: 10};
				this.props.getRoleManager(obj);
			}
		});
	}

	render()
	{
		let {roleList = [], roleListCount = 0, progress, roleErrorMsg = ""} = this.props;

		if(progress === LoadProgressConst.SAVING_FAILED || progress === LoadProgressConst.DUPLICATE)
		{
			this.savingErrorTips(roleErrorMsg)
		}
		const columns = [{
				key: 'rank',
				dataIndex: 'rank',
				width: '6%',
				render: (text) => {
					let {currentPage} = this.state;
					let rankNum,
						calcCurrent = (currentPage - 1) * 10;
					calcCurrent === 0 ? rankNum = text : rankNum = calcCurrent + text;
					return (
						<div style={{textAlign: "center"}}>{rankNum}</div>
					)
				}
			}, {
				key: 'name',
				title: getLangTxt("setting_role_name"),
				dataIndex: 'rolename',
				render: text => {
					let typeEle = document.querySelector(".roleListStyle"),
						titleWidth = typeEle && typeEle.clientWidth,
						roleNameInfo = truncateToPop(text, titleWidth) || {};

					return (
						roleNameInfo.show ?
							<Popover content={<div
								style={{width: titleWidth + 'px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>}
							         placement="topLeft">
								<div className="roleListStyle">{roleNameInfo.content}</div>
							</Popover>
							:
							<div className="roleListStyle">{text}</div>
					)
				}
			}, {
				key: 'description',
				title: getLangTxt("setting_role_des"),
				dataIndex: 'description',
				render: text => {
					let typeEle = document.querySelector(".roleListStyle"),
						titleWidth = typeEle && typeEle.clientWidth,
						roleInfo = truncateToPop(text, titleWidth) || {};

					return (
						roleInfo.show ?
							<Popover content={<div
								style={{width: titleWidth + 'px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>}
							         placement="topLeft">
								<div className="roleListStyle">{roleInfo.content}</div>
							</Popover>
							:
							<div className="roleListStyle">{text}</div>
					)
				}
			}, {
				key: 'status',
				title: getLangTxt("setting_role_on"),
				dataIndex: 'status',
				render: (text, record) => {
					return (
						<Switch checked={record.status == 1} onChange={this.onChange.bind(this, record)}/>
					)
				}
			}, {
				key: 'usernumber',
				title: getLangTxt("setting_account_count"),
				dataIndex: 'usernumber',
				render: (text, record, index) => {
					return (
						<span/* onClick={this.listModal.bind(this, index)}
                            style={{color: '#067ad8'}}*/>{text}</span>
					)
				}
			}, {
				key: 'operate',
				title: getLangTxt("operation"),
				render: (text, record) => {
					return (
						<div className="editor">
							<Tooltip placement="bottom" title={getLangTxt("edit")}>
								<i onClick={this.editorModal.bind(this, record)} className="iconfont icon-bianji"/>
							</Tooltip>
							<Tooltip placement="bottom" title={getLangTxt("del")}>
								<i onClick={this.showRemove.bind(this, record)} className="iconfont icon-shanchu"/>
							</Tooltip>
						</div>
					)
				}
			}],
			pagination = {
				showQuickJumper: true,
				total: roleListCount,
				current: this.state.currentPage,
				showTotal: (total) => {
					return getLangTxt("total", total);
				},
				onChange: (pageData) => {
					this.setState({currentPage: pageData});
					let obj = {page: pageData, rp: 10};
					this.props.getRoleManager(obj);
				}
			};

		return (
			<div className="rolemanager">
				<div className="rolemanager-head">
					<Button type="primary" onClick={this.newModal.bind(this)}>{getLangTxt("setting_add_role")}</Button>
				</div>
				<div className="rolemanager-body">
					<ScrollArea
						speed={1}
						horizontal={false}
						className="roleScrollArea">
						<Table dataSource={roleList} columns={columns} pagination={pagination}/>
					</ScrollArea>
				</div>
				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		roleList: state.newRoleManger.roleList,
		roleListCount: state.newRoleManger.roleListCount,
		progress: state.newRoleManger.progress,
		roleErrorMsg: state.newRoleManger.roleErrorMsg
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		sendNewRoleManger, sendEditorRoleManger, deleteRoleManger, getRoleManager, sendEditorRoleMangerStatus
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RoleManage);
