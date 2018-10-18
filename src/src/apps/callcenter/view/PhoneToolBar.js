import { PhoneCallUI, PhoneCall, PhoneCallEvent, PhoneInitEvent, ServerConfig, PhoneCallPage, PhoneEvent, PhoneStatus } from "../lib/Xn.PhoneCall";
import React from "react";
import App from "../../App";
import Settings from "../../../utils/Settings";
import { configProxy, getLoadData } from "../../../utils/MyUtil";
import Model from "../../../utils/Model";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { phoneCallChange, setscreenFlag, updateCustomId } from "../redux/reducers/telephonyScreenReducer";
import { getPhoneScreenRecord } from "../redux/reducers/phonePlayScreenReducer";
import "../lib/PhoneCall.css";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import { serverTimeGap } from "../../../utils/ConverUtils";

class PhoneToolBar extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		let loginUserProxy = Model.retrieveProxy("LoginUserProxy");
		
		ServerConfig.siteId = loginUserProxy.siteId;
		ServerConfig.userId = loginUserProxy.userId;
		ServerConfig.callSettingUrl = configProxy().xNccSettingServer;
		ServerConfig.loginUrl = configProxy().xNccCallServer;
		ServerConfig.appDownUrl = "";
		
		console.log("PhoneToolBar ServerConfig.userId = ", ServerConfig.userId);
		
		this.onPhoneOprate = this.onPhoneOprate.bind(this);
		
		if(!App.phoneCall)
		{
			this.phoneCall = App.phoneCall = new PhoneCall();
			this.loadData();
		}
		else
		{
			this.phoneCall = App.phoneCall;
		}
		
		this.phoneCall.on(PhoneEvent.PHONE_OPRATE, this.onPhoneOprate);
		this.onCrm = this.onCrm.bind(this);
		
		GlobalEvtEmitter.on("CRM", this.onCrm);
	}
	
	componentWillUnmount()
	{
		if(this.phoneCall)
		{
			this.phoneCall.removeListener(PhoneEvent.PHONE_OPRATE, this.onPhoneOprate);
		}

		GlobalEvtEmitter.removeListener("CRM", this.onCrm);

		this.props.updateCustomId();
	}
	
	onCrm({method, msg})
	{
		if(method === "customId" && msg)
		{
			this.props.updateCustomId(msg.customId);
		}
	}
	
	/**
	 * 电话交互
	 * @param {Object} data {oprate: "incoming", phonenumber: "18612031111", callid: "callId", callee:"123456", caller:"18612061111", isinner: false, type}
	 * */
	onPhoneOprate(data)
	{
		if(!data.isinner && [PhoneStatus.INCOMING, PhoneStatus.CALLOUT].includes(data.oprate))
		{
			this.props.phoneCallChange(data);
			this.props.getPhoneScreenRecord({...data, dateTime: (new Date().getTime() - serverTimeGap())});
			this.props.setscreenFlag(true);
		}
	}
	
	loadData()
	{
		getLoadData(Settings.nPhoneLoginUrl(), null, "post", 3)
		.then(({code, data}) => {
			
			let success = code === 200;
			if(success)
			{
				ServerConfig.token = data.accessToken;
				ServerConfig.gapTime = data.sysTime - new Date().getTime();
			}
			
			return Promise.resolve(success);
		})
		.then((success) => {
			success && this.phoneCall.start();
		})
	}
	
	render()
	{
		return (
			<div style={{height: 60, borderBottom: "solid 1px rgb(233,233,233)"}}>
				<PhoneCallPage/>
			</div>
		);
	}
	
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({phoneCallChange, getPhoneScreenRecord, setscreenFlag, updateCustomId}, dispatch);
}

export default connect(null, mapDispatchToProps)(PhoneToolBar);