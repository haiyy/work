import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Icon, Tabs, Form, Input } from 'antd';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst"
import { ReFresh } from "../../../../components/ReFresh";
import { setscreenFlag, addVisilPlan } from "../../redux/reducers/telephonyScreenReducer"
import '../style/telephonyScreen.less'
import '../style/searchListComp.less'
import { getProgressComp } from "../../../../utils/MyUtil";
import TelephonyVisitComponent from "./TelephonyVisitComponent" //回访计划
import TelephonyRecordComponent from "./TelephonyRecordComponent" //通话记录
import { PhoneStatus } from "../../lib/Xn.PhoneCall";
import ScrollArea from 'react-scrollbar';
import UsualTips from "../../../chat/view/aside/UsualTips";
import CrmInfo from "./CrmInfo";
import WoList from "./WoList";

const TabPane = Tabs.TabPane;

class TelephonyTabs extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			ModalShow: false, Visible: false, ruleNumLength: 0,
		}
	}
	
	_getProgressComp()
	{
		
		let {progress} = this.props;
		
		if(progress)
		{
			if(progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
				return;
			if(progress === LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
			{
				return getProgressComp(progress);
			}
			else if(progress === LoadProgressConst.LOAD_FAILED)  //加载失败
			{
				return <ReFresh reFreshStyle={{width: "calc(100% - 2.03rem)"}} reFreshFn={this.reFreshFn.bind(this)}/>;
			}
		}
		return null;
	}
	
	get phoneCallInfo()
	{
		let {telephonyScreen} = this.props;
		return telephonyScreen.get("phoneCallInfo") || {};
	}
	
	get customerId()
	{
		let {telephonyScreen} = this.props;
		
		return telephonyScreen.get("customerId") || "";
	}
	
	get phonenumber()
	{
		let {isDetails, callInfo} = this.props;
		if(isDetails)
		{
			if(callInfo){
				if(callInfo.callType=='呼入'){
					return callInfo.activeCallNumber 
				}else{
					return callInfo.passiveCallNumber 
				}
			}
		}
		// console.log(activeCallNumber,passiveCallNumber)
		return this.phoneCallInfo.phonenumber;
	}
	
	render()
	{
		let {isDetails, height} = this.props;
		console.log("test height1:",height);

		return (
			<div style={{ width: 'calc(62% - 2px)', float: 'left'}}>
				<Tabs type="card" style={{marginTop: 20}}>
					<TabPane tab="用户信息" key="1">
						<CrmInfo customerId={this.customerId} height={height?height:700} phone={this.phonenumber}/>
					</TabPane>
					
					<TabPane tab="通话记录" key="2">
						<TelephonyRecordComponent phonenumber={this.phonenumber}/>
					</TabPane>
	
					{
						!isDetails ? (
							<TabPane tab="常用话术" key="4">
								<UsualTips smartInputHide/>
							</TabPane>
						) : null
					}
					
					<TabPane tab="工单" key="5" style={{minHeight:200}}>
						<WoList/>
					</TabPane>
					
					<TabPane tab="回访计划" key="6">
						<TelephonyVisitComponent phonenumber={this.phonenumber}/>
					</TabPane>
				
				</Tabs>
			</div>
		);
		
	}
}

const mapStateToProps = (state) => {
	let {telephonyScreenReducer} = state;
	
	return {
		telephonyScreen: telephonyScreenReducer,
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({setscreenFlag, addVisilPlan}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(TelephonyTabs));
