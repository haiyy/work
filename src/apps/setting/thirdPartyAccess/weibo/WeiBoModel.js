import React from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, message } from 'antd';
import {
	setWeiBoInfo,
	getWeiboAccessInfo,
	getWeiBoInfo,
    editWeiBoInfo
} from "./../reducer/weiboReducer";
import { bindActionCreators } from 'redux';
import copy from 'copy-to-clipboard';
import ScrollArea from 'react-scrollbar';
import { getLangTxt } from "../../../../utils/MyUtil";
import TreeSelect from "../../../public/TreeSelect";
import TreeNode from "../../../../components/antd2/tree/TreeNode";
import Modal,{ confirm, info, error, success, warning } from "../../../../components/xn/modal/Modal";

const FormItem = Form.Item;
	//confirm = Modal.confirm,
	//TreeNode = TreeSelect.TreeNode;

class WeiBoModel extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			copyText: ''
		}
	}

	componentDidMount()
	{
		let {isNew, getWeiBoInfo, openId, getWeiboAccessInfo} = this.props;

		isNew ? getWeiboAccessInfo() : getWeiBoInfo(openId);
	}

	saveModelFun()
	{
		let {form, isNew} = this.props,
			{getFieldsValue} = form,
			obj = getFieldsValue(['name', 'openId', 'accessToken', 'groupId']),
			info = JSON.stringify(obj);

		form.validateFields((errors) => {
			if(errors)
				return false;

            if (!isNew)
            {
                this.props.editWeiBoInfo({type: 1, info}).then(result => {
                    this.resultFun(result);
                })
            }
            else
            {
                this.props.setWeiBoInfo({type: 1, info}).then(result => {
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

	/*点击上一步*/
	handlePrevStep()
	{
		this.props.closePage();
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

	/*行政组树渲染*/
	_getWeiboGroupTreeNode(treeData)
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
								this._getWeiboGroupTreeNode(item.children)
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
		if(value && value.trim() !== "")
		{
			callback();
		}
		callback(" ");
	}

	render()
	{
		let {weiboData, groupData, isNew} = this.props,
			{appkey, url} = weiboData;

		weiboData = isNew ? {} : weiboData;

		let {name = "", accesstoken = "", groupid = "", openid = ""} = weiboData;

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
							{getLangTxt("setting_weibo_step1")}
						</p>
						<FormItem label={getLangTxt("setting_weibo_name")} {...formItemLayout} hasFeedback>
							{getFieldDecorator('name', {
								initialValue: name,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem label={getLangTxt("setting_weibo_id")} {...formItemLayout} hasFeedback>
							{getFieldDecorator('openId', {
								initialValue: openid,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input disabled={openid ? true : false}/>
							)}
						</FormItem>
						<p className="titleExplain">
							<span className="number">2</span>
							{getLangTxt("setting_weibo_step2")}
						</p>
						<FormItem label={getLangTxt("setting_wechat_server_url")} {...formItemLayout} className="disAbledForm">
							{getFieldDecorator('serverUrl', {
								initialValue: url,
								rules: [{required: true}]
							})(
								<Input disabled/>
							)}
							<Button type="primary" onClick={this.copyFun.bind(this, url)}>{getLangTxt("setting_wechat_copy")}</Button>
						</FormItem>
						<FormItem label="APPKEY" {...formItemLayout} className="disAbledForm">
							{getFieldDecorator('appKey', {
								initialValue: appkey,
								rules: [{required: true}]
							})(
								<Input disabled/>
							)}
							<Button type="primary" onClick={this.copyFun.bind(this, appkey)}>{getLangTxt("setting_wechat_copy")}</Button>
						</FormItem>
						<p className="titleExplain">
							<span className="number">3</span>
							{getLangTxt("setting_weibo_step3")}
						</p>
						<FormItem label="access_token" {...formItemLayout} hasFeedback>
							{getFieldDecorator('accessToken', {
								initialValue: accesstoken,
								rules: [{validator: this.textValidator.bind(this, 1000)}]
							})(
								<Input/>
							)}
						</FormItem>
						<p className="titleExplain">
							<span className="number">4</span>
							{getLangTxt("setting_weibo_step4")}
						</p>
						<FormItem label={getLangTxt("setting_weibo_group")} {...formItemLayout} hasFeedback className="customFormItem">
							{
								getFieldDecorator('groupId', {
									initialValue: groupid ? groupid : undefined,
									rules: [{required: true}]
								})(
									<TreeSelect placeholder={getLangTxt("请选择微博客服组")}
                                        treeNode={this._getWeiboGroupTreeNode(groupData)}
                                    />
								)
							}
						</FormItem>
					</Form>
				</ScrollArea>

				<div className="bottomBtnWrapper">
					<Button type="primary" onClick={this.saveModelFun.bind(this)}>{getLangTxt("sure")}</Button>
					<Button type="primary" onClick={this.handlePrevStep.bind(this)}>{getLangTxt("pre_step")}</Button>
					<Button onClick={this.handlePrevStep.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>
			</div>
		)
	}
}

WeiBoModel = Form.create()(WeiBoModel);

function mapStateToProps(state)
{
	return {
		weiboData: state.weiboReducer.get("weiboData") || {},
		progress: state.weiboReducer.get("progress") || {},
		groupData: state.distributeReducer.data || []
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({setWeiBoInfo, getWeiboAccessInfo, getWeiBoInfo, editWeiBoInfo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WeiBoModel);
