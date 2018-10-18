import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Switch, Input, Radio, Card, InputNumber, Icon, Button, message } from 'antd';
import './style/autoAnswer.scss';
import ScrollArea from 'react-scrollbar';
import { autoResponse, getResponselevel, resetAnswerProgress } from "./action/autoResponse";
import { editConfigLevel } from "../configLevel/configLevel";
import LoginEvent from "../../../apps/event/LoginEvent";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import { bglen, stringLen } from "../../../utils/StringUtils";
import { getHyperMessageForJSON, isJsonString } from "../../../utils/HyperMediaUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item,
	RadioGroup = Radio.Group;

class AutoAnswer extends Component {
	arrSetting = [
		{"name": getLangTxt("company_setting")},
		{"name": getLangTxt("users_setting")},
		{"name": getLangTxt("kf_setting")}
	];

	constructor(props)
	{
		super(props);

		this.fns = {
			0: this._getCompanySetComp.bind(this),
			1: this._getUsersSetComp.bind(this),
			2: this._getAccountSetComp.bind(this)
		};

		this.state = {};

		this._initAutoAnswer(props.responselevel);
	}

	_initAutoAnswer(responselevel = {}, level)
	{
		if(responselevel.level != this.state.isUserAnswer)
			this.setState({isUserAnswer: responselevel.level});

		responselevel.item = 2;
		responselevel.level = level;
		this._autoAnswer = responselevel;
	}

	componentDidMount()
	{
		this.props.getResponselevel();
		this.props.resetAnswerProgress()

	}

	getUseableValue(initialValue, checked)
	{
		if(initialValue)
		{
			initialValue.useable = checked ? 1 : 0;
		}
	}

	getTextAreaContent(initialValue, e)
	{
		let hyperMsgJSON = getHyperMessageForJSON(e.target.value, 11);
		initialValue && (initialValue.content = JSON.stringify(hyperMsgJSON));
		initialValue && (initialValue.msgtype = hyperMsgJSON.msgtype);
	}

	getTimeValue(initialValue, time)
	{
        try
        {
            message.destroy();
        }
        catch(e) {}
		let errorTypeName = initialValue.type == 1 ? getLangTxt("setting_autoreply_word5") : getLangTxt("setting_autoreply_word6");

		if(!time)
		{
			message.error(errorTypeName);
			initialValue && (initialValue.waitTime = 60000);
		}
		else
		{
			initialValue && (initialValue.waitTime = time * 60000);
		}
	}

	goToUserGroup()
	{
		let path = [{
			"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"
		}, {
			"title": getLangTxt("setting_users_set"), "key": "basictemplateinfo", "fns": ["basictemplateinfo"],
			"custom": true
		}];
		this.props.route(path);
	}

	_goToPersonSetting()
	{
		GlobalEvtEmitter.emit(LoginEvent.OPEN_PERSON_SETTING, {key: "3", visible: true});
	}

	onchange({target})
	{
		this.setState({index: target.value});
	}

	judgeAnswerSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 1000)
		{
			callback();
		}
		callback(getLangTxt("setting_autoreply_word7"));
	}

	judgeTimeValue(rule, value, callback)
	{
		if(value)
		{
			callback();
		}
		callback(" ");
	}

	_getCompanySetComp({greeting = {}, customerReply = {}, supplierReply = {}})
	{
		const {useable: greetUseable = 0, content: greetContent = ""} = greeting,
			{useable: customerUseable = 0, content: customerContent = "", waitTime = 60000} = customerReply,
			{useable: supplierUseable = 0, content: supplierContent = "", waitTime: supplierWaitTime = 60000} = supplierReply,
			greetJSON = isJsonString(greetContent) ? JSON.parse(greetContent) : {message: ""},
			customerJSON = isJsonString(customerContent) ? JSON.parse(customerContent) : {message: ""},
			supplierJSON = isJsonString(supplierContent) ? JSON.parse(supplierContent) : {message: ""},
			conValnum = stringLen(greetJSON.message),
			textOverValnum = stringLen(customerJSON.message),
			textWaitValnum = stringLen(supplierJSON.message),
			{getFieldDecorator} = this.props.form;

		return (
			<div className="autoAnswerWrap">
				<Card key="1" className="autoAnswerBox">
					<div className="cardTitle" style={{padding:'0px'}}>
						<FormItem className="rightSwitch" style={{float: 'left', margin:'0 5px 0px -10px'}}>
							{
								getFieldDecorator('switch', {
										valuePropName: "checked",
										initialValue: greetUseable === 1
									}
								)(<Switch onChange={this.getUseableValue.bind(this, greeting)}/>)
							}
						</FormItem>
						{getLangTxt("setting_autoreply_welcome")}
					</div>

					<FormItem className="cardContent">
						{
							getFieldDecorator('textarea', {
								initialValue: greetJSON.message,
								rules: [{validator: this.judgeAnswerSpace.bind(this)}]
							})(
								<Input type="textarea" className="cardTextarea"
								       onChange={this.getTextAreaContent.bind(this, greeting)}/>
							)
						}
					</FormItem>
					<p className="wordNum">{conValnum} / 500</p>
				</Card>

				<Card key="2" className="autoAnswerBox">
					<div className="cardTitle" style={{padding:'0px'}}>
						<FormItem style={{float: 'left', margin:'0 5px 0px -10px'}}>
							{
								getFieldDecorator('title', {
										valuePropName: "checked",
										initialValue: customerUseable === 1
									}
								)(<Switch onChange={this.getUseableValue.bind(this, customerReply)}/>)
							}
						</FormItem>
						{getLangTxt("setting_autoreply_word1")}
						{
							<FormItem className="iptNumberCls" style={{display: "inline-block"}}>
								{
									getFieldDecorator('time', {
										initialValue: waitTime / 60000,
										rules: [{validator: this.judgeTimeValue.bind(this)}]
									})(
										<InputNumber className="numberRange" min={0}
                                                     precision={0}
										             onChange={this.getTimeValue.bind(this, customerReply)}/>
									)
								}
							</FormItem>
						}
						{getLangTxt("setting_autoreply_word8")}
					</div>

					<FormItem className="answerTextArea">
						{
							getFieldDecorator('textover', {
								initialValue: customerJSON.message,
								rules: [{validator: this.judgeAnswerSpace.bind(this)}]
							})(
								<Input onChange={this.getTextAreaContent.bind(this, customerReply)} type="textarea"
								       className="cardTextarea"/>
							)
						}
					</FormItem>
					<p className="wordNum">{textOverValnum} / 500</p>
				</Card>

				<Card key="3" className="autoAnswerBox">
					<div className="cardTitle" style={{padding:'0px'}}>
					<FormItem style={{float: 'left', margin:'0 5px 0px -10px'}}>
							{
								getFieldDecorator('titles', {
									valuePropName: "checked", initialValue: supplierUseable === 1
								})(
									<Switch onChange={this.getUseableValue.bind(this, supplierReply)}/>
								)
							}
						</FormItem>
						{getLangTxt("setting_autoreply_word3")}
						{
							<FormItem className="iptNumberCls" style={{display: "inline-block"}}>
								{getFieldDecorator('timeover', {
									initialValue: supplierWaitTime / 60000,
									rules: [{validator: this.judgeTimeValue.bind(this)}]
								})(
									<InputNumber min={0} precision={0} onChange={this.getTimeValue.bind(this, supplierReply)}
									             className="numberRange"/>
								)}
							</FormItem>
						}
						{getLangTxt("setting_autoreply_word8")}
					</div>

					<FormItem className="answerTextArea">
						{
							getFieldDecorator('text', {
								initialValue: supplierJSON.message,
								rules: [{validator: this.judgeAnswerSpace.bind(this)}]
							})(
								<Input onChange={this.getTextAreaContent.bind(this, supplierReply)} type="textarea"
								       className="cardTextarea"/>)
						}
					</FormItem>

					<p className="wordNum">{textWaitValnum} / 500</p>
				</Card>
			</div>
		)
	}

	_getUsersSetComp()
	{
		return (<p className="usersSetCompWrapper">
			<Icon className="autoAnswerConfigure" type="exclamation-circle-o"
			      style={{fontSize: '0.18rem', marginRight: 11, position: 'relative', top: '6'}}/>
			<span>{getLangTxt("note1")}</span>
			<span className="autoAnswerConfigure" onClick={this.goToUserGroup.bind(this)}
			      style={{cursor: "pointer"}}>{getLangTxt("note2")}</span>
			<span>{getLangTxt("note3")}</span>
		</p>);
	}

	_getAccountSetComp()
	{
		let {isUserAnswer} = this.state,
            {switcher = []} = this.props;

		if(isUserAnswer == 2 && switcher.includes("answer"))
			return (<p className="usersSetCompWrapper">
				<Icon className="autoAnswerConfigure" type="exclamation-circle-o"
				      style={{fontSize: '0.18rem', marginRight: 11, position: 'relative', top: '6'}}/>
				<span>{getLangTxt("note1")}</span>
				<span className="autoAnswerConfigure" onClick={this._goToPersonSetting.bind(this)}
				      style={{cursor: "pointer"}}>{getLangTxt("personal_note6")}</span>
				<span>{getLangTxt("note3")}</span>
			</p>);
		return null;
	}

	handleSubmit()
	{
		let {form} = this.props;

		form.validateFields((errors) => {
			if(errors)
				return false;
			let answerData = {
				autoReply: this._autoAnswer
			};
			this.props.autoResponse(answerData);

			this.props.editConfigLevel({item: 2, level: this._autoAnswer.level});

			this.setState({isUserAnswer: this._autoAnswer.level})
		})
	}

	render()
	{
		let {responselevel = initResponselevel, progress} = this.props,
			{level = 0} = responselevel,
			checkedIndex = this.state.index === undefined ? level : this.state.index,
			className = this.props.noPadding ? "answer nopadding" : "answer";

		this._initAutoAnswer(responselevel, checkedIndex);

		return (
			<div className={className}>
				<ScrollArea speed={1} horizontal={false} style={{height: "100%"}} smoothScrolling>
					<Form>
						<p className="settingRange">{getLangTxt("setting_autoreply_range")}</p>

						<div className="settingRange">
							<RadioGroup onChange={this.onchange.bind(this)} value={checkedIndex}>
								{
									this.arrSetting.map((item, index) => {
											return (
												<Radio key={index} value={index}>
													{
														item.name
													}
												</Radio>
											)
										}
									)
								}
							</RadioGroup>
						</div>
						{
							this.fns[checkedIndex](responselevel)
						}
					</Form>
				</ScrollArea>

				<div className="company-footer">
					<Button onClick={this.handleSubmit.bind(this)} className="primary"
					        type="primary">{getLangTxt("sure")}</Button>
				</div>
			</div>
		)
	}
}

let initResponselevel = {
	item: 2,
	level: 1,
	ustomerReply: {
		useable: 1,
		waitTime: 0,
		content: ""
	},
	greeting: {
		useable: 1,
		waitTime: 0,
		content: ""
	},
	supplierReply: {
		useable: 1,
		waitTime: 0,
		content: ""
	}
};

AutoAnswer = Form.create()(AutoAnswer);

function mapStateToProps(state)
{
    let {startUpData, personalReducer} = state,
        switcher = startUpData.get("personal") || [];

	return {
		responselevel: state.getResponselevel.data,
		progress: state.autoresponse.progress,
        switcher
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getResponselevel, editConfigLevel, autoResponse, resetAnswerProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoAnswer);
