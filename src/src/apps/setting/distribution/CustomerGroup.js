import React from 'react'
import { Tabs, Steps, Button, Input, Select, Form, message, Radio, TreeSelect } from 'antd';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CustomerTable from './CustomerTable';
import './style/customergroup.scss';
import { getUserSkillTag } from '../account/accountAction/sessionLabel';
import { getCustomerGroupData, getSkillTagCustomerGroupData, makeUsers, editorCurstem, clearCustomerData, clearUserMsg } from './action/distribute';
import { bglen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const Step = Steps.Step, TabPane = Tabs.TabPane, Option = Select.Option, FormItem = Form.Item, RadioGroup = Radio.Group,
	TreeNode = TreeSelect.TreeNode;

class CustomerGroup extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.state = {
			show: false,
			tableData: null,
			isWarned: false,
			radioValue: 0,
			customerFilterType: 'accountGroup',
			currentPage: 1
		}
	}

	// 删除已保存技能标签或者账户分组中已删除数据
	isHaveDelValue(savedData = [], groupData = [], key)
	{
		let isExit;
		savedData.forEach((selectedItem, index) => {
			isExit = groupData.find(item => item[key] === selectedItem);
			let loop = (data) => {
				data.forEach(item => {
					if(item[key] === selectedItem)
					{
						isExit = true;
					}
					else if(item.children)
					{
						loop(item.children)
					}
				})
			};

			loop(groupData);
			if(!isExit)
			{
				savedData.splice(index, 1);
			}
		});
		return savedData
	}

	componentDidMount()
	{
		if(this.props.link == "editor")
		{
			let {
					users = {
						showtags: [], filterType: 0, groups: []
					}, skillTagData = [], accountGroupData = [], form
				} = this.props,
				{showtags = [], filterType = 0, groups = []} = users,
				valueToString = "";

			this.setState({radioValue: filterType});
			if(filterType === 0)
			{
				this.props.form.setFieldsValue({"skillTag": [], "group": []});
				if(groups.length > 0)
				{
					// groups = this.isHaveDelValue(groups, accountGroupData, "groupid");

					this.setState({customerFilterType: 'accountGroup'});
					this.props.form.setFieldsValue({"customer": groups});

					valueToString = groups.join(",");
					this.setState({selectedGroupIds: valueToString});

					let data = {groupIds: valueToString, page: 1, rp: 100000};
					this.props.getCustomerGroupData(data);
				}
				else
				{
					showtags = this.isHaveDelValue(showtags, skillTagData, "tagid");

					this.setState({customerFilterType: 'skillTag'});
					this.props.form.setFieldsValue({"customer": showtags});

					valueToString = showtags.join(",");

					this.setState({selectedTagIds: valueToString});
					let data = {tagids: valueToString, page: 1, rp: 100000};
					this.props.getSkillTagCustomerGroupData(data);
				}
			}
			else if(filterType === 1)
			{
				showtags = this.isHaveDelValue(showtags, skillTagData, "tagid");

				valueToString = showtags.join(",");
				this.props.form.setFieldsValue({"skillTag": showtags, "group": groups, "customer": []});

				let data = {tagids: valueToString, page: 1, rp: 100000};
				this.props.getSkillTagCustomerGroupData(data);
			}
			else if(filterType === 2)
			{
				groups = this.isHaveDelValue(groups, accountGroupData, "groupid");

				this.props.form.setFieldsValue({"skillTag": showtags, "group": groups, "customer": []});
				valueToString = groups.join(",");
				this.setState({selectedGroupIds: valueToString});

				let data = {groupIds: valueToString, page: 1, rp: 100000};
				this.props.getCustomerGroupData(data);
			}
		}
	}

	//点击下一步 或者提交数据 isCommit = true 提交数据 isPrevStep = true 点击上一步
	saveMessage(isCommit = false, isPrevStep = false, e)
	{
		let propsData = this.props.groupData,
			{suppliers = []} = this.props.users,
			{form} = this.props,
			{radioValue = 0, customerFilterType = "accountGroup"} = this.state;
		propsData ? propsData.map((item) => {
			item.supplierConfigInfo = {
				/*"maxConversationNum": item.maxConversationNum,*/
				"maxConcurrentConversationNum": item.maxConcurrentConversationNum
			};

			/*delete item.maxConversationNum;*/
			// delete item.maxConcurrentConversationNum;
		}) : null;

		let data = this.props.usersData;
		data.supplierPoolName = form.getFieldValue("username")
		.trim();
		data.suppliers = this.props.link === "editor" && !this.state.tableData ? suppliers : this.state.tableData || [];

		if(radioValue !== 0)
		{
			data.suppliers = [];
		}
		data.showtags = radioValue === 0 ? customerFilterType === "skillTag" ? form.getFieldValue("customer") : [] : form.getFieldValue("skillTag");
		data.tags = data.showtags;
		data.groups = radioValue === 0 ? customerFilterType === "accountGroup" ? form.getFieldValue("customer") : [] : form.getFieldValue("group");
		data.filterType = radioValue;

		form.validateFieldsAndScroll((errors, values) => {
			if(errors)
				return false;
			// (this.state.tableData ? this.state.tableData.length > 0 : (this.props.link == "editor" && suppliers.length > 0))
			if(data.suppliers.length > 0 || radioValue != 0)
			{
				if(this.props.link == "new")
				{
					if(isCommit)
					{
						this.props.makeUsers(data);
						this.props.getShowPage("close");
					}
					else
					{
						let nextStep = {};
						if(isPrevStep)
						{
							nextStep = {usershow: true, TypeShow: false, customerShow: false};
						}
						else
						{
							nextStep = {usershow: false, TypeShow: true, customerShow: false};
						}
						this.props.getShowPage(data, nextStep);
					}
				}
				else if(this.props.link == "editor")
				{
					data.templateid = this.props.id;

					if(isCommit)
					{
						this.props.editorCurstem(data);
						this.props.clearUserMsg();
						this.props.getShowPage("close");
					}
					else
					{
						let nextStep = {};
						if(isPrevStep)
						{
							nextStep = {usershow: true, TypeShow: false, customerShow: false};
						}
						else
						{
							nextStep = {usershow: false, TypeShow: true, customerShow: false};
						}
						this.props.getShowPage(data, nextStep);
					}

				}
			}
			else
			{
				let errorTips;
				if(!(data.suppliers && data.suppliers.length > 0) && !this.state.isWarned)
				{
					errorTips = getLangTxt("setting_distribution_tip2");

					if(isCommit)
					{
						errorTips = getLangTxt("setting_distribution_tip3");
					}
					this.setState({isWarned: true});
					this.error(errorTips)
				}
			}
		});
	}

	error(data)
	{
		message.error(data)
	}

	getTableData(tableData)
	{
		if(tableData)
			tableData.map((item) => {
				item.supplierConfigInfo = {
					/*"maxConversationNum": item.maxConversationNum,*/
					"maxConcurrentConversationNum": item.maxConcurrentConversationNum
				};

				/*delete item.maxConversationNum;*/
				/*delete item.maxConcurrentConversationNum;*/
			});
		this.setState({tableData, isWarned: false})
	}

	closeClick()
	{
		this.props.getPreserve();
	}

	getNextPageTags(currentPage, currentSkillTag = [])
	{
		this.setState({currentPage});
		let {selectedTagIds, selectedGroupIds, radioValue, customerFilterType} = this.state,
			obj = {
				tagids: selectedTagIds,
				page: currentPage,
				rp: 100000
			};

		if(radioValue === 1 || (radioValue === 0 && customerFilterType === "skillTag"))
		{
			if(!selectedTagIds)
			{
				obj.tagids = currentSkillTag.join(",")
			}
			this.props.getSkillTagCustomerGroupData(obj);
		}
		else
		{
			delete obj.tagids;
			obj.groupIds = selectedGroupIds;
			if(!selectedGroupIds)
			{
				obj.groupIds = currentSkillTag.join(",")
			}
			this.props.getCustomerGroupData(obj);
		}

	}

	judgeSpace(rule, value, callback)
	{
		let keyWordReg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
		if(value && value.trim() !== "" && bglen(value) <= 200 && !keyWordReg.test(value))
		{
			callback();
		}
		callback(getLangTxt("setting_distribution_tip4"));
	}

	//筛选客服方式改变
	handleRadioChange(e)
	{
		this.setState({radioValue: e.target.value, currentPage: 1});
		this.props.form.resetFields(["skillTag", "group", "customer"]);
		this.props.clearCustomerData();
	}

	//设置指定客服
	selectCustomerFilterType(customerFilterType)
	{
		this.setState({customerFilterType, tableData: [], radioValue: 0, currentPage: 1});
		// this.props.form.setFieldsValue({"customer": []});
		this.props.form.resetFields(["skillTag", "group", "customer"]);
		this.props.clearCustomerData();
	}

	//技能标签select框获取焦点
	onFocusSelect(radioValue)
	{
		if(radioValue !== this.state.radioValue)
		{
			this.props.form.resetFields(["skillTag", "group", "customer"]);
			this.props.clearCustomerData();
			this.setState({currentPage: 1});
		}

		this.setState({radioValue});
	}

	//按照技能标签选择
	selectSkillTag(value)
	{
		if(value.length > 0)
		{
			let valueToString = value.join(","),
				data = {
					tagids: valueToString,
					page: 1,
					rp: 100000
				};
			this.setState({selectedTagIds: valueToString/*, radioValue: 1*/});
			this.props.getSkillTagCustomerGroupData(data);
			// this.props.form.setFieldsValue({"group": []});
		}
	}

	//按照行政组选择
	selectAccountGroup(value)
	{
		let valueToString = value.join(","),
			data = {
				groupIds: valueToString,
				page: 1,
				rp: 100000
			};
		this.setState({selectedGroupIds: valueToString});
		this.props.getCustomerGroupData(data);
	}

	//按照指定客服选择
	selectCustomer(customerFilterType, value)
	{
		let valueToString = value.join(",");
		if(customerFilterType === "skillTag")
		{
			let data = {
				tagids: valueToString,
				page: 1,
				rp: 100000
			};
			this.setState({selectedTagIds: valueToString});
			this.props.getSkillTagCustomerGroupData(data);
		}
		else
		{
			let data = {
				groupIds: valueToString,
				page: 1,
				rp: 1000000
			};
			this.props.getCustomerGroupData(data);
			this.setState({selectedGroupIds: valueToString});
		}
	}

	getSelectTreeData(type)
	{
		let treeData = [],
			{skillTagData = [], accountGroupData = []} = this.props,
			{customerFilterType = "accountGroup"} = this.state;
		switch(type)
		{
			case 0:
				if(customerFilterType === "accountGroup")
				{
					treeData = accountGroupData;
				}
				else
				{
					treeData = skillTagData;
				}
				break;
			case 1:
				treeData = skillTagData;
				break;
			case 2:
				treeData = accountGroupData;
				break;
		}
		return treeData;
	}

	//获取当前已选中行政组或者技能标签筛选条件
	getSelectedFilterData(type)
	{
		let selectedFilterData = [],
			{form} = this.props;
		switch(type)
		{
			case 0:
				selectedFilterData = form.getFieldValue("customer");
				break;
			case 1:
				selectedFilterData = form.getFieldValue("skillTag");
				break;
			case 2:
				selectedFilterData = form.getFieldValue("group");
				break;
		}
		return selectedFilterData;
	}

	//行政组树选择
	getAccountTree(selectTreeData)
	{
		if(selectTreeData)
			return selectTreeData.map(item => {
				let {groupid, groupname} = item;
				groupid = String(groupid);

				if(item.children && item.children.length > 0)
				{
					return (
						<TreeNode value={groupid} title={groupname} key={Math.random()}>
							{
								this.getAccountTree(item.children)
							}
						</TreeNode>
					);
				}
				return <TreeNode value={groupid} title={groupname} key={Math.random()}/>;
			});
	}

	render()
	{
		let {getFieldDecorator} = this.props.form,
			state = {},
			formItemLayout = {labelCol: {span: 3}, wrapperCol: {span: 15}},
			{suppliers = []} = this.props.users,
			{groupData: customerGroupData = [], skillTagData = [], form} = this.props,
			{radioValue = 0, customerFilterType = "", currentPage = 1} = this.state,
			selectTreeData = this.getSelectTreeData(radioValue),
			currentTypeValue = [],
			filterTypeData = this.getSelectedFilterData(radioValue);

		if(this.state.tableData)
		{
			suppliers = this.state.tableData
		}
		if(this.props.link == "new")
		{
			state = null
		}
		else if(this.props.link == "editor")
		{
			if(this.props.users)
			{
				state = this.props.users;
				if(!state.supplierPoolName)
				{
					state.supplierPoolName = getLangTxt("setting_distribution_default_group");
				}
			}
			customerGroupData.map(item => {
				suppliers.map(suppliersItem => {
					if(item.userId === suppliersItem.userId)
					{
						item.level = suppliersItem.level;
						item.maxConcurrentConversationNum = suppliersItem.maxConcurrentConversationNum;
						item.maxConversationNum = suppliersItem.maxConversationNum;
					}
				})
			})
		}

		currentTypeValue = state && state.showtags.length > 0 ? state.showtags : state && state.groups || [];

		return (
			<div className='customer-group'>
				<Steps className="distributeStep" current={1}>
					<Step title={getLangTxt("setting_distribution_define_group")}/>
					<Step title={getLangTxt("setting_distribution_define_group1")}/>
					<Step title={getLangTxt("setting_distribution_rules")}/>
				</Steps>

				<div className="customer-group-container">
					<div className='customer-body'>
						<Tabs defaultActiveKey="1">
							<TabPane tab={getLangTxt("setting_distribution_default_user")} key="1">
								<div className='customer-common' id="scrollAreaCustomer">
									<div className='customer-common-body'>
										<Form>
											<FormItem className="groupName" {...formItemLayout}
											          label={getLangTxt("setting_distribution_default_name")}>
												{
													getFieldDecorator("username", {
														initialValue: state ? state.supplierPoolName : "",
														rules: [{validator: this.judgeSpace.bind(this)}]
													})(
														<Input className="groupNameIpt"/>
													)
												}
											</FormItem>
											<div className="clearFix customerBox">
												<div
													className="customerTitle">{getLangTxt("setting_distribution_sp_user")}</div>
												<RadioGroup
													className="customerSelect"
													value={radioValue}
													onChange={this.handleRadioChange.bind(this)}
												>
													<Radio value={1} className="customerTypeRadio">
														<FormItem {...formItemLayout}
														          label={getLangTxt("setting_distribution_skill")}>
															{
																getFieldDecorator('skillTag',
																	{
																		initialValue: [],
																		rules: [{
																			required: radioValue === 1,
																			message: getLangTxt("setting_distribution_skill_select"),
																			type: "array"
																		}]
																	})(
																	<Select
																		mode="multiple"
																		className="customerSelectGroup"
																		showSearch optionFilterProp="children"
																		onFocus={this.onFocusSelect.bind(this, 1)}
																		onChange={this.selectSkillTag.bind(this)}
																		getPopupContainer={() => document.getElementById("scrollAreaCustomer")}
																	>
																		{
																			selectTreeData.map((item) => {
																				return (
																					<Option
																						key={item.tagid}
																						value={item.tagid}
																					>
																						{item.tagname}
																					</Option>
																				)
																			})
																		}
																	</Select>
																)
															}
														</FormItem>
													</Radio>
													<Radio className="customerTypeRadio" value={2}>
														<FormItem {...formItemLayout}
														          label={getLangTxt("setting_distribution_sp_group")}>
															{
																getFieldDecorator('group',
																	{
																		initialValue: [],
																		rules: [{
																			required: radioValue === 2,
																			message: getLangTxt("setting_distribution_select_group"),
																			type: "array"
																		}]
																	})(
																	<TreeSelect allowClear multiple treeDefaultExpandAll
																	            className="customerSelectGroup" treeNodeFilterProp="title"
																	            dropdownStyle={{
																		            maxHeight: 340, overflowX: 'hidden',
																		            overflowY: 'auto'
																	            }} showSearch
																	            onClick={this.onFocusSelect.bind(this, 2)}
																	            onChange={this.selectAccountGroup.bind(this)}
																	            getPopupContainer={() => document.getElementById("scrollAreaCustomer")}>
																		{
																			this.getAccountTree(selectTreeData)
																		}
																	</TreeSelect>
																)
															}
														</FormItem>
													</Radio>
													<Radio className="customerTypeRadio" value={0}>
														<FormItem {...formItemLayout}
														          label={getLangTxt("setting_distribution_sp1_user")}>
															<Select
																className="filterType sameFilter"
																value={customerFilterType}
																onChange={this.selectCustomerFilterType.bind(this)}
																getPopupContainer={() => document.getElementById("scrollAreaCustomer")}
															>
																<Option key={1}
																        value="accountGroup">{getLangTxt("setting_account_group")}</Option>
																<Option key={2}
																        value="skillTag">{getLangTxt("setting_account_skilltag")}</Option>
															</Select>
															{
																getFieldDecorator('customer',
																	{
																		initialValue: [],
																		rules: [{
																			required: radioValue === 0,
																			message: getLangTxt("setting_distribution_select_user"),
																			type: "array"
																		}]
																	})(
																	<TreeSelect allowClear multiple treeNodeFilterProp="title"


																	            className="customerSelectGroup"
																	            dropdownStyle={{
																		            maxHeight: 340, overflowX: 'hidden',
																		            overflowY: 'auto'
																	            }} showSearch
																	            optionFilterProp="children"
																	            onClick={this.onFocusSelect.bind(this, 0)}
																	            onChange={this.selectCustomer.bind(this, customerFilterType)}
																	            getPopupContainer={() => document.getElementById("scrollAreaCustomer")}>
																		{
																			customerFilterType === "accountGroup" ?
																				this.getAccountTree(selectTreeData)
																				:
																				selectTreeData.map((item) => {
																					return (
																						<TreeNode
																							key={item.tagid}
																							value={item.tagid}
																							title={item.tagname}
																						>
																						</TreeNode>
																					)
																				})
																		}
																	</TreeSelect>
																)
															}
														</FormItem>
													</Radio>
												</RadioGroup>
											</div>
										</Form>
									</div>
									<div className='customer-common-table'>
										<CustomerTable
											link={this.props.link}
											suppliers={suppliers}
											currentPage={currentPage}
											getNextPageTags={this.getNextPageTags.bind(this)}
											skillTagData={skillTagData}
											currentSkillTag={currentTypeValue}
											filterTypeData={filterTypeData}
											getTableData={this.getTableData.bind(this)}
											customerData={customerGroupData}
											groupDataCount={this.props.groupDataCount}
											radioValue={radioValue}
										/>
									</div>
								</div>
							</TabPane>
							{/*<TabPane tab="备用客服" key="2">{/!*<CustomerSpare customerData = {this.props.state} />*!/}该版本不支持此功能</TabPane>*/}
						</Tabs>
					</div>
				</div>

				<div className="CustomerFooter">
					<Button className="ghost next" type="ghost"
					        onClick={this.saveMessage.bind(this, false, false)}>{getLangTxt("next_step")}</Button>
					{
                        /*<Button className="ghost next" type="ghost" onClick={this.saveMessage.bind(this, false, true)}>上一步</Button>*/
                    }
					<Button className="primary" type="primary"
					        onClick={this.saveMessage.bind(this, true)}>{getLangTxt("save")}</Button>
					<Button className="ghost" type="ghost"
					        onClick={this.closeClick.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>
			</div>
		)
	}
}

CustomerGroup = Form.create()(CustomerGroup);

function mapStateToProps(state)
{
	return {
		state: state.distributeReducer.data,
		groupData: state.distributeReducer.groupData,
		groupDataCount: state.distributeReducer.groupDataCount,
		skillTagData: state.getUserSkillTag.data,
		accountGroupData: state.accountReducer.data
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getCustomerGroupData, getSkillTagCustomerGroupData, makeUsers, editorCurstem, getUserSkillTag,
		clearCustomerData, clearUserMsg
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerGroup);
