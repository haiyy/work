import React from 'react'
import { Switch, Input, Form, Col, Checkbox, Button, InputNumber } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ScrollArea from 'react-scrollbar';
import { getEvaluation, editEvaluation } from './action/consultativeEvaluation';
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item, InputGroup = Input.Group, CheckboxGroup = Checkbox.Group;

class EvaluateStyle extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			isUpdateData: false,
			subjectiiveStatus: "",
			forceStatus: ""
		}
	}
	
	/**
	 * 主动评价
	 * */
	//主动评价开启
	subjectiveChange(checked)
	{
		console.log("ConsultativeEvaluation SubjectiveChange", checked, this.evaSubjective);
		let useable = checked ? 1 : 0,
			{terminal = []} = this.evaSubjective;
		
		if(useable === 0)
		{
			this.setState({subjectiiveStatus: "success"})
		}
		else if(useable === 1 && terminal.length < 1)
		{
			this.props.form.setFieldsValue({"activeFinalEnd": [0]});
			Object.assign(this.evaSubjective, {terminal: [0]});
		}
		Object.assign(this.evaSubjective, {useable});
	}
	
	//主动评价消息数
	getActiveNum(value)
	{
		let customerMsgNum = value || 0;
		Object.assign(this.evaSubjective, {customerMsgNum})
	}
	
	//主动评价适用终端
	activeFinalEndApply(checked)
	{
		let terminal = checked,
			activeStatus = terminal.length == 0 ? "error" : "success";
		
		this.setState({subjectiiveStatus: activeStatus});
		
		Object.assign(this.evaSubjective, {terminal});
	}
	
	/**
	 * 强制评价
	 * */
	//强制评价开启
	forceChange(checked)
	{
		
		let useable = checked ? 1 : 0,
			{terminal = []} = this.evaForce;
		
		if(useable === 0)
		{
			this.setState({forceStatus: "success"})
		}
		else if(useable === 1 && terminal.length < 1)
		{
			this.props.form.setFieldsValue({"forceFinalEnd": [0]});
			Object.assign(this.evaForce, {terminal: [0]})
		}
		
		Object.assign(this.evaForce, {useable})
	}
	
	//强制评价消息数
	getForceNum(value)
	{
		let customerMsgNum = value || 0;
		Object.assign(this.evaForce, {customerMsgNum})
	}
	
	//强制评价适用终端
	forceFinalEndApply(checked)
	{
		let terminal = checked,
			forceStatus = terminal.length == 0 ? "error" : "success";
		
		this.setState({forceStatus: forceStatus});
		Object.assign(this.evaForce, {terminal})
	}
	
	/**
	 * 邀请评价
	 * */
	//邀请评价开启
	inviteChange(checked)
	{
		let useable = checked ? 1 : 0;
		
		Object.assign(this.evaInvite, {useable})
	}
	
	//邀请评价次数
	getInviteNum(value)
	{
		let maxCount = value || 0;
		Object.assign(this.evaInvite, {maxCount})
	}
	
	/**
	 * 确认保存
	 * */
	confirmSubmit(e)
	{
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err) => {
			if(!err)
			{
				this.props.saveEvaluateEdit(true);
			}
		});
	}
	
	//获取评价方式各部分数据模板
	getEditStyleData(styleData, type)
	{
		for(let i = 0; i < styleData.length; i++)
		{
			if(styleData[i].type == type)
			{
				return styleData[i];
			}
		}
		return {};
	}
	
	render()
	{
		
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 2},
				wrapperCol: {span: 4}
			},
			activeFinalEndApplyOptions = [
				{label: 'web', value: 0},
				{label: 'wap', value: 1},
				{label: 'sdk', value: 2}
			],
			{styleData} = this.props;
		
		let evaSubjective = this.getEditStyleData(styleData, 0),
			evaForce = this.getEditStyleData(styleData, 1),
			evaInvite = this.getEditStyleData(styleData, 2),
			{useable: activeUseable = 0, terminal: activeTerminal = [], customerMsgNum: activeCustomerMsgNum = 0} = evaSubjective || {},
			{useable: forceUseable = 0, terminal: forceTerminal = [], customerMsgNum: forceCustomerMsgNum = 0} = evaForce || {},
			{useable: inviteUseable = 0, maxCount: inviteCustomerMsgNum = 0} = evaInvite || {};
		
		activeUseable = activeUseable == 1;
		forceUseable = forceUseable == 1;
		inviteUseable = inviteUseable == 1;
		
		this.evaSubjective = evaSubjective;
		this.evaForce = evaForce;
		this.evaInvite = evaInvite;
		
		return (
			<div className="evaluationTop">
				<Form onSubmit={this.confirmSubmit.bind(this)}>
					<ScrollArea speed={1} horizontal={false} style={{height: "100%"}} smoothScrolling>
						<div className="evaluationStyleBox">
							<div className="evaluationTitleBox">
								<FormItem style={{display: 'inline-block'}}>
									{
										getFieldDecorator('evaSubjective')
										(
											<Switch style={{marginRight: "10px", marginTop: "-2px"}}
											        onChange={this.subjectiveChange.bind(this)}
											        checked={activeUseable}/>
										)
									}
								</FormItem>
								
								<FormItem className='head-name'>
									<span>{getLangTxt("setting_evalue_active")}</span>
								</FormItem>
							</div>
							
							
							<InputGroup size="large">
								<Col span="2"><span
									style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word1")}</span></Col>
								<FormItem style={{float: "left"}} className="msgCount">
									{
										getFieldDecorator('activeEvaMsg', {
											initialValue: activeCustomerMsgNum
										})
										(
											<InputNumber precision={0} onChange={this.getActiveNum.bind(this)}
											             style={{width: "50px"}}
											             min={0} disabled={!activeUseable}/>
										)
									}
								</FormItem>
								<Col span="6"><span
									style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word2")}</span></Col>
							</InputGroup>
							
							<FormItem label={getLangTxt("setting_evalue_tml")}
							          help={getLangTxt("setting_evalue_option_one")} className="finalEndApply"
							          validateStatus={this.state.subjectiiveStatus} {...formItemLayout}>
								{
									getFieldDecorator('activeFinalEnd', activeUseable ? {
											initialValue: activeTerminal,
											rules: [{required: activeUseable}]
										}
										:
										{
											initialValue: activeTerminal
										})
									(
										<CheckboxGroup
											options={activeFinalEndApplyOptions}
											disabled={!activeUseable}
											onChange={this.activeFinalEndApply.bind(this)}/>
									)
								}
							</FormItem>
						</div>
						
						
						<div className="evaluationStyleBox">
							<div className="evaluationTitleBox">
								<FormItem style={{display: 'inline-block'}}>
									{
										getFieldDecorator('evaForce')
										(
											<Switch style={{marginRight: "10px", marginTop: "-2px"}}
											        onChange={this.forceChange.bind(this)}
											        checked={forceUseable}/>
										)
									}
								</FormItem>
								
								<FormItem className='head-name'>
									{
										getFieldDecorator('headName')
										(
											<span>{getLangTxt("setting_evalue_force")}</span>
										)
									}
								</FormItem>
							</div>
							
							
							<InputGroup size="large">
								<Col span="2"><span
									style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word1")}</span></Col>
								<FormItem className="msgCount">
									{
										getFieldDecorator('forceEvaMsg', {
											initialValue: forceCustomerMsgNum
										})
										(
											<InputNumber precision={0} onChange={this.getForceNum.bind(this)}
											             style={{width: "50px"}}
											             min={0} disabled={!forceUseable}/>
										)
									}
								</FormItem>
								<Col span="6"><span
									style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word3")}</span></Col>
							</InputGroup>
							
							<FormItem label={getLangTxt("setting_evalue_tml")}
							          help={getLangTxt("setting_evalue_option_one")} className="finalEndApply"
							          validateStatus={this.state.forceStatus} {...formItemLayout}>
								{
									getFieldDecorator('forceFinalEnd', forceUseable ? {
											initialValue: forceTerminal,
											rules: [{required: forceUseable}]
										}
										:
										{
											initialValue: forceTerminal
										})
									(
										<CheckboxGroup
											options={[activeFinalEndApplyOptions[0], activeFinalEndApplyOptions[2]]}
											disabled={!forceUseable}
											onChange={this.forceFinalEndApply.bind(this)}/>
									)
								}
							</FormItem>
						</div>
						
						
						<div className="evaluationStyleBox">
							<div className="evaluationTitleBox">
								<FormItem style={{display: 'inline-block'}}>
									{
										getFieldDecorator('evaInvite')
										(
											<Switch style={{marginRight: "10px", marginTop: "-2px"}}
											        onChange={this.inviteChange.bind(this)}
											        checked={inviteUseable}/>
										)
									}
								</FormItem>
								
								<FormItem className='head-name'>
									{
										getFieldDecorator('headName')
										(
											<span>{getLangTxt("setting_evalue_invite")}</span>
										)
									}
								</FormItem>
							</div>
							
							<InputGroup size="large">
								<Col span="5"><span style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word4")}</span></Col>
								<FormItem className="msgCount">
									{
										getFieldDecorator('inviteEvaMsg', {
											initialValue: inviteCustomerMsgNum
										})
										(
											<InputNumber precision={0} onChange={this.getInviteNum.bind(this)}
											             style={{width: "50px"}}
											             min={1} disabled={!inviteUseable}/>
										)
									}
								</FormItem>
								<Col span="3"><span style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word5")}</span></Col>
							</InputGroup>
						</div>
					
					</ScrollArea>
					<FormItem className="submitEvaContent">
						<Button className="submitBtn" type="primary" htmlType="submit" size="large">{getLangTxt("save")}</Button>
					</FormItem>
				
				</Form>
			</div>
		)
	}
}

EvaluateStyle = Form.create()(EvaluateStyle);

function mapStateToProps(state)
{
	return {
		evaluateList: state.getEvaluateList.data
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getEvaluation, editEvaluation}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EvaluateStyle);
