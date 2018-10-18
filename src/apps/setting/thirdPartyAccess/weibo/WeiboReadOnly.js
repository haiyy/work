import React from 'react';
import { connect } from 'react-redux';
import { Button, Table, Tooltip } from 'antd';
import {
	getCompanyWeiBoList,
	deleteWeiBoInfo
} from "./../reducer/weiboReducer";
import { bindActionCreators } from 'redux';
import WeiBoModel from "./WeiBoModel";
import ScrollArea from 'react-scrollbar';
import { formatTimestamp, getLangTxt, getProgressComp } from "../../../../utils/MyUtil";
import { getAccountGroup } from "../../account/accountAction/sessionLabel";
import Modal,{ confirm, info, error, success, warning } from "../../../../components/xn/modal/Modal";
//const confirm = Modal.confirm;

class WeiboReadOnly extends React.Component {
	
	constructor(props)
	{
		super(props);
		this.state = {
			isClickBtn: false,
			deleteModalIsShow: false,
			isNew: true,
			openId: ''
		}
	}
	
	columns = [{
		title: getLangTxt("setting_weibo_count"),
		dataIndex: 'name',
		key: 'name'
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
			return (
				<div className="thirdPartyAccessOperateBox">
					<Tooltip placement="bottom" title={getLangTxt("edit")}>
						<i className="iconfont icon-bianji"/>
					</Tooltip>
					<Tooltip placement="bottom" title={getLangTxt("del")}>
						<i className="iconfont icon-shanchu"/>
					</Tooltip>
				</div>
			)
		}
	}];
	
	componentDidMount()
	{
		this.props.getCompanyWeiBoList();
		this.props.getAccountGroup();
	}
	
	selectModel()
	{
		this.setState({
			isClickBtn: true
		})
	}
	
	editList(record)
	{
		let {openid: openId} = record;
		
		this.setState({
			isClickBtn: true,
			isNew: false,
			openId
		})
	}
	
	delList(record)
	{
		this.setState({
			deleteModalIsShow: true,
			openId: record.openid
		})
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
		
		this.props.deleteWeiBoInfo({openid: openId});
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
	
	render()
	{
		let {weiboReducer} = this.props,
			developerWXList = weiboReducer.getIn(['developerWXList']) || [],
			progress = weiboReducer.getIn(['progress']) || [],
			{deleteModalIsShow, isNew, isClickBtn, openId} = this.state;
		
		return (
			<div className="weiboWrapper thirdPartyAccessWrapper">
				{
					!isClickBtn ?
						<div>
							<div className="weiboHeader">
                                <span className="weiboHeaderText">
                                    <i className="iconfont icon-weibo1"></i>
                                    <span>{getLangTxt("setting_weibo_butt")}</span>
                                </span>
								<Button type="primary" disabled>+{getLangTxt("setting_weibo_access")}</Button>
							</div>
							
							<div className="weiboContent">
								<p>{getLangTxt("setting_weibo_note1")}</p>
								<p>{getLangTxt("setting_weibo_note2")}</p>
								<ScrollArea speed={1} horizontal={false} smoothScrolling
								            style={{height: 'calc(100% - 60px)'}}>
									<Table dataSource={developerWXList} columns={this.columns} pagination={false}/>
								</ScrollArea>
							</div>
						</div>
						:
						<WeiBoModel isNew={isNew} openId={openId} closePage={this.backToMain.bind(this)}/>
				}
				
				{
					deleteModalIsShow ? this.showDeleteModal() : null
				}
				
				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	const weiboReducer = state.weiboReducer;
	
	return {
		weiboReducer
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getCompanyWeiBoList, deleteWeiBoInfo, getAccountGroup}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WeiboReadOnly);
