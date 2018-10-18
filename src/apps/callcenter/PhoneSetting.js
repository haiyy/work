import React from 'react';
import SettingsBreadcrumb from "../setting/enterprise/SettingsBreadcrumb";
import LogUtil from "../../lib/utils/LogUtil";
import ErrorBoundary from "../../components/ErrorBoundary";
import CalloutTaskFlag from "./view/CalloutTaskFlag";
import VisitPlan from "./view/VisitPlan";
import PersonalCall from "./view/PersonalCallSetting";
import CallListen from "./view/CallListen";
import RealTimeMonitor from "./view/RealTimeMonitor";
import Receptiongroup from "./view/Receptiongroup"
import CallRecordFlag from "./view/CallRecordFlag";
import TelephonyScreen from "./view/telephenyScreen/TelephonyScreen";
import BindOnAccount from "./view/BindOnAccount";

class PhoneSetting extends React.Component {
	constructor(props)
	{
		super(props);
		
		this.state = {editData: null};
	}
	
	componentDidMount()
	{
		if(!this.refs.setting)
			return;
		
		let heightSmall = this.refs.setting.clientHeight;
		if(heightSmall < 768 - 70)
		{
			heightSmall = 768 - 70;
		}
		
		this.setState({height: heightSmall});
	}
	
	_getRightContent()
	{
		try
		{
			let {path, setting} = this.props,
				{height, editData} = this.state,
				curRightKey = path.length && path[path.length - 1] || {},
				{key, fns, isAuthority} = curRightKey,
				CallRecorlFlag;
			
			if(path.length <= 0)
				return null;
			
			let rightContent = null;
			let Comp = fns ? fnMap[getFnkey(fns, setting)] : null;
			
			if(isAuthority)
			{
				CallRecorlFlag = fns[0];
				Comp = fnMap[fns[0]];
			}
			// console.log("Comp", fns, Comp);
			
			if(Comp)
			{
				rightContent = <Comp
					route={this.route.bind(this)}
					height={height}
					CallRecorlFlagTypes={CallRecorlFlag}/>;
			}
			
			return (
				<div className="mailCon">
					{
						rightContent
					}
				
				</div>
			);
		}
		catch(e)
		{
			LogUtil.trace("EnterpriseSetting", LogUtil.INFO, "_getRightContent stack = " + e.stack);
		}
		
		return null;
	}
	
	route(path, isNew, editData)
	{
		this.props.changeRoute(path);
		this.setState({isNew, editData});
		
	}
	
	render()
	{
		let {screenFLag, path, height} = this.props;
			height = height - 70 > 700 ? height - 70 : 700;
		
		if(screenFLag)
		{
			return <TelephonyScreen height={height}/>;
		}
		
		return (
			<div ref="setting" className="settingRight callCenterSetting" style={{height: '100%'}}>
				<SettingsBreadcrumb path={path} key="0" iconClass="icon-hujiaokefu iconfont"/>
				{
					this._getRightContent()
				}
			</div>
		);
	}
}

const fnMap = {
	
	callcenter_calle_records: CallRecordFlag,
	
	callcenter_caller_records: CallRecordFlag,
	
	callcenter_call_records_check: CallRecordFlag,
	
	incomingrecord: CallRecordFlag,
	
	calloutrecord: CallRecordFlag,
	
	incomingunanswered: CallRecordFlag,
	
	calloutunanswered: CallRecordFlag,
	
	callcenter_report_monitor: RealTimeMonitor,
	
	callcenter_report_monitor_check: RealTimeMonitor,
	
	callcenter_outbound_task_check: CalloutTaskFlag,
	
	callcenter_return_visit_plan_check: VisitPlan,
	
	callcenter_call_monitoring: CallListen,
	
	callcenter_call_monitoring_check: CallListen,
	
	callcenter_personal_setting: PersonalCall,
	
	callcenter_account_setting: BindOnAccount,
	
	callcenter_reception_setting: Receptiongroup
	
};

function getFnkey(fns, setting)
{
	let showFns = fns.filter(item => setting.includes(item));
	
	if(showFns.length > 1)
	{
		return showFns[0];
	}
	else if(showFns.length === 1)
	{
		if(fns.length === 1)
		{
			return showFns[0];
		}
		else
		{
			if(showFns[0] === fns[1]) //确保check
			{
				return showFns[0];
			}
		}
	}
	
	return '';
}

export default PhoneSetting;
