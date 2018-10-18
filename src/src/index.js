import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Switch, Route, HashRouter, MemoryRouter } from "react-router-dom";
import configureStore from "./store/configureStore";
import LogUtil from "./lib/utils/LogUtil";
import Model from "./utils/Model";
import LoginUserProxy from "./model/proxy/LoginUserProxy";
import ConfigProxy from "./model/proxy/ConfigProxy";
//import test from "./apps/chat/test";
import { initIpcRenderer } from "./core/ipcRenderer";
import UserInfo from "./model/vo/UserInfo";
import RosterUser from "./model/vo/RosterUser";
import UserSourceProxy from "./model/proxy/UserSourceProxy";
import CommonWordsProxy from "./model/proxy/CommonWordsProxy";
import App from 'bundle-loader?lazy!./apps/App'
import { getComponent } from "./utils/ComponentUtils";
import Login from "bundle-loader?lazy!./apps/login/Login";
import LoginWithToken from "bundle-loader?lazy!./apps/login/LoginWithToken";
import HyperMediaProxy from "./model/proxy/HyperMediaProxy";
import Settings from "./utils/Settings";
import GlobalEvtEmitter from "./lib/utils/GlobalEvtEmitter";
import NtalkerEvent from "./apps/event/NtalkerEvent";
import { ntalkerListRedux } from "./utils/ConverUtils";

require("./lib/core.min.js");

window.NT_DEBUG = (bool = true) => {
	LogUtil.debug = Boolean(bool);
};

window.NT_MQTTDEBUG = (bool) => {
	LogUtil.debug = Boolean(bool);
};

var hiddenProperty = "";
/**
 * 防止文件拖拽进入页面
 * */
window.onload = function() {
	//禁止拖拽文件
	document.addEventListener('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
	}, false);

	document.addEventListener('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
	}, false);

	hiddenProperty = 'hidden' in document ? 'hidden' :
		'webkitHidden' in document ? 'webkitHidden' :
			'mozHidden' in document ? 'mozHidden' :
				null;
	var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');

	var onVisibilityChange = function() {

		if(!document[hiddenProperty])
		{
			document.title = "在线智能客服平台";
			clearInterval(untreatedIntervalID);
			untreatedIntervalID = -1;
		}
	}

	GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_CHANGE, onChange);
	GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_LIST_CHANGE, onChange);

	document.addEventListener(visibilityChangeEvent, onVisibilityChange);

	//超媒体消息交互
	window.addEventListener("message", onMessage);
};

let untreatedIntervalID = -1;

function onChange()
{
	if(!document[hiddenProperty])
		return;

	let list = ntalkerListRedux();

	if(list.untreatedConverCount)
	{
		if(untreatedIntervalID > -1)
			return;

		let title = "新消息来了！";
		document.title = title;
		untreatedIntervalID = setInterval(() => {
			document.title === title ? (document.title = "在线智能客服平台") : (document.title = title);
		}, 1000);
	}
	else
	{
		clearInterval(untreatedIntervalID);
		untreatedIntervalID = -1;
	}
}

function onMessage(event)
{
	let {data = {}, origin} = event,
		{msg, method, url, type} = data; //type = 1时，工单跳转

	if(origin === Settings.getNMagicServer())
	{
		if(method === "windowHeight" && msg && msg.uri)
		{
			GlobalEvtEmitter.emit(msg.uri, data);
		}
		else if(method === "SendMessage")
		{
			/*if(Array.isArray(msg) && msg.length >= 3)
			{
				GlobalEvtEmitter.emit(SENDMESSAGE, {msg: msg[2]});
			}*/
		}
		else if(method === "OpenWebUrl")
		{
			window.open(url);
		}
	}
	else
	{
		if(method === "toLink")
		{
			if(type == 1)
			{
				GlobalEvtEmitter.emit("TICKET", {origin, data});
			}
		}

		if(type === 2) //CRM
		{
			GlobalEvtEmitter.emit("CRM", {method: "customId", msg});
		}
	}
}

NT_DEBUG(true);

Model.registerProxy(new LoginUserProxy())
.registerProxy(new ConfigProxy())
.registerProxy(new UserSourceProxy())
.registerProxy(new HyperMediaProxy())
.registerProxy(new CommonWordsProxy());

const user = new UserInfo(),
	rosterUser = new RosterUser(user),
	loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);

loginProxy.loginUser = rosterUser;

/*window.test = function() {
	test(window);
};*/

initIpcRenderer();

const store = configureStore();
var Router = HashRouter;//Type === 1 ? HashRouter : BrowserRouter;

render(
	<Provider store={store}>
		<Router>
			<Switch>
				<Route path="/loginToken" component={getComponent(LoginWithToken)}/>
				<Route path="/login" component={getComponent(Login)}/>
				<Route component={getComponent(App)}/>
			</Switch>
		</Router>
	</Provider>,
	document.getElementById("app")
);





