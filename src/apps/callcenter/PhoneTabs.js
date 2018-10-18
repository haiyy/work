import React from 'react';
import { Menu } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollArea from "react-scrollbar";
import LogUtil from "../../lib/utils/LogUtil";
import { getFuncSwitcherComplete,getCallCenterPermission} from "../../reducers/startUpLoadReduce";
import { setscreenFlag,setBraedCrumbFlag} from "./redux/reducers/telephonyScreenReducer"
import { shallowEqual } from "../../utils/MyUtil";
import PhoneSetting from "./PhoneSetting";
import PhonePlayScreen from "./view/PhonePlayScreen";
import PhoneToolBar from "./view/PhoneToolBar";

const SubMenu = Menu.SubMenu,
	Item = Menu.Item;

const option = [
	{
		"title": "通话记录", "key": "callcenter_calle_records", "icon": "iconimg icon-tonghuajilu1", 
		"isKey":"callcenter_call_records",
		"fns": ["callcenter_call_records_check"],
		"subMenu": [
			{"title": "呼入记录", "key": "incomingrecord","isAuthority":true,"fns": ["incomingrecord"]},
			{"title": "呼出记录", "key": "calloutrecord","isAuthority":true,"fns": ["calloutrecord"]},
		]
	},
	{
		"title": "外呼任务", "key": "callcenter_outbound_task", "icon": "iconimg icon-waihurenwu1", 
		"fns": ["callcenter_outbound_task_check"],
	},
	{
		"title": "呼损记录", "key": "callcenter_caller_records", "icon": "iconimg icon-husunjilu1",
		"isKey":"callcenter_call_records",
		"fns": ["callcenter_call_records_check"],
		"subMenu": [
			{"title": "呼入未接", "key": "incomingunanswered","isAuthority":true,"fns": ["incomingunanswered"]},
			{"title": "呼出未接", "key": "calloutunanswered","isAuthority":true,"fns": ["calloutunanswered"]},
		]
	},
	{
		"title": "回访计划", "key": "callcenter_return_visit_plan", "icon": "iconimg icon-huifangjihua1","fns": ["callcenter_return_visit_plan_check"],
	},
	{
		"title": "呼叫监控", "key": "callcenter_call_monitoring", "icon": "iconimg icon-hujiaojianting1","fns": ["callcenter_call_monitoring_check"],

	},
	{
		"title": "实时监控", "key": "callcenter_report_monitor", "icon": "iconimg icon-shishijiankong1","fns": ["callcenter_report_monitor_check"]
	},
	{
		"title": "呼叫设置", "key": "callcenter_call_setting", "icon": "iconimg icon-hujiaoshezhi1","fns":["callcenter_call_setting"],"isKey":"callcenter_call_setting",
		"subMenu": [
			{"title": "通话设置", "key": "callcenter_personal_setting", "icon": "iconfont icon-qiye","fns": ["callcenter_personal_setting"]},
			{"title": "账户绑定", "key": "callcenter_account_setting", "icon": "iconfont icon-qiye","fns": ["callcenter_account_setting"]},
			{"title": "接待组", "key": "callcenter_reception_setting", "icon": "iconfont icon-qiye","fns": ["callcenter_reception_setting"]},
		]
	}

];

class PhoneTabs extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {
			selectedKey: '1',
			openKeys: ["sub1"],
			path: [], //{"title": "企业设置", "key": "sub1"}, {"title": "企业信息", "key": "information"}
			winHeight: ""
		};

		this.state.option = this.getOptionsLoop(option.map(item => {
			return {...item}
		}), props.setting);

		this.getDefaultPath();
		this._getMenuMap();
		this.getCallCenterPermission();

		this.onOpenChange = this._onOpenChange.bind(this);
		this.handleClick = this._handleClick.bind(this);
	}

	componentDidMount()
	{
		window.addEventListener('resize', this.onWindowResize.bind(this))
	}

	componentWillUnmount()
	{
		this.props.setBraedCrumbFlag(false);
		window.removeEventListener('resize', this.onWindowResize.bind(this))
	}


	getCallCenterPermission(){
		this.props.getCallCenterPermission();
	}
	
	onWindowResize()
	{
		if(document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
		{
			let winHeight = document.documentElement.clientHeight - 60;
			if(winHeight != this.state.winHeight)
			{
				this.setState({winHeight})
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		if(this.props.screenFLag !== nextProps.screenFLag)
			return true;

		if(!shallowEqual(nextProps.setting, this.props.setting, true, 2) || !this.state.option)
		{
			this.state.option = this.getOptionsLoop(option.map(item => {
				return {...item}
			}), nextProps.setting);

			this.getDefaultPath();

			return true;
		}

		return !shallowEqual(nextState, this.state, true, 2);
	}

	getDefaultPath()
	{
		if(this.state.path && this.state.path.length > 0)
			return;

		this.state.option.find(item => {
			if(item.hasOwnProperty("subMenu"))
			{
				if(item.subMenu && item.subMenu.length > 0)
				{
					let {title, key} = item,
						{title: t, key: k,fns,isAuthority} = item.subMenu[0];

					this.state.path = [{title, key}, {title: t, key: k,fns,isAuthority}];
					this.state.selectedKey = k;
					this.state.openKeys = [key];
				}
			}
			else
			{
				this.state.path = [{...item}];
				this.state.selectedKey = item.key;
			}

			return this.state.path.length;
		});
	}

	_getMenuMap()
	{
		this._menuMap = {};
		option.forEach(item => {
			this._menuMap[item.key] = item.title;

			item.subMenu && item.subMenu.forEach(item => {
				this._menuMap[item.key] = item.title;
			});
		});
	}

	_handleClick({item,key, keyPath})
	{
		console.log(item);
		let {props} = item,
			{selectedKey} = this.state,
		{fns, isAuthority} = props;

		let path = keyPath.map(key => {
		return {key, title: this._menuMap[key], fns, isAuthority};
		});

		this.setState({
			selectedKey: key,
			path: path.reverse()
		});

		//切换模块时 让电话弹屏hide
		this.props.setscreenFlag(false);
		//切换回模块时 让面包屑显示
		if(selectedKey!=key){
			this.props.setBraedCrumbFlag(false);
		}
	}

	_onOpenChange(openKeys)
	{
		this.setState({openKeys});
	}

	_getMenuItems()
	{
		let opts = this.state.option || [];
		return opts.map(menu => {
			if(menu.subMenu && menu.subMenu.length > 0)
			{
				return (
					<SubMenu key={menu.key} title={<span><i className={menu.icon} style={{
						marginRight: '8px', position: 'relative', top: '1px'
					}}/>{menu.title}</span>} style={{position: "relative"}}>
						{
							menu.subMenu.map(item => {
								return (
									<Item key={item.key} fns={item.fns}  isAuthority={item.isAuthority} style={{position: "relative"}}>
										{item.title}
									</Item>
								);
							})
						}
					</SubMenu>
				);
			}
			else
			{
				return (
					<Item key={menu.key} style={{position: "relative"}} fns={menu.fns} isAuthority={menu.isAuthority}>
						<i className={menu.icon} style={{marginRight: '8px', position: 'relative', top: '1px'}}/>
						{
							menu.title
						}
					</Item>
				);
			}
		});
	}

	changeRoute(path)
	{
		let key, selectedKey;
		if(path.length === 2 || path.length === 3)
		{
			key = path[0].key;
			selectedKey = path[1].key;
		}
		else
		{
			key = selectedKey = path[0].key;
		}

		this.setState({selectedKey, openKeys: [key], path});
	}

	getOptionsLoop(opts, setting)
	{	
		if(!setting || setting.length < 0)
			return [];

		return opts.filter(item => {
			if(item.subMenu)
			{
				if (setting.includes(item.isKey)) {
					item.subMenu = this.getOptionsLoop(item.subMenu, setting);
					return item.subMenu.length;
				} else {
					return false;
				}
			}
			
			if(setting.includes(item.isKey) && setting.includes(item.key)  ){
				return item;
			}else if(item.isAuthority){
				return item;
			}
		
			return setting.includes(item.key);
		});
	}

	render()
	{
		try
		{
			const {openKeys, selectedKey, path} = this.state,
				  {setting} = this.props;
			
			return (
				<div ref="menus" className="settingTabsMenu">
					<ScrollArea className="settingTabsMenuScrollArea" speed={1} horizontal={false} smoothScrolling>
						<Menu className="user-select-disable callcenterMenu" theme="dark" mode="inline"
						      selectedKeys={[selectedKey]} openKeys={openKeys}
						      onOpenChange={this.onOpenChange}
						      onClick={this.handleClick}>
							{
								this._getMenuItems()
							}
						</Menu>
						<PhonePlayScreen style={{marginTop: 60}} setting={setting}/>
					</ScrollArea>
					<div className="callCenterScrollArea" style={{overflowY:'auto', overflowX:'hidden',position:'relative'}}>
						<PhoneToolBar/>
						<div style={{width: '100%', height: 10, backgroundColor: 'rgb(234,235,236)'}}></div>
						<PhoneSetting path={path} changeRoute={this.changeRoute.bind(this)}
								  setting={setting}	
					              screenFLag={this.props.screenFLag} height={this.refs.menus?this.refs.menus.clientHeight:0}/>
					</div>
				</div>
			);
		}
		catch(e)
		{
			LogUtil.trace("SettingTabs", LogUtil.ERROR, "render stack = " + e.stack);
		}

		return null;
	}
}

function mapStateToProps(state)
{
	let {startUpData, telephonyScreenReducer} = state,
		setting = startUpData.get("callcenter") || [];

	return {	
		setting,
		screenFLag: telephonyScreenReducer.get("screenFLag"),
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getFuncSwitcherComplete, setscreenFlag,setBraedCrumbFlag,getCallCenterPermission}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PhoneTabs);
