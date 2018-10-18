import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Switch, Input, Button, Card, InputNumber, Modal, message } from 'antd';
import { getAnswer, setAnswer, clearAnswerProgress } from './action/personalSetting';
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import {getHyperMessageForJSON, isJsonString} from "../../../utils/HyperMediaUtils";
import { bglen, stringLen } from "../../../utils/StringUtils";
import { confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const FormItem = Form.Item;

class Answer extends Component {

	onCancel()
	{
		this.props.onCancel(false);
	}

	componentDidMount()
	{
		this.props.getAnswer();
	}

    componentWillReceiveProps(nextProps) {
        let {progress: nextProgress, answer, isIgnoreEdit} = nextProps,
            {progress: thisProgress, answer: answerThis, isIgnoreEdit: isIgnoreEditThis} = this.props;

        if (answer && !answerThis)
        {
            this.handleSubmit();
        }

        if (isIgnoreEdit && !isIgnoreEditThis)
        {
            this.props.form.resetFields();
        }

        if (thisProgress === LoadProgressConst.SAVING_SUCCESS)
        {
            // this.props.onCancel();
            this.props.clearAnswerProgress()
        }

        if (nextProgress !== thisProgress)
        {
            if (nextProgress === LoadProgressConst.SAVING_FAILED)
            {
                this.getSavingErrorMsg();
            }
        }
    }

    getSavingErrorMsg()
    {
        error({
            title: getLangTxt("tip1"),
            iconType: 'exclamation-circle',
            className: 'errorTip',
            content: <div>{getLangTxt("20034")}</div>,
            width: '320px',
            okText: getLangTxt("sure"),
            onOk:()=>{
                this.props.clearAnswerProgress()
            }
        });
    }

	handleSubmit(e)
	{
        if (e)
            e.preventDefault();

		this.props.form.validateFields((errors) =>
		{
			if(errors)
            {
                this.props.afterSavingData("answer");
                return;
            }

            let {getFieldValue} = this.props.form;

            let userValueHyperMsgJSON = getHyperMessageForJSON(getFieldValue("userValue"), 11),
                noreplyValueHyperMsgJSON = getHyperMessageForJSON(getFieldValue("noreplyValue"), 11),
                waitValueHyperMsgJSON = getHyperMessageForJSON(getFieldValue("waitValue"), 11);

            let user = {
            	content: JSON.stringify(userValueHyperMsgJSON),
                    msgtype: userValueHyperMsgJSON.msgtype,
            	useable: getFieldValue("userChecked") ? 1 : 0
            },
            noreply = {
            	content: JSON.stringify(noreplyValueHyperMsgJSON),
                    msgtype: noreplyValueHyperMsgJSON.msgtype,
            	useable: getFieldValue("noreplyChecked") ? 1 : 0,
            	waitTime: getFieldValue("noreplyTime") * 60000
            },
            wait = {
            	content: JSON.stringify(waitValueHyperMsgJSON),
                    msgtype: waitValueHyperMsgJSON.msgtype,
            	useable: getFieldValue("waitChecked") ? 1 : 0,
            	waitTime: getFieldValue("waitTime") * 60000
            }/*,
            data = {
                    customerReply: noreply,
                    greeting: user,
                    supplierReply: wait
            }*/, {state} = this.props;

            Object.assign(state.customerReply, noreply);
            Object.assign(state.greeting, user);
            Object.assign(state.supplierReply, wait);

                let obj = {
                    autoReply: state
                };
            delete obj.autoReply.siteid;
            delete obj.autoReply.userid;

            this.props.setAnswer(obj);
            this.props.afterSavingData("answer", true);
        });
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

        if (!time)
        {
            message.error(errorTypeName);
            initialValue && (initialValue.waitTime = 60000);
        }else
        {
            initialValue && (initialValue.waitTime = time * 60000);
        }
    }

    judgeAnswerSpace(isJudge, rule, value, callback)
    {
        if(!isJudge || value && value.trim() !== "" && bglen(value) <= 1000)
        {
            callback();
        }
        callback(getLangTxt("setting_autoreply_word7"));
    }

    judgeTimeValue(isJudge, rule, value, callback)
    {
        if(!isJudge || value)
        {
            callback();
        }
        callback(" ");
    }

	render()
	{
        let {getFieldDecorator} = this.props.form,
			{state = {}, progress, form} = this.props,
			{customerReply = {}, supplierReply = {}, greeting = {}} = state || {},
			{content = ""} = greeting,
			{waitTime: gtWaittime = 60000, content: gtContent = ""} = customerReply,
			{waitTime: srWaittime = 60000, content: srContent = ""} = supplierReply;

        let userValueContent = isJsonString(content) ? JSON.parse(content) : {message: ""},
            noreplyContent = isJsonString(gtContent) ? JSON.parse(gtContent) : {message: ""},
            waitValueContent = isJsonString(srContent) ? JSON.parse(srContent) : {message: ""},
            connectText = form.getFieldValue("userValue") || userValueContent.message,
			unReplyText = form.getFieldValue("noreplyValue") || noreplyContent.message,
			waitText = form.getFieldValue("waitValue") || waitValueContent.message,
			cTNum = connectText ? stringLen(connectText) : 0,
			uRTNUM = unReplyText ? stringLen(unReplyText) : 0,
			wTNum = waitText ? stringLen(waitText) : 0;

		return (
			<div className="answer">
				<Form onSubmit={this.handleSubmit.bind(this)}>
					<Card>
						<div className="cardTitle">
							{getLangTxt("setting_autoreply_welcome")}
							<FormItem className="switchFormItem">
								{
									getFieldDecorator('userChecked', {
										valuePropName: "checked",
										initialValue: greeting.useable == 1
									})(

										<Switch  onChange={this.getUseableValue.bind(this, greeting)}/>
									)
								}
							</FormItem>
						</div>
						<FormItem className="textareaFormItem">
							{
								getFieldDecorator('userValue', {
									initialValue: connectText,
                                    rules:[{validator: this.judgeAnswerSpace.bind(this, greeting.useable == 1)}]
								})(
									<Input onChange={this.getTextAreaContent.bind(this, greeting)} type="textarea" id="textarea" className="textarea" name="textarea"
									       style={{resize: "none"}}  placeholder={getLangTxt("setting_autoreply_welcome2")}/>
								)
							}
						</FormItem>
						<p className="wordNum">{cTNum} / 500</p>
					</Card>

					<Card>
						<div className="cardTitle">
							{getLangTxt("setting_autoreply_word1")}
							<FormItem style={{display: 'inline-block', marginTop: '3px', marginLeft: '10px'}}>
								{
									getFieldDecorator('noreplyTime', {
                                        initialValue: gtWaittime / 60000,
                                        rules:[{validator: this.judgeTimeValue.bind(this, customerReply.useable == 1)}]
                                    })(
										<InputNumber min={1} onChange={this.getTimeValue.bind(this, customerReply)}/>
									)
								}
							</FormItem>
							{getLangTxt("setting_autoreply_word8")}
							<FormItem className="switchFormItem">
								{
									getFieldDecorator('noreplyChecked', {
										valuePropName: "checked",
										initialValue: customerReply.useable == 1
									})(<Switch onChange={this.getUseableValue.bind(this, customerReply)}/>)
								}
							</FormItem>
						</div>
						<FormItem className="textareaFormItem">
							{
								getFieldDecorator('noreplyValue', {
									initialValue: unReplyText,
                                    rules:[{validator: this.judgeAnswerSpace.bind(this, customerReply.useable == 1)}]
								})(
									<Input type="textarea" id="textarea" className="textarea" name="textarea"
									       style={{resize: "none"}} onChange={this.getTextAreaContent.bind(this, customerReply)}/>
								)
							}
						</FormItem>
						<p className="wordNum">{uRTNUM} / 500</p>
					</Card>

					<Card>
						<div className="cardTitle">
							{getLangTxt("setting_autoreply_word3")}
							<FormItem style={{display: 'inline-block', marginTop: '3px', marginLeft: '10px'}}>
								{
									getFieldDecorator('waitTime', {
                                        initialValue: (srWaittime / 60000),
                                        rules:[{validator: this.judgeTimeValue.bind(this, supplierReply.useable == 1)}]
                                    })(
										<InputNumber min={1} onChange={this.getTimeValue.bind(this, supplierReply)}/>
									)
								}
							</FormItem>
							{getLangTxt("setting_autoreply_word8")}
							<FormItem className="switchFormItem">
								{
									getFieldDecorator('waitChecked', {
										valuePropName: "checked",
										initialValue: supplierReply.useable == 1
									})(<Switch onChange={this.getUseableValue.bind(this, supplierReply) } />)
								}
							</FormItem>
						</div>
						<FormItem className="textareaFormItem">
							{
								getFieldDecorator('waitValue', {
									initialValue: waitText,
                                    rules:[{validator: this.judgeAnswerSpace.bind(this, supplierReply.useable == 1)}]
								})(
									<Input onChange={this.getTextAreaContent.bind(this, supplierReply)} type="textarea" id="textarea" className="textarea" name="textarea"
									       style={{resize: "none"}}/>
								)
							}
						</FormItem>
						<p className="wordNum">{wTNum} / 500</p>
					</Card>
					<FormItem className="footer">
						<Button type="ghost" onClick={this.onCancel.bind(this)}>{getLangTxt("cancel")}</Button>
						<Button type="primary" htmlType="submit">{getLangTxt("sure")}</Button>
					</FormItem>
				</Form>
                {
                    _getProgressComp(progress, "submitStatus userSaveStatus")
                }
			</div>
		)
	}
}

Answer = Form.create({
    onValuesChange(props, values) {
        props.isValueChange(true, "answer");
    }
})(Answer);

function mapStateToProps(state)
{
	let {personalReducer} = state,
		infomation = personalReducer.get("answer") || Map(),
		answer = infomation.get("data") || {},
		progress = infomation.get("progress");

	return {
		state:answer,
		progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAnswer, setAnswer, clearAnswerProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Answer);
