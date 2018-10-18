import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Table, Tooltip, Modal, TreeSelect, Form } from 'antd';
import ScrollArea from 'react-scrollbar';
import './../style/thirdPartyAccess.scss';
import {
	getDeveloperWeChatList,
	deleteWeChatInfo,
	editWechatGroup,
	getWechatInfo
} from '../reducer/weChatReducer';
import WeChatTopSpeedModel from "./WeChatTopSpeedModel";
import WeChatDevelopModel from "./WeChatDevelopModel";
import WeChatAuthorization from "./WeChatAuthorization";
import SelectModel from "../public/SelectModel";
import { formatTimestamp, getLangTxt, getProgressComp } from "../../../../utils/MyUtil";
import { distribute } from "../../distribution/action/distribute";
import NTModal from "../../../../components/NTModal";

const confirm = Modal.confirm,
	warning = Modal.warning,
	TreeNode = TreeSelect.TreeNode,
	FormItem = Form.Item,
	modeComponentMap = {
		1: WeChatTopSpeedModel,
		2: WeChatDevelopModel,
		3: WeChatAuthorization
	};

class WeChat extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			isClickBtn: false,
			deleteModalIsShow: false,
			isNew: true,
			openId: '',
			isModify: false
		};
	}
	
	columns = [{
		title: getLangTxt("setting_wechat_name"),
		dataIndex: 'name',
		key: 'name'
	}, {
		title: getLangTxt("setting_wechat_butt_mode"),
		dataIndex: 'type',
		key: 'type',
		render: (text) => {
			let typeName = '';
			if(text === 1)
			{
				typeName = getLangTxt("setting_wechat_speed_mode");
			}
			else if(text === 2)
			{
				typeName = getLangTxt("setting_wechat_mode");
			}
			else if(text === 3)
			{
				typeName = getLangTxt("setting_wechat_access_mode");
			}
			return (
				<span>{typeName}</span>
			);
		}
	}, {
		title: getLangTxt("setting_wechat_butt_time"),
		dataIndex: 'time',
		key: 'time',
		render: (text) => {
			return (
				<span> {formatTimestamp(text, true)} </span>
			)
		}
	}, {
		title: getLangTxt("operation"),
		dataIndex: 'operate',
		key: 'operate',
		render: (text, record) => {
			return <div className="thirdPartyAccessOperateBox">
				<Tooltip placement="bottom" title={getLangTxt("setting_wechat_change_group")}>
					<i className="iconfont icon-zu" onClick={this.editWechatGroup.bind(this, record)}/>
				</Tooltip>
				<Tooltip placement="bottom" title={getLangTxt("edit")}>
					<i className="iconfont icon-bianji" onClick={this.editList.bind(this, record)}/>
				</Tooltip>
				<Tooltip placement="bottom" title={getLangTxt("del")}>
					<i className="iconfont icon-shanchu" onClick={this.delList.bind(this, record)}/>
				</Tooltip>
			</div>
		}
	}];
	
	componentDidMount()
	{
		this.props.getDeveloperWeChatList();
		this.props.distribute("template");
	}
	
	selectModel()
	{
		this.setState({
			isClickBtn: true
		})
	}
	
	editList(record)
	{
		let {type, openid: openId} = record;
		
		this.setState({mode: type, isNew: false, openId, isClickBtn: true});
	}
	
	delList(record)
	{
		this.setState({
			deleteModalIsShow: true,
			openId: record.openid
		})
	}
	
	/*修改接待组*/
	editWechatGroup(editItem)
	{
		this.setState({isModify: true, editItem});
		this.props.getWechatInfo(editItem.openid)
	}
	
	handleModifyOK()
	{
		let {editItem} = this.state;
		
		let {form} = this.props;
		
		form.validateFields((errors) => {
			if(errors || !editItem)
				return false;
			
			let obj = {
				openid: editItem.openid,
				groupid: form.getFieldValue("groupId")
			};
			this.props.editWechatGroup(obj)
			.then(result => {
				if(result.code != 200)
					warning({
						title: getLangTxt("err_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: getLangTxt("sure"),
						content: result.msg || getLangTxt("20034")
					});
			});
			this.setState({isModify: false});
		});
	}
	
	handleModifyCancel()
	{
		this.setState({isModify: false})
	}
	
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
		return <TreeNode value="groupid" title={getLangTxt("setting_wechat_group_nodata")} disabled/>;
	}
	
	showDeleteModal()
	{
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip skillWarnTip',
			content: <p style={{textAlign: 'center'}}>{getLangTxt("del_content")}</p>,
			cancelText: getLangTxt("cancel"),
			okText: getLangTxt("sure"),
			onOk: this.removeOk.bind(this),
			onCancel: this.removeCancel.bind(this)
		});
	}
	
	removeOk()
	{
		let {openId} = this.state;
		
		this.setState({
			deleteModalIsShow: false
		});
		
		this.props.deleteWeChatInfo({openid: openId});
	}
	
	removeCancel()
	{
		this.setState({
			deleteModalIsShow: false
		})
	}
	
	backToMain(isPrev)
	{
		this.setState({isClickBtn: isPrev, mode: null})
	}
	
	getModeView(mode, isNew, openId = "")
	{
		let weixinModelWrapper = document.getElementsByClassName('weixinModelWrapper');
		if(weixinModelWrapper && weixinModelWrapper.length > 0)
			weixinModelWrapper[0].style.display = 'none';
		
		let ModeComponent = modeComponentMap[mode];
		
		if(ModeComponent)
		{
			return <div className="Mode"><ModeComponent isNew={isNew} openId={openId} closePage={this.backToMain.bind(this)}/></div>
		}
		
		return null;
	}
	
	onSelectMode(mode, isNew = true)
	{
		this.setState({mode, isNew, isClickBtn: false});
	}
	
	render()
	{
		let {weChatReducer, groupData, form} = this.props,
			{getFieldDecorator} = form,
			developerWXList = weChatReducer.getIn(['developerWXList']) || [],
			progress = weChatReducer.getIn(['progress']) || [],
			weChatData = weChatReducer.getIn(['weChatData']) || {},
			{groupid = ""} = weChatData,
			{deleteModalIsShow, mode, isNew, isClickBtn, openId, isModify} = this.state,
			formItemLayout = {
				labelCol: {span: 8},
				wrapperCol: {span: 14}
			};
		
		return (
			<div className="weixinWrapper thirdPartyAccessWrapper">
				{
					!isClickBtn ?
						<div className="weixinBox">
							<div className="weixinHeader">
                                <span className="weixinHeaderText">
                                    <i className="iconfont icon-weixin1"></i>
                                    <span>{getLangTxt("setting_wechat_butt")}</span>
                                </span>
								<Button type="primary"
								        onClick={this.selectModel.bind(this)}>+{getLangTxt("setting_wechat_access")}</Button>
							</div>
							
							<div className="weixinContent">
								<p>{getLangTxt("setting_wechat_note1")}</p>
								<p>{getLangTxt("setting_wechat_note2")}</p>
								<ScrollArea speed={1} horizontal={false} smoothScrolling
								            style={{height: 'calc(100% - 60px)'}}>
									<Table dataSource={developerWXList} columns={this.columns} pagination={false}/>
								</ScrollArea>
							
							</div>
						</div>
						:
						<SelectModel onSelectMode={this.onSelectMode.bind(this)} closePage={this.backToMain.bind(this)}
						             type="weChat"/>
				}
				
				{
					mode ? this.getModeView(mode, isNew, openId) : null
				}
				
				{
					deleteModalIsShow ? this.showDeleteModal() : null
				}
				
				{
					isModify ?
						<NTModal visible
						         title={getLangTxt("setting_wechat_group_change")} onOk={this.handleModifyOK.bind(this)}
						         onCancel={this.handleModifyCancel.bind(this)}
						         width={400} wrapClassName="weChatGroupModal"
						>
							<Form hideRequiredMark={true}>
								<FormItem label={getLangTxt("setting_wechat_group")} {...formItemLayout} hasFeedback
								          className="weChatGroupFormItem">
									{
										getFieldDecorator('groupId', {
											initialValue: groupid ? groupid : undefined,
											rules: [{required: true}]
										})(
											<TreeSelect placeholder={getLangTxt("setting_wechat_group")} dropdownStyle={{
												maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'
											}}>
												{
													this._getWeChatGroupTreeNode(groupData)
												}
											</TreeSelect>
										)
									}
								</FormItem>
							</Form>
						
						</NTModal> : null
				}
				
				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}

WeChat = Form.create()(WeChat);

function mapStateToProps(state)
{
	const weChatReducer = state.weChatReducer;
	
	return {
		weChatReducer,
		groupData: state.distributeReducer.data || []
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getDeveloperWeChatList,
		deleteWeChatInfo,
		distribute,
		editWechatGroup,
		getWechatInfo
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WeChat);
