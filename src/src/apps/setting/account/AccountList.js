import React from 'react';
import { Table, Button, Modal, Tabs, Popover, Form, Select, Input, Tooltip, message, Spin } from 'antd';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CreateAccount from './CreateAccount';
import AccountInfo from './AccountInfo';
import EditorAccount from './EditorAccount';
import { delAccountList, getlListData, getNewUserInfo, clearDeleteProgress, getUserType, getSearchData, migrateAccounts, delAccounts, getUserSkillTag } from './accountAction/sessionLabel';
import './style/accountRight.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { bglen } from "../../../utils/StringUtils"
import MigrateModalComp from "./MigrateModalComp";
import NTModal from "../../../components/NTModal";
import { truncateToPop } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const TabPane = Tabs.TabPane,
	confirm = Modal.confirm,
	FormItem = Form.Item,
	Option = Select.Option;

class AccountList extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.state = {
			selectedRowKeys: [],
			visible: false, //???
			isMigrate: false,
			isSearchAccount: false,
			show: false,  //del
			checked: false,  //del
			permissions: false,  //del
			details: false,  //查看账户详细信息
			changeGroup: false,  //编辑账号 改名字 is
			record: '',  //selectedUserId
			name: null,  //title。。。
			data: null, //del
			link: false,  //del
			userid: null, //del 同  	record: '',  //selectedUserId
			disabled: false,
			currentPage: 1,
			isSearchBtnShow: false,//搜索按钮是否可用
		};
		this.currentGroupId = "";
	}

	componentDidMount()
	{
		this.props.getNewUserInfo();
		this.props.getUserType();
        this.props.getUserSkillTag();
		this.setState({currentPage: 1});
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.currentId != this.props.currentId)
		{
			this.setState({currentPage: 1});
		}
	}

	//(operate, userid = "")  新增账户
	showModal()
	{
		this.setState({
			visible: true,
			name: getLangTxt("setting_account_add")
		});
	}

	//编辑账户
	showEditorModal(recode, e)
	{
		e.stopPropagation();
		this.setState({
			visible: true,
			name: getLangTxt("setting_account_edit"),
			userid: recode.userid
		});
	}

	handleOk()
	{
		this.setState({
			visible: false,
			permissions: false,
			details: false,
			changeGroup: false
		});
	}

	getCurrentGroup(groupId)
	{
		this.currentGroupId = groupId;
		this.setState({currentPage: 1, isSearchAccount: false});
		this.props.getCurrentGroup(groupId);
	}

	showConfirm(recode, e)
	{
		e.stopPropagation();
		let userid = recode.userid,
			{getAccountList = [], currentId = "", listCount = 0} = this.props,
			{currentPage = 1} = this.state,
			isUpdate = currentPage < listCount / 10,
			currentGroupId = currentId || this.currentGroupId;

		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				this.props.delAccountList(userid, isUpdate, currentPage, currentGroupId);

				if(getAccountList.length === 1)
				{
					currentPage = currentPage > 1 ? currentPage - 1 : currentPage;
					let obj = {
						groupid: currentGroupId,
						page: currentPage,
						size: 10
					};
					this.props.getlListData(obj);
					this.setState({currentPage});
				}
			}
		});
	}

	handleCancel()  // 同handleOK
	{
		this.setState({
			visible: false,
			permissions: false,
			details: false,
			changeGroup: false
		});
	}

	rowClick(record)
	{
		this.setState({record: record.userid, details: true});
	}

	changeState()
	{
		this.setState({link: false, visible: false});
	}

	failState()
	{
		this.setState({link: false});
	}

	_getProgressComp(obj)
	{
		let {progress} = this.props,
			errorMsg = getLangTxt("20034"),
			errorTitle = getLangTxt("setting_early_note3");

		if(progress)
		{
			if(progress.right === LoadProgressConst.LOAD_COMPLETE || progress.right === LoadProgressConst.SAVING_SUCCESS)
				return;

			if(progress.right === LoadProgressConst.LOADING || progress.right === LoadProgressConst.SAVING)  //正在加载或正在保存
			{
				return (
					<div className="accountListProgress">
                        <Spin style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
					</div>
				);
			}
			else if(progress.right === LoadProgressConst.LOAD_FAILED)  //加载失败
			{
				return <ReFresh reFreshStyle={{width: "calc(100% - 2.03rem)"}}
				                reFreshFn={this.reFreshFn.bind(this, obj)}/>;
			}
			else if(progress.right === LoadProgressConst.UNDELETED)
			{//不可删除账户
				Modal.warning({
					title: getLangTxt("err_tip"),
					width: '320px',
					iconType: 'exclamation-circle',
					className: 'errorTip',
					content: getLangTxt("setting_account_del_enabled"),
					okText: getLangTxt("sure"),
					onOk: () => {
						this.props.clearDeleteProgress();
					}
				});
			}
			else
			{
				if(progress.right === LoadProgressConst.SAVING_FAILED)  //保存失败
				{
					errorTitle = getLangTxt("tip2");
					errorMsg = getLangTxt("setting_early_note3");
				}
				else if(progress.right === LoadProgressConst.DUPLICATE)  //用户名重复
				{
					errorTitle = getLangTxt("tip3");
					errorMsg = getLangTxt("setting_account_note7");
				}
				else if(progress.right === LoadProgressConst.DUPLICATE_NICKNAME)  //内部名重复
				{
					errorTitle = getLangTxt("tip3");
					errorMsg = getLangTxt("setting_account_note8");
				}
				else if(progress.right === LoadProgressConst.ACCOUNT_EXCEED)  //账号数超限
				{
					errorTitle = getLangTxt("tip3");
					errorMsg = getLangTxt("setting_account_note9");
				}
				this.reFreshFn(obj);
				Modal.warning({
					title: errorTitle,
					content: errorMsg,
					iconType: 'exclamation-circle',
					className: 'warnTip',
					width: "320px",
					okText: getLangTxt("sure")
				});
			}

		}
		return null;
	}

	reFreshFn(obj)
	{
		if(!obj.groupid)
		{
			delete obj.groupid;
		}
		this.props.getlListData(obj);
		this.setState({currentPage: 1})
	}

	//判断内部名规则可输入汉字
	judgeShowNameSpace(rule, value, callback)
	{
		let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

		if(value === "" || accountNameRe.test(value))
		{
			callback();
		}
		callback(" ");
	}

	//判断账户名规则，不可输入汉字
	judgeSpace(rule, value, callback)
	{
		// let accountNameRe = /^\w{1,16}$/;
		// if(value === "" || accountNameRe.test(value))

		if(/*value && value.trim() !== "" && */bglen(value) <= 32)
		{
			callback();
		}
		callback(" ");
	}

	searchData = {
		page: 1, size: 10
	};

	//点击搜索账户
	handleSearch(e)
	{
		e.preventDefault();

		this.searchData = {
			page: 1, size: 10
		};

		this.props.form.validateFieldsAndScroll((err, values) => {
			if(!err)
			{
				if(values['account-name'])
					this.searchData.username = values['account-name'];
				if(values['nick-name'])
					this.searchData.nickname = values['nick-name'];
				if(values['role-name'])
					this.searchData.roleid = values['role-name'];
				if(values['user-type'])
					this.searchData.usertype = parseInt(values['user-type']);

				let {username, nickname, roleid, usertype} = this.searchData;

				if(!username && !nickname && !roleid && usertype === undefined)
				{
					if(!this.state.warned)
						message.error(getLangTxt("setting_account_note10"));
					this.setState({warned: true});
					return;
				}

				this.props.getCurrentGroup("");
				this.props.getSearchData(this.searchData);
				this.setState({isSearchAccount: true, currentPage: 1});

			}
			else
			{

			}
		});
	}

	//点击重置搜索参数
	resetSearchData()
	{
		this.props.form.setFieldsValue({"user-type": "", "account-name": "", "nick-name": "", "role-name": ""});
		this.searchData = {
			page: 1, size: 10
		};
		if(this.state.isSearchAccount)
		{
			this.props.getlListData();
		}
		this.props.getCurrentGroup("");
		this.currentGroupId = "";
		this.setState({isSearchAccount: false, currentPage: 1, isSearchBtnShow: false, warned: false});
	}

	//弹出迁移账户窗
	isShowMigrateModal()
	{
		let {selectedRowKeys = []} = this.state;

		if(selectedRowKeys.length > 0)
			this.setState({isMigrate: true})
	}

	//关闭迁移账户窗口
	isOpenMigrateModal(isMigrate, groupid = '')
	{
		if(groupid)
		{
			let {getAccountList = [], currentId = "", listCount = 0} = this.props,
				{currentPage = 1, selectedRowKeys = []} = this.state,
				isUpdate = currentPage < listCount / 10,
				currentGroupId = currentId || this.currentGroupId,
				data = {
					userids: selectedRowKeys,
					groupid
				};

			this.props.migrateAccounts(data, isUpdate, currentPage, currentGroupId);
			this.setState({selectedRowKeys: []})
		}

		this.setState({isMigrate})
	}

	//批量删除账户窗口
	isShowDelAccountsModal()
	{
		let {selectedRowKeys = []} = this.state;
		if(selectedRowKeys.length > 0)
			Modal.confirm({
				title: getLangTxt("del_tip"),
				width: '320px',
				iconType: 'exclamation-circle',
				className: 'warnTip',
				content: getLangTxt("setting_account_note11"),
				onOk: () => {
					let userids = {userids: selectedRowKeys},
						{currentId = "", listCount = 0} = this.props,
						{currentPage = 1} = this.state,
						isUpdate = currentPage < listCount / 10,
						currentGroupId = currentId || this.currentGroupId;
					this.props.delAccounts(userids, isUpdate, currentPage, currentGroupId)
				}
			})
	}

	//选择多个账户操作
	onSelectChange(selectedRowKeys)
	{
		this.setState({selectedRowKeys});
	}

	//点击搜索条件下拉列表
	onSearchSelectChange()
	{
		this.setState({isSearchBtnShow: true});
	}

	//搜索条件输入框
	onSearchIptChange(e)
	{
		if(!this.state.isSearchBtnShow)
		{
			this.setState({isSearchBtnShow: true})
		}
	}

	render()
	{

		const {selectedRowKeys, isSearchBtnShow} = this.state,
			{getAccountList, listCount = 0, currentId, progress, roleList = [], userTypes = [], form: {getFieldDecorator}, accountGroupList = []} = this.props,
			rowSelection = {
				selectedRowKeys,
				onChange: this.onSelectChange.bind(this)
			},
			columns = getColumns.call(this),
			obj = {
				groupid: currentId || this.currentGroupId,
				page: 1,
				size: 10
			},
			pagination = {
				total: parseInt(listCount),
				showQuickJumper: true,
				current: this.props.pageNum ? this.props.pageNum : this.state.currentPage,
				showTotal: (total) => {
					return getLangTxt("total", total);
				},
				onChange: (pageData) => {
					this.setState({currentPage: pageData});
					this.props.resetListPage(null);
					obj.page = pageData;
					if(currentId)
					{
						obj.groupid = currentId
					}
					else if(this.currentGroupId)
					{
						obj.groupid = this.currentGroupId
					}
					else if(!currentId && !this.currentGroupId)
					{
						delete obj.groupid;
					}
					if(this.state.isSearchAccount && !currentId)
					{
						this.searchData.page = pageData;
						this.props.getSearchData(this.searchData);
					}
					else
					{
						this.props.getlListData(obj);
					}
				}
			},
			formItemLayout = {labelCol: {span: 3}, wrapperCol: {span: 8}};

		return (
			<div className="accountListArea">
				<div className="searchAccountBox">
					<Form className="accountSearchForm" layout="inline" id="searchScrollArea"
					      onSubmit={this.handleSearch.bind(this)}>
						<div className="accountSearchContainer">
							<div className="accountSearchBox">
								<FormItem {...formItemLayout} label={getLangTxt("setting_account_usertype")}>
									{
										getFieldDecorator('user-type', {
											initialValue: ""
										})(
											<Select
												getPopupContainer={() => document.getElementById('searchScrollArea')}
												onChange={this.onSearchSelectChange.bind(this)}
											>
												{
													userTypes ? userTypes.map((item) => {
														return (
															<Option key={item.usertypeid}
															        value={item.usertypeid.toString()}>{item.name}</Option>
														)
													}) : null
												}
											</Select>
										)
									}
								</FormItem>
								<FormItem {...formItemLayout} label={getLangTxt("setting_account")}>
									{
										getFieldDecorator('account-name', {
											initialValue: "",
											rules: [{validator: this.judgeSpace.bind(this)}]
										})(
											<Input onKeyUp={this.onSearchIptChange.bind(this)}/>
										)
									}
								</FormItem>
							</div>
							<div className="accountSearchBox">
								<FormItem {...formItemLayout} label={getLangTxt("setting_account_internal_name")}>
									{
										getFieldDecorator('nick-name', {
											initialValue: "",
											rules: [{validator: this.judgeShowNameSpace.bind(this)}]
										})(
											<Input onKeyUp={this.onSearchIptChange.bind(this)}/>
										)
									}
								</FormItem>
								<FormItem {...formItemLayout} className="roleItem"
								          label={getLangTxt("setting_account_role")}>
									{
										getFieldDecorator('role-name',
											{
												initialValue: ""
											})(
											<Select
												getPopupContainer={() => document.getElementById('searchScrollArea')}
												onChange={this.onSearchSelectChange.bind(this)}
											>
												{
													roleList && roleList.map((item) => {
														return (
															<Option key={item.roleid}
															        value={item.roleid}>{item.rolename}</Option>
														)
													})
												}
											</Select>
										)
									}
								</FormItem>
							</div>
						</div>
						<div className="accountSearchBtn">
							<FormItem className="searchBtnBox ">
								<Button type="primary"/* disabled={!isSearchBtnShow}*/
								        onClick={this.resetSearchData.bind(this)}>{getLangTxt("setting_account_reset")}</Button>
								<Button type="primary"/* disabled={!isSearchBtnShow}*/
								        htmlType="submit">{getLangTxt("seach")}</Button>
							</FormItem>
						</div>
					</Form>
				</div>
				<div className="accountsTableList">
					<div className="createAccountBtn">
						<Button type="primary"
						        onClick={this.showModal.bind(this)}>{getLangTxt("setting_account_add")}</Button>
						<div className="accountOperateBox">
							<Button type="primary" className="deleteAccount"
							        onClick={this.isShowMigrateModal.bind(this)}>{getLangTxt("setting_account_transfer")}</Button>
							<Tooltip placement="bottom" title={getLangTxt("setting_account_multiple")}>
								<Button type="primary" className="deleteAccount deleteBtn"
								        onClick={this.isShowDelAccountsModal.bind(this)}>
										{getLangTxt("del")}
									{/* <i className="iconfont icon-shanchu"/> */}
								</Button>
							</Tooltip>
						</div>
					</div>
					<ScrollArea
						speed={1}
						horizontal={false}
						className="accountScrollArea">
						<Table columns={columns}
						       dataSource={getAccountList}
						       rowSelection={rowSelection}
						       onRowClick={this.rowClick.bind(this)}
						       pagination={pagination}
						/>
					</ScrollArea>
					{
						this.state.details ?
							<NTModal title={getLangTxt("setting_account_check")}
							         visible={true}
							         wrapClassName="details"
							         width={600}
							         footer={[<Button key="submit" type="primary" size="large"
							                          onClick={this.handleOk.bind(this)}>{getLangTxt("sure")}</Button>]}
							         onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}
							>
								<AccountInfo user={this.state.record}/>
							</NTModal> : null
					}
					{
						this.state.permissions ?
							<NTModal title={getLangTxt("setting_account_authority")}
							         visible={true}
							         wrapClassName="permissions"
							         width={723}
							         style={{top: 10}}
							         onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}
							>
								<div className="message">
									<b style={{paddingBottom: '10px'}}>{getLangTxt("setting_account_account")}</b><br/><b>{getLangTxt("setting_account_role")}</b><span>{getLangTxt("setting_account_quality")}</span>
								</div>
								<Tabs defaultActiveKey="1">
									<TabPane tab={getLangTxt("setting_account_kf")} key="1">
										<Button style={{marginBottom: '20px'}}
										        type="ghost">{getLangTxt("setting_account_online")}</Button>
										{/*<WordRoleSetting wordData = {[]} />*/}
									</TabPane>
									<TabPane tab={getLangTxt("setting_account_kf1")} key="2">Content of Tab Pane
										2</TabPane>
								</Tabs>
							</NTModal> : null
					}

					{
						this.state.visible ?
							<CreateAccount
								operatName={this.state.name}
								handleCancel={this.handleCancel.bind(this)}
								getCurrentGroup={this.getCurrentGroup.bind(this)}
								changeState={this.changeState.bind(this)}
								failState={this.failState.bind(this)}
								title={this.state.name}
								userid={this.state.userid}/>
							: null
					}

					{
						this.state.changeGroup ?
							<NTModal title={getLangTxt("setting_account_edit")} visible={true} width={723}
							         okText={getLangTxt("save")} cancelText={getLangTxt("cancel")}
							         wrapClassName="accountRight" style={{top: 150}}
							         onCancel={this.handleCancel.bind(this)}
							         onOk={this.handleOk.bind(this)}>
								<div>
									<EditorAccount link={this.state.link} changeState={this.changeState.bind(this)}
									               title={this.state.name}/>
								</div>
							</NTModal> : null
					}

					{
						this.state.isMigrate ?
							<MigrateModalComp currentID={currentId} accountGroupList={accountGroupList}
							                  isOpenMigrateModal={this.isOpenMigrateModal.bind(this)}/> : null
					}
				</div>
				{this._getProgressComp(obj)}
			</div>
		)
	}
}

function getColumns()
{
	return [{
		key: 'rank',
		dataIndex: 'rank',
		width: '6%',
		render: (text) => {
			let {currentPage} = this.state;
			let rankNum,
				calcCurrent = (currentPage - 1) * 10;
			if(this.props.pageNum)
			{
				calcCurrent = (this.props.pageNum - 1) * 10;
			}
			calcCurrent === 0 ? rankNum = text : rankNum = calcCurrent + text;
			return (
				<div style={{textAlign: "center"}}>{rankNum}</div>
			)
		}
	}, {
		key: 'username',
		title: getLangTxt("setting_account"),
		dataIndex: 'username',
		width: '20%',
		render: text => {
			let typeEle = document.querySelector(".accountInfoStyle"),
				typeWidth = typeEle && typeEle.clientWidth,
				typeInfo = truncateToPop(text, typeWidth) || {};

			return (
				typeInfo.show ?
					<Popover placement="topLeft"
					         content={
						         <div style={{
							         maxWidth: typeWidth + "px", height: "auto", wordWrap: "break-word"
						         }}>{text}</div>
					         }
					>
						<div className="accountInfoStyle">{typeInfo.content}</div>
					</Popover>
					:
					<div className="accountInfoStyle">{text}</div>
			)
		}
	}, {
		key: 'nickname',
		title: getLangTxt("setting_account_internal_name"),
		dataIndex: 'nickname',
		width: '20%',
		render: text => {
			let typeEle = document.querySelector(".accountInfoStyle"),
				typeWidth = typeEle && typeEle.clientWidth,
				typeInfo = truncateToPop(text, typeWidth) || {};

			return (
				typeInfo.show ?
					<Popover content={<div
						style={{maxWidth: typeWidth + "px", height: "auto", wordWrap: "break-word"}}>{text}</div>}
					         placement="topLeft">
						<div className="accountInfoStyle">{typeInfo.content}</div>
					</Popover>
					:
					<div className="accountInfoStyle">{text}</div>
			)
		}
	}, {
		key: 'externalname',
		title: getLangTxt("setting_account_external_name"),
		dataIndex: 'externalname',
		width: '20%',
		render: text => {
			let typeEle = document.querySelector(".accountInfoStyle"),
				typeWidth = typeEle && typeEle.clientWidth,
				typeInfo = truncateToPop(text, typeWidth) || {};

			return (
				typeInfo.show ?
					<Popover content={<div
						style={{maxWidth: typeWidth + "px", height: "auto", wordWrap: "break-word"}}>{text}</div>}
					         placement="topLeft">
						<div className="accountInfoStyle">{typeInfo.content}</div>
					</Popover>
					:
					<div className="accountInfoStyle">{text}</div>
			)
		}
	}, {
		key: 'roleList',
		title: getLangTxt("setting_account_role"),
		dataIndex: 'roleid',
		width: '20%',
		render: record => {
			let {roleList = []} = this.props,
				recordToString = "",
				copyRecord = [...record];

			record.forEach((item, index) => {

				let exitItem = roleList.find(roleItem => roleItem.roleid == item);

				if(exitItem)
				{
					copyRecord[index] = exitItem.rolename;
				}
				else
				{
					copyRecord.splice(index, 1);
				}
			});

			recordToString = copyRecord.join("，");

			let typeEle = document.querySelector(".accountInfoStyle"),
				typeWidth = typeEle && typeEle.clientWidth,
				typeInfo = truncateToPop(recordToString, typeWidth) || {};

			return (
				typeInfo.show ?
					<Popover content={<div style={{
						maxWidth: typeWidth + "px", height: "auto", wordWrap: "break-word"
					}}>{recordToString}</div>} placement="topLeft">
						<div className="accountInfoStyle">{typeInfo.content}</div>
					</Popover>
					:
					<div className="accountInfoStyle">{recordToString}</div>
			)
		}
	}/*, {
     key: 'ifDisable',
     title: '是否禁用',
     render: record => <Switch defaultChecked={record.ifDisable}/>
     }*/, {
		title: getLangTxt("operation"),
		key: 'action',
		width: '14%',
		render: record =>
			<div className="mask">
				<Tooltip placement="bottom" title={getLangTxt("edit")}>
					<i className="iconfont icon-bianji" onClick={this.showEditorModal.bind(this, record)}/>
				</Tooltip>
				<Tooltip placement="bottom" title={getLangTxt("del")}>
					<i className="iconfont icon-shanchu" onClick={this.showConfirm.bind(this, record)}/>
				</Tooltip>
			</div>
	}];
}

AccountList = Form.create()(AccountList);

function mapStateToProps(state)
{
	return {
		accountGroupList: state.accountReducer.data,
		listCount: state.getAccountList.count,
		progress: state.getAccountList.progress,
		roleList: state.getRoleList.data,
		userTypes: state.getUserType.data
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		delAccountList, getlListData, getNewUserInfo, clearDeleteProgress, getUserType, getSearchData, migrateAccounts,
		delAccounts, getUserSkillTag
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountList);
