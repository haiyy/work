import React from 'react';
import { Form, Select, TreeSelect, Input, message } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import EditorAccount from './EditorAccount';
import { getlListData, getNewUserInfo, getUserInfo, createUser, editUser, getUserType, getUserSkillTag } from './accountAction/sessionLabel';
import './style/newCreateAccount.scss';
import NTModal from "../../../components/NTModal";
import { bglen, stringLen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item;
const Option = Select.Option;
let onLine = null;

const TreeNode = TreeSelect.TreeNode;

class CreateAccount extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			inputValue: null,
			groupList: null,
			nameBlur: null,
			external: null,
			internal: null,
			password: null,
			onLine: null,
			judgePasswordLength: false,
			isPassWordSame: false,
			notChangePassword: true,
			usertype: null
		};
	}

	componentDidMount()
	{
		if(this.props.title == getLangTxt("setting_account_edit"))
		{
			let userid = this.props.userid ? this.props.userid : "";
			this.props.getUserInfo(userid);
		}
	}

	handlePasswordBlur(e)
	{
		const value = e.target.value;
		if((value.length > 0 && value.length < 6) || value.length > 20)
		{
			this.setState({notChangePassword: false});
			this.setState({judgePasswordLength: false})
		}
		else if(value == "")
		{
			this.setState({password: null, notChangePassword: true})
		}
		else
		{
			this.setState({password: value, notChangePassword: false});
			this.setState({judgePasswordLength: true})
		}
	}

	checkPassword(rule, value, callback)
	{
		const form = this.props.form;
		if(value && value !== form.getFieldValue('password'))
		{
			callback(' ');
			this.setState({isPassWordSame: false})
		}
		else
		{
			this.setState({isPassWordSame: true});
			callback();
		}
	}

	checkConfirm(rule, value, callback)
	{
		const form = this.props.form;
		if(value && this.state.passwordDirty)
		{
			form.validateFields(['confirm'], {force: true});
		}
		callback();
	}

	nameBlur(e)
	{
		let value = e.target.value;

		this.setState({nameBlur: value})
	}

	external(e)
	{
		const value = e.target.value;
		this.setState({external: value})
	}

	internal(e)
	{
		const value = e.target.value;
		this.setState({internal: value})
	}

	getDate(data)
	{
		onLine = data;
	}

	error(name)
	{
		message.error(name);
	}

	success(name)
	{
		message.success(name);
	}

	newHandleOk()
	{
		let roleChoice = this.props.form.getFieldValue("role"),
			userSkillTagValue = this.props.form.getFieldValue("skillTag");

		this.props.form.validateFields((err) => {
			if(!err)
			{
				if(this.props.title == getLangTxt("setting_account_add"))
				{
					let newData = {
						roleid: roleChoice,
						usertype: this.state.usertype != null ? this.state.usertype : 0,
						tagid: userSkillTagValue,
						groupid: this.state.groupList || this.props.state.groupid,
						username: this.state.nameBlur,
						nickname: this.state.internal,
						externalname: this.state.external,
						expans: [
							{
								appid: "nt-dolphin",
								attribute: {
									/*maxConversationNum: onLine ? onLine.selectValue : 2000,*/
									maxConcurrentConversationNum: onLine ? onLine.inputValue : 8
								}
							}
						]
						/*tags: onLine.treeValue*/
					};
					if(newData.usertype != 1)
					{
						newData.password = this.state.password
					}

					this.props.createUser(newData);
					this.props.changeState();

				}
				else if(this.props.title == getLangTxt("setting_account_edit"))  //后台修改数据格式   获取编辑数据与提交编辑数据格式不同
				{
					let state = this.props.editData;

					let editData = {
						usertype: this.state.usertype != null ? this.state.usertype : state.usertype,
						roleid: roleChoice,
						tagid: userSkillTagValue,
						groupid: this.state.groupList || (state ? state.group.groupid : ""),
						username: this.state.nameBlur || (state ? state.username : ""),
						nickname: this.state.internal || (state ? state.nickname : ""),
						externalname: this.state.external || (state ? state.externalname : ""),
						expans: [
							{
								appid: "nt-dolphin",
								attribute: {
									/*maxConversationNum: onLine ? onLine.selectValue : 2000,*/
									maxConcurrentConversationNum: onLine ? onLine.inputValue : 8
								}
							}
						],
						userid: state.userid ? state.userid : ""
					};

					Object.assign(state, editData);

					delete state.group;
					delete state.role;
					delete state.tag;

					if(this.state.notChangePassword)
					{
						delete state.password;
						this.props.editUser(state);
						this.props.changeState();
					}
					else if(!this.state.notChangePassword)
					{
						state.password = this.state.password;

						this.props.editUser(state);
						this.props.changeState();
					}
				}
			}
			else
			{
				this.props.failState();
			}
		});

	}

	_getTreeNode(treeData, selectedId)
	{
		if(treeData)
			return treeData.map(item => {
				let {groupid, groupname} = item;
				groupid = String(groupid);

				if(item.children && item.children.length > 0)
				{
					return (
						<TreeNode value={groupid} title={groupname} key={groupid}>
							{
								this._getTreeNode(item.children, selectedId)
							}
						</TreeNode>
					);
				}
				return <TreeNode value={groupid} title={groupname} key={groupid}/>;
			});
	}

	_onTreeChange(value)
	{
		let obj = {
			groupid: value,
			page: 1,
			size: 10
		};
		this.props.getCurrentGroup(value);
		this.props.getlListData(obj);
		this.setState({groupList: value});
	}

	handleCancel()
	{
		this.props.handleCancel()
	}

	getRoleId(selectedRole)
	{
		let roleIds = [];
		selectedRole && selectedRole.map(item => {
			roleIds.push(item.roleid);
		});

		return roleIds;
	}

	getTagId(selectedTag)
	{
		let tagIds = [];
		selectedTag && selectedTag.map(item => {
			tagIds.push(item.tagid);
		});

		return tagIds;
	}

	judgeSpace(rule, value, callback)
	{
		// let accountNameRe = /^\w{1,16}$/;

		if(value && value.trim() !== "" && bglen(value) <= 32)
		{
			callback();
		}
		callback(getLangTxt("setting_account_note12"));
	}

	judgeShowNameSpace(rule, value, callback)
	{
		let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

		if(value && value.trim() !== "" && accountNameRe.test(value) && bglen(value) <= 32)
		{
			callback();
		}
		callback(" ");
	}

	getUserTypeNum(value)
	{
		this.setState({
			usertype: value
		})
	}

    getIsPasswordComp(getFieldDecorator, formItemLayout, title, userNameCount, externalNameCount, username, judgeUserType, usertype)
    {

        let accountNameItem = !title ? [<FormItem {...formItemLayout} label={getLangTxt("setting_account")}
            help={!title ? userNameCount + "/16" : ""}>
            {
                getFieldDecorator('name', {
                    initialValue: "",
                    rules: [{validator: this.judgeSpace.bind(this)}]
                })(
                    <Input onKeyUp={this.nameBlur.bind(this)}/>
                )
            }
        </FormItem>] : [],
            accountNameUnedit = [<FormItem {...formItemLayout} label={getLangTxt("setting_account")}
                help={!title ? externalNameCount + "/16" : ""}>
                {
                    <span>{username || ""}</span>
                }
            </FormItem>],
            accountPasswordItem = judgeUserType == 0 ? [
                <FormItem {...formItemLayout} label={getLangTxt("setting_account_pwd1")}
                    help={getLangTxt("personalset_pwd_note")}>
                    {
                        getFieldDecorator('password', !title || title && usertype != 0 && this.state.usertype != null && judgeUserType != 1 ? {
                            rules: [{
                                required: true, min: 6, max: 20, message: getLangTxt("passWordTip")
                            }, {validator: this.checkConfirm.bind(this)}]
                        }
                            :
                        {
                            rules: [{min: 6, max: 20, message: getLangTxt("passWordTip")},
                                {validator: this.checkConfirm.bind(this)}]
                        })(
                            <Input type="password" onBlur={this.handlePasswordBlur.bind(this)}/>
                        )
                    }
                </FormItem>,
                <FormItem className="passwordConfirm" {...formItemLayout}
                    label={getLangTxt("setting_account_pwd2")}
                    help={getLangTxt("setting_account_pwd2_note")} hasFeedback>
                    {
                        getFieldDecorator('confirm', !title || title && usertype != 0 && this.state.usertype != null && judgeUserType != 1 ? {
                            rules: [{
                                required: true, min: 6, max: 20,
                                message: getLangTxt("setting_account_note17")
                            }, {validator: this.checkPassword.bind(this)}]
                        } : {
                            rules: [{
                                min: 6, max: 20, message: getLangTxt("setting_account_note17")
                            }, {validator: this.checkPassword.bind(this)}]
                        })(
                            <Input type="password"/>
                        )
                    }
                </FormItem>
            ] : [],
            finalComp = [];

        if (judgeUserType == 1)
        {
            if (title)
            {
                finalComp = accountNameUnedit;
            }
            else
            {
                finalComp = accountNameItem;
            }
        }
        else
        {
            if (title)
            {
                finalComp = accountNameUnedit.concat(accountPasswordItem);
            }
            else
            {
                finalComp = accountNameItem.concat(accountPasswordItem);
            }
        }

        return finalComp
    }

	render()
	{
		let {
				form: {getFieldDecorator, getFieldValue},
				formItemLayout = {labelCol: {span: 4}, wrapperCol: {span: 9}},
				groupData/*: {data = []}*/,
				editData = {},
				roleDatas,
				userTypes,
				userSkillTag
			} = this.props,
			{roleid = [], tagid = [], externalname = "", nickname = "", username = "", usertype = "", expans, group = {groupid: ""}, tag = [], role = []} = editData,
			{groupid = ""} = group || {},
			title = this.props.title == getLangTxt("setting_account_edit"),
			selectUserTYpe = "",
			selectRoleData = [],
			selectuserSkillTag = [],
			userNameCount = 0, externalNameCount = 0, internalNameCount = 0;

		if(title)
		{
			userNameCount = this.state.nameBlur ? getFieldValue("name") && stringLen(getFieldValue("name")) || 0 : stringLen(username);
			externalNameCount = this.state.external ? getFieldValue("external-name") && stringLen(getFieldValue("external-name")) || 0 : stringLen(externalname);
			internalNameCount = this.state.internal ? getFieldValue("internal-name") && stringLen(getFieldValue("internal-name")) || 0 : stringLen(nickname);
		}
		else
		{
			userNameCount = this.state.nameBlur ? getFieldValue("name") && stringLen(getFieldValue("name")) : 0;
			externalNameCount = this.state.external ? getFieldValue("external-name") && stringLen(getFieldValue("external-name")) : 0;
			internalNameCount = this.state.internal ? getFieldValue("internal-name") && stringLen(getFieldValue("internal-name")) : 0;
		}

		if(title)
		{
			selectUserTYpe = usertype;
			selectRoleData = this.getRoleId(role) || [];
			selectuserSkillTag = this.getTagId(tag) || [];
		}

		let judgeUserType = title ? (this.state.usertype !== null ? this.state.usertype : usertype) : this.state.usertype || 0;

		return (
			<NTModal title={this.props.title} visible={true} onOk={this.newHandleOk.bind(this)} width='5.7rem'
			         onCancel={this.handleCancel.bind(this)} okText={getLangTxt("sure")} cancelText={getLangTxt("cancel")}
			         wrapClassName="accountRight scrollAreaStyle">
				<div className="accountListScroll" id="scrollArea">
					<Form hideRequiredMark={true}>
						<p className="createAccountHeader">{getLangTxt("setting_account_details")}</p>
						<FormItem {...formItemLayout} label={getLangTxt("setting_account_character")}>
							{
								getFieldDecorator('selectGroup', {
									initialValue: selectUserTYpe.toString(),
									rules: [{required: true, message: getLangTxt("setting_account_note13")}]
								})(
									<Select
										getPopupContainer={() => document.getElementById('scrollArea')}
										onChange={this.getUserTypeNum.bind(this)}
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

						<FormItem {...formItemLayout} label={getLangTxt("setting_account_role")}>
							{
								getFieldDecorator('role',
									{
										initialValue: selectRoleData || [],
										rules: [{required: true, message: getLangTxt("setting_account_note14")}]
									})(
									<Select showSearch optionFilterProp="children" mode="multiple"
									        getPopupContainer={() => document.getElementById('scrollArea')}>
										{
											roleDatas && roleDatas.map((item) => {
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
						<FormItem {...formItemLayout} label={getLangTxt("setting_account_group")}>
							{
								getFieldDecorator('group', {
									initialValue: title ? groupid : "",
									rules: [{required: true, message: getLangTxt("setting_account_note15")}]
								})(
									<TreeSelect
										dropdownStyle={{maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'}}
										onChange={this._onTreeChange.bind(this)}
										getPopupContainer={() => document.getElementById('scrollArea')}
									>
										{
											this._getTreeNode(groupData)
										}
									</TreeSelect>
								)
							}
						</FormItem>
						<FormItem {...formItemLayout} label={getLangTxt("setting_account_internal_name")}
						          help={internalNameCount + "/16"}>
							{
								getFieldDecorator('internal-name', {
									initialValue: title ? nickname : "",
									rules: [{validator: this.judgeShowNameSpace.bind(this)}]
								})(
									<Input onKeyUp={this.internal.bind(this)}/>
								)
							}
						</FormItem>
						<FormItem {...formItemLayout} label={getLangTxt("setting_account_external_name")}
						          help={externalNameCount + "/16"}>
							{
								getFieldDecorator('external-name', {
									initialValue: title ? externalname : "",
									rules: [{validator: this.judgeShowNameSpace.bind(this)}]
								})(
									<Input onKeyUp={this.external.bind(this)}/>
								)
							}
						</FormItem>
						<FormItem {...formItemLayout} label={getLangTxt("setting_account_skilltag")}>
							{
								getFieldDecorator('skillTag',
									{
										initialValue: selectuserSkillTag,
										rules: [{required: true, message: getLangTxt("setting_account_note16")}]
									})(
									<Select showSearch optionFilterProp="children" mode="multiple"
									        getPopupContainer={() => document.getElementById('scrollArea')}>
										{
											userSkillTag && userSkillTag.map((item) => {
												return (
													<Option key={item.tagid} value={item.tagid}>{item.tagname}</Option>
												)
											})
										}
									</Select>
								)
							}
						</FormItem>
							<div>
                                <p className="createAccountHeader">{getLangTxt("setting_account_settings")}</p>
                                {this.getIsPasswordComp(getFieldDecorator, formItemLayout, title, userNameCount, externalNameCount, username, judgeUserType, usertype)}
							</div>

						<EditorAccount FormItem={FormItem} title={this.props.title} _this={this}
						               getFieldDecorator={getFieldDecorator}
						               getDate={this.getDate.bind(this)}
						               userMsg={editData ? expans : []}/>
					</Form>
				</div>
			</NTModal>
		)
	}
}

CreateAccount = Form.create()(CreateAccount);

function mapStateToProps(state)
{
	return {
		roleDatas: state.getRoleList.data,
		roleLoadProgress: state.getRoleList.progress,
		userTypes: state.getUserType.data,
		userTypeLoadProgress: state.getUserType.progress,
		editData: state.getEditData.data || {},
		editDataProgress: state.getEditData.progress,
		groupData: state.accountReducer.data || [],
		progress: state.getAccountList.progress,
		userSkillTag: state.getUserSkillTag.data
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({ createUser, getUserInfo, editUser, getlListData
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount)
