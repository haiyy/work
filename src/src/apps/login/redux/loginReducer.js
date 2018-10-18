import { ntMd5, sendT2DEvent } from "../../../utils/MyUtil";
import SessionEvent from "../../event/SessionEvent";
import Settings from "../../../utils/Settings";
import Model from "../../../utils/Model";
import LoginUserProxy from "../../../model/proxy/LoginUserProxy";
import { urlLoader } from "../../../lib/utils/cFetch";
import LogUtil from "../../../lib/utils/LogUtil";
import ConfigProxy from "../../../model/proxy/ConfigProxy";
import { createMessageId } from "../../../lib/utils/Utils";

const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_ONCANEL = 'LOGIN_ONCANEL';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_USERINFO_UPATE = 'LOGIN_USERINFO_UPATE';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
const REDIRECT = 'LOGIN_REDIRECT';

//-------------------------Actions------------------------------

export function requestLogin(formData, requestId)
{
	log("requestLogin requestId = " + requestId);
	
	return dispatch => {
		try
		{
			if(!formData)
				return;
			
			let loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);
			if(!loginProxy)
				return;
			
			let siteid = loginProxy.siteId = formData.siteid,
				username = loginProxy.username = formData.userName,
				userPwd = loginProxy.userpwd = formData.password,
				loginUrl = Settings.getLoginUrl(),
				body = {siteid, username};
			
			loginProxy.userId = username;
			loginProxy.bsavePwd = formData.remember;
			loginProxy.loginStatus = formData.loginStatus;
			loginProxy.bautoLogin = formData.bautoLogin; //是否自动登录 没有做
			
			dispatch({type: LOGIN_REQUEST, user: {success: -1}});  //正在登录
			
			sessionStorage.setItem("siteid", siteid);
			
			getLoginCode()
			.then(result => {
				if(result.success)
				{
					let pwd = ntMd5(userPwd + loginProxy.loginCode);
					
					body.password = pwd;
					body.key = loginProxy.loginCodeKey;
					
					gotoLogin(loginUrl, body, loginProxy)
					.then(result => {
						if(result)
						{
							if(result.success)
							{
								updateStorage(siteid, userPwd, username, formData.remember);
							}
							
							dispatch({type: LOGIN_SUCCESS, user: result, requestId});
						}
					});
				}
				else
				{
					//20010:"登录异常，请稍后重试！(20010)", //服务器挂了||网络断了
					dispatch({type: LOGIN_SUCCESS, user: {success: false, error: 20010}});
				}
			});
		}
		catch(e)
		{
			log("loginUser stack: " + e.stack);
		}
	};
}

export function requestLoginWithToken(value, siteid)
{
	log("requestLoginWithToken token = " + value + ", siteid = " + siteid);
	
	return dispatch => {
		dispatch({type: LOGIN_REQUEST, user: {success: -1}});  //正在登录
		
		let configProxy = Model.retrieveProxy(ConfigProxy.NAME),
			loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);
		
		loginProxy.siteId = siteid;
		
		dispatch({type: "LOGIN_REQUEST", user: {success: -1}});  //正在登录
		
		configProxy.getFlashServer()
		.then(success => {
			if(success)
			{
				urlLoader(Settings.getLoginWithTokenUrl(), {
					body: JSON.stringify({token: value, siteid}), method: "post"
				})
				.then(({jsonResult}) => {
					let {error, code, data} = jsonResult;
					
					let success = code === 200;
					
					if(success)
					{
						loginProxy.userId = data.userid;
						loginProxy.token = data.token;
						loginProxy.ntoken = data.token;
						loginProxy.loginStatus = 1;
						
						sessionStorage.setItem("sessid", data.sessid);
						sessionStorage.setItem("userid", data.userid);
						sessionStorage.setItem("token", data.token);
					}
					else
					{
						error = code || 20003;
					}
					
					dispatch({
						type: LOGIN_SUCCESS,
						user: {success, error}
					});
				});
			}
			else
			{
				dispatch({
					type: LOGIN_SUCCESS,
					user: {success: false, error: 20022}
				});
			}
		});
	}
}

export function requestCancel(cannel)
{
	log("requestCancel cannel = " + cannel);
	
	return dispatch => {
		let onCancel = {};
		onCancel[cannel] = cannel;
		
		dispatch({type: LOGIN_ONCANEL, onCancel, user: {success: -2}});
	}
}

function updateStorage(siteId, password, userName, remember)
{
	let loginView = Array.from(JSON.parse(localStorage.getItem('loginView')) || []);
	
	let siteIdIndex = loginView.findIndex(value => {
			if(value && value.length > 0)
			{
				return value[0].siteId === siteId;
			}
			
			return false;
			
		}),
		userInfos = loginView[siteIdIndex] || [],
		index = userInfos.findIndex(userInfo => userInfo.userName === userName),
		userInfo = (index >= 0 && userInfos[index]) || {};
	
	if(userInfo)
	{
		if(remember)
		{
			userInfo.password = password;
			userInfo.remember = 1;
		}
		else
		{
			delete userInfo.password;
		}
	}
	
	localStorage.setItem("loginView", JSON.stringify(loginView));
}

function gotoLogin(loginUrl, body, loginProxy)
{
	let result = {};
	
	return urlLoader(loginUrl, {
		body: JSON.stringify(body),
		method: "post",
	})
	.then((response) => {
		let jsonResult = response.jsonResult;
		if(!jsonResult)
			return Promise.resolve();
		
		let success = jsonResult.code === 200;
		
		log("gotoLogin loginSuccess = " + success);
		
		result.success = success;
		
		if(success)
		{
			let data = jsonResult.data,
				nloginToken = data.token;
			
			loginProxy.userId = data.userid;
			loginProxy.token = data.token;
			loginProxy.ntoken = data.token;
			result.nloginToken = nloginToken;
			
			sessionStorage.setItem("sessid", data.sessid);
			sessionStorage.setItem("userid", data.userid);
			sessionStorage.setItem("token", data.token);
		}
		else
		{
			loginProxy.loginCode = -1;
			result.error = jsonResult.code || 20003;
		}
		
		return Promise.resolve(result);
	});
}

//user = {success:false,error:20001}  Lang.getLangTxt(error);
// user = {success:true,access_token:"token"}
export function loginSuccess(user)
{
	return dispatch => {
		dispatch({
			type: LOGIN_SUCCESS,
			user
		});
	};
}

export function dispatchAction(value)
{
	return dispatch => {
		dispatch(value);
	};
}

export function mineInfoUpdate()
{
	return dispatch => {
		dispatch({
			type: LOGIN_USERINFO_UPATE,
		});
	};
}

export function logoutUser()
{
	return dispatch => {
		let loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);
		if(!loginProxy)
			return;
		
		loginProxy.loginCode = -1;
		
		sendT2DEvent({
			listen: SessionEvent.REQUEST_DISCONNECT,
			params: []
		});
		
		Settings.clear();
		
		dispatch({type: LOGOUT_SUCCESS});
	};
}

export function checkLogin()
{
	return dispatch => {
		let userid = sessionStorage.getItem("userid"),
			token = sessionStorage.getItem("token"),
			sessid = sessionStorage.getItem("sessid");
		
		if(!userid || !token || !sessid)
		{
			logoutUser()(dispatch);
			return;
		}
		
		let configProxy = Model.retrieveProxy(ConfigProxy.NAME);
		
		configProxy.getFlashServer()
		.then(success => {
			if(success)
			{
				toChecklogin(userid, sessid, token, dispatch);
			}
			else
			{
				dispatch({type: LOGIN_SUCCESS, user: {success: false, error: 20027}});
			}
		});
		
		dispatch({type: LOGIN_REQUEST, user: {success: -1}});  //正在登录
	};
}

function toChecklogin(userid, sessid, token, dispatch)
{
	console.log("loginReducer toChecklogin ....");
	
	let loginProxy = Model.retrieveProxy(LoginUserProxy.NAME);
	
	urlLoader(Settings.getLoginCheckUrl(), {
		body: JSON.stringify({userid, sessid, token}),
		method: "post",
	})
	.then((response) => {
		let jsonResult = response.jsonResult;
		if(!jsonResult)
			return Promise.resolve();
		
		let success = jsonResult.code === 200;
		
		log("gotoLogin loginSuccess = " + success);
		
		if(success)
		{
			loginProxy.userId = userid;
			loginProxy.token = token;
			loginProxy.ntoken = token;
			loginProxy.siteId = sessionStorage.getItem("siteid");
			
			dispatch({type: LOGIN_SUCCESS, user: {success: true}});
		}
		else
		{
			dispatch({type: LOGIN_SUCCESS, user: {success: false, error: 20027}});  //正在登录
		}
	});
}

export function toRedirect(data)
{
	return dispatch => {
		dispatch({type: REDIRECT, data});
	};
}

//---------------------------Reducer-------------------------------

export default function loginReducer(state = {}, action) {
	switch(action.type)
	{
		case LOGIN_ONCANEL:
			let cancel = state.cancel || {};
			Object.assign(cancel, action.onCancel);
			state.cancel = cancel;
			state.user = action.user;
			return state;
		
		case LOGIN_REQUEST:
			return {
				...state,
				user: action.user
			};
		
		case LOGIN_USERINFO_UPATE:
			return {
				...state,
				updateTime: new Date().getTime()
			};
		
		case LOGIN_SUCCESS:
			let cancel1 = state.cancel || {};
			if(cancel1[action.requestId])
				return state;
			
			return Object.assign({}, state, {
				user: action.user,
			});
		
		case LOGOUT_SUCCESS:
			return Object.assign({}, state, {
				user: undefined
			});
		case REDIRECT:
			state.redirect = action.data;
			return state;
		
		default:
			return state;
	}
}

/**
 * 获取登录code
 * */
function getLoginCode()
{
	let loginCodeUrl = Settings.getLoginCodeUrl();
	
	log("getLoginCode getLoginCodeUrl = " + loginCodeUrl);
	
	return urlLoader(loginCodeUrl, {}, "application/json; charset=UTF-8", 1)
	.then(({jsonResult}) => {
		let {code, data} = jsonResult,
			success = code === 200,
			result = {success};
		
		log("getLoginCode getLoginCodeUrl = " + loginCodeUrl + ", success = " + success);
		
		if(success)
		{
			let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME);
			loginUserProxy.loginCode = data.code;
			loginUserProxy.loginCodeKey = data.key;
		}
		
		return Promise.resolve(result);
	})
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('loginReducer', info, log);
}
