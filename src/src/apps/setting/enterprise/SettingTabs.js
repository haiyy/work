import React from 'react';
import { Menu } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollArea from "react-scrollbar";
import EnterpriseSetting from "./EnterpriseSetting";
import { getLangTxt, shallowEqual } from "../../../utils/MyUtil";
import { getFuncSwitcherComplete } from "../../../reducers/startUpLoadReduce";
import LogUtil from "../../../lib/utils/LogUtil";

const SubMenu = Menu.SubMenu,
	Item = Menu.Item;

const option = [
	{
		"title": "setting_company", "key": "sub1", "icon": "iconfont icon-qiye",
		"subMenu": [
			{
				"title": "setting_company_info", "key": "information",
				"fns": ["information_check_eidt", "information_check"]
			},
			{"title": "setting_common_word", "key": "usedwords", "fns": ["usedwords_edit", "usedwords_check"]},
			{"title": "setting_consult_type", "key": "summary", "fns": ["summary_edit", "summary_check"]},
			{
				"title": "setting_sensitive_words", "key": "sensitiveword",
				"fns": ["sensitiveword_edit", "sensitiveword_check"]
			},
			{
				"title": "setting_recept_time", "key": "reception_time",
				"fns": ["reception_time_edit", "reception_time_check"]
			},
			/*{"title": "质检", "key": "qualitytest"},*/
			{
				"title": "setting_early_warning", "key": "earlywarning",
				"fns": ["earlywarning_edit", "earlywarning_check"]
			}
		]
	},
	{
		"title": "setting_account_manager", "key": "sub2", "icon": "iconfont icon-zhanghaoguanli",
		"subMenu": [
			{"title": "setting_role_manager", "key": "rolemanage", "fns": ["rolemanage_eidt", "rolemanage_check"]},
			{"title": "setting_skill_tag", "key": "skilltag", "fns": ["skilltag_edit", "skilltag_check"]},
			{"title": "setting_account_center", "key": "account", "fns": ["account_edit", "account_check"]},
			{"title": "account_management", "key": "account_management", "fns":["account_management_edit", "account_management_check"]},
            {"title": "consulting_binding", "key": "consulting_binding", "fns":["consulting_binding_edit", "consulting_binding_check"]}
		]
	},
	{
		"title": "setting_access_set", "key": "accessSetting", "icon": "iconfont icon-yingyongjieruguanli",
		"subMenu": [
			{"title": "setting_distribution", "key": "distribution", "fns": ["distribution_edit", "distribution_check"]},
			{"title": "setting_queuemanage", "key": "queuemanage", "fns": ["queuemanage_edit", "queuemanage_check"]},
			{"title": "setting_keypage", "key": "keypage", "fns": ["keypage_edit", "keypage_check"]},
			{"title": "setting_source_manager", "key": "visitorsource", "fns": ["visitorsource_edit", "visitorsource_check"]},
			{"title": "setting_custom_tab", "key": "customtab", "fns": ["custom_tab_edit", "custom_tab_check"]},
			{
				"title": "setting_thirdparty_access", "key": "thirdpartyaccess",
				"subMenu": [
					{"title": "setting_queue_weChat", "key": "wechat_agent", "fns": ["wechat_agent_edit", "wechat_agent_check"]},
					{
						"title": "setting_smallroutine", "key": "wechat_applet_agent",
						"fns": ["wechat_applet_agent_edit", "wechat_applet_agent_check"]
					},
					{"title": "setting_weibo", "key": "weibo_agent", "fns": ["weibo_agent_edit", "weibo_agent_check"]}
				]
			}
		]
	},
	{
		"title": "setting_web_set", "key": "visitorservicesetting", "icon": "iconfont icon-tuandui",
		"subMenu": [
			{"title": "setting_webview", "key": "webview", "fns": ["webview_edit", "webview_check"]},
			{"title": "setting_autoreply", "key": "autoreplay", "fns": ["autoreplay"], "custom": true},
			{
				"title": "setting_faq", "key": "faqsetting",
				"fns": ["enterpeise_faqsetting_edit", "enterpeise_faqsetting_check"]
			},
			{"title": "setting_evalue", "key": "consultative", "fns": ["consultative_edit", "consultative_check"]},
			{"title": "setting_msgset", "key": "leavemessage", "fns": ["leavemessage_edit", "leavemessage_check"]},
			{"title": "setting_users_set", "key": "basictemplateinfo", "fns": ["basictemplateinfo"], "custom": true},
			{"title": "setting_blacklist", "key": "blacklist_setting", "fns": ["blacklist_setting_check"]},
			{"title": "setting_hypermedia", "key": "magicbox", "fns": ["magicbox_copy", "magicbox_check"]}
		]
	}
];

class SettingTabs extends React.Component {

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

		this.onOpenChange = this._onOpenChange.bind(this);
		this.handleClick = this._handleClick.bind(this);
	}

	componentDidMount()
	{
		window.addEventListener('resize', this.onWindowResize.bind(this))
	}

	componentWillUnmount()
	{
		window.removeEventListener('resize', this.onWindowResize.bind(this))
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
						{title: t, key: k, fns, custom} = item.subMenu[0];

					this.state.path = [{title, key}, {title: t, key: k, fns, custom}];
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

	_handleClick({item, key, keyPath})
	{
		let {props = {fns: [], custom: false}} = item,
			{fns, custom} = props;

		let path = keyPath.map(key => {
			return {key, title: this._menuMap[key], fns, custom};
		});

		this.setState({
			selectedKey: key,
			path: path.reverse()
		});
	}

	_onOpenChange(openKeys)
	{
		// let openKey = openKeys.pop();
		//
		// openKeys = [];
		//
		// if(openKey && openKey.length > 0)
		// {
		// 	openKeys.push(openKey);
		// }

		this.setState({openKeys});
	}

	_getMenuItems()
	{
		let opts = this.state.option || [];

		return opts.map(menu => {
			if(menu.subMenu && menu.subMenu.length > 0)
			{
				return (
					<SubMenu key={menu.key} title={
						<span><i className={menu.icon} style={{
							marginRight: '8px', position: 'relative', top: '1px'
						}}/>{getLangTxt(menu.title)}</span>} style={{position: "relative"}}>
						{
							menu.subMenu.map(item => {
								if(item.subMenu && item.subMenu.length > 0)
								{
									return (
										<SubMenu key={item.key}  title={<span>{getLangTxt(item.title)}</span>}>
											{
												item.subMenu.map(unit => {
													return (
														<Item key={unit.key} style={{position: "relative"}}
														      fns={unit.fns} custom={unit.custom}>
															<i className={unit.icon}/>
															<span>{getLangTxt(unit.title)}</span>
														</Item>
													);
												})
											}
										</SubMenu>
									)
								}

								return (
									<Item key={item.key} style={{position: "relative"}} fns={item.fns}
									      custom={item.custom}>
										{
											getLangTxt(item.title)
										}
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
					<Item key={menu.key} style={{position: "relative"}}>
						<i className={menu.icon} style={{marginRight: '8px', position: 'relative', top: '1px'}}/>
						{
							getLangTxt(menu.title)
						}
					</Item>
				);
			}
		});
	}

	changeRoute(path)
	{
		let key, selectedKey, {openKeys} = this.state;
		if(path.length === 2 || path.length === 3)
		{
			key = path[0].key;
			selectedKey = path[1].key;
		}
		else
		{
			key = selectedKey = path[0].key;
		}

		openKeys.push(key);

		this.setState({selectedKey, openKeys, path});
	}

	getOptionsLoop(opts, setting)
	{
		if(!setting || setting.length < 0)
			return [];

        return opts.filter(item =>
		{
			if(item.subMenu)
			{
				item.subMenu = this.getOptionsLoop(item.subMenu, setting);
				return item.subMenu.length;
			}

			return setting.includes(item.key);
			// return fns.find(key => setting.includes(key));
		});
	}

	render()
	{
		try
		{
			const {openKeys, selectedKey, path} = this.state,
				{settingOperation} = this.props;

			return (
				<div ref="menus" className="settingTabsMenu">
					<ScrollArea className="settingTabsMenuScrollArea" speed={1} horizontal={false} smoothScrolling>
						<Menu className="user-select-disable" theme="dark" mode="inline"
						      selectedKeys={[selectedKey]} openKeys={openKeys}
						      onOpenChange={this.onOpenChange}
						      onClick={this.handleClick}>
							{
								this._getMenuItems()
							}
						</Menu>
					</ScrollArea>

					<EnterpriseSetting path={path} changeRoute={this.changeRoute.bind(this)}
					                   setting={settingOperation}/>
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
	let {startUpData} = state,
		setting = startUpData.get("setting") || [],
		settingOperation = startUpData.get("settingOperation") || [];

	return {setting, settingOperation};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getFuncSwitcherComplete}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingTabs);
