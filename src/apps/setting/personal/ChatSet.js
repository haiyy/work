import React, { Component } from 'react'
import { Form, Radio, Checkbox, Button } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getChatSet, setChatSet, resetChatSetProgress } from './action/personalSetting';
import Immutable from "immutable";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import VersionControl from "../../../utils/VersionControl";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class ChatSet extends Component {
	
	static defaultProps = {
		chatSet: {
			lastWord: 0,
			soundOn: 1,
			forceOpenWindow: 1
		}
	};
	
	constructor(props)
	{
		super(props);
		
		this._style = {padding: "0.11rem 0.14rem", height: "3.95rem", position: "relative"};
		this._options = [{label: getLangTxt("new_message_tip"), value: 0}, {
			label: getLangTxt("new_message_force_open"), value: 1
		}];
		
	}
	
	componentDidMount()
	{
		this.props.getChatSet();
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {chatset, isIgnoreEdit} = nextProps,
			{chatset: chatsetThis, isIgnoreEdit: isIgnoreEditThis, progress} = this.props;
		
		if(chatset && !chatsetThis)
		{
			this._onSubmit();
		}
		
		if(isIgnoreEdit && !isIgnoreEditThis)
		{
			this.props.form.resetFields();
		}
		
		if(progress === LoadProgressConst.SAVING_SUCCESS)
		{
			//VersionControl.initChatSet(chatsetThis);
			this.props.resetChatSetProgress();
			// this._onCancel();
			return null;
		}
	}
	
	shouldComponentUpdate(nextProps, nextState)
	{
		return !Immutable.is(Immutable.fromJS(this.props), Immutable.fromJS(nextProps)) || !Immutable.is(Immutable.fromJS(this.state), Immutable.fromJS(nextState));
	}
	
	_onCancel()
	{
		this.props.onCancel(false);
	}
	
	_onSubmit()
	{
		let {form} = this.props;
		
		let chatSetData = form.getFieldsValue() || {},
			lastWord = {lastWord: chatSetData.lastWord},
			sound = chatSetData.soundCheck,
			soundOn = 0, forceOpenWindow = 0;
		
		sound.forEach(item => {
			item === 0 ? soundOn = 1 : forceOpenWindow = 1;
		});
		
		Object.assign(this.props.chatSet, lastWord, {soundOn, forceOpenWindow});
		
		this.props.setChatSet(this.props.chatSet);
		this.props.afterSavingData("chatset", true);
	}
	
	reFreshFn()
	{
		this.props.getChatSet();
	}
	
	render()
	{
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 7},
				wrapperCol: {span: 12}
			};
		
		let {chatSet, progress} = this.props,
			lastWord = chatSet && chatSet.lastWord,
			checkDefaultValue = [];
		
		if(chatSet && chatSet.soundOn == 1)
			checkDefaultValue.push(0);
		
		if(chatSet && chatSet.forceOpenWindow == 1)
			checkDefaultValue.push(1);
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="chatSet personalise" style={this._style}>
				<p>{getLangTxt("lastword")}</p>
				<FormItem {...formItemLayout} vertical>
					{
						getFieldDecorator('lastWord', {initialValue: lastWord})
						(
							<RadioGroup>
								<Radio value={0}>{getLangTxt("conver")}</Radio>
								<Radio value={1}>{getLangTxt("kf")}</Radio>
								<Radio value={2}>{getLangTxt("fk")}</Radio>
							</RadioGroup>
						)}
				</FormItem>
				
				<FormItem {...formItemLayout} vertical>
					{
						getFieldDecorator('soundCheck', {initialValue: checkDefaultValue})(
							<Checkbox.Group options={this._options}/>
						)
					}
				</FormItem>
				
				<div className="footer">
					<Button type="ghost" onClick={this._onCancel.bind(this)}>{getLangTxt("cancel")}</Button>
					<Button type="primary" onClick={this._onSubmit.bind(this)}>{getLangTxt("sure")}</Button>
				</div>
				{
					_getProgressComp(progress, "submitStatus userSaveStatus")
				}
			</div>
		)
	}
}

ChatSet = Form.create({
	onValuesChange(props, values)
	{
		props.isValueChange(true, "chatset");
	}
})(ChatSet);

function mapStateToProps(state)
{
	let {personalReducer} = state,
		infomation = personalReducer.get("chatSet") || Map(),
		chatSet = infomation.get("data") || {},
		progress = infomation.get("progress");
	
	return {
		chatSet,
		progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getChatSet, setChatSet, resetChatSetProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatSet);
