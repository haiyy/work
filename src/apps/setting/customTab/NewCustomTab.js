import React from 'react';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { Button, Form, Input, Icon,  message } from 'antd';
import "./style/customTab.scss";
import ParamSetting from "./ParamSetting";
import { addTab, editTab, getCustomerTabParams } from "./tabReducer/customerTabReducer";

const FormItem = Form.Item;
import { bglen, stringLen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class NewCustomTab extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			parameter: [],
			isParamCompleteWarned: false,
			tabNameHelp: null
		};
	}
	
	componentDidMount()
	{
		if(this.props.editData)
		{
			let {parameter = []} = this.props.editData;
			this.setState({parameter});
		}
		
		this.props.getCustomerTabParams();
	}
	
	judgeSpace(rule, value, callback)
	{
		if(value && typeof value !== "string")
			return callback();
		
		if(value && value.trim() !== "" && bglen(value) <= 20)
		{
			callback();
		}
		callback(" ");
	}
	
	//验证URL地址
	judgeUrl(rule, value, callback)
	{
		let reUrl01 = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
		if(value && reUrl01.test(value))
		{
			callback();
		}
		callback(getLangTxt("setting_custom_tab_note1"));
	}
	
	//获取所选参数值 array
	getParamsData(parameter)
	{
		this.setState({parameter})
	}
	
	//取消
	handleCancelNewTab()
	{
		let path = [{"title": getLangTxt("setting_access_set"), "key": "accessSetting"},
			{
				"title": getLangTxt("setting_custom_tab"), "key": "customtab",
				"fns": ["custom_tab_edit", "custom_tab_check"]
			}];
		this.props.route(path);
	}
	
	//参数填写错误只提示一次，提示过则不再提示
	isParamCompleteWarned(isParamCompleteWarned)
	{
		this.setState({isParamCompleteWarned})
	}
	
	//参数填写错误只提示一次，页面内容改动重新提示
	changeWarnedStatus()
	{
		this.isParamCompleteWarned(false);
	}
	
	//保存
	handleSaveNewTab()
	{
		let {form} = this.props,
			{parameter, isParamCompleteWarned} = this.state,
			commitParameter = [...parameter],
			saveErrorMsg = getLangTxt("20034");
		
		if(commitParameter.length > 0)
		{
			commitParameter.forEach(item => {
				delete item.data;
			})
		}
		form.validateFields((errors) => {
			
			let path = [{"title": getLangTxt("setting_access_set"), "key": "accessSetting"}, {
					"title": getLangTxt("setting_custom_tab"), "key": "customtab",
					"fns": ["custom_tab_edit", "custom_tab_check"]
				}],
				commitData = {
					"tabname": form.getFieldValue("tabName"),
					"url": form.getFieldValue("tabLink"),
					"parameter": commitParameter
				},
				{editData} = this.props,
				emptyItem;
			
			if(commitParameter.length > 0)
			{
				commitParameter.forEach((item, index) => {
					if(item.tabKey === "")
					{
						commitParameter.splice(index, 1)
					}
				})
			}
			
			emptyItem = commitParameter.find(item => {
				return item.tabValue === "" || item.tabValue.trim() === ""
			});
			
			if(errors)
				return false;
			
			if(emptyItem)
			{
				if(!isParamCompleteWarned)
					message.error({
						title: getLangTxt("err_tip"),
						content: getLangTxt("setting_custom_tab_note2"),
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: getLangTxt("sure")
					});
				
				this.isParamCompleteWarned(true);
				return false;
			}
			
			if(editData)
			{
				Object.assign(editData, commitData);
				this.props.editTab(editData)
				.then(result => {
					if(result.success)
					{
						this.props.route(path);
					}
					else
					{
						if(result.code === 404)
							saveErrorMsg = getLangTxt("setting_custom_tab_note3");
						warning({
							title: getLangTxt("err_tip"),
							iconType: 'exclamation-circle',
							className: 'errorTip',
							content: saveErrorMsg,
							okText: getLangTxt("sure"),
							width: '320px'
						});
					}
					
				});
			}
			else
			{
				this.props.addTab(commitData)
				.then(result => {
					if(result.success)
					{
						this.props.route(path);
					}
					else
					{
						if(result.code === 404)
							saveErrorMsg = getLangTxt("setting_custom_tab_note3");
						warning({
							title: getLangTxt("err_tip"),
							iconType: 'exclamation-circle',
							className: 'errorTip',
							content: saveErrorMsg,
							okText: getLangTxt("sure"),
							width: '320px'
						});
					}
				});
			}
		})
	}
	
	setNameHelp({target: {value}})
	{
		let tabNameHelp = value ? stringLen(value) : 0;
		
		this.setState({tabNameHelp: tabNameHelp + '/10'});
	}
	
	render()
	{
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 2},
				wrapperCol: {span: 18}
			};
		let {editData} = this.props,
			{tabNameHelp} = this.state;
		
		tabNameHelp || Object.assign(this.state, {tabNameHelp: editData ? stringLen(editData.tabname) + "/10" : '0/10'});
		
		return (
			<div className="newCustomTabWrap clearFix">
				<div className="newCustomTabHeade">
					<div className="headWrap" onClick={this.handleCancelNewTab.bind(this)}>
						<Icon className="iconStyle backIcon" type="left"/>
						<span className="backText">{getLangTxt("back")}</span>
					</div>
				</div>
				
				<div className="customTable">
					<Form className="newCustomTabForm">
						<FormItem
							{...formItemLayout}
							label={getLangTxt("rightpage_tab_showname")}
							hasFeedback
							help={tabNameHelp}
						>
							{getFieldDecorator('tabName', {
								initialValue: editData ? editData.tabname : '',
								rules: [{validator: this.judgeSpace.bind(this), required: true}]
							})(
								<Input onKeyUp={this.setNameHelp.bind(this)}
								       onBlur={this.changeWarnedStatus.bind(this)}/>
							)}
						</FormItem>
						
						<FormItem
							{...formItemLayout}
							className="tabLinkIpt"
							label={getLangTxt("setting_custom_tab_link")}
							hasFeedback
						>
							{getFieldDecorator('tabLink', {
								initialValue: editData ? editData.url : '',
								rules: [{validator: this.judgeUrl.bind(this), required: true}]
							})(
								<Input onBlur={this.changeWarnedStatus.bind(this)}/>
							)}
						</FormItem>
					</Form>
					
					<div className="newCustomTabMiddle">
						<ParamSetting
							editParamData={editData && editData.parameter}
							getParamsData={this.getParamsData.bind(this)}
							isParamCompleteWarned={this.isParamCompleteWarned.bind(this)}
						/>
					</div>
					
					<div className="newCustomTabBottom">
						<p className="title">{getLangTxt("setting_custom_tab_rule")}</p>
						<p className="item">{getLangTxt("setting_custom_tab_word1")}</p>
						<p className="textContent">{getLangTxt("setting_custom_tab_word2")}</p>
						<p className="item">{getLangTxt("setting_custom_tab_word3")}</p>
						<p className="textContent">
							{getLangTxt("setting_custom_tab_word4")}
						</p>
						<p className="textContent">
							{getLangTxt("setting_custom_tab_word5")}
						</p>
						<p className="textContent">
							{getLangTxt("setting_custom_tab_word6")}
						</p>
						<p className="item">{getLangTxt("setting_custom_tab_word7")}</p>
						<img src={require('../../../public/images/example.png')}/>
					</div>
				</div>
				
				<div className="btnWrap">
					<Button type="ghost" onClick={this.handleCancelNewTab.bind(this)}>{getLangTxt("cancel")}</Button>
					<Button type="primary" onClick={this.handleSaveNewTab.bind(this)}>{getLangTxt("save")}</Button>
				</div>
			</div>
		)
	}
}

NewCustomTab = Form.create()(NewCustomTab);

function mapStateToProps(state)
{
	return {
		state
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({addTab, editTab, getCustomerTabParams}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCustomTab);

