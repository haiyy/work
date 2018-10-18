/**
 * login success ==> InitAppRedux
 * */
import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import LogUtil from "../lib/utils/LogUtil";
import NIMClient from "../im/core/NIMClient";
import NIMCallBack from "../apps/chat/net/NIMCallBack";
import LoginUserProxy from "../model/proxy/LoginUserProxy";
import LoadDataProxy from "./LoadDataProxy";
import Model from "../utils/Model";
import NIMClientConfig from "../im/core/NIMClientConfig";
import { loginSuccess } from "../apps/login/redux/loginReducer";
import Settings from "../utils/Settings";
import ColleagueConverListProxy from "../model/proxy/ColleagueConverListProxy";
import LoginResult from "../model/vo/LoginResult";
import NtalkerEvent from "../apps/event/NtalkerEvent";
import SessionEvent from "../apps/event/SessionEvent";
import GlobalEvtEmitter from "../lib/utils/GlobalEvtEmitter";
import RosterUser from "../model/vo/RosterUser";
import UserInfo from "../model/vo/UserInfo";
import { fetchTheme } from "../apps/setting/personal/action/personalSetting";
import HyperMediaProxy from "../model/proxy/HyperMediaProxy";
import RobotProxy from "../model/proxy/RobotProxy";
import { getNtalkerList } from "../apps/chat/ConsultReceptRedux";
import TabDataManager from "../utils/TabDataManager";
import {releasePhone} from "../utils/PhoneUtils";

class InitAppRedux extends Component {
	
	isInited = false;
	
	constructor(props)
	{
		super();
		
		GlobalEvtEmitter.on(NtalkerEvent.T2D, this._onT2dHandler.bind(this));
		
		let user = props.user;
		
		if(user && user.success === LoginResult.SUCCESS && !this.isInited)
		{
			this.isInited = true;
			this._loadData();
			this._initIm();
			this._initProxy();
		}
	}
	
	_onT2dHandler(data)
	{
		if(data && data.listen === SessionEvent.REQUEST_DISCONNECT)
		{
			setTimeout(() => {
				Model.removeProxy(LoginUserProxy.NAME);
				getNtalkerList().clear();
				TabDataManager.clear();
				
				const user = new UserInfo(),
					rosterUser = new RosterUser(user),
					loginProxy = new LoginUserProxy();
				
				Model.registerProxy(loginProxy);
				
				loginProxy.loginUser = rosterUser;
				
				this.isInited = false;
				
				if(this._callBack)
				{
					this._callBack.destroy();
				}
				
				if(this._client)
				{
					this._client.destroy();
				}
				
				//呼叫中心 签出
				releasePhone();

				this._client = null;
				this._callBack = null;
				this._nimConfig = null;
				
				Model.retrieveProxy(ColleagueConverListProxy.NAME).clear();
			}, 10);
		}
	}
	
	componentWillReceiveProps(nextProps)
	{
		let user = nextProps.user;
		
		if(user && user.success === LoginResult.SUCCESS && !this.isInited)
		{
			this.isInited = true;
			this._loadData();
			this._initIm();
			this._initProxy();
			this.props.fetchTheme();
		}
	}
	
	shouldComponentUpdate()
	{
		return false;
	}
	
	render()
	{
		return null;
	}
	
	_loadData()
	{
		let loadDataProxy = Model.retrieveProxy(LoadDataProxy.NAME);
		if(loadDataProxy)
		{
			loadDataProxy.start();
		}
	}
	
	_initProxy()
	{
		Model.registerProxy(new ColleagueConverListProxy())
		.registerProxy(new RobotProxy());
	}
	
	_initIm()
	{
		try
		{
			log("启动IMSDK...");
			
			let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME),
				siteId = loginUserProxy.siteId,
				userId = loginUserProxy.userId,
				version = Settings.version(),
				token = loginUserProxy.token,
				imUris = Settings.getImUris();
			
			this._client = new NIMClient();
			
			this._callBack = new NIMCallBack(this._client);
			
			window.callBack = this._callBack;
			window.logUtil = LogUtil;
			
			this._nimConfig = this._nimConfig ? this._nimConfig : new NIMClientConfig();
			
			this._nimConfig.appId = siteId;
			this._nimConfig.userId = userId;
			this._nimConfig.userName = loginUserProxy.username;
			this._nimConfig.sessionId = "pc" + new Date().getTime();
			this._nimConfig.token = token.nPigeonToken;
			this._nimConfig.hosts = imUris[0];
			this._nimConfig.ports = imUris[1];
			this._nimConfig.useSSL = imUris[2];
			this._nimConfig.synMessageUrl = Settings.getImSynmessageUrl();
			this._nimConfig.device = "{\"id\":\"" + 11 + "\",\"deviceType\":\"" + "pc" + "\",\"os\":\"" + "" + "\",\"deviceModel\":\"" + null + "\",\"browse\":\"" + null + "\"}";
			this._nimConfig.deviceType = "PC";
			
			this._callBack.init(siteId, userId, token.nDolphinToken, version);
			
			this._client.init(this._nimConfig, this._callBack);
			this._client.connect();
		}
		catch(e)
		{
			log("initIm stack: " + e.stack, LogUtil.ERROR);
		}
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("InitAppRedux", info, log);
}

function mapStateToProps(state)
{
	const {loginReducer: {user}} = state;
	return {user: {...user}};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({loginSuccess, fetchTheme}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(InitAppRedux);
