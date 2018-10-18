import React, { PropTypes } from 'react';
import { Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import { Button } from 'antd';
import { bindActionCreators } from 'redux';
import { requestCancel, requestLoginWithToken } from './redux/loginReducer';
import '../../public/styles/login/login.scss';
import LoginResult from "../../model/vo/LoginResult";
import ReFresh from "../../components/ReFresh";
import { parseSearch } from "../../utils/StringUtils";
import { getLangTxt } from "../../utils/MyUtil";

class LoginWithToken extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {};
	}
	
	componentWillReceiveProps(nextProps)
	{
		let user = nextProps.user;
		if(user && this.props.user != user)
		{
			this.state.visible = user.success === LoginResult.FAILURE;
		}
	}
	
	_getLoginingComp()
	{
		return (
			<div className="loadWrap">
				<div className="la-square-jelly-box">
					<div></div>
					<div></div>
				</div>
				<Button type="primary" onClick={this._onCancelHandler.bind(this)}>{getLangTxt("cancel")}</Button>
			</div>
		);
	}
	
	reFreshFn()
	{
		let {token, siteid} = this.props;
		this.props.requestLoginWithToken(token, siteid);
	}
	
	_onCancelHandler()
	{
		const {dispatch} = this.props;
		dispatch(requestCancel(this.requestId));
	}
	
	render()
	{
		let {user, location = {}} = this.props,
			{search = ""} = location,
			query = parseSearch(search) || {},
			{token, siteid} = query;
		
		if(user.success === LoginResult.LOGINING)
		{
			return this._getLoginingComp();
		}
		else if(user.success === LoginResult.SUCCESS)
		{
			return <Redirect to="/"/>
		}
		else if(user.success === undefined)
		{
			this.props.requestLoginWithToken(token, siteid);
		}
		
		return (
			<div className="login-container">
				<ReFresh reFreshFn={this.reFreshFn.bind(this)}/>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	const {loginReducer: {user = {}}} = state;
	return {user};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({requestLoginWithToken}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginWithToken);
