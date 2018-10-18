import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Form, Input, TreeSelect, Modal } from 'antd';
import './../style/thirdPartyAccess.scss';
import ScrollArea from 'react-scrollbar';
import { setWeChatInfo, getWechatInfo, editWeChatInfo } from '../reducer/weChatReducer';
import { bglen } from "../../../../utils/StringUtils";
import { getLangTxt } from "../../../../utils/MyUtil";

const FormItem = Form.Item,
	confirm = Modal.confirm,
	TreeNode = TreeSelect.TreeNode;

class WeChatDevelopModel extends React.Component {

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
            if (!isNew)
            {
                this.props.editWeChatInfo({mode: 2, info}).then(result => {
                    this.resultFun(result);
                });
            }
            else
            {
                this.props.setWeChatInfo({mode: 2, info}).then(result => {
                    this.resultFun(result);
                });
            }
		})
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
            if (result && result.msg)
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

	/*行政组树渲染*/
	_getWeChatGroupTreeNode(treeData)
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
								this._getWeChatGroupTreeNode(item.children)
							}
						</TreeNode>
					);
				}
				return <TreeNode value={templateid} title={name} key={templateid}/>;
			});
		return <TreeNode value="groupid" title={getLangTxt("setting_wechat_admin_group_change")} disabled/>;
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
		let reUrl01 = /[a-zA-z]+:\/\/[^\s]*/;

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

		let {name = "", openid = "", appid = "", appsecret = "", texturl = "", uploadurl = "", downloadurl = "", tokenurl = "", userinfourl = "", groupid = ""} = weChatData;

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
				<div className="developWeChatScroll">
					<Form hideRequiredMark={true}>
						<p className="titleExplain">
							<span className="number">1</span>
							{getLangTxt("setting_wechat_step1")}
						</p>
						<FormItem label={getLangTxt("setting_wechat_name1")} {...formItemLayout} hasFeedback>
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
						<FormItem label="App ID" {...formItemLayout} hasFeedback>
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
							{getLangTxt("setting_wechat_step3")}
						</p>
						<FormItem label={getLangTxt("setting_wechat_group")} {...formItemLayout} hasFeedback className="customFormItem">
							{
								getFieldDecorator('groupId', {
									initialValue: groupid ? groupid : undefined,
									rules: [{required: true}]
								})(
									<TreeSelect placeholder={getLangTxt("setting_wechat_group")} dropdownStyle={{
                                                    maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'
                                                }}
                                                getPopupContainer={() => document.getElementsByClassName('developWeChatScroll')[0]}
                                    >
										{
											this._getWeChatGroupTreeNode(groupData)
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
				</div>

				<div className="bottomBtnWrapper">
					<Button type="primary" onClick={this.saveDevelopModelFun.bind(this)}>{getLangTxt("sure")}</Button>
					<Button type="primary" onClick={this.handlePrevStep.bind(this)}>{getLangTxt("pre_step")}</Button>
					<Button onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>
			</div>
		)
	}
}

WeChatDevelopModel = Form.create()(WeChatDevelopModel);

function mapStateToProps(state)
{
	return {
		weChatData: state.weChatReducer.get("weChatData") || {},
		groupData: state.distributeReducer.data || []
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({setWeChatInfo, getWechatInfo, editWeChatInfo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WeChatDevelopModel);
