import React from "react";
import { Form, Select, InputNumber, Radio, Input, Button } from 'antd'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import './style/personalcall.less'
import './style/searchListComp.less'
import { getPersonalCallSetting, putPersonalCallSetting, getCalloutTelPhoneList, updateProgress, updatePersonalCallSetting } from "../redux/reducers/personalcallsettingReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { getProgressComp } from "../../../utils/MyUtil";
import { ReFresh } from "../../../components/ReFresh";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class PersonalCallSetting extends React.Component {

	constructor(props)
	{
		super(props);
	}

	componentDidMount()
	{
		this.props.getPersonalCallSetting();
		this.props.getCalloutTelPhoneList();
	}

	handleSubmit()
	{
		this.props.form.validateFields((err, formData) => {
			if(!err)
			{
				formData.autoStatusAfterLogin = this.props.personalcallSetting.autoStatusAfterLogin;

				this.props.putPersonalCallSetting(formData);
			}
		});
	}

	reFreshFn()
	{
		this.props.getPersonalCallSetting();
	}

	_getProgressComp()
	{
		let {progress} = this.props;

		if(progress)
		{
			if(progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
				return;
			if(progress === LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
			{
				return getProgressComp(progress);
			}
			else if(progress === LoadProgressConst.LOAD_FAILED)  //加载失败
			{
				return <ReFresh reFreshStyle={{left: 0, top: 0, bottom:0}} reFreshFn={this.reFreshFn.bind(this)}/>;
			}
		}
		return null;
	}

	savingTip()
	{
		const {progress, msg} = this.props;
		if(progress == LoadProgressConst.SAVING_FAILED)
		{
			return (<div style={{color:'red'}} className="saveResult">{msg}</div>);
		}
		if(progress == LoadProgressConst.SAVING_SUCCESS)
		{
			return (<div style={{color:'green'}} className="saveResult">{msg}</div>);
		}
	}

	//登录状态点击
	onLoginStatusTypes(value) {
		let datalist = this.props.personalcallSetting;
		if (datalist.autoStatusAfterLogin != value) {
			datalist.autoStatusAfterLogin = value;
			this.props.updatePersonalCallSetting(datalist);
		}
	}

	normalizeValue(value, prevValue)
	{
		let reg = /^[0-9]+$/;
		
		if(value.length < prevValue.length)
			this.setState({clickNum: null});
		
		if(!value)
			return "";
		
		if(!reg.test(value) || value > 999)
			return prevValue;
		
		return value;
	}

	render()
	{
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {span: 3},
			wrapperCol: {span: 10},
		};
		let {telPhoneList, personalcallSetting} = this.props;
		if(JSON.stringify(personalcallSetting) != '{}')
		{
			personalcallSetting.answermode = parseInt(personalcallSetting.answermode).toString();
		}
		return (<div>
					<div className="personalcall">
						<Form className="PersonalCallSetting-box">
							<FormItem {...formItemLayout} className="personalcall-serviceMode" label="服务模式">
								{
									getFieldDecorator("answermode", {initialValue: personalcallSetting.answermode})(
										<RadioGroup className="PersonalCall-Radio">
											<Radio value="0">
												<span className="PersonalCall-Radio-title">软电话</span>
												<span>软电话基于网页技术</span>
											</Radio>
											<Radio value="1">
												<span className="PersonalCall-Radio-title">IP电话</span>
												<span>IP话机基于IP话机硬件，切换前请确保您的IP话机的连接，并已完成设置</span>
											</Radio>
										</RadioGroup>
									)
								}
							</FormItem>
							<FormItem {...formItemLayout} label="外呼号码显示" >
								{
									getFieldDecorator("dspNumber", { rules: [{required: true,message: " "}], initialValue: personalcallSetting.dspNumber})
									(<Select placeholder="请选择外呼号码" className="personal-select" getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
										{
											telPhoneList.map((item) => {
												return <Option value={item.relayNumber}>{item.relayNumber}</Option>
											})
										}
									</Select>)
								}
							</FormItem>
							{/* <FormItem {...formItemLayout} label="内部名">
								{
									getFieldDecorator("nickName", { initialValue: personalcallSetting.nickName})
									(<Input className="Personal-NickName" disabled/>)
								}
							</FormItem> */}
							<FormItem {...formItemLayout} label="整理时间设置">
								{
									getFieldDecorator("workTime", {initialValue: personalcallSetting.workTime, normalize: this.normalizeValue.bind(this)})(
									<InputNumber className="PersonalCall-timer" min={0} max={999}/>
								)}
								<span className="ant-form-text"> 秒</span>
								<p style={{color:'#999',lineHeight: '24px'}}>注：客服通话结束后n秒不分配客户，客服可以利用此时间整理上一通话工作</p>
							</FormItem>
							<FormItem {...formItemLayout} label="登录默认状态">
								<div>
									<Button  onClick={this.onLoginStatusTypes.bind(this,0)}  className={personalcallSetting.autoStatusAfterLogin==0?"loginstatus login-status-active-btn1":"loginstatus sonalcalllogin_btn1"}>空闲</Button>
									<Button  onClick={this.onLoginStatusTypes.bind(this,1)} className={personalcallSetting.autoStatusAfterLogin==1?"loginstatus login-status-active-btn2":"loginstatus sonalcalllogin_btn2"}>忙碌</Button>
								</div>

							</FormItem>
						</Form>
						{this._getProgressComp()}
					</div>
					<div className="PersonalCallSetting-footer">
						{this.savingTip()}
						<Button type="primary" onClick={this.handleSubmit.bind(this)}>保存</Button>
					</div>
				</div>
		);
	}
}

function mapStateToProps(state)
{
	let {PersonalCallSettingReducer} = state;
	return {
		progress: PersonalCallSettingReducer.get("progress") || {},
		msg: PersonalCallSettingReducer.get("msg") || "",
		telPhoneList: PersonalCallSettingReducer.get("telPhoneList") || [],
		personalcallSetting: PersonalCallSettingReducer.get("personalcallSetting") || {}
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getPersonalCallSetting, putPersonalCallSetting, getCalloutTelPhoneList, updateProgress, updatePersonalCallSetting
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(PersonalCallSetting));
