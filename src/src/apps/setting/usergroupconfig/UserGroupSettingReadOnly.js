import React, { Component } from 'react';
import { Tabs, Tag, Form, Input, Card, Switch, InputNumber, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FaqSettingCommon from '../FaqQuestion/FaqSettingCommon';
import FaqSettingCommonReadOnly from '../FaqQuestion/FaqSettingCommonReadOnly';
import './style/userGroupSetting.scss';
import { getAutowelcomelevel, getResponselevel, autoUserResponse, templatesAutoResponseGreet, templateAutoResponse, resetAnswerProgress } from "../autoResponder/action/autoResponse";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import {getHyperMessageForJSON, isJsonString} from "../../../utils/HyperMediaUtils";

const TabPane = Tabs.TabPane, FormItem = Form.Item;

class UserGroupSettingReadOnly extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			disabled: true,
			settings: false,
			webChat: false,
			usualQuestion: false,
			greetWorld: false,
			autoReply: false
		}
	}

	componentWillMount()
	{
		let record = this.props.recordArr, obj;
		if(record.length == 1)
		{
			record.map((item) =>
			{
				this.props.getAutowelcomelevel(item.templateid);
				this.props.getResponselevel(item.templateid);
			})
		}
	}

	saveEditVal()
	{
		let {recordArr, form} = this.props,
			obj = {},
			greetingVal = getHyperMessageForJSON(form.getFieldValue("value"), 11),
			custRepUseable = form.getFieldValue("check"),
			greetUseable = form.getFieldValue("title"),
			suprRepUseable = form.getFieldValue("titles");
		custRepUseable ? custRepUseable = 1 : custRepUseable = 0;
		greetUseable ? greetUseable = 1 : greetUseable = 0;
		suprRepUseable ? suprRepUseable = 1 : suprRepUseable = 0;

		let templateids = [];

		if(recordArr)
		{
			recordArr.map((item) =>
			{
				templateids.push(item.templateid);
			})
		}
		if(this.state.greetWorld || this.props.greetWorld)
		{
			/*obj = {
			 templateids: templateids,
			 welcome: {
			 "item": 1,
			 "level": 1,
			 "content": greetingVal
			 }
			 };*/
			obj = {
				templateids: templateids,
				content: JSON.stringify(greetingVal),
                msgtype: greetingVal.msgtype
			};
			this.props.templatesAutoResponseGreet(obj)
		}
		else if(this.state.autoReply || this.props.autoReply)
		{
            let {form} = this.props,
                contentHyperMsgJSON = getHyperMessageForJSON(form.getFieldValue("content"), 11),
                textoverHyperMsgJSON = getHyperMessageForJSON(form.getFieldValue("textover"), 11),
                textHyperMsgJSON = getHyperMessageForJSON(form.getFieldValue("text"), 11);

            form.validateFields((errors) => {
                if (errors)
                return false;

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
	}

	callback(key)
	{
		if(key == 1)
		{
			this.setState({webChat: false, usualQuestion: true, greetWorld: false, autoReply: false});
		}
		if(key == 2)
		{
			this.setState({webChat: false, usualQuestion: false, greetWorld: true, autoReply: false});
		}
		if(key == 3)
		{
			this.setState({webChat: false, usualQuestion: false, greetWorld: false, autoReply: true});
		}

        this.props.resetAnswerProgress();
		/*switch(key){
		 case 1 : console.log("设置成功共");
		 break;
		 case 2 : this.setState({});
		 break;
		 case 3 : this.setState({webChat: false, usualQuestion: false, greetWorld: true, autoReply: false});
		 break;
		 case 4 : this.setState({webChat: false, usualQuestion: false, greetWorld: false, autoReply: true});
		 break;
		 }*/
	}

	close(item)
	{

	}

	confirmEdit()
	{

	}

	backUp()
	{
		this.props.returnToMain(false)
	}

	goToWeb()
	{
        let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"}, {"title": getLangTxt("setting_webview"), "key": "webview"}];
		this.props.route(path);
	}

	_getAnswer(temResponse, getFieldDecorator)
	{

		let styles = {width: '100%', height: '60px', border: 'none', resize: 'none', lineHeight: '30px'},
            {form} = this.props,
			conVal = form.getFieldValue("content"),
			textOverVal = form.getFieldValue("textover"),
			textWaitVal = form.getFieldValue("text"),
			conValnum,
			textOverValnum,
			textWaitValnum,
			temResponseVal;

		let {
				greeting = {content: "", useable: 0, waitTime: 0}, customerReply = {
					content: "", useable: 0, waitTime: 0
				}, supplierReply = {content: "", useable: 0, waitTime: 0}
			} = temResponse,
			{content: greetingContent, useable: greetingUseable} = greeting,
			{content: customerReplyContent, useable: customerReplyUseable, waitTime: customerReplyWaitTime} = customerReply,
			{content: supplierReplyContent, useable: supplierReplyUseable, waitTime: supplierReplyWaitTime} = supplierReply;

        let greetingJson = isJsonString(greetingContent) ? JSON.parse(greetingContent) : {message: ""},
            customerJson = isJsonString(customerReplyContent) ? JSON.parse(customerReplyContent) : {message: ""},
            supplierJson = isJsonString(supplierReplyContent) ? JSON.parse(supplierReplyContent) : {message: ""};

		conVal ? conValnum = conVal.length : conValnum = 0;
		textOverVal ? textOverValnum = textOverVal.length : textOverValnum = 0;
		textWaitVal ? textWaitValnum = textWaitVal.length : textWaitValnum = 0;

		return (
			<div className="userGroupReply">
				<Card className="answerBox">
					<div className="cardTitle_per">
						<span style={{display: "inline-block", height: "30px"}}>{getLangTxt("setting_autoreply_welcome")}</span>
						<FormItem style={{float: 'right'}}>
							{getFieldDecorator('check', {
                                valuePropName: "checked",
                                initialValue: greetingUseable == 1
                            })(
								<Switch disabled />
							)}
						</FormItem>
					</div>

					<FormItem>
						{getFieldDecorator('content', {
                            initialValue: greetingJson.message
                        })(
							<Input disabled type="textarea" style={styles}/>
						)}
					</FormItem>
					<p className="wordNum">{conValnum} / 500</p>
				</Card>

				<Card className="answerBox">
					<div className="cardTitle_per">
						{getLangTxt("setting_autoreply_word1")}{
						<FormItem style={{display: "inline-block"}}>
							{getFieldDecorator('time', {initialValue: customerReplyWaitTime / 60000 || 1})(
								<InputNumber disabled min={1} style={{
									marginLeft: "10px", height: "28px", position: 'relative', top: '4px'
								}}/>
							)}
						</FormItem>
					}{getLangTxt("setting_autoreply_word8")}
						<FormItem style={{float: 'right'}}>
							{getFieldDecorator('title', {
								valuePropName: "checked",
                                initialValue: customerReplyUseable == 1
							})(
								<Switch disabled />
							)}
						</FormItem>
					</div>

					<FormItem style={{width: '100%', height: '60px'}}>
						{getFieldDecorator('textover', {
                            initialValue: customerJson.message
                        })(
							<Input disabled type="textarea" style={styles}/>
						)}
					</FormItem>
					<p className="wordNum">{textOverValnum} / 500</p>
				</Card>

				<Card className="answerBox">
					<div className="cardTitle_per">
						{getLangTxt("setting_autoreply_word3")}{
						<FormItem style={{display: "inline-block"}}>
							{getFieldDecorator('timeover', {initialValue: supplierReplyWaitTime / 60000 || 1})(
								<InputNumber disabled min={1} style={{
									marginLeft: "10px", height: "28px", position: 'relative', top: '4px'
								}}/>
							)}
						</FormItem>
					}{getLangTxt("setting_autoreply_word8")}
						<FormItem style={{float: 'right'}}>
							{getFieldDecorator('titles', {
								valuePropName: "checked",
                                initialValue: supplierReplyUseable == 1
							})(
								<Switch disabled />
							)}
						</FormItem>
					</div>

					<FormItem style={{width: '100%', height: '60px'}}>
						{getFieldDecorator('text', {
                            initialValue: supplierJson.message
                        })(
							<Input disabled type="textarea" style={styles}/>
						)}
					</FormItem>
					<p className="wordNum">{textWaitValnum} / 500</p>
				</Card>
			</div>
		)
	}

	render()
	{

		let {
				templateResponse = {
					greeting: {}, customerReply: {}, supplierReply: {}
				}, templateGreet = {content: ""}, progress
			} = this.props,
			{greeting, customerReply, supplierReply} = templateResponse,
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

		let arr = [getLangTxt("setting_faq"), getLangTxt("setting_autoreply_greeting"), getLangTxt("autoResp")], num = 1, {getFieldDecorator} = this.props.form,
            statusClassname;

		arr.map((item, index) =>
		{
			if(this.props.name == item)
			{
				num = index + 1 + "";
			}
		});
		const tags = (
				<div className="tagWrapper">
					{
						this.props.recordArr ? this.props.recordArr.map((item, index) =>
						{
							return (<Tag key={index} closable
							             onClose={this.close.bind(this, item)}>{(item.name.length > 10 ? item.name.slice(0, 10) + '...' : item.name)}</Tag>)
						}) : null
					}
				</div>
			),
			user = (<p className="userGroupSettingWrapper">
				<Icon type="exclamation-circle-o"
				      style={{fontSize: '0.18rem', marginRight: 11, position: 'relative', top: '6'}}/>
                <span>{getLangTxt("note1")}</span>
                <span className="autoAnswerConfigure" onClick={this.goToWeb.bind(this)} style={{ cursor: "pointer"}}>{getLangTxt("setting_users_word2")}</span>
                <span>{getLangTxt("note3")}</span>
			</p>),
			greetingComponent = (
				<div style={{height: "87%", position: "relative", padding: "0 20px"}}>
					<p style={{margin: "20px 0 15px 0"}}>{getLangTxt("setting_autoreply_greeting_content")}</p>

					<FormItem>
						{getFieldDecorator('value', {initialValue: editContent})(
							<Input disabled type="textarea" style={{width: '459px', height: '124px', resize: 'none'}}/>
						)}
					</FormItem>

				</div>
			),
			response = (
				<div>
					{this._getAnswer(templateResponse, getFieldDecorator)}
				</div>
			);

		return (
			<Form className="userGroupSetting">
				<Tabs defaultActiveKey={ num } onChange={this.callback.bind(this)}>
					{
						arr.map((item, index) =>
						{
                           statusClassname = index == 1 || index == 2 ? 'submitStatus submitStatusDouble':'submitStatus';
							return (
								<TabPane tab={item} key={index + 1}>
									{ tags }
									{ index == 0 ?
                                        /*<FaqSettingCommon userFaqSetting={true}
									                                 recordArr={this.props.recordArr}/>*/
                                        <FaqSettingCommonReadOnly userFaqSetting={true}
									                                 recordArr={this.props.recordArr}/> : null }
									{ index == 1 ? greetingComponent : null }
									{ index == 2 ? response : null }
									<div className="backWrapper">
                                        {
                                            index != 0 ?
                                                <Button disabled type="primary" className="saveBtn">{getLangTxt("save")}</Button>
                                                : null
                                        }
										<Button type="primary" className="backBtn" onClick={this.backUp.bind(this)}>{getLangTxt("back")}</Button>
									</div>
                                    {
                                        _getProgressComp(progress, statusClassname)
                                    }
								</TabPane>
							);
						})
					}
				</Tabs>
			</Form>
		)
	}
}

UserGroupSettingReadOnly = Form.create()(UserGroupSettingReadOnly);

function mapStateToProps(state)
{
	return {
		templateGreet: state.getAutoWelcome.data,
		templateResponse: state.getResponselevel.data,
        progress: state.autoresponse.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getAutowelcomelevel, getResponselevel, autoUserResponse, templatesAutoResponseGreet, templateAutoResponse, resetAnswerProgress
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupSettingReadOnly);
