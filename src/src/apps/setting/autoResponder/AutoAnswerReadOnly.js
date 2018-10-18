import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Switch, Input, Radio, Card, InputNumber, Icon, Button } from 'antd';
import './style/autoAnswer.scss';
import ScrollArea from 'react-scrollbar';
import { getResponselevel, resetAnswerProgress } from "./action/autoResponse";
import LoginEvent from "../../../apps/event/LoginEvent";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import { bglen, stringLen } from "../../../utils/StringUtils";
import { isJsonString } from "../../../utils/HyperMediaUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item,
	RadioGroup = Radio.Group;

class AutoAnswerReadOnly extends Component {
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
		responselevel.item = 2;
		responselevel.level = level;
		this._autoAnswer = responselevel;
	}

	componentDidMount()
	{
		this.props.getResponselevel();
		this.props.resetAnswerProgress()

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
					<div className="cardTitle">{getLangTxt("setting_autoreply_welcome")}
						<FormItem className="rightSwitch">
							{
								getFieldDecorator('switch', {
										valuePropName: "checked",
										initialValue: greetUseable === 1
									}
								)(<Switch disabled/>)
							}
						</FormItem>
					</div>

					<FormItem className="cardContent">
						{
							getFieldDecorator('textarea', {
								initialValue: greetJSON.message
							})(
								<Input disabled type="textarea" className="cardTextarea"/>
							)
						}
					</FormItem>
					<p className="wordNum">{conValnum} / 500</p>
				</Card>

				<Card key="2" className="autoAnswerBox">
					<div className="cardTitle">{getLangTxt("setting_autoreply_word1")}
						{
							<FormItem style={{display: "inline-block"}}>
								{
									getFieldDecorator('time', {
										initialValue: waitTime / 60000
									})(
										<InputNumber disabled className="numberRange" min={1}/>
									)
								}
							</FormItem>
						}
						{getLangTxt("setting_autoreply_word8")}

						<FormItem style={{float: 'right'}}>
							{
								getFieldDecorator('title', {
										valuePropName: "checked",
										initialValue: customerUseable === 1
									}
								)(<Switch disabled/>)
							}
						</FormItem>
					</div>

					<FormItem className="answerTextArea">
						{
							getFieldDecorator('textover', {
								initialValue: customerJSON.message
							})(
								<Input disabled type="textarea"
								       className="cardTextarea"/>
							)
						}
					</FormItem>
					<p className="wordNum">{textOverValnum} / 500</p>
				</Card>

				<Card key="3" className="autoAnswerBox">
					<div className="cardTitle">{getLangTxt("setting_autoreply_word3")}
						{
							<FormItem style={{display: "inline-block"}}>
								{getFieldDecorator('timeover', {initialValue: supplierWaitTime / 60000})(
									<InputNumber min={1} disabled className="numberRange"
									/>
								)}
							</FormItem>
						}
						{getLangTxt("setting_autoreply_word8")}
						<FormItem style={{float: 'right'}}>
							{
								getFieldDecorator('titles', {
									valuePropName: "checked", initialValue: supplierUseable === 1
								})(
									<Switch disabled/>
								)
							}
						</FormItem>
					</div>

					<FormItem className="answerTextArea">
						{
							getFieldDecorator('text', {
								initialValue: supplierJSON.message
							})(
								<Input disabled type="textarea" className="cardTextarea"/>)
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
        let {switcher = []} = this.props;

        if(switcher.includes("answer"))
            return (<p className="usersSetCompWrapper">
                <Icon className="autoAnswerConfigure" type="exclamation-circle-o"
                      style={{fontSize: '0.18rem', marginRight: 11, position: 'relative', top: '6'}}/>
                <span>{getLangTxt("note1")}</span>
                <span className="autoAnswerConfigure" onClick={this._goToPersonSetting.bind(this)}
                      style={{cursor: "pointer"}}>{getLangTxt("personal_note6")}</span>npm 
                <span>{getLangTxt("note3")}</span>
            </p>);
        
        return null;
	}

    onchange({target})
    {
        this.setState({index: target.value});
    }

	render()
	{
		let {responselevel = initResponselevel, progress} = this.props,
			{level = 0} = responselevel,
			checkedIndex = this.state.index === undefined ? level : this.state.index;
		this._initAutoAnswer(responselevel, checkedIndex);

		return (
			<div className="answer">
				<ScrollArea speed={1} horizontal={false} style={{height: "100%"}} smoothScrolling>
					<Form>
						<p className="settingRange">{getLangTxt("setting_autoreply_range")}</p>

						<div className="settingRange">
							<RadioGroup value={checkedIndex} onChange={this.onchange.bind(this)} >
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
					<Button disabled className="primary" type="primary">{getLangTxt("sure")}</Button>
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

AutoAnswerReadOnly = Form.create()(AutoAnswerReadOnly);

function mapStateToProps(state)
{
	return {
		responselevel: state.getResponselevel.data,
		progress: state.autoresponse.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getResponselevel, resetAnswerProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoAnswerReadOnly);
