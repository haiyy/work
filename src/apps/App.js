import React from 'react';
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import Header from "bundle-loader?lazy!./header/Header";
//import NtalkerListRedux from "bundle-loader?lazy!../model/chat/NtalkerListRedux";
import NtalkerListRedux from "../model/chat/NtalkerListRedux";
import InitAppRedux from "bundle-loader?lazy!../core/InitAppRedux";
//import ConsultReceptRedux from "bundle-loader?lazy!./chat/ConsultReceptRedux";
import ConsultReceptRedux from "./chat/ConsultReceptRedux";
//import LoadDataProxy from "bundle-loader?lazy!../core/LoadDataProxy";
import LoadDataProxy from "../core/LoadDataProxy";
import 'antd/dist/antd.less';
import '../public/styles/app/app.scss';
import '../public/styles/electron/electron.scss';
import '../public/styles/triggerModal/triggerModal.scss';
import '../public/styles/font/iconFont.scss';
import "../public/styles/font/common_iconfont.css";
import { shallowEqual } from "../utils/MyUtil";
import { bindActionCreators } from 'redux';
import LoginResult from "../model/vo/LoginResult";
import IndexPage from "bundle-loader?lazy!../core/IndexPage";
import SettingTabs from "bundle-loader?lazy!./setting/enterprise/SettingTabs";
import RecordTabs from "bundle-loader?lazy!./record/RecordTabs";
import FriendsPage from "bundle-loader?lazy!../components/FriendsPage";
import KpiTabs from "bundle-loader?lazy!./kpi/view/KpiTabs";
import HelpCenter from 'bundle-loader?lazy!./help/view/HelpCenter';
import { getComponent } from "../utils/ComponentUtils";
import EnterFrameComp from "../components/EnterFrameComp";
import ChatPage from "bundle-loader?lazy!./chat/ChatPage";
import { getQueryString } from "../utils/StringUtils";
import PropTypes from 'prop-types';
import NewsRemind from './public/newsRemind';
import TranslateProxy from "../model/chat/TranslateProxy";
import NTLocaleProvider from "../components/NTLocaleProvider";
import PhoneTabs from "bundle-loader?lazy!./callcenter/PhoneTabs";

const SettingTabsComp = getComponent(SettingTabs),
	RecordTabsComp = getComponent(RecordTabs),
	FriendsPageComp = getComponent(FriendsPage),
	KpiPageComp = getComponent(KpiTabs),
	ChatPageComp = getComponent(ChatPage),
	IndexPageComp = getComponent(IndexPage),
	NtalkerListReduxComp = NtalkerListRedux,//getComponent(NtalkerListRedux),
	InitAppReduxComp = getComponent(InitAppRedux),
	ConsultReceptReduxComp = ConsultReceptRedux,//getComponent(ConsultReceptRedux),
    LoadDataProxyComp = LoadDataProxy,
    //LoadDataProxyComp = getComponent(LoadDataProxy),
    HelpPageComp =  getComponent(HelpCenter),
    	CallCenterComp = getComponent(PhoneTabs),
	HeaderComp = getComponent(Header);

export class App extends EnterFrameComp {

	static isMaximizable = false;

	static propTypes = {
		children: PropTypes.element,
	};

	constructor(props)
	{
		super(props);
		this.state = {
			winHeight: "",
			visible: false
		}
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
		let {documentElement = {}} = document;

		if(documentElement.clientHeight && documentElement.clientWidth)
		{
			let winHeight = documentElement.clientHeight - 60;

			if(winHeight != this.state.winHeight)
			{
				this.setState({winHeight})
			}
		}
	}

	componentWillReceiveProps(nextProps)
	{
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		return !shallowEqual(nextProps, this.props, true, 2) || this.state.winHeight !== nextState.winHeight;
	}

	renderAuthenticatedPage()
	{
		sendToMain("onresize", 1440, 900);

		let {theme = {}, location} = this.props,
			{personalskin = 0, skin = []} = theme,
			name = skin.length ? skin[personalskin].icon : "blue",
			isElectronClassName = Type === 1 ? 'bodyIsElectron' : '',
			visible = !location || (location.pathname !== "/" && location.pathname !== "/chats");

		this.getAppCss.call(document.body, name);

		document.body.className = name;
		document.body.className += ' ' + isElectronClassName;

		return (
			<div className="ant-layout-aside">
				<HeaderComp/>
				<LoadDataProxyComp/>
				<NtalkerListReduxComp/>
				<InitAppReduxComp/>
				<ConsultReceptReduxComp/>
				<div className="ant-layout-main" id="body">
					<div className="ant-layout-container">
						<div className="ant-layout-content">
							<Switch>
								<Route path="/setting" component={SettingTabsComp}/>
								<Route path="/chatrecord" component={RecordTabsComp}/>
								<Route path="/friends" component={FriendsPageComp}/>
								<Route path="/kpi" component={KpiPageComp}/>
								<Route path="/chats" component={ChatPageComp}/>
                                <Route path="/help" component={HelpPageComp}/>
								<Route path="/phone" component={CallCenterComp}/>
								<Route component={IndexPageComp}/>
							</Switch>
						</div>
					</div>
					{visible ? <NewsRemind/> : null}
				</div>
			</div>
		);
	}

	getChildren(success = false)
	{
		let {location = {}} = this.props,
			{search = {}} = location,
			query = getQueryString(search);

		if(success === LoginResult.SUCCESS)
			return this.renderAuthenticatedPage();

		if(query.mode == 1) //token直连
		{
			return <Redirect to={{
				pathname: '/loginToken',
				state: {query}
			}}/>;
		}

		return <Redirect to="/login"/>
	}

	getAppCss(name)
	{
		// if(name === "blue")
		// {
		// 	require.ensure([], function() {
		// 		require("../public/styles/skin/" + name + ".less");
		// 	})
		// }
		// else
		// {
		// 	require.ensure([], function() {
		// 		require("../public/styles/skin/" + name + ".less");
		// 	})
		// }
		require.ensure([], function() {
			require("../public/styles/skin/" + name + ".less");
		})
	}

	render()
	{
		let {user: {success = false}} = this.props,
			isMiniClassName = (Type === 1 && !App.isMaximizable) ? "isMiniAppWrap" : "";

		return (
			<div className={"appWrap " + isMiniClassName}>
				<NTLocaleProvider lang={TranslateProxy.LANGUAGE}>
					<div className={name + " AppCSS"}>
						{
							this.getChildren(success)
						}
					</div>
				</NTLocaleProvider>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	const {
			loginReducer: {user = {}},
			personalReducer
		} = state,

		themeData = personalReducer.get("theme") || Map(),
		theme = themeData.get("data") || {};

	return {user, theme};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);


