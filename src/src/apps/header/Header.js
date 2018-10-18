import React from 'react'
import WorkStatistics from '../workbench/view/WorkStatistics'
import User from './User'
import Logo from './Logo'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../../public/styles/header/header.scss'
import { OPEN_SUMMARY } from '../event/TabEvent';
import { getSummaryModal } from "../../utils/ConverUtils";
import { getChatSummaryAll } from "../setting/summary/action/summarySetting";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import Channel from "../../model/vo/Channel";
import { sendToMain } from "../../core/ipcRenderer";
import { App } from "../App";

class Header extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			showChatSummary: false,
			isLarge: App.isMaximizable
		};
		
		//this.handleOpenSummary = this.handleOpenSummary.bind(this);
		this.close = this.close.bind(this);
		
		//GlobalEvtEmitter.on(OPEN_SUMMARY, this.handleOpenSummary);
	}
	
	componentDidMount()
	{
		this.props.getChatSummaryAll();
	}
	
	componentWillUnmount()
	{
		//GlobalEvtEmitter.removeListener(OPEN_SUMMARY, this.handleOpenSummary)
	}
	
	/*handleOpenSummary(data)
	{
		if(data.tabData)
		{
			this.setState({
				showChatSummary: true,
				tabData: data.tabData,
				isCurrent: data.isCurrent
			});
		}
	}*/
	
	close()
	{
		this.setState({
			showChatSummary: false,
			tabData: null
		});
	}
	
	onOperate(value)
	{
		sendToMain(Channel.OPERATE, value);
		
		if(value === Channel.MAXIMIZABLE)
		{
			App.isMaximizable = !App.isMaximizable;
			this.setState({
				isLarge: App.isMaximizable
			})
		}
	}
	
	canDrag(value)
	{
		let style = {};
		style["-webkit-app-region"] = value ? "drag" : "no-drag";
		
		return style;
	}
	
	render()
	{
		let {tabData = {}, isLarge, isCurrent} = this.state,
			summaryProps = {
				visible: this.state.showChatSummary,
				summaryAll: this.props.summaryAll,
				converId: tabData && tabData.sessionId,
				rosterUser: tabData && (tabData.chatDataVo && tabData.chatDataVo.rosterUser) || {},
				close: this.close,
				isCurrent
			},
			isLargeIcon = isLarge ? 'icon-shouqi1 iconfont' : 'icon-fangkuang iconfont';
		
		return (
			<div className="header">
				<Logo logoUrl={this.props.logoUrl}/>
				{
					this.props.workbench === 1 ? <WorkStatistics canDrag={this.canDrag(!App.isMaximizable)}/> : null
				}
				<User/>
				{
					this.state.showChatSummary ? getSummaryModal(summaryProps) : null
				}
				{
					Type === 1 ?
						<div className="toolWrap">
							<button onClick={this.onOperate.bind(this, Channel.MINIMIZABLE)}>
								<i className="icon-cha iconfont"/>
							</button>
							
							<button onClick={this.onOperate.bind(this, Channel.MAXIMIZABLE)}>
								<i className={isLargeIcon}/>
							</button>
							
							<button onClick={this.onOperate.bind(this, Channel.MINIMIZABLE)}>
								<i className="icon-hengxian iconfont"/>
							</button>
						</div> : null
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {startUpData} = state,
		workbench = startUpData.get("workbench") || 0,
		logoUrl = startUpData.get("logourl") || "";
	
	return {
		workbench, logoUrl,
		summaryAll: state.summaryReducer.chatSummaryAll
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getChatSummaryAll}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
