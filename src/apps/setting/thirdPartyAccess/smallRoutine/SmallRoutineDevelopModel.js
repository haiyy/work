import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Form, Input, TreeSelect } from 'antd';
import { setWeChatInfo, getWechatInfo, editWeChatInfo } from '../reducer/smallRoutineReducer';
import ScrollArea from 'react-scrollbar';
import { bglen } from "../../../../utils/StringUtils";
import { getLangTxt } from "../../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../../components/xn/modal/Modal";

const FormItem = Form.Item,
	//confirm = Modal.confirm,
	TreeNode = TreeSelect.TreeNode;

class SmallRoutineDevelopModel extends React.Component {
	
	constructor(props)
	{
		super(props);
	}
	
	componentDidMount()
	{
		let {isNew, getWechatInfo, openId} = this.props;
		
		if(!isNew)
			getWechatInfo(openId);
	}
	
	/******保存开发模式******/
	saveDevelopModelFun()
	{
		let {form, isNew} = this.props,
			{getFieldsValue} = form,
			obj = getFieldsValue(['name', 'openId', 'appId', 'appSecret', 'groupId', 'textUrl', 'uploadUrl', 'downloadUrl', 'tokenUrl', 'userUrl']),
			info = JSON.stringify(obj);
		
		form.validateFields((errors) => {
			if(errors)
				return false;
			
			if(!isNew)
			{
				this.props.editWeChatInfo({mode: 2, info})
				.then(result => {
					this.resultFun(result);
				})
			}
			else
			{
				this.props.setWeChatInfo({mode: 2, info})
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
	
	textValidator(textLen, rule, value, callback)
	{
		let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
		if(value && value.trim() !== "" && bglen(value) <= textLen && accountNameRe.test(value))
		{
			callback();
		}
		callback(" ");
	}
	
	urlValidator(rule, value, callback)
	{
		let reUrl01 = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
		
		if(value && value.trim() !== "" && reUrl01.test(value))
		{
			callback();
		}
		callback(" ");
	}
	
	render()
	{
		let {weChatData, groupData, isNew} = this.props;
		
		weChatData = isNew ? {} : weChatData;
		
		let {name = "", appid = "", appsecret = "", openid = "", texturl = "", uploadurl = "", downloadurl = "", tokenurl = "", userinfourl = "", groupid = "", url = ""} = weChatData;
		
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {
					xs: {span: 24},
					sm: {span: 4}
				},
				wrapperCol: {
					xs: {span: 24},
					sm: {span: 20}
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
						<FormItem label={getLangTxt("setting_wechat_server_url")} {...formItemLayout} hasFeedback>
							{getFieldDecorator('url', {
								initialValue: url,
								rules: [{validator: this.urlValidator.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
						<p className="titleExplain">
							<span className="number">2</span>
							{getLangTxt("setting_smallroutine_step3")}
						</p>
						<FormItem label={getLangTxt("setting_smallroutine_group")} {...formItemLayout} hasFeedback className="customFormItem">
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
						<p className="titleExplain">
							<span className="number">3</span>
							{getLangTxt("setting_wechat_step4")}
						</p>
						<FormItem label={getLangTxt("setting_wechat_text")} {...formItemLayout} extra={getLangTxt("setting_wechat_text_note")} hasFeedback>
							{getFieldDecorator('textUrl', {
								initialValue: texturl,
								rules: [{validator: this.urlValidator.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label={getLangTxt("setting_wechat_image")} {...formItemLayout} extra={getLangTxt("setting_wechat_image_note")} hasFeedback>
							{getFieldDecorator('uploadUrl', {
								initialValue: uploadurl,
								rules: [{validator: this.urlValidator.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label={getLangTxt("setting_wechat_image1")} {...formItemLayout} extra={getLangTxt("setting_wechat_image1_note1")} hasFeedback>
							{getFieldDecorator('downloadUrl', {
								initialValue: downloadurl,
								rules: [{validator: this.urlValidator.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label="Token URL" {...formItemLayout} extra={getLangTxt("setting_wechat_image1_note")} hasFeedback>
							{getFieldDecorator('tokenUrl', {
								initialValue: tokenurl,
								rules: [{validator: this.urlValidator.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label={getLangTxt("setting_wechat_use_info")} {...formItemLayout} extra={getLangTxt("setting_wechat_text_note")} hasFeedback>
							{getFieldDecorator('userUrl', {
								initialValue: userinfourl,
								rules: [{validator: this.urlValidator.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
					</Form>
				</ScrollArea>
				
				<div className="bottomBtnWrapper">
					<Button type="primary" onClick={this.saveDevelopModelFun.bind(this)}>{getLangTxt("sure")}</Button>
					<Button type="primary" onClick={this.handlePrevStep.bind(this)}>{getLangTxt("pre_step")}</Button>
					<Button onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>
			</div>
		)
	}
}

SmallRoutineDevelopModel = Form.create()(SmallRoutineDevelopModel);

function mapStateToProps(state)
{
	return {
		weChatData: state.smallRoutineReducer.get("weChatData") || {},
		groupData: state.distributeReducer.data || []
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({setWeChatInfo, getWechatInfo, editWeChatInfo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SmallRoutineDevelopModel);
