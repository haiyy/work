import React, { Component } from 'react'
import { Form, Radio, Checkbox, Input, Button, Switch, Popover } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ScrollArea from 'react-scrollbar';
import { getEvaluation, editEvaluation } from './action/consultativeEvaluation';
import { bglen } from "../../../utils/StringUtils";
import { substr } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const RadioGroup = Radio.Group, FormItem = Form.Item, CheckboxGroup = Checkbox.Group;

class EvaluateContent extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			reLoadData: false,
			satisfyTextStatus: '',
			satisfactionStatus: '',
			resolveTextStatus: '',
			resolveStatus: '',
			isEditSatisfyTitle: false,
			isEditResolveTitle: false,
			isEditAdviseTitle: false,
			isEditSatisfyOption: false,
			isEditResolveOption: false,
			currentOptionId: ""
		};
	}

	/*
	* 双击修改评价类型名称
	* titleType : isEditSatisfyTitle满意度
	*             isEditResolveTitle是否解决问题
	*             isEditAdviseTitle建议反馈
	* */
	getTitleContent(titleType)
	{
		this.setState({
			[titleType]: true
		})
	}

	/*
	* 失去焦点保存*/
	saveTitleContent(titleType, titleArea, e)
	{
		this.props.form.validateFieldsAndScroll((err, values) => {
			if(err && err[titleType])
				return false;
			let title = e.target.value;
			Object.assign(titleArea, {title});
			this.setState({
				[titleType]: false
			})
		})
	}

	/**
	 * 编辑标题
	 * */
	editTitleText(e)
	{
		let title = e.target.value;
		Object.assign(this.allContentData, {title})
	}

	/**
	 * 满意度
	 * */
	onSatisfyChange(checked)
	{
		this.setState({satisfyChecked: checked});
		let userable = checked ? 1 : 0,
			{option = [], content = ""} = this.satisfySelectedData,
			isCheckedItem;
		if(option == []) return;

		isCheckedItem = option.find(item => item.useable == 1);

		if(userable === 0)
		{
			this.setState({
				satisfyTextStatus: "success",
				satisfactionStatus: "success"
			});
			if(!this.state.resolveChecked)
				this.onResolveChange(true);
		}
		else if(userable === 1)
		{
			if(!isCheckedItem)
			{
				option[0].useable = 1;
				this.props.form.setFieldsValue({
					"satisfaction": [option[0].optionId]
				});
			}

			if(content == "")
			{
				content = getLangTxt("setting_evalue_mode_word6");
				this.props.form.setFieldsValue({
					"satisfyTextTips": content
				});
			}
			else if(content.length > 50)
			{
				this.setState({satisfyTextStatus: "error"});
			}

			Object.assign(this.satisfySelectedData, {option, content});
		}

		Object.assign(this.satisfySelectedData, {userable})

	}

	/**
	 * 满意度文本提示
	 * */
	getSatisfyTips(e)
	{
		let content = e.target.value,
			satisfyText = content && content.length <= 50 ? "success" : "error";

		this.setState({satisfyTextStatus: satisfyText});
		Object.assign(this.satisfySelectedData, {content})
	}

	/*
	* 编辑评价内容选项文本*/
	editEvaluateOptionContent(currentOptionId)
	{
		if(!this.state.isErrorOptionContent)
			this.setState({currentOptionId});
	}

	validateOptionContent(e)
	{

	}

	/*
	* 保存评价内容选项文本*/
	saveEvaluateOptionContent(currentOption, e)
	{
		let editContent = e.target.value,
			{form} = this.props;

		form.validateFields((errors) => {
			if(errors && errors.optionName)
			{
				this.setState({isErrorOptionContent: true});

				return false;
			}
			currentOption.content = editContent;
			this.setState({currentOptionId: "", isErrorOptionContent: false});
		})

	}

	/**
	 * 满意程度勾选
	 * */
	setOptionLevel(option, type, checked)
	{
		let satisfyStatus = checked.length > 0 ? "success" : "error";
		if(option == []) return;

		option.map(item => {
			item.useable = 0;
			item.isDefault = 0;
			checked.map(checkedItem => {
				if(checkedItem == item.optionId)
				{
					item.useable = 1;
				}
			})
		});

		let isDefaultItem = option.find(item => item.useable === 1);

		if(isDefaultItem)
		{
			isDefaultItem.isDefault = 1;
			if(type === "satisfy")
			{
				this.props.form.setFieldsValue({satisfyDefaultOption: isDefaultItem.optionId})
			}
			else
			{
				this.props.form.setFieldsValue({resolveDefaultOption: isDefaultItem.optionId})
			}
		}

		if(type === "satisfy")
		{
			this.setState({satisfactionStatus: satisfyStatus});
		}
		else
		{
			this.setState({resolveStatus: satisfyStatus});
		}

	}

	/*
	* 满意度默认选中项设置*/
	defaultOptionSet(option = [], e)
	{
		if(option == []) return;
		option.forEach(item => {
			item.isDefault = item.optionId === e.target.value ? 1 : 0;
		});
	}

	/**
	 * 满意度答案设置勾选
	 * */

	satisfiedAnswerSet(e)
	{
		let optionType = e.target.value;
		Object.assign(this.satisfySelectedData, {optionType});
	}

	/**
	 * 是否解决问题
	 * */

	onResolveChange(checked)
	{  //是否解决问题勾选
		this.setState({resolveChecked: checked});
		let userable = checked ? 1 : 0,
			{option = [], content = ""} = this.resolveSelectedData,
			isCheckedItem;
		if(option == []) return;

		isCheckedItem = option.find(item => item.useable == 1);

		if(userable === 0)
		{
			this.setState({
				resolveTextStatus: "success",
				resolveStatus: "success"
			});
			if(!this.state.satisfyChecked)
				this.onSatisfyChange(true);
		}
		else if(userable === 1)
		{
			if(!isCheckedItem)
			{
				option[0].useable = 1;
				this.props.form.setFieldsValue({
					"resolve": [option[0].optionId]
				});
			}

			if(content == "")
			{
				content = getLangTxt("setting_evalue_mode_word7");
				this.props.form.setFieldsValue({
					"resolveTextTips": content
				});
			}
			else if(content.length > 50)
			{
				this.setState({resolveTextStatus: "error"});
			}
			Object.assign(this.resolveSelectedData, {option, content});
			this.setState({upDateing: !this.state.upDateing})
		}

		Object.assign(this.resolveSelectedData, {userable});
	}

	/**
	 * 是否解决问题文本提示
	 * */

	getResolveTips(e)
	{
		let content = e.target.value,
			satisfyText = content && content.length <= 50 ? "success" : "error";

		this.setState({resolveTextStatus: satisfyText});
		Object.assign(this.resolveSelectedData, {content})
	}

	/**
	 * 解决问题答案设置
	 * */

	resolvedAnswerSet(e)
	{
		let optionType = e.target.value;
		Object.assign(this.resolveSelectedData, {optionType});
	}

	/**
	 * 建议与反馈
	 * */

	onAdviseChange(checked)
	{
		let userable = checked ? 1 : 0;
		this.setState({adviseChecked: checked});
		Object.assign(this.adviseSelectedData, {userable});
	}

	/**
	 * 建议与反馈文本提示
	 * */

	getAdviseTips(e)
	{
		let content = e.target.value;
		Object.assign(this.adviseSelectedData, {content})
	}

	/**
	 * 建议与反馈文本提示内容 textarea
	 * */

	getFeedbackTips(e)
	{
		let content = e.target.value;
		Object.assign(this.adviseSelectedData, {content})
	}

	/**
	 * 评价按钮内容
	 * */

	getEvaluationButton(e)
	{
		let evaluationButton = e.target.value;
		Object.assign(this.allContentData, {evaluationButton})
	}

	/**
	 * 确认保存
	 * */

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if(!err)
			{
				this.props.saveEvaluateEdit(true)
			}
			else
			{
				console.log("EvaluateContent handleSubmit err values", err, values)
			}
		});
	};

	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && value && value.length <= 10)
		{
			callback();
		}
		callback(getLangTxt("setting_evalue_mode_node1"));
	}

	/**
	 * 遍历获取checkbox下选项列表及默认选中列表
	 * */
	getOptionCheckBox(data)
	{
		if(!data) return;

		let optionArray = [],
			defaultCheckedValue = [],
			{getFieldDecorator} = this.props.form;
		for(let i = 0; i < data.length; i++)
		{
			let obj = {
				label: this.state.currentOptionId === data[i].optionId ?
					<FormItem
						style={{display: "inline-block"}}
						className="optionNameStyle"
						hasFeedback>
						{getFieldDecorator('optionName', {
							initialValue: data[i].content,
							rules: [{validator: this.judgeSpace.bind(this)}]
						})(
							<Input style={{display: "inline-block", width: "70px"}} autoFocus
							       onBlur={this.saveEvaluateOptionContent.bind(this, data[i])}/>
						)}
					</FormItem>
					:
					bglen(data[i].content) > 10 ?
						<Popover content={<div
							style={{maxWidth: '70px', height: 'auto', wordWrap: 'break-word'}}>{data[i].content}</div>}
						         placement="top">
							<span style={{display: "inline-block", width: "70px"}}
							      onDoubleClick={this.editEvaluateOptionContent.bind(this, data[i].optionId)}>{substr(data[i].content, 5) + "..."}</span>
						</Popover>
						:
						<span style={{display: "inline-block", width: "70px"}}
						      onDoubleClick={this.editEvaluateOptionContent.bind(this, data[i].optionId)}>{data[i].content}</span>,
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

	//判断评价标题 10
	judgeEvaluateTitle(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 20)
		{
			callback();
		}
		callback(getLangTxt("setting_evalue_mode_node2"));
	}

	//判断评价文本提示 50
	judgeEvaluateContent(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 100)
		{
			callback();
		}
		callback(" ");
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
					<Form onSubmit={this.handleSubmit.bind(this)} style={{height: 'calc(100% - 64px)'}}>
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
												<Switch onChange={this.onSatisfyChange.bind(this)}
												        checked={satisfyChecked}/>
											)
										}
									</FormItem>
									{
										this.state.isEditSatisfyTitle ?
											<FormItem
												className="evaluateTypeTitleForm"
												hasFeedback>
												{getFieldDecorator('isEditSatisfyTitle', {
													initialValue: satisfyTitle,
													rules: [{validator: this.judgeEvaluateTitle.bind(this)}]
												})(
													<Input className="evaluateTypeTitleIpt" autoFocus
													       onBlur={this.saveTitleContent.bind(this, "isEditSatisfyTitle", satisfyData)}/>
												)}
											</FormItem>
											:
											<span className="evaluateTypeTitleSpan"
											      onDoubleClick={this.getTitleContent.bind(this, "isEditSatisfyTitle")}>{satisfyTitle}</span>
									}
								</div>

								<FormItem
									label={getLangTxt("setting_evalue_tip")}
									help={getLangTxt("setting_evalue_tip_note")}
									className="sameFormExplainIpt"
									validateStatus={this.state.satisfyTextStatus}
									{...formItemLayout4}
								>
									{
										getFieldDecorator('satisfyTextTips', satisfyChecked ? {
												initialValue: satisfyContent,
												rules: [{validator: this.judgeEvaluateContent.bind(this)}]
											}
											:
											{
												initialValue: satisfyContent
											})
										(
											<Input disabled={!satisfyChecked} onKeyUp={this.getSatisfyTips.bind(this)}/>
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
										getFieldDecorator('satisfaction', satisfyChecked ? {
												initialValue: satifyOptionArray.defaultCheckedValue,
												rules: [{required: true}]
											}
											:
											{
												initialValue: satifyOptionArray.defaultCheckedValue
											})
										(
											<CheckboxGroup
												className="satisfyHoverIsDefault"
												options={satisfactionOptions}
												disabled={!satisfyChecked}
												onChange={this.setOptionLevel.bind(this, satisfyOption, "satisfy")}/>
										)
									}
								</FormItem>

								<FormItem
									className="answerSetStyle"
									{...formItemLayout3}
									label={getLangTxt("setting_evalue_option_default")}
								>
									{
										getFieldDecorator('satisfyDefaultOption', {
											initialValue: initialSatisfyCheckedDefaultItem && initialSatisfyCheckedDefaultItem.optionId || satisfyOptionCheckedItem[0] && satisfyOptionCheckedItem[0].value
										})
										(
											<RadioGroup disabled={!satisfyChecked}
											            onChange={this.defaultOptionSet.bind(this, satisfyOption)}
											            options={satisfyOptionCheckedItem}/>
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
												<Switch onChange={this.onResolveChange.bind(this)}
												        checked={resolveChecked}/>
											)
										}
									</FormItem>

									{
										this.state.isEditResolveTitle ?
											<FormItem
												style={{display: "inline-block"}}
												className="evaluateTypeTitleForm"
												hasFeedback>
												{getFieldDecorator('isEditResolveTitle', {
													initialValue: resolveTitle,
													rules: [{validator: this.judgeEvaluateTitle.bind(this)}]
												})(
													<Input className="evaluateTypeTitleIpt" autoFocus
													       onBlur={this.saveTitleContent.bind(this, "isEditResolveTitle", resolveData)}/>
												)}
											</FormItem>
											:
											<span className="evaluateTypeTitleSpan"
											      onDoubleClick={this.getTitleContent.bind(this, "isEditResolveTitle")}>{resolveTitle}</span>
									}
								</div>

								<FormItem
									className="sameFormExplainIpt"
									label={getLangTxt("setting_evalue_tip")}
									help={getLangTxt("setting_evalue_tip_note")}
									validateStatus={this.state.resolveTextStatus}
									{...formItemLayout4}
								>
									{
										getFieldDecorator('resolveTextTips', resolveChecked ? {
												initialValue: resolveContent,
												rules: [{validator: this.judgeEvaluateContent.bind(this)}]
											}
											:
											{
												initialValue: resolveContent
											})
										(
											<Input disabled={!resolveChecked} onKeyUp={this.getResolveTips.bind(this)}/>
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
										getFieldDecorator('resolve', resolveChecked ? {
												initialValue: resolveOptionArray.defaultCheckedValue,
												rules: [{required: true}]
											}
											:
											{
												initialValue: resolveOptionArray.defaultCheckedValue
											})
										(
											<CheckboxGroup
												style={{border: "10px solid green"}}
												options={resolveOptions}
												disabled={!resolveChecked}
												onChange={this.setOptionLevel.bind(this, resolveOption, "resolve")}
											/>
										)
									}
								</FormItem>
								<FormItem
									className="answerSetStyle"
									{...formItemLayout3}
									label={getLangTxt("setting_evalue_option_default")}
								>
									{
										getFieldDecorator('resolveDefaultOption', {
											initialValue: initialresolveCheckedDefaultItem && initialresolveCheckedDefaultItem.optionId || resolveOptionCheckedItem[0] && resolveOptionCheckedItem[0].value
										})
										(
											<RadioGroup disabled={!resolveChecked}
											            onChange={this.defaultOptionSet.bind(this, resolveOption)}
											            options={resolveOptionCheckedItem}/>
										)
									}
								</FormItem>
								<FormItem
									className="answerSetStyle"
									{...formItemLayout3}
									label={getLangTxt("setting_evalue_answer_set")}
								>
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
												<Switch onChange={this.onAdviseChange.bind(this)}
												        checked={adviseChecked}/>
											)
										}
									</FormItem>
									{
										this.state.isEditAdviseTitle ?
											<FormItem
												style={{display: "inline-block"}}
												className="evaluateTypeTitleForm"
												hasFeedback>
												{getFieldDecorator('isEditAdviseTitle', {
													initialValue: adviseTitle,
													rules: [{validator: this.judgeEvaluateTitle.bind(this)}]
												})(
													<Input className="evaluateTypeTitleIpt" autoFocus
													       onBlur={this.saveTitleContent.bind(this, "isEditAdviseTitle", adViseTipData)}/>
												)}
											</FormItem>

											:
											<span className="evaluateTypeTitleSpan"
											      onDoubleClick={this.getTitleContent.bind(this, "isEditAdviseTitle")}>{adviseTitle}</span>
									}
								</div>
								<FormItem
									className="sameFormExplainIpt"
									{...formItemLayout4}
									style={{marginBottom: "15px"}}
									label={getLangTxt("setting_evalue_tip")}
									help={getLangTxt("setting_evalue_tip_note")}
								>
									{
										getFieldDecorator('adViseTip', {
											initialValue: adviseContent,
											rules: [{max: 50}]
										})
										(
											<Input disabled={!adviseChecked} onKeyUp={this.getAdviseTips.bind(this)}/>
										)
									}
								</FormItem>
							</div>

							<FormItem
								className="evaButtonStyle"
								style={{marginBottom: "20px"}}
								{...formItemLayout3}
								label={getLangTxt("setting_evalue_content_btn")}
								help={getLangTxt("setting_evalue_tip_note2")}
							>
								{
									getFieldDecorator('evaBtnContent', {
										initialValue: evaluationButton,
										rules: [{validator: this.judgeEvaluateTitle.bind(this)}]
									})
									(
										<Input onKeyUp={this.getEvaluationButton.bind(this)}/>
									)
								}
							</FormItem>
						</ScrollArea>
						<FormItem className="submitEvaContent">
							<Button className="submitBtn" type="primary" htmlType="submit">{getLangTxt("save")}</Button>
						</FormItem>
					</Form>
				</div>
			</div>
		)
	}
}

EvaluateContent = Form.create()(EvaluateContent);

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

export default connect(mapStateToProps, mapDispatchToProps)(EvaluateContent);
