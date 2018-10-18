import React from 'react';
import { Tabs, Modal, Popover } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import '../../../../public/styles/chatpage/asideNav.scss';
import Trajectory from './trajectory/Trajectory';
import AasideNavSetting from './AasideNavSetting';
import UsualTips from './UsualTips';
import { getChatRightTabsComplete } from "../../../../reducers/startUpLoadReduce";
import { fetchNtid } from '../../../../actions/traAll';
import ScrollArea from 'react-scrollbar';
import Goods from "./Goods";
import HistoryList from "../../../record/consult/HistoryList";
import { bglen, substr } from "../../../../utils/StringUtils";
import NTIFrame from "../../../../components/NTIFrame";
import { getWorkUrl, reoperation } from "../../../../utils/MyUtil";
import RobotAssist from "./RobotAssist";

const erp = "erp",
	crm = "crm",
	productinfo = "productinfo",
	commonwords = "commonwords",
	chatnotes = "chatnotes",
	usertrail = "usertrail",
    robotassist = "robotassist";

const TabPane = Tabs.TabPane;

class AsideNav extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {visible: false};
		this._enabled = true;

		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener('resize', this.onWindowResize);

		this.update =  reoperation(this.forceUpdate.bind(this), 300);
	}

	componentWillUnmount()
	{
		window.removeEventListener('resize', this.onWindowResize);
	}

	onWindowResize()
	{
		this.update();
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.guestInfo && this.props.guestInfo &&
			nextProps.guestInfo.userId != this.props.guestInfo.userId)
		{
			this._selected = this._defaultSelect;
			this.props.fetchNtid(nextProps.guestInfo.userId);
		}
	}

	showModal()
	{
		this.setState({
			visible: true
		});
	}

	handleCancel(e)
	{
		this.setState({
			visible: false
		});
	}

	_style = {width: '100%', height: '100%', overflow: 'hidden'};
	_disabledStyle = {width: '100%', height: 'auto', overflow: 'hidden', color: '#ccc', backgroundColor: "#f9f9f9"};

	_createContent(id, data, chatDataVo)
	{
		let {chatData, guestInfo = {}} = this.props;

		switch(id)
		{
			case productinfo:
				return <Goods style={this._style} chatDataVo={chatDataVo}/>;

			case commonwords:

				return <UsualTips chatData={chatData}/>;

			case chatnotes:
				return <HistoryList chatDataVo={chatDataVo}/>;

			case usertrail:
				let {userId = ""} = guestInfo;
				return <Trajectory ref="usertrail" ntid={userId}/>;

            case robotassist:
				return <RobotAssist chatDataVo={chatDataVo}/>;

			default:
				let url = getWorkUrl(data.url, guestInfo, chatData && chatData.chatDataVo),
					chatpage = document.getElementsByClassName('rightNav')[0],
					height = '100%',
					width = '100%';

				if(chatpage)
				{
					height = chatpage.clientHeight - 55;
					//width = Type === 1 ?  chatpage.clientWidth : width;
					width = chatpage.clientWidth;
				}

				return <NTIFrame src={url} style={{height, width}} container="rightNav"/>;
		}

		return null;
	}

	get checkEnable()
	{
		let settingOperation = this.props.settingOperation;

		return settingOperation.includes("kf_right_tab_check");
	}

	_defaultSelect = "0";

	_getTabPane(data)
	{
		let {id, show, showname, defaultoption: df = 0} = data,
			{chatDataVo = {}} = this.props;

		if(df === 1)
			this._defaultSelect = show.toString();

		if(bglen(showname) > 8)
		{
			showname = (
				<Popover content={<div style={{maxWidth: "300px"}}>{showname}</div>} placement="topLeft"
				         trigger="hover">
					<span>{substr(showname, 4) + '...'}</span>
				</ Popover>
			);
		}

		return (
			<TabPane disabled={!this._enabled} tab={showname} key={show}>
				{
					id === 'commonwords' || id === 'chatnotes' || id === 'usertrail' ?
						<div className="mailCon" style={{height: '100%'}}>
							{
								this._createContent(id, data, chatDataVo)
							}
						</div>
						:
						<ScrollArea ref={"scrollarea" + id} speed={1} className="area" horizontal={false}
						            smoothScrolling>
							<div className="mailCon" style={{height: '100%'}}>
								{
									this._createContent(id, data, chatDataVo)
								}
							</div>
						</ScrollArea>
				}

			</TabPane>
		);
	}

	_onTabClick(key)
	{
		if(this._selected === key)
			return;

		this._selected = key;
		this.forceUpdate();
	}

	render()
	{
		let {chatRightTabs = []} = this.props;

		chatRightTabs = Array.isArray(chatRightTabs) ? chatRightTabs : [];

		let tabPanes = chatRightTabs.filter(item => item.enabled === 1)
		.map(this._getTabPane.bind(this));

		this._selected = this._selected ? this._selected : this._defaultSelect;

		return (
			<div className="ant-right-aside rightNav">
				{
					this._enabled
						?
						<div className="" style={{height: '100%', position: 'releative'}}>
							<Tabs className="asideNavTabs" ref={node => this.tabs = node} activeKey={this._selected}
							      size="small" style={this._style} onTabClick={this._onTabClick.bind(this)}>
								{
									tabPanes
								}
							</Tabs>
							{
								this.props.asideNavSettingOn === 1 ?
									<div className="bars">
										<i className="iconfont icon-012gengduo" style={{color: '#a9b7b7'}}
										   onClick={this.showModal.bind(this)}/>
									</div> : null
							}
						</div>
						:
						<div className="rightNav disabledRightNav">

							<Tabs activeKey={this._defaultSelect} size="small" style={this._disabledStyle}>
								{
									tabPanes
								}
							</Tabs>
							{
								this.props.asideNavSettingOn === 1 ?
									<div className="bars">
										<i className="iconfont icon-012gengduo"
										   style={{color: '#a9b7b7'}}/>
									</div> : null
							}
						</div>
				}
				{
					this.checkEnable && this.state.visible ? <AasideNavSetting onCancel={this.handleCancel.bind(this)}
					                                                           update={this.forceUpdate.bind(this)}/> : null
				}
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {startUpData} = state,
		chatRightTabs = startUpData.get("chatRightTabs") || {},
		asideNavSettingOn = startUpData.get("asidenavsetting"),
		settingOperation = startUpData.get("settingOperation") || [];
	;

	return {chatRightTabs, asideNavSettingOn, settingOperation};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getChatRightTabsComplete, fetchNtid}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AsideNav);
