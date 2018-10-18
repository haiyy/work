import React from 'react'
import { Switch, Input, Form, Col, Checkbox, Button, InputNumber } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ScrollArea from 'react-scrollbar';
import { getEvaluation } from './action/consultativeEvaluation';
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item, InputGroup = Input.Group, CheckboxGroup = Checkbox.Group;

class EvaluateStyleReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			isUpdateData: false,
			subjectiiveStatus: "",
			forceStatus: ""
		}
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
				<Form>
					<ScrollArea speed={1} horizontal={false} style={{height: "100%"}} smoothScrolling>
						<div className="evaluationStyleBox">
							<div className="evaluationTitleBox">
								<FormItem style={{display: 'inline-block'}}>
									{
										getFieldDecorator('evaSubjective')
										(
											<Switch disabled style={{marginRight: "10px", marginTop: "-2px"}}
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
											<InputNumber style={{width: "50px"}}
											             min={0} disabled/>
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
									getFieldDecorator('activeFinalEnd', {initialValue: activeTerminal})
									(<CheckboxGroup options={activeFinalEndApplyOptions} disabled/>)
								}
							</FormItem>
						</div>
						
						
						<div className="evaluationStyleBox">
							<div className="evaluationTitleBox">
								<FormItem style={{display: 'inline-block'}}>
									{
										getFieldDecorator('evaForce')
										(
											<Switch disabled style={{marginRight: "10px", marginTop: "-2px"}}
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
								<Col span="2"><span style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word1")}</span></Col>
								<FormItem className="msgCount">
									{
										getFieldDecorator('forceEvaMsg', {
											initialValue: forceCustomerMsgNum
										})
										(
											<InputNumber style={{width: "50px"}}
											             min={0} disabled/>
										)
									}
								</FormItem>
								<Col span="6"><span style={{float: "left"}}>{getLangTxt("setting_evalue_mode_word3")}</span></Col>
							</InputGroup>
							
							<FormItem label={getLangTxt("setting_evalue_tml")} help={getLangTxt("setting_evalue_option_one")} className="finalEndApply"
							          validateStatus={this.state.forceStatus} {...formItemLayout}>
								{
									getFieldDecorator('forceFinalEnd',
										{
											initialValue: forceTerminal
										})
									(
										<CheckboxGroup
											options={[activeFinalEndApplyOptions[0], activeFinalEndApplyOptions[2]]}
											disabled/>
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
											<Switch disabled style={{marginRight: "10px", marginTop: "-2px"}}
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
											<InputNumber style={{width: "50px"}}
											             min={1} disabled/>
										)
									}
								</FormItem>
								<Col span="3"><span style={{float: "left"}}>次邀请评价</span></Col>
							</InputGroup>
						</div>
					
					</ScrollArea>
					<FormItem className="submitEvaContent">
						<Button disabled className="submitBtn" type="primary" htmlType="submit" size="large">保存</Button>
					</FormItem>
				
				</Form>
			</div>
		)
	}
}

EvaluateStyleReadOnly = Form.create()(EvaluateStyleReadOnly);

function mapStateToProps(state)
{
	return {
		evaluateList: state.getEvaluateList.data
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getEvaluation}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EvaluateStyleReadOnly);
