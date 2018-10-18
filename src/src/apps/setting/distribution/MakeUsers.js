import React, { PropTypes } from 'react';
import { Steps, Button, Input, Form, message, Modal } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UserFilterList from './UserFilterList';
import { editorCurstem, makeUsers, getType, getdata, clearUserMsg, checkoutExist } from './action/distribute';
import './style/makeUsers.scss';
import { bglen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const Step = Steps.Step, FormItem = Form.Item;

class MakeUsers extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {show: false, userFilterList: []}
	}

	componentDidMount()
	{
		this.props.getType();
	}

	getUserFilterList(data)
	{
		this.setState({userFilterList: data});
	}

	//校验筛选条件输入合法性
	validateRuleValue(rules)
	{
		let reUrl01 = /[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/,
			keyWordReg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
			isNext = true;
		if(rules.length > 0)
			rules.forEach(item => {
				if(item.ruleKey === "referer" || item.ruleKey === "landingpage")
				{
					if(!reUrl01.test(item.ruleValue[0]))
						isNext = false
				}
				else if(item.ruleKey === "keyword")
				{
					if(!(item.ruleValue[0] && (item.ruleValue[0].trim() != "") && (!keyWordReg.test(item.ruleValue[0]))))
						isNext = false
				}
				else if(item.ruleValue && item.ruleValue.length < 1)
				{
					isNext = false
				}
			});
		return isNext;
	}

	nextMethod()
	{
		let obj = {}, {userFilterList} = this.state, matchRules = [],
			name = this.props.form.getFieldValue("username"),
			{form} = this.props,
			isNext;

		userFilterList && userFilterList.map((item) => {
			if(item.type != "")
			{
				let rulesItem = {
					"ruleKey": item.type,
					"ruleValue": item.value,
					"ruleChar": item.include
				};
				matchRules.push(rulesItem);
			}
		});

		isNext = this.validateRuleValue(matchRules);

        try
        {
            message.destroy();
        }
        catch(e) {}

		if(!isNext)
		{
			message.error(getLangTxt("setting_distribution_tip13"));
			return false;
		}

		form.validateFieldsAndScroll((errors) => {
			if(errors)
				return false;

			let nextPage = {usershow: false, TypeShow: false, customerShow: true};
			if(name.trim() != "")
			{
				if(this.props.link == "new")
				{
					obj.name = name;
					obj.matchRules = matchRules;
					obj.allocationName = getLangTxt("setting_distribution_default");
					obj.allocation = 'F-L-B-R';
					this.checkoutExist(name, obj, nextPage)
				}
				else if(this.props.link == "editor")
				{
					obj.name = name;
					obj.matchRules = matchRules;
					obj.templateid = this.props.id;
                    this.checkoutExist(name, obj, nextPage)
				}
			}
		});
	}

	checkoutExist(name, obj, nextPage)
	{
        let {users, link} = this.props,
            {name: editName} = users,
            isEdit = link === "editor";

        if (!(isEdit && editName == name))
        {
            checkoutExist(name)
                .then(exist => {
                    if(exist)
                    {
                        Modal.error({
                            title: getLangTxt("tip"),
                            iconType: 'exclamation-circle',
                            className: 'errorTip',
                            content: <div>{getLangTxt("setting_distribution_tip1")}</div>,
                            width: '320px',
                            okText: getLangTxt("sure")
                        });
                        //已存在
                        return;
                    }
                    this.props.getShowPage(obj, nextPage);
                })
        }else
        {
            this.props.getShowPage(obj, nextPage);
        }
	}

	error(data)
	{
		message.error(data);
	}

	submit()
	{
		let {users} = this.props,
			name = this.props.form.getFieldValue("username"), {userFilterList} = this.state, matchRules = [],
			isNext,
            copyUserInfo = {...users};

		let {form} = this.props;

		userFilterList && userFilterList.map((item) => {
			if(item.type != "")
			{
				let rulesItem = {
					"ruleKey": item.type,
					"ruleValue": item.value,
					"ruleChar": item.include
				};
				matchRules.push(rulesItem);
			}
		});

		isNext = this.validateRuleValue(matchRules);

        try
        {
            message.destroy();
        }
        catch(e) {}

		if(!isNext)
		{
			message.error(getLangTxt("setting_distribution_tip13"));
			return false;
		}

		form.validateFieldsAndScroll((errors) => {
			if(errors)
				return false;
			if(name.trim() != "")
			{
				if(this.props.link == "new")
				{
					let obj = {};
					obj.name = name;
					obj.matchRules = matchRules;
					obj.allocationName = getLangTxt("setting_distribution_default");
					obj.allocation = 'F-L-B-R';
					obj.filterType = 0;
					delete copyUserInfo.status;

					this.checkoutSavingExist(name, obj)
				}
				else if(this.props.link == "editor")
				{
                    copyUserInfo.name = name;
                    copyUserInfo.matchRules = matchRules;
                    copyUserInfo.templateid = this.props.id;

					delete copyUserInfo.status;

                    this.checkoutSavingExist(name, copyUserInfo)
				}
			}
		});
	}

    checkoutSavingExist(name, obj)
    {
        let {users, link} = this.props,
            {name: editName} = users,
            isEdit = link === "editor";

        if (!(isEdit && editName == name))
        {
            checkoutExist(name)
                .then(exist => {
                    if(exist)
                    {
                        Modal.error({
                            title: getLangTxt("tip"),
                            iconType: 'exclamation-circle',
                            className: 'errorTip',
                            content: <div>{getLangTxt("setting_distribution_tip1")}</div>,
                            width: '320px',
                            okText: getLangTxt("sure")
                        });
                        //已存在
                        return;
                    }
                    if (isEdit)
                    {
                        this.props.editorCurstem(obj);
                        this.props.clearUserMsg();
                        this.props.getShowPage("close");
                    }else
                    {
                        this.props.makeUsers(obj);
                        this.props.getShowPage("close");
                    }
                })
        }else
        {
            if (isEdit)
            {
                this.props.editorCurstem(obj);
                this.props.clearUserMsg();
                this.props.getShowPage("close");
            }else
            {
                this.props.makeUsers(obj);
                this.props.getShowPage("close");
            }
        }


    }

	judgeSpace(rule, value, callback)
	{
		let keyWordReg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
		if(value && value.trim() !== "" && bglen(value) <= 200 && !keyWordReg.test(value))
		{
			callback();
		}
		callback(getLangTxt("setting_distribution_tip14"));
	}

	closeClick()
	{
		this.props.getPreserve();
	}

	render()
	{
		let users,
			{getFieldDecorator} = this.props.form,
			style = {position: "relative", top: "6px"};

		this.props.link == "editor" ? users = this.props.users : users = null;

		return (
			<div className='makeusers'>
				<Steps className="makeusers-steps" current={0}>
					<Step title={getLangTxt("setting_distribution_define_group")}/>
					<Step title={getLangTxt("setting_distribution_define_group1")}/>
					<Step title={getLangTxt("setting_distribution_rules")}/>
				</Steps>

				<div className="makeusersScroll">
					<div className='makeusers-body'>
						<div className="user-group-name">
							<span className='makeusers-body-names'
							      style={style}>{getLangTxt("setting_users_name")}</span>
							<Form className="usergroup-form-display">
								<FormItem className="usergroup-form-display">
									{
										getFieldDecorator("username",
											{
												initialValue: users ? users.name : "",
												rules: [{validator: this.judgeSpace.bind(this)}]
											}
										)
										(<Input className="usergroup-name-ipt"/>)
									}
								</FormItem>
							</Form>
						</div>
						<span className='makeusers-body-names'>{getLangTxt("screening_users")}</span>
						<UserFilterList link={this.props.link} users={users}
						                getUserFilterList={this.getUserFilterList.bind(this)}/>
					</div>
				</div>

				<div className="makeUserButtonBox clearFix">
					<Button className="ghost next" type="ghost"
					        onClick={this.nextMethod.bind(this)}>{getLangTxt("next_step")}</Button>
					<Button className="primary" type="primary"
					        onClick={this.submit.bind(this)}>{getLangTxt("save")}</Button>
					<Button className="ghost" type="ghost"
					        onClick={this.closeClick.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>

			</div>
		)
	}
}

MakeUsers = Form.create()(MakeUsers);

function mapStateToProps(state)
{
	return {
		dataType: state.getStrategy.data,
		data: state.getDatas.data
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({makeUsers, editorCurstem, getType, getdata, clearUserMsg}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MakeUsers);
