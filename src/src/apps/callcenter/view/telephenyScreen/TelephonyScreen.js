import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Form, Icon, message } from 'antd';
import LoadProgressConst from "../../../../model/vo/LoadProgressConst"
import { ReFresh } from "../../../../components/ReFresh";
import { setscreenFlag, addVisilPlan } from "../../redux/reducers/telephonyScreenReducer"
import '../style/telephonyScreen.less'
import '../style/searchListComp.less'
import { getProgressComp, shallowEqual } from "../../../../utils/MyUtil";
import { PhoneStatus } from "../../lib/Xn.PhoneCall";
import TelephonVisitPlanComponent from "../../util/TelephonVisitPlanComponent";
import TelephonyTabs from "./TelephonyTabs"
import PhoneConclusionView from "./PhoneConclusionView";
import NTIFrame from "../../../../components/NTIFrame";
import NTDragView from "../../../../components/NTDragView";
import Portal from "../../../../components/Portal";
import Settings from "../../../../utils/Settings";

//获取主被叫号码
function getPhoneNumbers(caller, callee)
{
	if(!caller)
	{
		return "未知";
	}
	if(!callee)
	{
		return caller;
	}
	return caller + "  ->  " + callee;
}

function getPropsPhone(type, caller, callee)
{
	let phoneNumber = '';
	
	if(type == 2)
	{
		phoneNumber = callee;
	}
	else
	{
		phoneNumber = caller;
	}
	
	return phoneNumber;
}

class TelephonyScreen extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			ModalShow: false,
			Visible: false,
			ruleNumLength: 0,
			woVisible: false
		}
	}
	
	shouldComponentUpdate(nextProps, nextState)
	{
		return !shallowEqual(this.props, nextProps, false, 2) || !shallowEqual(this.state, nextState, false, 2);
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
	
	get crmPasscode()
	{
		let {telephonyScreen} = this.props;
		return telephonyScreen.get("crmPasscode") || "";
	}
	
	get woPasscode()
	{
		let {telephonyScreen} = this.props;
		return telephonyScreen.get("woPasscode") || "";
	}
	
	get customerId()
	{
		let {telephonyScreen} = this.props;
		
		return telephonyScreen.get("customId") || "";
	}
	
	callback(value)
	{
	
	}
	
	onVisitplanModal()
	{
		this.setState({
			ModalShow: true,
			Visible: true
		});
	}
	
	/*关闭Modal*/
	onVisitPlanClose()
	{
		this.setState({
			ModalShow: false,
			Visible: false
		});
	}
	
	onFormDatachange(data)
	{
		this.props.addVisilPlan(data);
		this.onVisitPlanClose();
	}
	
	handleSubmit(e)
	{
		e.preventDefault();
		this.props.form.validateFields((err, formData) => {
			if(!err)
			{
				console.log(formData)
				
			}
			
		});
	}
	
	isShow(value)
	{
		if(value && !this.woPasscode)
		{
			message.error("请新建用户信息");
			return;
		}
		this.setState({woVisible: value});
	}
	
	newWoComp()
	{
		let woVisible = this.state.woVisible;
		
		if(woVisible)
		{
			return (
				<Portal onRemove={this.isShow.bind(this, false)}>
					<NTDragView enabledDrag={true} enabledClose={true} _onClose={this.isShow.bind(this, false)}
					            wrapperProps={{width: 630, height: 600}}>
						<div className="actionToolModalWrapper">
							{
								!this.woPasscode ?
									<div>没有customerId</div>
									:
									(
										<NTIFrame src={Settings.getnWoWebUrl(this.woPasscode)}
										          style={{height: 600}} container="actionToolModalWrapper"/>
									)
							}
						</div>
					</NTDragView>
				</Portal>
			);
		}
		
		return null;
	}
	
	onTelephonyClose()
	{
		this.props.setscreenFlag(false);
	}
	
	render()
	{
		let {ModalShow, Visible} = this.state,
			{callid, caller, callee, type} = this.phoneCallInfo;
		
		let width = document.querySelector(".mailCon") ? document.querySelector(".mailCon").clientWidth : 811,
			w1 = width*0.38 < 380 ? 380 : '38%', w2 = width*0.38 < 380 ? 'calc(100% - 380px)' : 'calc(62% - 2px)';
		return (
			<div className="TelephonyScreen">
				<div className="TelephonyScreen-left" style={{width:w1}}>
					<h6>通话信息</h6>
					<div className="TelephonyScreen-left-Message">
						<p><span>通话ID</span>
							<span>{callid}</span>
							<a href="javascript:void(0)" onClick={this.isShow.bind(this, true)}>+新建工单</a>
						</p>
						<p>
							<span>类型</span><span>{type == 1 ? "呼入" : "呼出"}</span>
						</p>
						<p><span>主被叫号码</span>
							<span>{getPhoneNumbers(caller, callee)}</span>
							<a href="javascript:void(0)" onClick={this.onVisitplanModal.bind(this)}>+预约回访</a>
						</p>
					</div>
					
					<h6 style={{marginBottom: '0.12rem', marginTop: '0.12rem'}}>咨询总结</h6>
					<PhoneConclusionView callId={callid}/>
				</div>
				
				<div className="TelephonyScreen-border" style={{minHeight: this.props.height,left:w1}}/>
				<TelephonyTabs height={this.props.height} width={w2}/>
				
				<TelephonVisitPlanComponent onformData={this.onFormDatachange.bind(this)}
				                            PhoneNumber={getPropsPhone(type, caller, callee)}
				                            callId={callid}
				                            Modalshow={ModalShow} Visible={Visible}
				                            handleCancel={this.onVisitPlanClose.bind(this)}/>
				{
					this.newWoComp()
				}
				<div className="TelephonyScreen-close">
					<Icon type="close" onClick={this.onTelephonyClose.bind(this)}/>
				</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(TelephonyScreen));
