import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Switch, Input, Button, Icon } from 'antd';
import { getAutowelcomelevel, autoResponseGreet, resetAnswerProgress } from "./action/autoResponse";
import { editConfigLevel } from "../configLevel/configLevel";
import ConfigItemsLevel from "../../../model/vo/ConfigItemsLevel";
import { Map } from "immutable";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import { getHyperMessageForJSON, isJsonString } from "../../../utils/HyperMediaUtils";

const FormItem = Form.Item;

class AutoGreetings extends Component {
	
	arrSetting = [
		{"name": getLangTxt("company_setting")},
		{"name": getLangTxt("users_setting")}
	];
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			isUpdate: false
		}
	}
	
	_onGreetChange(checked)
	{
		let useable = checked ? 1 : 0;
		
		this._autoGreet.useable = useable;
	}
	
	_onLevelChange(index, checked)
	{
		let level = index;
		
		if(!checked)
			level = level === 0 ? 1 : 0;
		
		this._autoGreet.level = level;
		this.setState({isUpdate: !this.state.isUpdate});
		// this.props.editConfigLevel({item: 1, level});
	}
	
	getTextarea(e)
	{
		let hyperMsgJSON = getHyperMessageForJSON(e.target.value, 11);
		
		this._autoGreet.content = JSON.stringify(hyperMsgJSON);
		this._autoGreet.msgtype = hyperMsgJSON.msgtype;
	}
	
	goToUserGroup()
	{
		let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"},
			{
				"title": getLangTxt("setting_users_set"), "key": "basictemplateinfo", "fns": ["basictemplateinfo"],
				"custom": true
			}];
		this.props.route(path);
	}
	
	_getConfigLevel()
	{
		let {getConfigLevel = Map()} = this.props;
		let configLevel = getConfigLevel.get(ConfigItemsLevel.Welcome);
		
		configLevel = configLevel === undefined ? 0 : configLevel;
		
		return configLevel;
	}
	
	_getConfigProgress()
	{
		let {getConfigLevel = Map()} = this.props;
		let configProgress = getConfigLevel.get("progress");
		
		return configProgress;
	}
	
	_getWelcomeComp(level = 0)
	{
		const formItemLayout = {
			labelCol: {span: 12},
			wrapperCol: {span: 12}
		};
		
		return this.arrSetting.map((item, index) =>
			<span key={index} style={{marginRight: "30px"}}>
				<div style={{position: 'relative', display: "inline-block", paddingRight: "60px"}}>{item.name}
					<FormItem style={{
						display: "inline-block", position: "absolute", top: "-8px", right: "-25px"
					}} {...formItemLayout}>
					    <Switch checked={level == index}
					            onChange={this._onLevelChange.bind(this, index)}/>
			        </FormItem>
		        </div>
            </span>
		);
	}
	
	_getUsersComp()
	{
		return (
			<p className="usersPWrapper">
				<Icon type="exclamation-circle-o"
				      style={{fontSize: '0.18rem', marginRight: 11, position: 'relative', top: '6'}}/>
				<span>{getLangTxt("note1")}</span>
				<span className="autoAnswerConfigure" style={{cursor: "pointer"}}
				      onClick={this.goToUserGroup.bind(this)}>{getLangTxt("note2")}</span>
				<span>{getLangTxt("note3")}</span>
			</p>
		);
	}
	
	judgeIptLength(rule, value, callback)
	{
		if(value && value.trim() !== "")
		{
			callback();
		}
		callback(getLangTxt("setting_users_word1"))
	}
	
	_getCompanyComp(welcome)
	{
		let {getFieldDecorator} = this.props.form,
			welcomeTrans = "";
		
		if(isJsonString(welcome))
		{
			let parseWelcome = JSON.parse(welcome) || {};
			welcomeTrans = parseWelcome.message || "";
		}
		else
		{
			welcomeTrans = welcome;
		}
		return (
			<div>
				<p className="greetingTitle">{getLangTxt("setting_autoreply_greeting_content")}</p>
				<FormItem>
					{
						getFieldDecorator('value', {
							initialValue: welcomeTrans || "",
							rules: [{validator: this.judgeIptLength.bind(this)}]
						})(
							<Input type="textarea" style={{width: '540px', height: '116px', resize: 'none'}}
							       onChange={this.getTextarea.bind(this)}/>
						)
					}
				</FormItem>
			</div>
		
		);
	}
	
	handleSubmit()
	{
		let {form} = this.props;
		
		form.validateFields((errors) => {
			if(errors)
				return false;
			let greetingData = {
				welcome: this._autoGreet
			};
			this.props.autoResponseGreet(greetingData);
		})
	}
	
	render()
	{
		let {state = {content: "", level: 0, useable: 0}, progress} = this.props,
			{content = "", useable = 0, level = 0} = state,
			configLevel = this._getConfigLevel(),
			configProgress = this._getConfigProgress(),
			{getFieldDecorator} = this.props.form,
			styles = {
				greet: {marginBottom: '20px', position: 'relative', display: "inline-block", paddingRight: "38px"}
			};
		
		if(state)
		{
			// state.level = configLevel;
			state.item = 1;
		}
		
		this._autoGreet = state;
		
		return (
			<div className="autoGreetings">
				<Form>
					<div className="isOpenGreeting">{getLangTxt("setting_autoreply_greeting_on")}
						<FormItem className="greetingOpenChecked">
							{
								getFieldDecorator('Checkbox', {
									valuePropName: "checked", initialValue: useable === 1
								})(<Switch onChange={this._onGreetChange.bind(this)}/>)
							}
						</FormItem>
					</div>
					{
						useable === 1 ?
							<div>
								<div className="greetingSetting">
									<p className="greetingSettingTitle">{getLangTxt("setting_autoreply_range")}</p>
									
									<div className="greetingSettingSelect">
										{
											this._getWelcomeComp(level)
										}
									</div>
									
									<div className="greetingSettingSelect">
									
									</div>
								</div>
								
								{
									level === 0 ? this._getCompanyComp(content) : this._getUsersComp()
								}
							
							</div> : null
					}
				
				</Form>
				<div className="company-footer">
					<Button onClick={this.handleSubmit.bind(this)} className="primary"
					        type="primary">{getLangTxt("sure")}</Button>
				</div>
				{
					getProgressComp(configProgress)
				}
			</div>
		)
	}
}

AutoGreetings = Form.create()(AutoGreetings);

function mapStateToProps(state)
{
	return {
		state: state.getAutoWelcome.data,
		configLevel: state.getConfigLevel.data,
		getConfigLevel: state.getConfigLevel,
		progress: state.autoresponse.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAutowelcomelevel, autoResponseGreet, editConfigLevel, resetAnswerProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoGreetings);
