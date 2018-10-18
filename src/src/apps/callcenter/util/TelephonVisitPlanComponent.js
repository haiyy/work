import React from 'react';
import { render } from 'react-dom';
import { Modal, Form, Input, Switch, Button, Upload, Icon, DatePicker } from 'antd';
import "../view/style/formContent.less"

const FormItem = Form.Item;
import moment from 'moment';

const RangePicker = DatePicker.RangePicker;
import { bglen } from "../../../utils/StringUtils";
import { Map, fromJS } from 'immutable';

class TelephonVisitPlanComponent extends React.Component { //子组件
	constructor(props)
	{
		super(props);
		let planTime=this.props.planTime
		this.state = {
			Modalshow: true,//props.ModalShow,
			visible: props.visible,
			confirmDirty: false,
			ruleNumLength: -1,
			endValue:planTime,
			endOpen: false,
			validateStatus: "success"
		}
	}

	handleSubmit = (e) => {
		var that = this;
		e.preventDefault();

		this.props.form.validateFieldsAndScroll((err, formData) => {

			if(bglen(formData.remarks) > 500)
			{
				this.setState({
					validateStatus: "error"
				});
				return;
			}
			if(!err)
			{
				if(formData.hideNumberEnabled)
				{
					formData.hideNumberEnabled = 0;
				}
				else
				{
					formData.hideNumberEnabled = 1;
				}

				//时间转化为时间戳
				formData.planTime = moment(formData.planTime)
				.valueOf();
				formData.callId = this.props.callId;
                
                console.log(formData)
				that.props.onformData(formData);

				//初始化弹框中数据
				this.setState({
					ruleNumLength: -1,
					validateStatus: "success"
				})
				this.props.form.resetFields();
			}
		});

    }

	handleCancel()
	{
		//初始化弹框中数据
		this.props.form.resetFields();
		this.props.handleCancel();
		this.setState({
			ruleNumLength: -1,
			validateStatus: "success"
		})
	}

	onDescribe(e)
	{
		let value = e.target.value;
		if (bglen(value) > 140) return;
		this.setState({
			ruleNumLength: value
		});
	}

	ruleForLength(value, prevValue) {
		if(!value)
			return "";

		if (bglen(value) <= 140) {
			return value;
		}
		
		return prevValue;
	}

	onEndChange(value)
	{
		this.setState({endValue: value});
	}

	handleStartOpenChange(open)
	{
		if(!open)
		{
			this.setState({endOpen: true});
		}
	}

	handleEndOpenChange(open)
	{
		this.setState({endOpen: open});
	}

	disabledEndDate(value)
	{

	}



	render()
	{
		const {Visible, PhoneNumber, remarks, isEdit,planTime} = this.props;
		const {getFieldDecorator} = this.props.form;
		const {endValue, endOpen} = this.state;
		const formItemLayout = {
			labelCol: {span: 5},
			wrapperCol: {span: 15},
		};
		let {ruleNumLength} = this.state;
		if(ruleNumLength == -1)
		{
			ruleNumLength = remarks;
		}

		return (
			<div>
				{
					Visible ? (
						<Modal visible={true} title={isEdit ? "编辑回访计划" : "新建回访计划"} okText="保存"
						       style={{width: '418px', marginTop: 100}}
						       onOk={this.handleSubmit.bind(this)}
						       onCancel={this.handleCancel.bind(this)}>
							<Form onSubmit={this.handleSubmit.bind(this)}>
								<FormItem {...formItemLayout} label="电话号码">
									{
										getFieldDecorator('phoneNumber', {
											initialValue: PhoneNumber,
											rules: [{
												required: true,
												message: " ",
											}],
										})(<Input disabled={true} style={{width: '100%'}}/>)
									}
								</FormItem>

								<FormItem {...formItemLayout} label={isEdit ? "计划时间" : "回呼时间"}>
									{
										getFieldDecorator('planTime', {
											initialValue: isEdit?moment(planTime):moment(),
											rules: [{
												required: true,
												message: " ",
											}],
										})
										(
											<DatePicker
												disabledDate={this.disabledEndDate.bind(this)}
												showTime
												disabledDate={current => {
                                                    return current.isBefore(moment(Date.now()).add(-1, 'days'));
                                                  }}
												format="YYYY-MM-DD HH:mm:ss"
												// value={endValue}
												placeholder={isEdit ? "计划时间" : "回呼时间"}
												onChange={this.onEndChange.bind(this)}
												open={endOpen}
												onOpenChange={this.handleEndOpenChange.bind(this)}
												style={{width: '100%'}}
											/>
										)
									}
								</FormItem>

								<FormItem  {...formItemLayout} label={isEdit ? "备注" : "回呼备注"}
								           validateStatus={this.state.validateStatus}>
									{
										getFieldDecorator('remarks', {
											initialValue: remarks,
											rules: [{ message: " "}],
											normalize: this.ruleForLength.bind(this)
										})(
											<Input type="textarea" onChange={this.onDescribe.bind(this)}
											       style={{height: 90, resize: 'none'}}/>
										)}
									<span className="CallOut-num">{bglen(ruleNumLength)}/140</span>
								</FormItem>
							</Form>
						</Modal>
					) : null
				}
			</div>
		)
	}
}

export default Form.create()(TelephonVisitPlanComponent);
