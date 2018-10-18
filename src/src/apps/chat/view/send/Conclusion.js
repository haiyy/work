import React, { PropTypes } from 'react'
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Tooltip, Popover, Table } from 'antd';
import '../../../setting/summary/style/summary.scss';
import { bglen, substr } from '../../../../utils/StringUtils';
import { getSummaryModal } from "../../../../utils/ConverUtils";
import { getSummaryAll, getChatSummaryAll, getCommonSummary } from "../../../setting/summary/action/summarySetting";
import { getLangTxt } from "../../../../utils/MyUtil";
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";
import { OPEN_SUMMARY } from "../../../event/TabEvent";

class Conclusion extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.state = {
			visible: false,
			modal: false
		};
		
		this.handleOpenSummary = this.handleOpenSummary.bind(this);
		
		GlobalEvtEmitter.on(OPEN_SUMMARY, this.handleOpenSummary);
	}
	
	componentWillUnmount()
	{
		GlobalEvtEmitter.removeListener(OPEN_SUMMARY, this.handleOpenSummary)
	}
	
	handleOpenSummary()
	{
		this.setState({modal:true});
	}

	hide()
	{
		this.setState({
			modal: !this.state.modal
		});
	}

	handleVisibleChange()
	{
		this.setState({
			visible: !this.state.visible
		});
	}

	handleOk()
	{
		this.setState({
			visible: false,
			modal: false,
		});
	}

	handleCancel(e)
	{
		this.setState({
			visible: false,
			modal: false,
		});
	}

	componentDidMount()
	{
		this.props.getChatSummaryAll();
		// 2017.09.21 获取常用咨询总结
		this.props.getCommonSummary();
	}

	get rosterUser()
	{
		let chatData = this.props.chatData,
			chatDataVo = chatData.chatDataVo;

		if(chatDataVo)
		{
			return chatDataVo.rosterUser;
		}

		return null;
	}

	summarySubmit(record, index)
	{
		this.props.submitSummary([
			[{id: record.summaryid, content: record.content}],
			""
		]);

		this.setState({
			visible: !this.state.visible
		});
	}

	render()
	{
		const data = this.props.commonSummaryList || [],
			content = (
				<div className="commonsummary">
					<Table columns={column} dataSource={data} size="small" pagination={false} showHeader={false}
					       onRowClick={this.summarySubmit.bind(this)}
					       expandedRowRender={false}
					       locale={{emptyText: data.length === 0 ? getLangTxt("summary_no_data") : ''}}/>
					<a onClick={this.hide.bind(this)} style={{display: 'block', padding: '6px 8px'}}>更多</a>
				</div>
			),
			summaryProps = {
				visible: this.state.modal, summaryAll: this.props.summaryAll, converId: this.props.converId,
				rosterUser: this.rosterUser, close: this.hide.bind(this), isCurrent: true
			};

		return (
			<div className="conclusion">
				<Popover placement="top" title={""} content={content} trigger="hover" overlayClassName="many"
				         overlayStyle={{'width': '124px', zIndex: '10'}} visible={this.state.visible}
				         onVisibleChange={this.handleVisibleChange.bind(this)}>
					<Tooltip placement="bottom" title={this.props.item.get("title")}
                            overlayStyle={{lineHeight: '0.16rem'}}
					         arrowPointAtCenter>
						<i className={this.props.propsClassName}/>
					</Tooltip>
				</Popover>
				{
					this.state.modal ? getSummaryModal(summaryProps) : null
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {summaryReducer = {}, chatPageReducer = {}} = state,
		{commonSummaryList, chatSummaryAll} = summaryReducer,
		chatData = chatPageReducer.get("chatData") || {};

	return {commonSummaryList, summaryAll: chatSummaryAll, chatData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getSummaryAll, getChatSummaryAll, getCommonSummary}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Conclusion);

export const column = [{
	dataIndex: 'summaryid',
	render: (text, record) => {
		let title = record.content;
		return bglen(title) > 16 ?
			<Popover
				content={<div style={{maxWidth: '200px', height: 'auto', wordWrap: 'break-word'}}>{title}</div>}
				placement="topLeft">
				<span>{substr(title, 8) + '...'}</span>
			</Popover>
			:
			<span>{title}</span>
	}
}];
