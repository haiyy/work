/**
 * 启动数据加载模块
 * 单例
 * */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import LogUtil from "../lib/utils/LogUtil";
import Model from "../utils/Model";
import Settings from '../utils/Settings';
import { getLoadData, getDataFromResult } from '../utils/MyUtil';
import { getMainNavDataComplete, getToolFuncsDataComplete, getChatRightTabsComplete, getFuncSwitcherComplete, getRecordSwither, getLogoComplete } from '../reducers/startUpLoadReduce';
import VersionControl from "../utils/VersionControl";
import LoginUserProxy from "../model/proxy/LoginUserProxy";
import UserSourceProxy from "../model/proxy/UserSourceProxy";
import { fromJS } from "immutable";
import CommonWordsProxy from "../model/proxy/CommonWordsProxy";
import UsualTips from "../apps/chat/view/aside/UsualTips";
import { getIntelligent, getInfomation } from "../apps/setting/personal/action/personalSetting";
import HyperMediaProxy from "../model/proxy/HyperMediaProxy";

class LoadDataProxy extends Component {
	
	static NAME = 'LoadDataProxy';
	
	constructor()
	{
		super();
		
		this.name = LoadDataProxy.NAME;
		
		Model.registerProxy(this);
	}
	
	shouldComponentUpdate()
	{
		return false;
	}
	
	start()
	{
		this._loadData();
	}
	
	_loadData()
	{
		log("_loadData 加载基本数据...");
		
		this._getPersonInfo()
		.then(() => this._getMainNavData())
		.then(() => this._getToolFunctionsData())
		.then(() => this._getLogoData())
		.then(() => this._getFuncSwitcherComplete())
		.then(() => this._getChatRightTabs())
		.then(() => this._getChatSetCode())
		.then(() => this._getVisitorSource())
		.then(() => this._getHyperMediaFlistComplete())
		.then(() => this.props.getRecordSwither())
		.then(() => {
			this.props.getIntelligent();
			return Promise.resolve();
		})
		.then(() => {
			let commonWordsProxy = Model.retrieveProxy(CommonWordsProxy.NAME);
			
			return commonWordsProxy.loadData(UsualTips.ALL);
		});
	}
	
	_getMainNavData()
	{
		log("getMainNavData menuconfig start...");
		
		let url = Settings.getMainNavUrl(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		return getLoadData(url)
		.then(getDataFromResult)
		.then(info => {
			log(["getMainNavData menuconfig = ", info]);
			
			this.props.getMainNavDataComplete(info);
			return resolve;
		});
	}
	
	_getLogoData()
	{
		log("_getLogoData start...");
		
		let url = Settings.getLogoUrl(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		return getLoadData(url)
		.then(getDataFromResult)
		.then(info => {
			log(["_getLogoData url = ", info]);
			
			this.props.getLogoComplete(info);
			return resolve;
		});
	}
	
	
	_getToolFunctionsData()
	{
		log("getToolFunctionsData start...");
		
		let url = Settings.getToolFunctionsUrl(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		return getLoadData(url)
		.then(getDataFromResult)
		.then(info => {
			log(["getToolFunctionsData = ", info]);
			this.props.getToolFuncsDataComplete(fromJS(info));
			return resolve;
		});
	}
	
	_getChatRightTabs()
	{
		log("getChatRightTabs start...");
		
		let url = Settings.getChatRightTabsUrl(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		return getLoadData(url)
		.then(getDataFromResult)
		.then(info => {
			log(["getChatRightTabs = ", info]);
			
			if(info && Array.isArray(info))
			{
				info.sort(this._tabsSort);
			}
			
			this.props.getChatRightTabsComplete(info);
			return resolve;
		});
	}
	
	_getFuncSwitcherComplete()
	{
		log("getFuncSwitcherComplete start...");
		
		let url = Settings.getInitSwitcherUrl(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		return getLoadData(url)
		.then(getDataFromResult)
		.then(info => {
			log(["getFuncSwitcherComplete = ", info]);
			
			this.props.getFuncSwitcherComplete(info || {});
			return resolve;
		});
	}
	
	_getHyperMediaFlistComplete()
	{
		log("_getHyperMediaFlistComplete start...");
		
		let url = Settings.getHyperMediaFlist(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		return getLoadData(url, null, "get", null, 1, true)
		.then(getDataFromResult)
		.then(info => {
			log(["_getHyperMediaFlistComplete = ", info]);
			
			var hyperMediaProxy = Model.retrieveProxy(HyperMediaProxy.NAME);
			hyperMediaProxy.update(info ? info : []);
			return resolve;
		});
	}
	
	_tabsSort(a, b)
	{
		if(!a || !b)
			return 0;
		
		let gap = a.show - b.show;
		if(isNaN(gap))
			return 0;
		
		return gap;
	}
	
	/**
	 * 获取自定义聊天设置
	 * */
	_getChatSetCode()
	{
		log("getChatSetCode start...");
		
		let url = Settings.getPersonInfoUrl2("chatset"),
			resolve = Promise.resolve();
		if(!url)
			return resolve;
		
		return getLoadData(url)
		.then(info => {
			log(["getChatSetCode = ", info]);
			
			if(info.code === 200)
			{
				VersionControl.initChatSet(info.data);
			}
			
			return resolve;
		});
	}
	
	/**
	 * 获取个人信息
	 * */
	_getPersonInfo()
	{
		log("getPersonInfo start...");
		
		this.props.getInfomation();
		return Promise.resolve();
	}
	
	_getVisitorSource()
	{
		log("getVisitorSource start...");
		
		let url = Settings.getVisitorSourceUrl(),
			resolve = Promise.resolve();
		
		if(!url)
			return resolve;
		
		let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME),
			token = loginUserProxy.ntoken;
		
		return getLoadData(url, null, "get", {token})
		.then(info => {
			log(["getVisitorSource = ", info]);
			
			let userSourceProxy = Model.retrieveProxy(UserSourceProxy.NAME);
			userSourceProxy.update(info.data);
			
			return resolve;
		});
	}
	
	render()
	{
		return null;
	}
	
	getProxyName()
	{
		return this.name;
	}
	
	onRegister()
	{
	
	}
	
	onRemove()
	{
	
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getMainNavDataComplete,
		getToolFuncsDataComplete,
		getChatRightTabsComplete,
		getFuncSwitcherComplete,
		getIntelligent,
		getInfomation,
		getRecordSwither,
		getLogoComplete
	}, dispatch);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('LoadDataProxy', info, log);
}

export default connect(null, mapDispatchToProps)(LoadDataProxy);
