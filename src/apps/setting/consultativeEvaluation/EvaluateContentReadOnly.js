import React, { Component } from 'react'
import { Form, Radio, Checkbox, Input, Button, Switch, Popover } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ScrollArea from 'react-scrollbar';
import { getEvaluation } from './action/consultativeEvaluation';
import { bglen } from "../../../utils/StringUtils";
import { substr } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const RadioGroup = Radio.Group, FormItem = Form.Item, CheckboxGroup = Checkbox.Group;

class EvaluateContentReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			satisfyTextStatus: '',
			satisfactionStatus: '',
			resolveTextStatus: '',
			resolveStatus: '',
		};
	}
	
	/**
	 * 遍历获取checkbox下选项列表及默认选中列表
	 * */
	getOptionCheckBox(data)
	{
		if(!data) return;
		
		let optionArray = [],
			defaultCheckedValue = [];
		for(let i = 0; i < data.length; i++)
		{
			let obj = {
				label: bglen(data[i].content) > 10 ?
					<Popover content={<div
						style={{maxWidth: '70px', height: 'auto', wordWrap: 'break-word'}}>{data[i].content}</div>}
					         placement="top">
						<span
							style={{display: "inline-block", width: "70px"}}>{substr(data[i].content, 5) + "..."}</span>
					</Popover>
					:
					<span style={{display: "inline-block", width: "70px"}}>{data[i].content}</span>,
				value: data[i].optionId
			};
			
			optionArray.push(obj);    //根据后台数据遍历获取选项check
			
			if(data[i].useable == 1)
			{
				defaultCheckedValue.push(data[i].optionId);    //根据后台数据遍历获取当前选中项
			}
		}
		
		return {optionArray, defaultCheckedValue};
	}
	
	/*
	* 默认选中项列表组件*/
	getDefaultOptionData(option = [])
	{
		let allCheckedItem = option.filter(item => item.useable === 1),
			checkedItemData = [];
		
		allCheckedItem.map(item => {
			let obj = {
				label: bglen(item.content) > 10 ?
					<Popover content={<div
						style={{maxWidth: '70px', height: 'auto', wordWrap: 'break-word'}}>{item.content}</div>}
					         placement="top">
						<span style={{display: "inline-block", width: "70px"}}>{substr(item.content, 5) + "..."}</span>
					</Popover>
					:
					<span style={{display: "inline-block", width: "70px"}}>{item.content}</span>,
				
				value: item.optionId
			};
			checkedItemData.push(obj)
		});
		
		return checkedItemData;
		
	}
	
	render()
	{
		
		let {satisfyChecked, resolveChecked, adviseChecked} = this.state,   //获取各项是否开启
			{contentData = {conversationEvaluationItems: []}} = this.props,
			{conversationEvaluationItems = []} = contentData;   //获取评价内容数据
		
		let satisfyData = contentData && conversationEvaluationItems[0],
			resolveData = contentData && conversationEvaluationItems[1],
			adViseTipData = contentData && conversationEvaluationItems[2];
		
		let {title, evaluationButton} = contentData;    //获取评价标题 评价按钮内容
		
		let {userable: satisfyUseable, content: satisfyContent = "", title: satisfyTitle = "", option: satisfyOption = [], optionType: satisfyOptionType = 0} = satisfyData || {},
			{userable: resolveUseable, content: resolveContent = "", title: resolveTitle = "", option: resolveOption = [], optionType: resolveOptionType = 0} = resolveData || {},
			{userable: adviseUserable, content: adviseContent = "", title: adviseTitle = ""} = adViseTipData || {};    //获取各项下详细数据 满意度 是否解决问题 。。。。。。
		
		let satifyOptionArray = this.getOptionCheckBox(satisfyOption) || {},    //  获取各部分选项数据及默认选中项
			resolveOptionArray = this.getOptionCheckBox(resolveOption) || {},
			satisfyOptionCheckedItem = this.getDefaultOptionData(satisfyOption),    //获取已选中选项 生成设置默认项组件
			resolveOptionCheckedItem = this.getDefaultOptionData(resolveOption),
			initialSatisfyCheckedDefaultItem = satisfyOption.find(item => item.isDefault === 1),
			initialresolveCheckedDefaultItem = resolveOption.find(item => item.isDefault === 1);
		
		this.satisfySelectedData = satisfyData;     //获取各部分选项数据原始结构
		this.resolveSelectedData = resolveData;
		this.adviseSelectedData = adViseTipData;
		this.allContentData = contentData;
		
		let {getFieldDecorator} = this.props.form,
			formItemLayout2 = {
				labelCol: {span: 2},
				wrapperCol: {span: 12}
			},
			formItemLayout3 = {
				labelCol: {span: 2},
				wrapperCol: {span: 12}
			},
			formItemLayout4 = {
				labelCol: {span: 2},
				wrapperCol: {span: 10}
			},
			satisfactionOptions = satifyOptionArray.optionArray || [],    //获取满意程度选项数据
			resolveOptions = resolveOptionArray.optionArray || [];        //获取解决程度选项数据
		
		satisfyChecked = satisfyChecked == undefined ? satisfyUseable == 1 : satisfyChecked;    //获取各部分默认及修改后是否开启
		resolveChecked = resolveChecked == undefined ? resolveUseable == 1 : resolveChecked;
		adviseChecked = adviseChecked == undefined ? adviseUserable == 1 : adviseChecked;
		
		return (
			<div className="evaluationContent">
				
				<div className="content">
					<Form style={{height: 'calc(100% - 64px)'}}>
						<ScrollArea speed={1} horizontal={false} style={{height: '100%', marginLeft: '28px'}}
						            smoothScrolling>
							{
								/*<FormItem
									{...formItemLayout2}
									label="标题"
									className="titleIpt"
									help="请输入30字以内标题"
								>
									{
										getFieldDecorator('title', {
											initialValue: title,
											rules: [{max: 30}, {required: true}]
										})
										(
											<Input onKeyUp={this.editTitleText.bind(this)}/>
										)
									}
								</FormItem>*/
							}
							<div className="evaluateContentBox">
								<div className="evaluateValueTitle">
									<FormItem style={{display: "inline-block"}}>
										{
											getFieldDecorator('onSatisfyChange', {
												initialValue: satisfyChecked
											})
											(
												<Switch disabled checked={satisfyChecked}/>
											)
										}
									</FormItem>
									<span className="evaluateTypeTitleSpan">{satisfyTitle}</span>
								</div>
								
								<FormItem
									label={getLangTxt("setting_evalue_tip")}
									help={getLangTxt("setting_evalue_tip_note")}
									className="sameFormExplainIpt"
									validateStatus={this.state.satisfyTextStatus}
									{...formItemLayout4}
								>
									{
										getFieldDecorator('satisfyTextTips',
											{
												initialValue: satisfyContent
											})
										(
											<Input disabled/>
										)
									}
								</FormItem>
								<FormItem
									className="levelPointStyle sameFormExplainBox"
									label={getLangTxt("setting_evalue_option")}
									help={getLangTxt("setting_evalue_option_one")}
									validateStatus={this.state.satisfactionStatus}
									{...formItemLayout3}
								>
									{
										getFieldDecorator('satisfaction',
											{
												initialValue: satifyOptionArray.defaultCheckedValue
											})
										(
											<CheckboxGroup
												className="satisfyHoverIsDefault"
												options={satisfactionOptions}
												disabled/>
										)
									}
								</FormItem>
								
								<FormItem className="answerSetStyle"{...formItemLayout3}
								          label={getLangTxt("setting_evalue_option_default")}>
									{
										getFieldDecorator('satisfyDefaultOption', {
											initialValue: initialSatisfyCheckedDefaultItem && initialSatisfyCheckedDefaultItem.optionId || satisfyOptionCheckedItem[0] && satisfyOptionCheckedItem[0].value
										})
										(
											<RadioGroup disabled options={satisfyOptionCheckedItem}/>
										)
									}
								</FormItem>
								
								<FormItem
									className="answerSetStyle"
									{...formItemLayout3}
									label={getLangTxt("setting_evalue_answer_set")}
								>
									{
										getFieldDecorator('satisfyAnswerSet', {
											initialValue: satisfyOptionType.toString()
										})
										(
											<span>{getLangTxt("setting_evalue_radio")}</span>
											// {/*<RadioGroup disabled={!satisfyChecked}
											//     onChange={this.satisfiedAnswerSet.bind(this)}>
											//     <Radio key="1" value="0">单选项</Radio>
											//     {/!*<Radio key="2" value="1">复选项</Radio>*!/}
											// </RadioGroup>*/}
										)
									}
								</FormItem>
							</div>
							<div className="evaluateContentBox">
								<div className="evaluateValueTitle">
									<FormItem
										style={{display: "inline-block"}}
									>
										{
											getFieldDecorator('onResolveChange', {
												initialValue: resolveChecked
											})
											(
												<Switch disabled checked={resolveChecked}/>
											)
										}
									</FormItem>
									
									<span className="evaluateTypeTitleSpan">{resolveTitle}</span>
								</div>
								
								<FormItem className="sameFormExplainIpt" label={getLangTxt("setting_evalue_tip")}
								          help={getLangTxt("setting_evalue_tip_note1")}
								          validateStatus={this.state.resolveTextStatus}{...formItemLayout4}>
									{
										getFieldDecorator('resolveTextTips',
											{
												initialValue: resolveContent
											})
										(
											<Input disabled/>
										)
									}
								</FormItem>
								<FormItem
									className="levelPointStyle sameFormExplainBox"
									label={getLangTxt("setting_evalue_option")}
									help={getLangTxt("setting_evalue_option_one")}
									validateStatus={this.state.resolveStatus}
									{...formItemLayout3}
								>
									{
										getFieldDecorator('resolve', {
											initialValue: resolveOptionArray.defaultCheckedValue
										})
										(<CheckboxGroup style={{border: "10px solid green"}} options={resolveOptions}
										                disabled/>)
									}
								</FormItem>
								<FormItem className="answerSetStyle"{...formItemLayout3}
								          label={getLangTxt("setting_evalue_option_default")}>
									{
										getFieldDecorator('resolveDefaultOption', {
											initialValue: initialresolveCheckedDefaultItem && initialresolveCheckedDefaultItem.optionId || resolveOptionCheckedItem[0] && resolveOptionCheckedItem[0].value
										})
										(
											<RadioGroup disabled options={resolveOptionCheckedItem}/>
										)
									}
								</FormItem>
								<FormItem className="answerSetStyle"{...formItemLayout3}
								          label={getLangTxt("setting_evalue_answer_set")}>
									{
										getFieldDecorator('resolveAnswerSet', {
											initialValue: resolveOptionType.toString()
										})
										(
											<span>{getLangTxt("setting_evalue_radio")}</span>
											// <RadioGroup disabled={!resolveChecked} onChange={this.resolvedAnswerSet.bind(this)}>
											//     <Radio key="1" value="0">单选项</Radio>
											//     {/*<Radio key="2" value="1">复选项</Radio>*/}
											// </RadioGroup>
										)
									}
								</FormItem>
							</div>
							<div className="evaluateContentBox">
								<div className="evaluateValueTitle">
									<FormItem style={{display: "inline-block"}}>
										{
											getFieldDecorator('onAdviseChange', {
												initialValue: adviseChecked
											})
											(
												<Switch disabled
												        checked={adviseChecked}/>
											)
										}
									</FormItem>
									
									<span className="evaluateTypeTitleSpan">{adviseTitle}</span>
								
								</div>
								<FormItem className="sameFormExplainIpt"{...formItemLayout4}
								          style={{marginBottom: "15px"}} label={getLangTxt("setting_evalue_tip")}
								          help={getLangTxt("setting_evalue_tip_note1")}>
									{
										getFieldDecorator('adViseTip', {
											initialValue: adviseContent,
											rules: [{max: 50}]
										})
										(
											<Input disabled/>
										)
									}
								</FormItem>
							</div>
							
							<FormItem className="evaButtonStyle" style={{marginBottom: "20px"}}{...formItemLayout3}
							          label={getLangTxt("setting_evalue_content_btn")}
							          help={getLangTxt("setting_evalue_tip_note2")}>
								{
									getFieldDecorator('evaBtnContent', {
										initialValue: evaluationButton
									})
									(
										<Input disabled/>
									)
								}
							</FormItem>
						</ScrollArea>
						<FormItem className="submitEvaContent">
							<Button disabled className="submitBtn" type="primary" htmlType="submit"
							        size="large">{getLangTxt("save")}</Button>
						</FormItem>
					</Form>
				</div>
			</div>
		)
	}
}

EvaluateContentReadOnly = Form.create()(EvaluateContentReadOnly);

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

export default connect(mapStateToProps, mapDispatchToProps)(EvaluateContentReadOnly);
