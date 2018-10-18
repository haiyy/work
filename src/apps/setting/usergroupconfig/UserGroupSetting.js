import React, { Component } from 'react';
import { Tabs, Tag, Form, Input, Card, Switch, InputNumber, Button, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FaqSettingCommon from '../FaqQuestion/FaqSettingCommon';
import FaqSettingCommonReadOnly from '../FaqQuestion/FaqSettingCommonReadOnly';
import './style/userGroupSetting.scss';
import '../receptiontime/style/receptiontime.scss'
import { getAutowelcomelevel, getResponselevel, autoUserResponse, templatesAutoResponseGreet, templateAutoResponse, resetAnswerProgress } from "../autoResponder/action/autoResponse";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import { getHyperMessageForJSON, isJsonString } from "../../../utils/HyperMediaUtils";
import ReceptionTimeTable from "../receptiontime/ReceptionTimeTable";
import ScrollArea from 'react-scrollbar';
import { getReceptionTime, setReceptionTime, sureCooperate } from "../receptiontime/reducer/receptionTimeReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { Modal } from "antd/lib/index";
import { bglen, stringLen } from "../../../utils/StringUtils";
import { confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const TabPane = Tabs.TabPane, FormItem = Form.Item,
	{TextArea} = Input;

class UserGroupSetting extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			receptionTime: false,
			canSave: true,
			announceLen: null
		}
	}

	userGroupArr = [
		{
			title: getLangTxt("setting_faq"), key: "faqsetting",
			fns: ["basictemplateinfo_common_edit", "basictemplateinfo_common_check"]
		},
		{
			title: getLangTxt("setting_autoreply_greeting"), key: "greet",
			fns: ["basictemplateinfo_greetings_edit", "basictemplateinfo_greetings_check"]
		},
		{
			title: getLangTxt("setting_autoreply1"), key: "autoreplay",
			fns: ["basictemplateinfo_response_edit", "basictemplateinfo_response_check"]
		},
		{
			title: getLangTxt("setting_recept_time"), key: "receptiontime",
			fns: ["basictemplateinfo_receptionedit", "basictemplateinfo_reception_check"]
		}
	];

	componentDidMount()
	{
		let {recordArr, settingOperation} = this.props;
		if(recordArr.length == 1)
		{
			recordArr.forEach((item) => {
				this.props.getAutowelcomelevel(item.templateid);
				this.props.getResponselevel(item.templateid);
				this.props.getReceptionTime(item.templateid);
			})
		}

		this.userGroupArr.forEach(item => {
			item.fns = getFnkey(item.fns, settingOperation)
		});
	}

	saveEditVal(activeKey)
	{
		let {recordArr, form} = this.props,
			obj = {},
			greetingVal = getHyperMessageForJSON(form.getFieldValue("value"), 11),
			custRepUseable = form.getFieldValue("check"),
			greetUseable = form.getFieldValue("title"),
			suprRepUseable = form.getFieldValue("titles"),
			templateids = [];

		custRepUseable ? custRepUseable = 1 : custRepUseable = 0;
		greetUseable ? greetUseable = 1 : greetUseable = 0;
		suprRepUseable ? suprRepUseable = 1 : suprRepUseable = 0;

		if(recordArr)
		{
			recordArr.map((item) => {
				templateids.push(item.templateid);
			})
		}

		this.receptionTimeData.templateid = templateids;

		if(activeKey === "greet")
		{
			form.validateFields((errors) =>
            {
                if(errors && errors.value)
                    return false;

				obj = {
					templateids: templateids,
					content: JSON.stringify(greetingVal),
					msgtype: greetingVal.msgtype
				};
				this.props.templatesAutoResponseGreet(obj)
			})
		}
		else if(activeKey === "autoreplay")
		{
			let contentHyperMsgJSON = getHyperMessageForJSON(form.getFieldValue("content"), 11),
				textoverHyperMsgJSON = getHyperMessageForJSON(form.getFieldValue("textover"), 11),
				textHyperMsgJSON = getHyperMessageForJSON(form.getFieldValue("text"), 11);

			form.validateFields((errors) =>
            {
				if(errors)
                {
                    if (errors.content || errors.text || errors.textover || errors.time || errors.timeover )
                    return false;
                }

				obj = {
					"templateids": templateids,
					"autoReply": {
						/*"item": 2,
						 "level": 1,*/
						"greeting": {
							"useable": custRepUseable,
							"waitTime": 0,
							"content": JSON.stringify(contentHyperMsgJSON),
							"msgtype": contentHyperMsgJSON.msgtype
						},
						"customerReply": {
							"useable": greetUseable,
							"waitTime": form.getFieldValue("time") * 60000,
							"content": JSON.stringify(textoverHyperMsgJSON),
							"msgtype": textoverHyperMsgJSON.msgtype
						},
						"supplierReply": {
							"useable": suprRepUseable,
							"waitTime": form.getFieldValue("timeover") * 60000,
							"content": JSON.stringify(textHyperMsgJSON),
							"msgtype": textHyperMsgJSON.msgtype
						}
					}
				};
				this.props.templateAutoResponse(obj);
			});
		}
		else if(activeKey === "receptiontime")
		{
            try
            {
                message.destroy();
            }
            catch(e) {}

			let {announceLen} = this.state;
			if(announceLen <= 500)
			{
				this.props.setReceptionTime(this.receptionTimeData);
			}
			else
			{
				message.error(getLangTxt("setting_notice_note"));
			}
		}
	}

	callback(activeKey)
	{
		this.setState({activeKey});
		this.props.resetAnswerProgress();
	}

	close(item)
	{

	}

	backUp()
	{
		this.props.returnToMain(false)
	}

	getUserGroupComp(key)
	{
		let {form} = this.props,
			{getFieldDecorator} = form,
			userItemComp = {
				basictemplateinfo_common_edit: this.getFaqSetting(),
				basictemplateinfo_common_check: this.getFaqSetting(true),
				basictemplateinfo_greetings_edit: this.getGreatingComp(getFieldDecorator),
				basictemplateinfo_greetings_check: this.getGreatingComp(getFieldDecorator, true),
				basictemplateinfo_response_edit: this._getAnswer(form),
				basictemplateinfo_response_check: this._getAnswer(form, true),
                basictemplateinfo_receptionedit: this.getReceptionTime(),
                basictemplateinfo_reception_check: this.getReceptionTime(true)
			};

		return userItemComp[key]
	}

	judgeTimeValue(rule, value, callback)
	{
		if(value)
		{
			callback();
		}
		callback(" ");
	}

	getTimeValue(initialValue, time)
	{
        try
        {
            message.destroy();
        }
        catch(e) {}
		let errorTypeName = initialValue.type == 1 ? getLangTxt("setting_autoreply_word5") : getLangTxt("setting_autoreply_word6");

		if(!time)
		{
			message.error(errorTypeName);
		}
	}

	judgeAnswerSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 1000)
		{
			callback();
		}
		callback(getLangTxt("setting_autoreply_word7"));
	}

	/*获取自动回复组件*/
	_getAnswer(form, isReadOnly)
	{
		let styles = {width: '100%', height: '60px', border: 'none', resize: 'none', lineHeight: '30px'},
			{getFieldDecorator} = form,
			conVal = form.getFieldValue("content"),
			textOverVal = form.getFieldValue("textover"),
			textWaitVal = form.getFieldValue("text"),
			conValnum,
			textOverValnum,
			textWaitValnum;

		let {templateResponse = {greeting: {}, customerReply: {}, supplierReply: {}}} = this.props,
			{
				greeting = {content: "", useable: 0, waitTime: 0}, customerReply = {
				content: "", useable: 0, waitTime: 0
			}, supplierReply = {content: "", useable: 0, waitTime: 0}
			} = templateResponse,
			{content: greetingContent, useable: greetingUseable} = greeting,
			{content: customerReplyContent, useable: customerReplyUseable, waitTime: customerReplyWaitTime} = customerReply,
			{content: supplierReplyContent, useable: supplierReplyUseable, waitTime: supplierReplyWaitTime} = supplierReply;

		let greetingJson = isJsonString(greetingContent) ? JSON.parse(greetingContent) : {message: ""},
			customerJson = isJsonString(customerReplyContent) ? JSON.parse(customerReplyContent) : {message: ""},
			supplierJson = isJsonString(supplierReplyContent) ? JSON.parse(supplierReplyContent) : {message: ""};

		conValnum = stringLen(conVal);
		textOverValnum = stringLen(textOverVal);
		textWaitValnum = stringLen(textWaitVal);

		return (
			<div className="userGroupReply">
				<Card className="answerBox">
					<div className="cardTitle_per">
						<span style={{
							display: "inline-block", height: "30px"
						}}>{getLangTxt("setting_autoreply_welcome")}</span>
						<FormItem className="answerUseableSwitch">
							{getFieldDecorator('check', {
								valuePropName: "checked",
								initialValue: greetingUseable == 1
							})(
								<Switch disabled={isReadOnly}/>
							)}
						</FormItem>
					</div>

					<FormItem>
						{getFieldDecorator('content', {
							initialValue: greetingJson.message,
							rules: [{validator: this.judgeAnswerSpace.bind(this)}]
						})(
							<Input disabled={isReadOnly} type="textarea" style={styles}/>
						)}
					</FormItem>
					<p className="wordNum">{conValnum} / 500</p>
				</Card>

				<Card className="answerBox">
					<div className="cardTitle_per">
						{
							getLangTxt("setting_autoreply_word1")
						}
						<FormItem style={{display: "inline-block"}}>
							{
								getFieldDecorator('time', {
									initialValue: customerReplyWaitTime / 60000,
									rules: [{validator: this.judgeTimeValue.bind(this)}]
								})(
									<InputNumber disabled={isReadOnly} min={0} precision={0} style={{
										marginLeft: "10px", position: 'relative', top: '6px', width: '52px'
									}} onChange={this.getTimeValue.bind(this, customerReply)}/>
								)
							}
						</FormItem>
						{getLangTxt("setting_autoreply_word2")}
						<FormItem className="answerUseableSwitch">
							{getFieldDecorator('title', {
								valuePropName: "checked",
								initialValue: customerReplyUseable == 1
							})(
								<Switch disabled={isReadOnly}/>
							)}
						</FormItem>
					</div>

					<FormItem style={{width: '100%', height: '60px'}}>
						{getFieldDecorator('textover', {
							initialValue: customerJson.message,
							rules: [{validator: this.judgeAnswerSpace.bind(this)}]
						})(
							<Input disabled={isReadOnly} type="textarea" style={styles}/>
						)}
					</FormItem>
					<p className="wordNum">{textOverValnum} / 500</p>
				</Card>

				<Card className="answerBox">
					<div className="cardTitle_per">
						{getLangTxt("setting_autoreply_word3")}{
						<FormItem style={{display: "inline-block"}}>
							{getFieldDecorator('timeover', {
								initialValue: supplierReplyWaitTime / 60000,
								rules: [{validator: this.judgeTimeValue.bind(this)}]
							})(
								<InputNumber disabled={isReadOnly} min={0} precision={0} style={{
									marginLeft: "10px", position: 'relative', top: '6px', width: '52px'
								}} onChange={this.getTimeValue.bind(this, supplierReply)}/>
							)}
						</FormItem>
					}{getLangTxt("setting_autoreply_word8")}
						<FormItem className="answerUseableSwitch">
							{getFieldDecorator('titles', {
								valuePropName: "checked",
								initialValue: supplierReplyUseable == 1
							})(
								<Switch disabled={isReadOnly}/>
							)}
						</FormItem>
					</div>

					<FormItem style={{width: '100%', height: '60px'}}>
						{getFieldDecorator('text', {
							initialValue: supplierJson.message,
							rules: [{validator: this.judgeAnswerSpace.bind(this)}]
						})(
							<Input disabled={isReadOnly} type="textarea" style={styles}/>
						)}
					</FormItem>
					<p className="wordNum">{textWaitValnum} / 500</p>
				</Card>
			</div>
		)
	}

	get receptionTimeData()
	{
		let {receptionTimeData} = this.props;
		if(!receptionTimeData)
			return null;

		return receptionTimeData.get("data");
	}

	onContentCheckBoxChange({target: {checked}})
	{
		this.receptionTimeData.receptionTime.contentUseable = checked ? 1 : 0;
		this.forceUpdate();
	}

	judgeAnnounceLen({target: {value}})
	{

		let announceLen = stringLen(value);

		this.receptionTimeData.receptionTime.content = value ? value : "";
		this.setState({announceLen});
	}

	onCanSave(bool)
	{
		this.forceUpdate();
	}

	get cansave()
	{
		try
		{
			let index = this.receptionTimeData.receptionTime.items.findIndex(value => (!value.itemid || value.isEdit));

			return index > -1;
		}
		catch(e)
		{

		}

		return false;
	}

	get progress()
	{
		let {receptionTimeData} = this.props;
		if(!receptionTimeData)
			return LoadProgressConst.LOAD_COMPLETE;

		return receptionTimeData.get("progress");
	}

	get error()
	{
		let {receptionTimeData} = this.props;
		if(!receptionTimeData)
			return LoadProgressConst.LOAD_COMPLETE;

		return receptionTimeData.get("msg");
	}

	get errorMessage()
	{
		if(this.progress === LoadProgressConst.SAVING_FAILED && !this.modal)
		{
			this.modal = error({
				title: getLangTxt("tip1"),
				iconType: 'exclamation-circle',
				className: 'errorTip',
				content: <div>{this.error ? this.error : getLangTxt("20034")}</div>,
				width: '320px',
				okText: getLangTxt("sure"),
				onOk: () => {
					this.modal = null;
					this.props.sureCooperate();
				}
			});
		}

		return null;
	}

	/*获取接待时间组件*/
	getReceptionTime(diabled)
	{
		if(!this.receptionTimeData || !this.receptionTimeData.receptionTime)
			return null;

		let {content, contentUseable, items} = this.receptionTimeData.receptionTime,
			templateid = [],
			{recordArr} = this.props,
			{canSave, announceLen} = this.state,
			announceNum = stringLen(content),
			textIllegalStatus = announceLen > 500 ? "announceText illegalStatus" : "announceText",
			textLenStatus = announceLen > 500 ? "userGroupTextLenStatus illegalTextLenStatus" : "userGroupTextLenStatus";

		if(announceLen != announceNum)
			this.setState({
				announceLen: announceNum
			});

		if(!items)
		{
			this.receptionTimeData.receptionTime.items = items = [];
		}

		if(recordArr && Array.isArray(recordArr))
		{
			templateid = recordArr.map(value => value.templateid);
		}

		content = content ? content : "";

		return (
			<div className="receptionComp">
				<ScrollArea speed={1} horizontal={false} className="receptionUserScrollArea">
					<ReceptionTimeTable itemList={items} templateid={templateid} isNew={this.onCanSave.bind(this)}
                        disabled={diabled} cansave={this.cansave}/>
					<Checkbox className="announceIO" defaultChecked={contentUseable} disabled={diabled}
					          onChange={this.onContentCheckBoxChange.bind(this)}>{getLangTxt("notice")}</Checkbox>

					<TextArea className={textIllegalStatus} defaultValue={content}
					          disabled={contentUseable == 0 || diabled}
					          onChange={this.judgeAnnounceLen.bind(this)}/>,
					<span className={textLenStatus}>{announceLen + "/500"}</span>
				</ScrollArea>
				{
					this.errorMessage
				}
			</div>
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

	/*获取问候语组件*/
	getGreatingComp(getFieldDecorator, isReadOnly)
	{
		let {templateGreet = {content: ""}} = this.props,
			{content} = templateGreet,
			editContent = "";

		if(content && isJsonString(content))
		{
			let editContentJson = JSON.parse(content) || {};
			editContent = editContentJson.message || "";
		}
		else
		{
			editContent = content;
		}
		return <div style={{height: "87%", position: "relative", padding: "0 20px"}}>
			<p style={{margin: "20px 0 15px 0"}}>{getLangTxt("setting_autoreply_greeting_content")}</p>

			<FormItem>
				{getFieldDecorator('value', {
					initialValue: editContent,
					rules: [{validator: this.judgeIptLength.bind(this)}]

				})(
					<Input disabled={isReadOnly} type="textarea"
					       style={{width: '459px', height: '124px', resize: 'none'}}/>
				)}
			</FormItem>

		</div>
	}

	getFaqSetting(readOnly)
	{
		if(readOnly)
			return <FaqSettingCommonReadOnly/>;

		return <FaqSettingCommon userFaqSetting={true} recordArr={this.props.recordArr}/>
	}

	/*获取当前选择用户群标签*/
	getUserGroupTag()
	{
		let {recordArr} = this.props;

		return <div className="tagWrapper">
			{
				recordArr ?
					recordArr.map((item, index) => {
						return (
							<Tag key={index}/* closable
                                onClose={this.close.bind(this, item)}*/>
								{(item.name.length > 10 ? item.name.slice(0, 10) + '...' : item.name)}
							</Tag>
						)
					}) : null
			}
		</div>
	}

	render()
	{
		let {progress} = this.props,
			{activeKey, canSave} = this.state,
			statusClassname,
			userGroupComp = this.userGroupArr.filter(item => item.fns) || [],
			isReception = activeKey === "receptiontime" || (userGroupComp.length == 1 && userGroupComp[0].key === "receptiontime"),
			saveProgress = isReception ? this.progress : progress;
		return (
			<Form className="userGroupSetting">
				<Tabs /*defaultActiveKey={} */ onChange={this.callback.bind(this)}>
					{
						userGroupComp.length ? userGroupComp.map((item, index) => {
							// statusClassname = index == 1 || index == 2 ? 'submitStatus submitStatusDouble' : 'submitStatus';
							return (
								<TabPane tab={item.title} key={item.key}>
									{this.getUserGroupTag()}
									{this.getUserGroupComp(item.fns)}
									<div className="backWrapper">
										{
                                            !(index == 0 && item.key == "faqsetting") ?
												<Button type="primary" className="saveBtn"
												        disabled={isReception && this.cansave}
												        onClick={this.saveEditVal.bind(this, item.key)}
												>{getLangTxt("save")}
												</Button>
												:
												null
										}
										<Button type="primary" className="backBtn"
										        onClick={this.backUp.bind(this)}>{getLangTxt("back")}</Button>
									</div>
									{
										_getProgressComp(saveProgress, "submitStatus submitStatusDouble")
									}
									{
										this.errorMessage
									}
								</TabPane>
							);
						}) : <div className="noLimitModuleComp" onClick={this.backUp.bind(this)}>
							<span>{getLangTxt("load_note3")}</span></div>
					}
				</Tabs>
			</Form>
		)
	}
}

function getFnkey(fns, setting)
{
	/*if (fns.length && fns.length < 2)
		return fns[0];
	return fns.find(key => setting.includes(key));*/
	let showFns = fns.filter(item => setting.includes(item));

	if(showFns.length > 1)
	{
		return showFns[0];
	}
	else if(showFns.length === 1)
	{
		if(fns.length === 1)
		{
			return showFns[0];
		}
		else
		{
			if(showFns[0] === fns[1]) //确保check
			{
				return showFns[0];
			}
		}
	}

	return '';
}

UserGroupSetting = Form.create()(UserGroupSetting);

function mapStateToProps(state)
{
	let {startUpData} = state,
		settingOperation = startUpData.get("settingOperation") || [];
	return {
		templateGreet: state.getAutoWelcome.data,
		templateResponse: state.getResponselevel.data,
		receptionTimeData: state.receptionTimeReducer,
		progress: state.autoresponse.progress,
		settingOperation
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getAutowelcomelevel, getResponselevel, autoUserResponse, templatesAutoResponseGreet, templateAutoResponse,
		resetAnswerProgress, getReceptionTime, setReceptionTime, sureCooperate
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupSetting);
