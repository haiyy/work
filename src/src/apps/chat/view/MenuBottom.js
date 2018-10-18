import React from 'react';
import { ContextMenu, MenuItem, monitor } from "../../../components/contextmenu/index.js";
import VersionControl from "../../../utils/VersionControl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Menu, Popover } from 'antd';
import { bglen, substr } from "../../../utils/StringUtils";
import ChatStatus from "../../../model/vo/ChatStatus";
import { getCommonSummary } from "../../setting/summary/action/summarySetting";
import { getLangTxt } from "../../../utils/MyUtil";

const {SubMenu} = Menu;

class MenuBottom extends React.Component {
	
	static top = "0";
	static result = "1";
	static tag = "2";
	static close = "3";
	static sortTime = "4";
	static sortStatus = "5";
	static head = "6";
	static summary = "7";
	
	_mode = 0; //1 => 点击在Tab上 0 => 点击在Tab之外
	
	constructor(props)
	{
		super(props);
		
		this._mode = this.props.mode;
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.mode !== this._mode)
		{
			this._mode = nextProps.mode;
		}
	}
	
	_getTopItem()
	{
		if(this._mode === 1)
		{
			let topText = this.props.top == 1 ? "取消置顶" : "置顶";
			
			return <MenuItem>
				<p id={MenuBottom.top} onClick={this._handleClick.bind(this)}>
					{topText}
				</p>
			</MenuItem>
		}
		
		if(this.props.top == 1)
		{
			return "取消置顶";
		}
		
		return "置顶";
	}
	
	_handleClick(type)
	{
		let {onRightMouse} = this.props;
		
		onRightMouse(type);
		
		setTimeout(this.forceUpdate.bind(this), 0);
	}
	
	_getSortItem()
	{
		if(VersionControl.CHAT_SORT_TIME == VersionControl.chatSort)
		{
			return (
				<MenuItem>
					<p id={MenuBottom.sortStatus} onClick={this._handleClick.bind(this, MenuBottom.sortTime)}>{getLangTxt("status_sort")}</p>
				</MenuItem>
			);
		}
		
		return (
			<MenuItem>
				<p id={MenuBottom.sortTime} onClick={this._handleClick.bind(this, MenuBottom.sortTime)}>{getLangTxt("time_sort")}</p>
			</MenuItem>
		);
	}
	
	getTitle(title)
	{
		return bglen(title) > 16 ?
			<Popover
				content={<div style={{maxWidth: '200px', height: 'auto', wordWrap: 'break-word'}}>{title}</div>}
				placement="topLeft">
				<span>{substr(title, 8) + '...'}</span>
			</Popover>
			:
			<span>{title}</span>
	}
	
	getMenuSummaryList()
	{
		let {commonSummaryList} = this.props;
		
		if(!commonSummaryList || commonSummaryList.length <= 0)
		{
			let menu = [
				<Menu.Item key="-1"> {getLangTxt("summary_no_data")}</Menu.Item>,
				<Menu.Item key="more" data="more">{getLangTxt("more")}</Menu.Item>
			];
			
			return menu;
		}
		
		let menus = commonSummaryList.map(item =>
			<Menu.Item key={item.summaryid} data={item}>
				{
					this.getTitle(item.content)
				}
			</Menu.Item>
		);
		
		menus.push(this.getMoreBtn());
		
		return menus;
	}
	
	onMenuClick({item, key, keyPath})
	{
		monitor.hideMenu();
		
		let {onRightMouse} = this.props,
			{data} = item.props;
		
		if(typeof onRightMouse === "function")
		{
			onRightMouse(keyPath.pop(), data);
		}
	}
	
	getMoreBtn()
	{
		return (
			<Menu.Item key="more" data="more">
				{getLangTxt("more")}
			</Menu.Item>
		);
	}
	
	onMouseEnter()
	{
		setTimeout(() => {
			let {coordinateY} = this.props,
				AppCSS = document.getElementsByClassName("AppCSS"),
				totalY, differenceY,
				menu = document.getElementById("7$Menu"),
				menuHeight = menu.clientHeight;
			
			if(AppCSS)
			{
				totalY = AppCSS[0].clientHeight;
				differenceY = totalY - coordinateY;
				
				if(differenceY < menuHeight)
				{
					if(!menu)
						return;
					
					menu.style.top = -(menuHeight - differenceY) + 'px';
				}
			}
		}, 0);
	}
	
	getMenuItemSummary()
	{
		let chatData = this.props.chatData || {},
			chatDataVo = chatData.chatDataVo;
		
		if(!chatDataVo)
			return null;
		
		let noMonitor = !chatDataVo.isMonitor,
			evaluateEnable = noMonitor,
			toolFuncsData = this.props.toolFuncsData;
		
		if(toolFuncsData)
		{
			let index = toolFuncsData.findIndex(item => "summary" === item.get("name") && item.get("enable") === 1);
			if(index <= -1)
			{
				evaluateEnable = false;
			}
		}
		
		if(!evaluateEnable)
			return null;
		
		return (
			<SubMenu key="7" title={<span>{getLangTxt("summary_title")}</span>} onMouseEnter={this.onMouseEnter.bind(this)}>
				{
					this.getMenuSummaryList()
				}
			</SubMenu>
		);
	}
	
	render()
	{
		return (
			<ContextMenu identifier="some_unique" noShow={this._mode === 0}>
				<Menu style={{width: 150}} mode="vertical" onClick={this.onMenuClick.bind(this)}>
					{
						this.getMenuItemSummary()
					}
					{
						this._getSortItem()
					}
				</Menu>
			</ContextMenu>
		);
	}
}

function mapStateToProps(state)
{
	let {summaryReducer = {}, startUpData} = state,
		{commonSummaryList} = summaryReducer,
		toolFuncsData = startUpData.get("toolFuncsData");
	
	return {commonSummaryList, toolFuncsData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getCommonSummary}, dispatch);
}

export const hideMenu = monitor.hideMenu;

export default connect(mapStateToProps, mapDispatchToProps)(MenuBottom);
