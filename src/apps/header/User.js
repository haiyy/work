import React from 'react'
import { logoutUser, mineInfoUpdate } from '../login/redux/loginReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Select, Tabs, Dropdown, Modal } from 'antd';
import SkinSetting from '../setting/personal/SkinSetting';
import Information from '../setting/personal/Information';
import Answer from '../setting/personal/Answer';
import Password from '../setting/personal/Password';
import ChatSet from '../setting/personal/ChatSet';
import UsedWords from '../setting/personal/UsedWords';
import Intelligent from '../setting/personal/Intelligent';
import UserStatus from '../../model/vo/UserStatus';
import { getLangTxt, loginUser, sendT2DEvent } from "../../utils/MyUtil";
import SessionEvent from "../event/SessionEvent";
import { sendToMain } from "../../core/ipcRenderer";
import Channel from "../../model/vo/Channel";
import { CLOSE_ALL } from "../event/TabEvent";
import ConfigItemsLevel from "../../model/vo/ConfigItemsLevel";
import LoginEvent from "../event/LoginEvent";
import "../../public/styles/chatpage/user.scss";
import { bglen, substr } from "../../utils/StringUtils";
import { chatDataClear } from "../chat/redux/reducers/chatPageReducer";
import { tabClosed } from "../chat/redux/reducers/eventsReducer";
import { getAllLevel } from "../setting/configLevel/configLevel";
import { setInfomation, getInfomation, fetchTheme } from "../setting/personal/action/personalSetting";
import { getUserInfo } from "../setting/account/accountAction/sessionLabel";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import ConnectStatus from "../../im/connect/ConnectStatus";
import NIMCode from "../../im/error/NIMCode";
import { confirm, info, error, success, warning } from "../../components/xn/modal/Modal";

const Option = Select.Option,
	TabPane = Tabs.TabPane,
	MenuItem = Menu.Item,
	style = {padding: '0px', lineHeight: '42px', height: '12.5%'},
	menuSettings = [
		{
			id: "information",
			name: getLangTxt("personalInfo"),
			iconfont: "icon-mingpian",
			componentCls: Information,
			enable: 0,
			key: 1,
			isValueChange: false
		},
		{
			id: "password",
			name: getLangTxt("modifyPwd"),
			iconfont: " icon-mima",
			componentCls: Password,
			enable: 0,
			isValueChange: false
		},
		{
			id: "usedwords",
			name: getLangTxt("personCommandWords"),
			iconfont: "icon-jilu",
			componentCls: UsedWords,
			enable: 0,
			isValueChange: false
		},
		{
			id: "answer",
			name: getLangTxt("autoResp"),
			iconfont: "icon-yuyin",
			componentCls: Answer,
			enable: 0,
			isValueChange: false
		},
		{
			id: "skinsetting",
			name: getLangTxt("personalSkin"),
			iconfont: "icon-yifu",
			componentCls: SkinSetting,
			enable: 0,
			isValueChange: false
		},
		{
			id: "chatset",
			name: getLangTxt("chatSet"),
			iconfont: "icon-bangzhu",
			componentCls: ChatSet,
			enable: 0,
			isValueChange: false
		},
		{
			id: "intelligent",
			name: getLangTxt("intelligentSwitch"),
			iconfont: "icon-banshou",
			componentCls: Intelligent,
			enable: 0,
			isValueChange: false
		}
	];

class User extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			show: false,
			visible: false,
			key: 0,
			logoUrl: require("../../public/images/kfPortrait.png"),
			autoReplyEnable: false,
			downDirection: 'icon-sanjiao-xia',
			netStatus: false
		};

		this._close = this._close.bind(this);
		this.style = "";
		this._resetAutoReplayOpen(props.getConfigLevel);
		this._onOpenPersonSetting = this._onOpenPersonSetting.bind(this);
		this._handleChange = this._handleChange.bind(this);
		this.onNetStatusChange = this.onNetStatusChange.bind(this);
		this._onQuit = this._onQuit.bind(this);

		GlobalEvtEmitter.on(LoginEvent.OPEN_PERSON_SETTING, this._onOpenPersonSetting);
		GlobalEvtEmitter.on("userStatusChange", this._handleChange);
		GlobalEvtEmitter.on(SessionEvent.CONNECT_STATUS, this.onNetStatusChange);
		GlobalEvtEmitter.on("MainToQuit", this._onQuit);
	}

	onNetStatusChange({connectStatus, errorCode})
	{
		if(errorCode == NIMCode.RECONNECT_FAILED_ERROR || errorCode === NIMCode.DISCONNECT_LOST_ERROR)
		{
			this.setState({netStatus: false});
			sendToMain(Channel.USER_STATUS, "5");
		}
		else if(errorCode === NIMCode.HANDLE_SHARK && connectStatus === ConnectStatus.ST_CONNECTED)
		{
			this.setState({netStatus: true});
			sendToMain(Channel.USER_STATUS, "6");
		}
	}

	componentWillUnmount()
	{
		GlobalEvtEmitter.removeListener(LoginEvent.OPEN_PERSON_SETTING, this._onOpenPersonSetting);
		GlobalEvtEmitter.removeListener("userStatusChange", this._handleChange);
		GlobalEvtEmitter.removeListener(SessionEvent.CONNECT_STATUS, this.onNetStatusChange);
		GlobalEvtEmitter.removeListener("MainToQuit", this._onQuit);
	}

	refreshSwitcher()
	{
		let switcher = this.props.switcher;

		menuSettings.forEach(item => {
			item.enable = switcher.includes(item.id) ? 1 : 0;
		})
	}

	_onOpenPersonSetting(data)
	{
		if(data)
		{
			this.setState({...data});
		}
	}

	componentDidMount()
	{
		this.props.getAllLevel();
		this.props.fetchTheme();
	}

	componentWillReceiveProps(nextProps)
	{
		let {getConfigLevel} = nextProps;

		this._resetAutoReplayOpen(getConfigLevel);
	}

	_resetAutoReplayOpen(getConfigLevel)
	{
		if(getConfigLevel)
		{
			let level = getConfigLevel.get(ConfigItemsLevel.AutoReplay);

			Object.assign(this.state, {autoReplyEnable: level === 2});
		}
	}

	_updateUserInfo()
	{
		if(!loginUser())
			return;

		let {userData = {}} = this.props,
			{nickname, externalname} = userData,
			userInfo = loginUser().userInfo || {};

		userInfo.nickName = nickname;
		userInfo.externalname = externalname;

		this.loginUser = loginUser();
		this.userName = this.loginUser.userName;
		this.userStatus = this.loginUser.status;
		this.userStatus = this.userStatus !== undefined ? this.userStatus.toString() : UserStatus.AWAY.toString();

		console.log("User _updateUserInfo userStatus = ", this.userStatus);
	}

	_handleChange(value)
	{
		let title = "", content = "", onOk = null, iconType = "exclamation-circle", className = 'warnTip',
			maskClosable = true;

		if(this.switchStatusModal)
		{
			this.switchStatusModal.destroy();
		}

		if(value == UserStatus.AVAILABLE)
		{
			this._switchStatus(value);
			return;
		}
		else if(value == UserStatus.AWAY)
		{
			title = getLangTxt("personal_note1");
			content = getLangTxt("personal_note2");
			onOk = () => {
				GlobalEvtEmitter.emit(CLOSE_ALL);
				this._switchStatus(value);
			};
		}
		else if(value == UserStatus.BUSY)
		{
			title = getLangTxt("personal_note3");
			content = getLangTxt("personal_note4");
			onOk = this._switchStatus.bind(this, value);
		}

		this.switchStatusModal = confirm({title, content, onOk, iconType, className, maskClosable});
	}

	_switchStatus(value)
	{
		sendT2DEvent({
			listen: SessionEvent.REQUEST_UPDATE_USERSTATUS,
			params: [value]
		});
	}

	_show({key})
	{
		let {visible, key: tabKey} = this.state;

		if(key == 8 || key == 9)
			return;

		this._modalClosable = !visible;
		if(menuSettings[tabKey] && menuSettings[tabKey].isValueChange)
		{
			this.getSaveModal(tabKey, true);
			this.setState({isClose: true});
		}
		else
		{
			this.setState({
				key: key ? key : 1,
				visible: !visible,
				clickKey: null,
				downDirection: 'icon-sanjiao-xia'
			})
		}
	}

	_close(visible)
	{
		let {key} = this.state;

		if(key == 8 || key == 9)
			return;

		if(menuSettings[key].isValueChange)
		{
			this.getSaveModal(key, true)
		}
		else
		{
			this.setState({
				key: key ? key : 1,
				visible,
				clickKey: null,
				downDirection: 'icon-sanjiao-xia'
			})
		}
	}

	_onLogOut(e)
	{
		this.props.chatDataClear();
		this.logoutUser();
		sendToMain(Channel.USER_STATUS, 5);
	}

	_onQuit(e)
	{
		let content = getLangTxt("personal_note2"),
			title = getLangTxt("personal_note5"),
			iconType = "exclamation-circle",
			className = 'warnTip',
			maskClosable = true,
			onOk = () => {
				this.props.chatDataClear();

				this._switchStatus(UserStatus.AWAY);
				GlobalEvtEmitter.emit(CLOSE_ALL);

				this.logoutUser();
				sendToMain(Channel.OPERATE, Channel.QUIT);
			};

		this.setState({
			downDirection: 'icon-sanjiao-xia'
		});

		confirm({title, content, onOk, iconType, className, maskClosable});
	}

	logoutUser()
	{
		setTimeout(() => {
			this.props.logoutUser();
		}, 100);
	}

	_getSetting()
	{
        let {switcher = []} = this.props;
		return (<Menu onClick={this._show.bind(this)} className="setting" style={{right: '-0.07rem'}}>
			{
				menuSettings.map((menuData, index) => {
					if(!menuData.enable || !switcher.includes(menuData.id))
						return null;

					return (
						<MenuItem key={index} style={style}>
							<i className={"iconfont " + menuData.iconfont}/>
							{
								menuData.name
							}
						</MenuItem>
					);
				})
			}
			<Menu.Item key="8" className="deal">
				<span onClick={this._onLogOut.bind(this)}>{getLangTxt("logout")}</span>
			</Menu.Item>
			<Menu.Item key="9" className="deal quit">
				<span onClick={this._onQuit.bind(this)}>{getLangTxt("quit")}</span>
			</Menu.Item>
		</Menu>);
	}

	//监控各tab页form值是否变化
	isFormValueChange(isValueChange, tabid)
	{
		menuSettings.forEach(item => {
			if(item.id === tabid)
			{
				item.isValueChange = isValueChange;
			}
			else
			{
				item.isValueChange = false;
			}
		})
	}

	getSaveModal(key, isClosed)
	{
		let {key: tabKey} = this.state;

		confirm({
			width: "320px",
			title: getLangTxt("personalset_leave_page"),
			content: getLangTxt("personalset_save"),
			okText: getLangTxt("save"),
			cancelText: getLangTxt("no_save"),
			onOk: () => {
				this.setState({[menuSettings[tabKey].id]: true, key: tabKey});
			},
			onCancel: () => {
				menuSettings[tabKey].isValueChange = false;
				this.setState({[menuSettings[tabKey].id]: false, key, isIgnoreEdit: true});
				if(isClosed)
					this.setState({visible: !this.state.visible, downDirection: 'icon-sanjiao-xia'})
			}
		})
	}

	afterSavingData(tabid, savingStatus)
	{
		let {key, clickKey} = this.state;

		if(clickKey)
		{
			if(savingStatus)
			{
				menuSettings[key].isValueChange = false;
				this.setState({[tabid]: false, key: clickKey});
				if(!this._modalClosable)
					this.setState({visible: !this.state.visible, downDirection: 'icon-sanjiao-xia'})
			}
			else
			{
				this.setState({[tabid]: false, key});
			}
		}
		else
		{
			if(savingStatus)
			{
				menuSettings[key].isValueChange = false;
				if(!this._modalClosable)
					this.setState({visible: !this.state.visible, downDirection: 'icon-sanjiao-xia'})
			}
		}
	}

	_change(key)
	{
		let {key: tabKey} = this.state;

		if(menuSettings[tabKey].isValueChange)
		{
			this.getSaveModal(key)
		}
		else
		{
			this.setState({key});
		}

		this.setState({clickKey: key, isIgnoreEdit: false});
	}

	_getTabSettigs(currentStyle)
	{
		let {visible = false, name = "", key: activeKey = 0} = this.state;

		if(!visible || !menuSettings[activeKey])
			return null;

		name = menuSettings[activeKey].name;

		return (
			<Modal wrapClassName="settings individuationSettings" visible footer="" onOk={this._show.bind(this)}
			         onCancel={this._show.bind(this)}
			         title={
				         <span>
							<i className="iconfont icon-chilun"
							   style={{marginRight: "8px"}}/>{getLangTxt("personalset_nav")} / {name}
						</span>
			         }>
				<div className={"setting-left " + currentStyle}>
					<Tabs activeKey={activeKey} tabPosition={'left'} onChange={this._change.bind(this)}>
						{
							menuSettings.map((menuData, index) => {
									if(menuData.enable === 0)
										return null;

									return <TabPane key={index} tab={
										<span>
											<i className={"iconfont " + menuData.iconfont}/>
											{
												menuData.name
											}
										</span>
									}>
										{
											React.createElement(menuData.componentCls,
												{
													onCancel: this._close.bind(this),
													isValueChange: this.isFormValueChange.bind(this),
													[menuSettings[activeKey].id]: this.state[menuSettings[activeKey].id],
													afterSavingData: this.afterSavingData.bind(this),
													isIgnoreEdit: this.state.isIgnoreEdit
												})
										}
									</TabPane>
								}
							)
						}
					</Tabs>
				</div>
			</Modal>
		);
	}

	_getImgPath(value)
	{
		return require(`../../public/images/login/${value}.png`);
	}

	getColorType(type)
	{
		let currentStyle = "";
		switch(type)
		{
			case 0:
				currentStyle = "blue";
				break;
			case 1:
				currentStyle = "scenery";
				break;
			case 2:
				currentStyle = "seaBreeze";
				break;
			case 3:
				currentStyle = "floral";
				break;
			case 4:
				currentStyle = "night";
				break;
			case 5:
				currentStyle = "purple";
				break;
		}
		return currentStyle;
	}

	onVisibleChange(visible)
	{
		this.setState({
			downDirection: visible ? 'icon-sanjiao-shang' : 'icon-sanjiao-xia'
		})
	}

	statusUI()
	{
		let {netStatus} = this.state;

		return netStatus ? (
			<Select value={this.userStatus} onChange={this._handleChange.bind(this)}
			        getPopupContainer={() => document.querySelector(".ant-layout-aside")}
			        dropdownMatchSelectWidth={false} dropdownClassName="userSelectStatus">
				<Option value={UserStatus.AVAILABLE.toString()} title={getLangTxt("online")}>
					<img src={this._getImgPath("online")}/>
					<span>{getLangTxt("online")}</span>
				</Option>
				<Option value={UserStatus.BUSY.toString()} title={getLangTxt("busy")}>
					<img src={this._getImgPath("busy")}/>
					<span>{getLangTxt("busy")}</span>
				</Option>
				<Option value={UserStatus.AWAY.toString()} title={getLangTxt("offline")}>
					<img src={this._getImgPath("leave")}/>
					<span>{getLangTxt("offline")}</span>
				</Option>
			</Select>
		) : <img className='netStatusImg' src={this._getImgPath("noNetState")}/>;
	}

	render()
	{
		this.refreshSwitcher();
		this._updateUserInfo();

		const {autoReplyEnable = false, downDirection} = this.state,
			{userData = {portrait: ""}, theme = {personalskin: 0}} = this.props,
			{personalskin} = theme,
			{portrait} = userData,
			currentStyle = this.getColorType(personalskin);

		menuSettings[3].enable = autoReplyEnable ? 1 : 0;

		return (
			<div className="user">
				<div className="UserLogo" style={{
					backgroundImage: 'url("' + (portrait || this.state.logoUrl) + '")',
					filter: this.style
				}}>
					{
						this.statusUI()
					}
				</div>

				<Dropdown overlay={this._getSetting(autoReplyEnable)} trigger={['click']} placement="bottomRight"
				          getPopupContainer={() => document.querySelector(".ant-layout-aside")}
				          onVisibleChange={this.onVisibleChange.bind(this)}>
					<div className="dropDownWrap">
						<div className="detail" title={this.userName}>
							{bglen(this.userName) > 12 ? substr(this.userName, 6) + '...' : this.userName}
						</div>
						<div className="down">
							<i className={"iconfont " + downDirection}/>
						</div>
					</div>
				</Dropdown>

				{
					this._getTabSettigs(currentStyle)
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {startUpData, personalReducer} = state,
		switcher = startUpData.get("personal") || [],
		infomation = personalReducer.get("infomation") || Map(),
		userData = infomation.get("data") || {},

		themeData = personalReducer.get("theme") || Map(),
		theme = themeData.get("data") || {};

	return {
		switcher,
		updateTime: state.loginReducer.updateTime,
		getConfigLevel: state.getConfigLevel,
		userData: userData || {},
		theme
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		logoutUser, mineInfoUpdate, getAllLevel, getUserInfo,
		setInfomation, getInfomation, chatDataClear, fetchTheme, tabClosed
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
