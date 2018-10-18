import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getRoleMangerLimitData, sendNewRoleManger, sendEditorRoleManger, clearRoleErrorProgress } from '../roleAction/roleManger'
import { bglen, getHelp, truncateToPop } from "../../../../../utils/StringUtils";
import { Form, Button, Radio, Input, Checkbox, Popover } from 'antd';
import '../style/createRole.scss'
import { getAccountList, getAccountGroup } from "../../../../record/redux/consultReducer";
import { getAccountGroupList } from "../../accountAction/sessionLabel";
import NumberLimit from "./NumberLimit";
import { stringLen } from "../../../../../utils/StringUtils";
import { getLangTxt } from "../../../../../utils/MyUtil";
import {getShopGroup} from "../../../shopAccount/reducer/shopAccountReducer";
import {getProgressComp} from "../../../../../utils/MyUtil";
import LoadProgressConst from "../../../../../model/vo/LoadProgressConst";
import "../../style/CreateRoleComp.scss";
import Modal,{ confirm, info, error, success, warning } from "../../../../../components/xn/modal/Modal";

const FormItem = Form.Item, RadioGroup = Radio.Group;

class CreateRoleComp extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.state = {};
		this.featureFieldDos = [];
		this.accountGroupIds = [];
	}

	componentDidMount()
	{
		if(this.props.editData)
		{
			this.props.getRoleMangerLimitData(this.props.editData.roleid);
		}
		else
		{
			this.props.getRoleMangerLimitData()
		}

		this.props.getAccountGroup();
		this.props.getAccountGroupList();
        this.props.getShopGroup();
	}

	//点击返回至角色列表
	handleBackToRole()
	{
		let path = [
			{"title": "setting_account_manager", "key": "sub2"},
			{
				"title": "setting_role_manager", "key": "rolemanage", "fns": ["rolemanage_eidt", "rolemanage_check"]
			}
		];

		this.props.route(path);
	}

	//角色名称校验规则
	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "")
		{
			callback();
		}
		callback(getLangTxt("setting_role_name_note"));
	}

	//角色描述校验规则
	judgeDescripeLength(rule, value, callback)
	{
		let textLength = bglen(value) || 0;
		if(textLength <= 100 || !value)
		{
			callback();
		}
		callback(getLangTxt("setting_role_name_note1"));
	}

	/*查询功能权限全选操作*/
	selectedAllActionDos(item, checkedStatus)
	{
		if(item.enterpriseProductFeatures.length)
		{
			item.enterpriseProductFeatures.forEach(enterItem => {
				enterItem.featureActions.forEach(featureItem => {
					featureItem.enabled = checkedStatus;
				})
			})
		}
		else
		{
			item.featureActions.forEach(featureItem => {
				featureItem.enabled = checkedStatus;
			})
		}
	}

	/*点击全选功能权限*/
	handleSelectAllActionDos(e)
	{
		let {limitData} = this.props,
			allCheckStatus = e.target.checked ? 1 : 0;
		limitData.forEach(item => {
			this.selectedAllActionDos(item, allCheckStatus);
		});
		this.forceUpdate();
	}

	/*点击全选特定功能下功能权限*/
	handleFirstActionDos(item, e)
	{
		let checkedStatus = e.target.checked ? 1 : 0;

		this.selectedAllActionDos(item, checkedStatus);

		this.forceUpdate();
	}

	getFieldDos(featureFieldDos)
	{
		let obj = {content: [], range: [], rangeValue: ''};

		featureFieldDos && featureFieldDos.map(item => {

			if(item.type === 1)
			{
				obj.content.push(item);
			}
			if(item.type === 2)
			{
				if(item.enabled === 1)
				{
					if(item.sourcetype == "kfid")
					{
						if(!(item.expression) || item.expression === "=")
						{
							obj.rangeValue = item.fieldid;
						}
						else
						{
							obj.rangeValue = item.fieldid + "cust";
						}
					}
					else if(item.sourcetype == "group")
					{
						if(item.ranges === "own")
						{
							obj.rangeValue = item.fieldid + 'self';
						}
						else
						{
							obj.rangeValue = item.fieldid + 'group';
						}
					}
					else
					{
						obj.rangeValue = item.fieldid;
					}
				}

				// if (!obj.rangeValue)
				// {
				//     obj.rangeValue = featureFieldDos[0].fieldid;
				//     item.expression = "=";
				//     item.ranges = "own";
				// }

				obj.range.push(item)
			}
		});

		return obj
	}

	/*数据范围权限值改变*/
	onFieldDosRangeChange(range, e)
	{
		/*判断数据权限范围类型：kfid:仅自己; self:自己所在行政组; group:选择行政组*/
		let checkedType = e.target.value,
			checkedValue = checkedType.substring(checkedType.length - 4, checkedType.length),
			checkedItem;

		range.forEach(item => {
			item.expression = null;
			item.ranges = null;
			item.enabled = 0;

			this.props.form.setFieldsValue({[item.fieldid]: []});

		});

		if(checkedValue === "kfid" || checkedValue === "cust")
		{
			checkedItem = range.find(item =>
				item.sourcetype === 'kfid'
			);
			checkedItem.enabled = 1;
			if(checkedValue === "kfid") //选择仅自己
			{
				checkedItem.expression = "=";
				checkedItem.ranges = "own";
			}
			else //选择指定客服
			{
				checkedItem.expression = "in";
			}
		}
		else if(checkedValue === "self" || checkedValue === "roup")
		{
			checkedItem = range.find(item =>
				item.sourcetype === 'group'
			);

			checkedItem.enabled = 1;

			if(checkedValue === "self")
			{
				checkedItem.ranges = "own";
				checkedItem.expression = "=";
			}
			else
			{
				checkedItem.expression = "in";
			}
		}
		else
		{
			checkedItem = range.find(item =>
				item.fieldid === checkedType
			);
			checkedItem.enabled = 1;
            checkedItem.expression = "in";
		}

		this.forceUpdate();
		this.setState({fieldRangeValue: e.target.value})
	}

	/*数据内容权限值改变*/
	onFieldDosConChange(item, e)
	{
		let enabled = e.target.checked ? 1 : 0,
			obj = {enabled};
		Object.assign(item, obj);

		this.setState({isUpdate: !this.state.isUpdate});
	}

	/*获取数据内容权限*/
	getcontent(content)
	{

		return content.map(item =>
			<Checkbox className="numberLimitCheck" checked={item.enabled == 1}
			          onChange={this.onFieldDosConChange.bind(this, item)}>{item.fieldname}</Checkbox>)
	}

	/*功能权限选中*/
	onActionDosChange(item, e)
	{
		let enabled = e.target.checked ? 1 : 0,
			obj = {enabled};
		Object.assign(item, obj);
		this.forceUpdate();
	}

	/*点击显示对应数据权限*/
	handleCurrentFieldDos(featureid)
	{
		let fieldIO = featureid === this.state.featureid ? null : featureid;

		this.setState({featureid: fieldIO})
	}

	/*获取功能权限点*/
	getActionDos(featureActions, featureFields = [], featureid)
	{
		let fieldDos, {fieldRangeValue} = this.state;

		if(featureFields && featureFields.length)
		{
			fieldDos = this.getFieldDos(featureFields);
		}

		return <div className="featureNameRight">
			<div className="ActionDosCheckBox">
				{
					featureActions.length ? featureActions.map(item => {
						let {actionname} = item;

						return <Checkbox checked={item.enabled == 1}
						                 onChange={this.onActionDosChange.bind(this, item)}>{actionname}</Checkbox>;
					}) : <div>&nbsp;</div>
				}
			</div>
			{
				featureFields && featureFields.length ?
					<div className="dropDownComp" onClick={this.handleCurrentFieldDos.bind(this, featureid)}>
						{
							featureid === this.state.featureid ?
								<i className="iconfont icon-xiala1-xiangshang featureDosMore"/>
								:
								<i className="iconfont icon-xiala1 featureDosMore"/>
						}

					</div> :
					<div className="dropDownComp">&nbsp;</div>
			}

			{
				featureid === this.state.featureid ?
					<div className="fieldDosComp">
						{
							fieldDos.content.length ?
								<div className="fieldDosContent">
									<span>{getLangTxt("setting_role_dos_label1")}</span>
									{this.getcontent(fieldDos.content)}
								</div> : null
						}
						{
							fieldDos.range.length ?
								<div className="fieldDosContent">
									<span className="fieldRadioTitle">{getLangTxt("setting_role_dos_label2")}</span>
									<RadioGroup onChange={this.onFieldDosRangeChange.bind(this, fieldDos.range)}
									            defaultValue={fieldDos.rangeValue}>
										<NumberLimit range={fieldDos.range} fieldRangeValue={fieldRangeValue}/>
									</RadioGroup>
								</div> : null
						}
					</div> : null
			}
		</div>
	}

	/*功能点*/
	getFeatureComp(enterpriseProductFeatures)
	{
		if(!enterpriseProductFeatures.length)
			return <div className="featureItemComp"></div>
		return enterpriseProductFeatures.map(item => {
			let {featurename, featureActions, featureFields, featureid} = item;

			return <div className="featureItemComp">
				<div className="featureNameComp">{featurename}</div>
				{this.getActionDos(featureActions, featureFields, featureid)}
			</div>
		})
	}

	/*判断特定功能模块下是否全选 //checkedStatus： 0: 全不选; 1: 部分选择; 2: 全选;*/
	getIndeterminate(item, checkedStatus)
	{
		let checkedNum = 0,
			checkedFieldsArr = [];

		if(item.enterpriseProductFeatures.length)
		{
			item.enterpriseProductFeatures.forEach(enterItem => {
				enterItem.featureActions.forEach((feaItem) => {
					checkedFieldsArr.push(feaItem);
				});
			});

			checkedFieldsArr.forEach(checkboxItem => {
				if(checkboxItem.enabled)
					checkedNum++;
			});
			checkedStatus = checkedNum === 0 ? 0 : checkedNum < checkedFieldsArr.length ? 1 : 2;
		}
		else
		{
			item.featureActions.forEach((feaItem) => {
				if(feaItem.enabled)
					checkedNum++;
			});
			checkedStatus = checkedNum === 0 ? 0 : checkedNum < item.featureActions.length ? 1 : 2;
		}

		return checkedStatus;
	}

	getContainerWidth()
	{
		let containerComp = document.getElementsByClassName("limitComp")[0],
			containerWidth = 128;
		if(containerComp)
		{
			containerWidth = containerComp.clientWidth * 0.17;
		}

		return containerWidth - 50;
	}

	//获取角色权限组件
	getRoleLimitComp(item, index, indeterminate)
	{
		let {featurename, enterpriseProductFeatures, featureActions, featureid, featureFields} = item,
			featureNameWidth = this.getContainerWidth(),
			contentInfo = truncateToPop(featurename, featureNameWidth) || {};

		if(featureActions && featureActions.length)
			return <div className="limitItemComp" key={index}>
				<div className="firstFeatureNameComp">
					<Checkbox checked={indeterminate === 2}
					          indeterminate={indeterminate === 1}
					          onChange={this.handleFirstActionDos.bind(this, item)}
					>
						{
							contentInfo.show ?
								<Popover content={<div className="fieldNamePopover">{featurename}</div>}
								         placement="top">
									<span className="fieldName">{contentInfo.content}</span>
								</Popover>

								:
								<span className="fieldName">{featurename}</span>
						}
					</Checkbox>

				</div>
				<div className="featureRightComp">
					<div className="featureItemComp">
						<div className="featureNameComp">&nbsp;</div>
						{this.getActionDos(featureActions, featureFields, featureid)}
					</div>
				</div>
			</div>;

		return <div className="limitItemComp">
			<div className="firstFeatureNameComp">
				<Checkbox checked={indeterminate === 2}
				          indeterminate={indeterminate === 1}
				          onChange={this.handleFirstActionDos.bind(this, item)}>
					{
						contentInfo.show ?
							<Popover content={<div className="fieldNamePopover">{featurename}</div>} placement="top">
								<span className="fieldName">{contentInfo.content}</span>
							</Popover>
							:
							<span className="fieldName">{featurename}</span>
					}
				</Checkbox>
			</div>
			<div className="featureRightComp">{this.getFeatureComp(enterpriseProductFeatures)}</div>
		</div>;
	}

	//点击保存数据
	handleSubmit()
	{
		this.props.form.validateFieldsAndScroll((err, values) => {
			if(!err)
			{
				let {limitData, editData} = this.props,
					obj = {
						rolename: this.props.form.getFieldValue("roleName"),
						description: this.props.form.getFieldValue("roleDescription"),
						online_customer_service: limitData
					};

				if(this.props.editData)
				{
					obj.roleid = editData.roleid;
					obj.status = editData.status;

					Object.assign(editData, obj);
					this.props.sendEditorRoleManger(obj).then(result => {
                        if (result.code == 200)
                            this.handleBackToRole();
                    });
				}
				else
				{
					obj.status = 1;
					this.props.sendNewRoleManger(obj).then(result => {
                        if (result.code == 200)
                            this.handleBackToRole();
                    });
				}
			}
			else
			{
				console.log(err, values)
			}
		});
	}

    savingErrorTips(msg)
    {
        warning({
            title: getLangTxt("err_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'errorTip',
            okText: getLangTxt("sure"),
            content: msg
        });
        this.props.clearRoleErrorProgress();
    }

	render()
	{
		const {getFieldDecorator, getFieldValue} = this.props.form,
			formItemLayout = {
				labelCol: {span: 4},
				wrapperCol: {span: 16}
			};

		let {editData, limitData = [], progress, roleErrorMsg} = this.props,
			description = getFieldValue('roleDescription'),
			isCheckedAll = 1, //1==>全选
			firstIndeterminate,
			roleLimitComps = limitData.length ? limitData.map((item, index) => {
				/*获取各模块全选状态*/
				firstIndeterminate = this.getIndeterminate(item, 0);

				/*获取全部全选状态*/
				if(firstIndeterminate !== 2)
				{
					if(isCheckedAll === 1)
					{
						isCheckedAll = index > 0 ? 2 : 0;
					}
				}
				else
				{
					if(isCheckedAll === 0)
					{
						isCheckedAll = 2;
					}
				}

				return this.getRoleLimitComp(item, index, firstIndeterminate)
			}) : null;

        if(progress === LoadProgressConst.SAVING_FAILED || progress === LoadProgressConst.DUPLICATE || progress === LoadProgressConst.ROLE_LIMIT_EMPTY)
        {
            this.savingErrorTips(roleErrorMsg)
        }

		return (
			<div className="createRole clearFix">
				<div className="createRoleRight">
					<div className="operateBtn">
						<Button type="primary" className="backToRoleList"
						        onClick={this.handleSubmit.bind(this)}>{getLangTxt("save")}</Button>
						<Button type="primary" className="backToRoleList"
						        onClick={this.handleBackToRole.bind(this)}>{getLangTxt("back")}</Button>
					</div>
					<div className="createRoleScroll">
						<Form >
							<FormItem className="roleName" {...formItemLayout} label={getLangTxt("setting_role_name")} hasFeedback>
								{
									getFieldDecorator("roleName", {
										rules: [{required: true, validator: this.judgeSpace.bind(this)}],
										initialValue: editData ? editData.rolename : ""
									})(
										<Input style={{width: '50%'}} type="text"/>
									)
								}
							</FormItem>
							<FormItem className="roleDescribe" {...formItemLayout} label={getLangTxt("setting_role_des")}
							          help={getHelp(description, 100)} hasFeedback>
								{
									getFieldDecorator("roleDescription", {
										rules: [{validator: this.judgeDescripeLength.bind(this)}],
										initialValue: editData ? editData.description : ""
									})(
										<Input className="roleDescribeIpt" type="textarea"/>
									)
								}
							</FormItem>
						</Form>
						{
							limitData ? <div className="limitComp" id="createRoleScroll">
								<div className="limitItemComp">
									<div className="firstFeatureNameComp limitTitle">
										<Checkbox checked={isCheckedAll === 1} indeterminate={isCheckedAll === 2}
										          onChange={this.handleSelectAllActionDos.bind(this)}>{getLangTxt("setting_role_dos_label3")}</Checkbox>
									</div>
									<div className="featureRightComp">
										<div className="featureItemComp">
											<div className="featureNameComp limitTitle">{getLangTxt("setting_role_dos_label4")}</div>
											<div className="featureNameRight">
												<div className="ActionDosCheckBox limitTitle">{getLangTxt("setting_role_dos_label5")}</div>
												<div className="dropDownComp limitTitle">{getLangTxt("setting_role_dos_label6")}</div>
											</div>
										</div>
									</div>
								</div>
								{
									limitData ? roleLimitComps : null
								}
							</div> : null
						}
					</div>
				</div>
                {
                    getProgressComp(progress)
                }
			</div>
		)
	}
}

CreateRoleComp = Form.create()(CreateRoleComp);

function mapStateToProps(state)
{
	let {consultReducer1: consultData} = state;

	return {
		groupList: state.accountReducer.data,
		limitData: state.getRoleManger.limitData,
        progress: state.newRoleManger.progress,
        roleErrorMsg: state.newRoleManger.roleErrorMsg,
		consultData
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getRoleMangerLimitData, sendNewRoleManger, sendEditorRoleManger, getAccountGroup, getAccountList,
		getAccountGroupList, getShopGroup, clearRoleErrorProgress
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRoleComp);
