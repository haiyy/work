import Proxy from "../Proxy";
import { getUserName } from "../vo/RosterUser";

/*
 * let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME);
 * */
class LoginUserProxy extends Proxy {

	static NAME = "LoginUserProxy";

	constructor()
	{
		super();

		this.name = LoginUserProxy.NAME;
	}

	get lastSiteId()
	{
		return this._lastSiteId;
	}

	set lastSiteId(value)
	{
		this._lastSiteId = value;
	}

	/**企业ID*/
	get siteId()
	{
		return _siteId;
	}

	set siteId(value)
	{
		_siteId = value;
	}

	get groupId()
	{
		if(this._userInfo)
		{
			return this._userInfo.groupId;
		}

		return "";
	}

	/**获取登录密码*/
	get userpwd()
	{
		return _userpwd;
	}

	set userpwd(value)
	{
		_userpwd = value;
	}

	getUserName()
	{
		return getUserName(this._userInfo);
	}

	/**获取登录名*/
	get username()
	{
		if(this._userInfo)
		{
			return this._userInfo.userName;
		}

		return _username;
	}

	set username(value)
	{
		_username = value;

		if(this._userInfo)
		{
			this._userInfo.userName = value;
		}
	}

	/**获取登录用户ID*/
	get userId()
	{
		return _userId;
	}

	set userId(value)
	{
		_userId = value;

		if(this._userInfo)
		{
			this._userInfo.userId = value;
		}
	}

	/**
	 *"nloginToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKZXJzZXktU2VjdXJpdHktQmFzaWMiLCJzdWIiOiJ7XCJ1c2VyaWRcIjpcIjEyXCJ9IiwiaWF0IjoxNDg2OTc2NDM1LCJleHAiOjE0ODg0NDc2NjR9.YU-H63vDYIUg5peFFVJW-vx9MZbtdYmuzcn6UiTgvHI",
	 "nDolphinToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKZXJzZXktU2VjdXJpdHktQmFzaWMiLCJzdWIiOiJ7XCJ2YWxpZHRpbWVzXCI6NjAwMDAsXCJyb2xlc1wiOltdLFwic2l0ZWlkXCI6XCJrZl8xMDAwXCIsXCJ1c2VyaWRcIjpcImtmXzEwMDBfZGFlOGMxZjQtY2ExZC00Y2I2LTk4ZjEtZjc5Yjg0NDdlNGI1XCJ9IiwiaWF0IjoxNDg2OTc2NDM1LCJleHAiOjE0ODg0NDc2NjR9.bwL99trwtkjqvravAPt0YwvZH9mQECVTAJc3JeOcrDE",
	 "nPigeonToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKZXJzZXktU2VjdXJpdHktQmFzaWMiLCJzdWIiOiJ7XCJ2YWxpZHRpbWVzXCI6NjAwMDAsXCJyb2xlc1wiOltdLFwic2l0ZWlkXCI6XCJrZl8xMDAwXCIsXCJ1c2VyaWRcIjpcImtmXzEwMDBfZGFlOGMxZjQtY2ExZC00Y2I2LTk4ZjEtZjc5Yjg0NDdlNGI1XCJ9IiwiaWF0IjoxNDg2OTc2NDM1LCJleHAiOjE0ODg0NDc2NjR9.bWqSjGvdxHloq3leISu-n_DsM1WU1rz6XR4zWYSSOwM",
	 "nSkyEyeToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKZXJzZXktU2VjdXJpdHktQmFzaWMiLCJzdWIiOiJ7XCJ2YWxpZHRpbWVzXCI6NjAwMDAsXCJyb2xlc1wiOltdLFwic2l0ZWlkXCI6XCJrZl8xMDAwXCIsXCJ1c2VyaWRcIjpcImtmXzEwMDBfZGFlOGMxZjQtY2ExZC00Y2I2LTk4ZjEtZjc5Yjg0NDdlNGI1XCJ9IiwiaWF0IjoxNDg2OTc2NDM1LCJleHAiOjE0ODg0NDc2NjR9.Xf9oyZ3dKRE1dMr7aSAwMSB6s4TkicekeJo9kqKx3UU",
	 "nPantherToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKZXJzZXktU2VjdXJpdHktQmFzaWMiLCJzdWIiOiJ7XCJ2YWxpZHRpbWVzXCI6NjAwMDAsXCJyb2xlc1wiOltdLFwic2l0ZWlkXCI6XCJrZl8xMDAwXCIsXCJ1c2VyaWRcIjpcImtmXzEwMDBfZGFlOGMxZjQtY2ExZC00Y2I2LTk4ZjEtZjc5Yjg0NDdlNGI1XCJ9IiwiaWF0IjoxNDg2OTc2NDM1LCJleHAiOjE0ODg0NDc2NjR9.Xf9oyZ3dKRE1dMr7aSAwMSB6s4TkicekeJo9kqKx3UU"
	 * */
	get token()
	{
		return _token;
	}

	set token(value)
	{
		if(!value)
			return;

		_token = {
			nloginToken: value,
			nDolphinToken: value,
			nPigeonToken: value,
			nSkyEyeToken: value,
			nPantherToken: value
		};
	}

	set ntoken(value)
	{
		_ntoken = value;
	}

	get ntoken()
	{
		return _ntoken;
	}

	get loginUser()
	{
		return _rosterUser;
	}

	/**设置登录用户信息
	 * @param {RosterUser} value
	 * */
	set loginUser(value)
	{
		_rosterUser = value;

		if(_rosterUser.userInfo)
		{
			_rosterUser.userInfo.type = 1;
		}
	}

	/**初始登录状态*/
	get loginStatus()
	{
		if(_rosterUser && _rosterUser.userInfo)
		{
			return _rosterUser.userInfo.status;
		}

		return _loginStatus;
	}

	set loginStatus(value)
	{
		_loginStatus = value;

		if(_rosterUser && _rosterUser.userInfo)
		{
			_rosterUser.userInfo.status = _loginStatus;
		}
	}

	/**@return {Boolean} 是否保存密码 */
	get bsavePwd()
	{
		return _bsavePwd;
	}

	set bsavePwd(value)
	{
		_bsavePwd = value;
	}

	/**是否自动登录*/
	get bautoLogin()
	{
		return _autoLogin;
	}

	set bautoLogin(value)
	{
		_autoLogin = value;
	}

	get loginCode()
	{
		return _loginCode;
	}

	get loginCodeKey()
	{
		return _loginCodeKey;
	}

	set loginCodeKey(value)
	{
		_loginCodeKey = value;
	}

	set loginCode(value)
	{
		_loginCode = value;
	}

	get _userInfo()
	{
		if(_rosterUser)
		{
			return _rosterUser.userInfo;
		}

		return null;
	}

	saveToLocal()
	{
		return true;
	}
}

let _token = {},
	_ntoken = "",
	_username = null,
	_userpwd = null,
	_userId = null,
	_siteId = null,
	_rosterUser = null,
	_autoLogin = false,
	_bsavePwd = false,
	_loginStatus = -1,
	_loginCode,
	_loginCodeKey = "";  //给服务器的透传值

export default LoginUserProxy;
