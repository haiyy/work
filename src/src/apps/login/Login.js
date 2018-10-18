import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Checkbox, Select, Form, Input, Button } from 'antd';
import { requestLogin, requestCancel, dispatchAction, checkLogin } from './redux/loginReducer';
import { getLangTxt, ntMd5 } from '../../utils/MyUtil';
import { generateSiteId } from '../../utils/StringUtils';
import '../../public/styles/login/login.scss';
import Lang from '../../im/i18n/Lang';
import UserStatus from '../../model/vo/UserStatus';
import LoginUserProxy from "../../model/proxy/LoginUserProxy";
import LoginResult from "../../model/vo/LoginResult";
import { createMessageId } from "../../lib/utils/Utils";
import LogUtil from "../../lib/utils/LogUtil";
import ConfigProxy from "../../model/proxy/ConfigProxy";
import Model from "../../utils/Model";
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';
import UpdateView from "../update/UpdateView";
import Channel from "../../model/vo/Channel";
import { sendToMain } from "../../core/ipcRenderer";
import NTModal from "../../components/NTModal";
import { version, productName } from '../../../package.json';
import TranslateProxy from "../../model/chat/TranslateProxy";
import VersionControl from "../../utils/VersionControl";
import {getProgressComp} from "../../utils/MyUtil";

const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

let formdata,
	loginView = [],
	siteIds = [];

class Login extends React.PureComponent {

	constructor(props)
	{
		super(props);

		if(localStorage.length > 0 && localStorage.getItem('loginView'))
		{
			loginView = Array.from(JSON.parse(localStorage.getItem('loginView')) || []);
			if(loginView.length > 0)
			{
				siteIds = loginView.filter(value => value && value.length)
				.map(value => value[0].siteId);
			}
		}

		let lang = localStorage.getItem("lang") || "zh-cn";

		TranslateProxy.LANGUAGE = lang;

		this.state = {lang};

		let loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);
		if(this.state.siteid)
		{
			loginProxy.lastSiteId = this.state.siteid;
		}
	}

	componentWillUnmount()
	{
		formdata = null;
		loginView = [];
		siteIds = [];
	}

	componentDidMount()
	{
		let {theme = {}} = this.props,
			{personalskin = 0, skin = []} = theme,
			name = skin.length ? skin[personalskin].icon : "blue",
			body = document.body;

		this.getAppCss.call(document.body, name);

		body.className = name;

		Array.from(body.children)
		.forEach(element => {
			if(element && element.tagName === "DIV" && element.id !== "app")
			{
				body.removeChild(element);
			}
		});

		this._getLoginInfo();
		
		console.log("Login componentDidMount ...");

		this.onLangChange(this.state.lang);
		
		this.props.checkLogin();
	}

	getAppCss(name)
	{
		if(name === "purple" || name === "floral")
		// if(name === "purple")
		{
			require("../../public/styles/skin/" + name + ".less");
		}
		else
		{
			require("../../public/styles/skin/" + name + ".scss");
		}
	}

	_getLoginInfo(siteId = "", index = 0)
	{
		if(!siteIds || siteIds.length <= 0)
		{
			this.setState({visible: false});
			this.userInfo = null;
			return;
		}

		let tempState = {
				visible: false,
				userInfos: []
			},
			userInfos;

		if(!siteId)
			siteId = siteIds[0] ? siteIds[0] : siteId;

		tempState.siteid = siteId;

		let sindex = this.findSiteIdIndex(siteId);
		userInfos = loginView[sindex];

		if(!userInfos || userInfos.length <= 0)
		{
			this.userInfo = null;
			this.setState(tempState);
			return;
		}

		let userInfo = userInfos[index];
		tempState.userInfos = userInfos;

		this.userInfo = userInfo;

		this.setState(tempState);
	}

	componentWillReceiveProps(nextProps)
	{
		let user = nextProps.user;
		if(user && this.props.user != user)
		{
			this.state.visible = user.success === LoginResult.FAILURE;
		}
	}

	_onSiteIdChanged(value)
	{
		this._getLoginInfo(value.trim() || " "); // " "防止用户名和密码显示默认值
	}

	set userInfo(value)
	{
		let userName = "",
			remember = false, loginStatus = "1",
			userInfo = value,
			siteId = "",
			password = "";

		if(userInfo)
		{
			userName = userInfo.userName || userName;
			password = password || userInfo.password;
			remember = userInfo.remember == 1;
			loginStatus = userInfo.loginStatus;
			siteId = siteId || userInfo.siteId;
		}

		this.state.userInfo = value;

		this.props.form.setFieldsValue({siteid: siteId, userName, password, remember, loginStatus});
	}

	handleSubmit(e)
	{
		e.preventDefault();

		this.props.form.validateFields((errors) => {
			if(errors)
				return false;

			formdata = this.props.form.getFieldsValue();

			let password = formdata.password.trim(),
				userInfo = this.state.userInfo;

			if(!userInfo || userInfo.password !== password)
			{
				password = ntMd5(formdata.password);
			}

			Object.assign(this.state, {password: formdata.password});

			formdata.remember = formdata.remember ? 1 : 0;
			formdata.password = password;
			formdata.siteid = generateSiteId(formdata.siteid)
			.toLocaleLowerCase();
			formdata.userName = formdata.userName.trim();

			this._populateStorage(formdata);

			let configProxy = Model.retrieveProxy(ConfigProxy.NAME),
				loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);

			loginProxy.siteId = formdata.siteid;

			this.props.dispatchAction({type: "LOGIN_REQUEST", user: {success: -1}}); //正在登录

			configProxy.getFlashServer()
			.then(success => {
				if(success)
				{
					this.requestId = createMessageId();
					this.props.requestLogin(formdata, this.requestId);
				}
				else
				{
					this.props.dispatchAction({
						type: "LOGIN_SUCCESS",
						user: {success: false, error: 20022}
					}); //正在登录
				}
			});
		});
	}

	_handleOk()
	{
		this.props.dispatchAction({
			type: "LOGIN_SUCCESS",
			user: {}
		});

		this.setState({
			visible: false
		});
	}

	_handleCancel()
	{
		this.setState({
			visible: false
		});
	}

	_onChangeUserInput(userName)
	{
		let userInfos = this.state.userInfos;
		userName = userName.trim();

		if(userName && userInfos)
		{
			let userInfo = userInfos.find(item => item && userName === item.userName),
				password = userInfo && userInfo.password ? userInfo.password : "";

			this.props.form.setFieldsValue({password});
		}
	}

	_getErrorModal(user)
	{
		if(!this.state.visible)
			return null;

		return (
			<NTModal className="login-model" visible={this.state.visible} title="" footer="" okText={getLangTxt("sure")}
			         cancelText=""
			         width={416} mask={false}
			         wrapClassName="loginWaring" onCancel={this._handleCancel.bind(this)}>
				<i className="iconfont icon-009cuowu"/>
				<span>{getLangTxt("login_error_title")}</span>
				{
					user ? <p>{Lang.getLangTxt(user.error)}</p> : <p>{getLangTxt("login_error")}</p>
				}
				<Button type="primary" onClick={this._handleOk.bind(this)}>{getLangTxt("sure")}</Button>
			</NTModal>
		);
	}

	_getSiteIdOptions(siteIds)
	{
		if(Array.isArray(siteIds) && siteIds.length > 0)
		{
			return siteIds.map(siteid => <Option key={siteid} value={siteid}> {siteid} </Option>);
		}

		return [];
	}

	_getNameOptions(userInfos)
	{
		if(Array.isArray(userInfos) && userInfos.length > 0)
		{
			return userInfos.map((item, index) => {
				return (
					<Option key={index} value={item.userName}>
						{item.userName}
					</Option>
				);
			})
		}

		return [];
	}

	_populateStorage(data)
	{
		let login = {
			userName: data.userName,
			loginStatus: data.loginStatus,
			siteId: data.siteid
		};

		let index = this.findSiteIdIndex(data.siteid),
			userInfos = loginView[index] || [];

		index > -1 && loginView.splice(index, 1);

		if(userInfos)
		{
			let index = userInfos.findIndex(userInfo => userInfo.userName === data.userName);

			index >= 0 && userInfos.splice(index, 1);

			userInfos.unshift(login);
		}
		else
		{
			userInfos = [login];
		}

		this.state.userInfo = login;

		loginView.unshift(userInfos);

		localStorage.setItem("loginView", JSON.stringify(loginView));
	}

	findSiteIdIndex(siteId)
	{
		return loginView.findIndex(value => {
				if(value && value.length > 0)
				{
					return value[0].siteId === siteId;
				}

				return false;
			}
		)
	}

	_getSiteIdsComp()
	{
		return (
			<Select placeholder={getLangTxt("siteIdTip")} notFoundContent="" mode="combobox"
			        defaultActiveFirstOption={false}
			        showArrow={false} filterOption={false}
			        onChange={this._onSiteIdChanged.bind(this)}>
				{
					this._getSiteIdOptions(siteIds)
				}
			</Select>
		);
	}

	_getUserInfosComp(userInfos)
	{
		return (
			<Select placeholder={getLangTxt("userNameTip")} mode="combobox" notFoundContent=""
			        defaultActiveFirstOption={false} showArrow={false}
			        filterOption={false} onChange={this._onChangeUserInput.bind(this)}>
				{
					this._getNameOptions(userInfos)
				}
			</Select>
		);
	}

	_getLoginingComp()
	{
		return (
			<div className="loadWrap">
                { getProgressComp(1) }
				<Button type="primary" onClick={this._onCancelHandler.bind(this)}>{getLangTxt("cancel")}</Button>
			</div>
		);
	}

	_onCancelHandler()
	{
		this.props.requestCancel(this.requestId);
	}

	_getImgPath(value)
	{
		return require(`../../public/images/login/${value}.png`)
	}

	statusUI()
	{
		const statusOptionsStyle = {'padding': '5px 8px', 'textAlign': 'left'};

		return (
			<Select fieldNames="statesTwo" dropdownClassName="statesTwo"
			        optionFilterProp="children" dropdownMatchSelectWidth={false}>
				<Option value={UserStatus.AVAILABLE.toString()}
				        style={statusOptionsStyle} title={getLangTxt("online")}>
					<img src={this._getImgPath("online")} className="stateIcon"/>
					<span className="stateSpan">{getLangTxt("online")}</span>
				</Option>

				<Option value={UserStatus.BUSY.toString()}
				        style={statusOptionsStyle} title={getLangTxt("busy")}>
					<img src={this._getImgPath("busy")} className="stateIcon"/>
					<span className="stateSpan">{getLangTxt("busy")}</span>
				</Option>

				<Option value={UserStatus.AWAY.toString()}
				        style={statusOptionsStyle} title={getLangTxt("offline")}>
					<img src={this._getImgPath("leave")} className="stateIcon"/>
					<span className="stateSpan">{getLangTxt("offline")}</span>
				</Option>
			</Select>
		);
	}

	changeAppNodeStyle()
	{
		let app = document.getElementById("app");

		if(app)
		{
			app.style.minWidth = "1024px";
			app.style.minHeight = "637px";

			this.modalWrap(".ant-modal-wrap{ min-width: 1024px;min-height: 637px;} .loadWrap{ width: 800px;height: 450px;}");
		}
	}

	modalWrap(innerText)
	{
		var style = document.getElementById("#ant-modal-wrap");
		if(!style)
		{
			style = document.createElement("style");
			style.id = "#ant-modal-wrap";
			document.head.appendChild(style);
		}
		style.innerText = innerText;
	}

	onLangChange(value)
	{
		localStorage.setItem("lang", value);

		let lg = lang[value];

		TranslateProxy.LANGUAGE = value;

		require.ensure([], () => {
			Lang.setI18n(lg);
			let lang = require("../../locale/" + lg).default;
			Lang.setLangs(lang);

			this.forceUpdate();
		});

		this.setState({lang: value});
	}

	render()
	{
		try
		{
			if(Type === 1)
			{
				this.modalWrap(".ant-modal-wrap{ min-width: 755px;min-height: 525px;} " +
					".loadWrap{ width: 755px;height: 450px;}");
			}

			let user = this.props.user;

			if(user)
			{
				if(user.success === LoginResult.LOGINING)
				{
					return this._getLoginingComp();
				}
				else if(user.success === LoginResult.SUCCESS)
				{
					this.changeAppNodeStyle();

					sendToMain("onresize");

					return <Redirect to="/"/>
				}
			}

			let userName = "", remember = false, loginStatus = "1", userInfo = this.state.userInfo, siteId = "",
				password = "";

			if(userInfo)
			{
				userName = userInfo.userName || userName;
				password = password || userInfo.password;
				remember = userInfo.remember == 1;
				loginStatus = userInfo.loginStatus;
				siteId = siteId || userInfo.siteId;
			}

			const {getFieldDecorator} = this.props.form;
			let {userInfos} = this.state;
			userInfos = userInfos ? userInfos : [];

			return (
				<div className="loginContainer">
					<div className="loginContent">
						<div className="hideLogoImg"></div>
						<p className="loginTextP">{getLangTxt("login")}</p>
						<p className="loginTextW clearFix">
							{getLangTxt("login_welcome")}
							{
								VersionControl.isShowLangOption == 1 || VersionControl.isShowLangOption == true ?
									<Select value={this.state.lang} className="languagesSelect"
									        dropdownStyle={{webkitAppRegion: "no-drag"}}
									        dropdownClassName="dropDownNoDrag"
									        onChange={this.onLangChange.bind(this)}>
										<Option value="zh-cn">中文</Option>
										<Option value="en-us">English</Option>
									</Select> : null
							}
						</p>

						<Form className="login-content-box" onSubmit={this.handleSubmit.bind(this)}>
							<div className="loginMessage">
								<div className='login-item'>
									<span className="home login-icon"/>
									<FormItem hasFeedback>
										{
											getFieldDecorator('siteid', {
												initialValue: siteId, rules: [{required: true, min: 1, message: ' '}]
											})(this._getSiteIdsComp())
										}
									</FormItem>
								</div>

								<div className='login-item'>
									<span className="user login-icon"/>
									<FormItem hasFeedback>
										{
											getFieldDecorator('userName', {
												initialValue: userName,
												rules: [{
													required: true, min: 1, message: ' '
												}]
											})(this._getUserInfosComp(userInfos))
										}
									</FormItem>
								</div>

								<div className='login-item'>
									<span className="lock login-icon"/>
									<FormItem hasFeedback className="passwordFormItem">
										{
											getFieldDecorator('password', {
												initialValue: password,
												rules: [{
													required: true, min: 6, message: getLangTxt("passWordTip_note")
												}]
											})(
												<Input type="password" className="login-item-passwordInput"
												       autocomplete="new-password"
												       placeholder={getLangTxt("passWordTip")}/>
											)
										}
									</FormItem>
								</div>

								<FormItem className="loginBtnFormItem">
									<Button type="primary" htmlType="submit"
									        className="loginBtn">{getLangTxt("loginLabel")}</Button>
								</FormItem>

								<div>
									<FormItem className="rememberPasswordFormItem">
										{
											getFieldDecorator('remember', {
												valuePropName: 'checked', initialValue: remember
											})(
												<Checkbox>{getLangTxt("rememberPwd")}</Checkbox>
											)
										}
									</FormItem>

									<FormItem className="loginStateFormItem">
										<span className="pullDownArrow"></span>
										{
											getFieldDecorator('loginStatus', {initialValue: loginStatus})(
												this.statusUI()
											)
										}
									</FormItem>
								</div>
							</div>
						</Form>
						{
							Type === 1 ?
								<div className="loginToolWrapper">
									<button key="quit" className='toolImg closeImgBtn'
									        onClick={this.onOperate.bind(this, Channel.QUIT)}>
										<img src={require('../../public/images/icon_close.png')}/>
									</button>
									<button key="minimaizable" className='toolImg miniImgBtn'
									        onClick={this.onOperate.bind(this, Channel.MINIMIZABLE)}>
										<img src={require('../../public/images/icon_minimize.png')}/>
									</button>
								</div>
								: null
						}

						<span className="versionNumber">{getLangTxt("version")}{version}</span>
					</div>
					{
						this._getErrorModal(user)
					}
					{
						Type === 1 ? <UpdateView siteId={this.props.form.getFieldValue("siteid")}/> : null
					}
				</div>
			);
		}
		catch(e)
		{
			LogUtil.trace("Login", LogUtil.ERROR, "render stack = " + e.stack);
		}

		return null;
	}

	onOperate(value)
	{
		sendToMain(Channel.OPERATE, value);
	}
}

const lang = {
	["zh-cn"]: "zh_cn",
	["en-us"]: "en_us",
};

Login.propTypes = {
	form: PropTypes.object.isRequired
};

function mapStateToProps(state)
{
	const {loginReducer: {user}} = state;
	return {user};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({requestLogin, requestCancel, dispatchAction, checkLogin}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(createForm()(Login))
