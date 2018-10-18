import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './../style/thirdPartyAccess.scss';
import { Button, Form, Input, TreeSelect, message, Modal } from 'antd';
import { setWeChatInfo, getWechatAccessInfo, getWechatInfo, editWeChatInfo } from '../reducer/smallRoutineReducer';
import copy from 'copy-to-clipboard';
import { bglen } from "../../../../utils/StringUtils";
import ScrollArea from 'react-scrollbar';
import { getLangTxt } from "../../../../utils/MyUtil";

const FormItem = Form.Item,
	confirm = Modal.confirm,
	TreeNode = TreeSelect.TreeNode;

class SmallRoutineTopSpeedModel extends React.Component {
	
	constructor(props)
	{
		super(props);
		this.state = {
			copyText: ''
		}
	}
	
	componentDidMount()
	{
		let {isNew, getWechatAccessInfo, getWechatInfo, openId} = this.props;
		
		isNew ? getWechatAccessInfo() : getWechatInfo(openId);
	}
	
	/******保存开发模式******/
	saveTopspeedModelFun()
	{
		let {form, isNew} = this.props,
			{getFieldsValue} = form,
			obj = getFieldsValue(['name', 'openId', 'appId', 'appSecret', 'token', 'url', 'encodingAESKey', 'groupId']),
			info = JSON.stringify(obj);
		
		form.validateFields((errors) => {
			if(errors)
				return false;
			
			if(!isNew)
			{
				this.props.editWeChatInfo({mode: 1, info})
				.then(result => {
					this.resultFun(result);
				})
			}
			else
			{
				this.props.setWeChatInfo({mode: 1, info})
				.then(result => {
					this.resultFun(result);
				})
			}
		});
	}
	
	resultFun(result)
	{
		let errorMsg = getLangTxt("20034");
		
		if(result && result.code === 200)
		{
			this.props.closePage();
		}
		else
		{
			if(result && result.msg)
				errorMsg = result.msg;
			
			confirm({
				title: getLangTxt("tip"),
				width: '320px',
				iconType: 'exclamation-circle',
				className: 'warnTip skillWarnTip',
				content: <p style={{textAlign: 'center'}}>{errorMsg}</p>
			});
		}
	}
	
	/*行政组树渲染*/
	_getSmallRouGroupTreeNode(treeData)
	{
		if(treeData)
			return treeData.map(item => {
				let {templateid, name} = item;
				templateid = String(templateid);
				
				if(item.children && item.children.length > 0)
				{
					return (
						<TreeNode value={templateid} title={name} key={templateid}>
							{
								this._getSmallRouGroupTreeNode(item.children)
							}
						</TreeNode>
					);
				}
				return <TreeNode value={templateid} title={name} key={templateid}/>;
			});
		return <TreeNode value="groupid" title={getLangTxt("setting_wechat_admin_group_change")} disabled/>;
	}
	
	/*点击取消按钮*/
	handleCancel()
	{
		this.props.closePage();
	}
	
	/*点击上一步*/
	handlePrevStep()
	{
		this.props.closePage(true);
	}
	
	copyFun(content)
	{
		try
		{
			if(document.execCommand('copy', false, null))
			{
				document.execCommand('copy', false, null);
			}
			else
			{
				message.error(getLangTxt("setting_hypermedia_note1"));
			}
		}catch(err)
		{
			message.error(getLangTxt("setting_hypermedia_note2"));
		}
		
		copy(content);
		
		this.setState({copyText: content});
		
		if(content != this.state.copyText)
			message.success(getLangTxt("setting_hypermedia_note3"));
	}
	
	textValidator(textLen, rule, value, callback)
	{
		let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
		if(value && value.trim() !== "" && bglen(value) <= textLen && accountNameRe.test(value))
		{
			callback();
		}
		callback(" ");
	}
	
	render()
	{
		let {smallRoutineReducer, weChatData, groupData, isNew} = this.props,
			{url = "", token = "", encodingAESKey = ""} = weChatData,
			progress = smallRoutineReducer.getIn(['progress']);
		
		weChatData = isNew ? {} : weChatData;
		
		let {name = "", openid = "", appid = "", appsecret = "", groupid = ""} = weChatData;
		
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {
					xs: {span: 24},
					sm: {span: 3}
				},
				wrapperCol: {
					xs: {span: 24},
					sm: {span: 21}
				}
			};
		
		return (
			<div className="topspeedModelContent">
				<ScrollArea speed={1} horizontal={false} smoothScrolling style={{height: 'calc(100% - 70px)'}}>
					<Form hideRequiredMark={true}>
						<p className="titleExplain">
							<span className="number">1</span>
							{getLangTxt("setting_smallroutine_step1")}
						</p>
						<FormItem label={getLangTxt("setting_smallroutine_name")} {...formItemLayout} hasFeedback>
							{getFieldDecorator('name', {
								initialValue: name,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label={getLangTxt("setting_smallroutine_id")} {...formItemLayout} hasFeedback>
							{getFieldDecorator('openId', {
								initialValue: openid,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input disabled={openid ? true : false}/>
							)}
						</FormItem>
						<FormItem label="APP ID" {...formItemLayout} hasFeedback>
							{getFieldDecorator('appId', {
								initialValue: appid,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label="AppSecret" {...formItemLayout} hasFeedback>
							{getFieldDecorator('appSecret', {
								initialValue: appsecret,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input/>
							)}
						</FormItem>
						<p className="titleExplain">
							<span className="number">2</span>
							{getLangTxt("setting_smallroutine_step2")}
						</p>
						<FormItem label={getLangTxt("setting_wechat_server_url")} {...formItemLayout}
						          className="disAbledForm">
							{getFieldDecorator('url', {
								initialValue: url
							})(
								<Input disabled/>
							)}
							<Button type="primary"
							        onClick={this.copyFun.bind(this, url)}>{getLangTxt("setting_wechat_copy")}</Button>
						</FormItem>
						<FormItem label="Token" {...formItemLayout} className="disAbledForm">
							{getFieldDecorator('token', {
								initialValue: token
							})(
								<Input disabled/>
							)}
							<Button type="primary"
							        onClick={this.copyFun.bind(this, token)}>{getLangTxt("setting_wechat_copy")}</Button>
						</FormItem>
						<FormItem label="EncodingAESKey" {...formItemLayout} className="disAbledForm">
							{getFieldDecorator('encodingAESKey', {
								initialValue: encodingAESKey
							})(
								<Input disabled/>
							)}
							<Button type="primary"
							        onClick={this.copyFun.bind(this, encodingAESKey)}>{getLangTxt("setting_wechat_copy")}</Button>
						</FormItem>
						<p className="titleExplain">
							<span className="number">3</span>
							{getLangTxt("setting_smallroutine_step3")}
						</p>
						<FormItem label={getLangTxt("setting_smallroutine_group")} {...formItemLayout} hasFeedback
						          className="customFormItem">
							{
								getFieldDecorator('groupId', {
									initialValue: groupid ? groupid : undefined,
									rules: [{required: true}]
								})(
									<TreeSelect placeholder={getLangTxt("setting_smallroutine_group")} dropdownStyle={{
										maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'
									}}>
										{
											this._getSmallRouGroupTreeNode(groupData)
										}
									</TreeSelect>
								)
							}
						</FormItem>
					</Form>
				</ScrollArea>
				<div className="bottomBtnWrapper">
					<Button type="primary" onClick={this.saveTopspeedModelFun.bind(this)}>{getLangTxt("sure")}</Button>
					<Button type="primary" onClick={this.handlePrevStep.bind(this)}>{getLangTxt("pre_step")}</Button>
					<Button onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>
			</div>
		)
	}
}

SmallRoutineTopSpeedModel = Form.create()(SmallRoutineTopSpeedModel);

function mapStateToProps(state)
{
	const smallRoutineReducer = state.smallRoutineReducer,
		weChatData = smallRoutineReducer.get("weChatData") || {},
		groupData = state.distributeReducer.data || [];
	
	return {
		smallRoutineReducer, weChatData, groupData
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({setWeChatInfo, getWechatAccessInfo, getWechatInfo, editWeChatInfo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SmallRoutineTopSpeedModel);
