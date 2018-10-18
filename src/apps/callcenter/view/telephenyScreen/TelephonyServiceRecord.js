import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Form, Icon, message,Button } from 'antd';
import { getCallRecordDetails,addVisilPlan,setBraedCrumbFlag} from "../../redux/reducers/telephonyScreenReducer";
import { formatTimes, formatTimestamp } from "../../../../utils/MyUtil";
import PhoneConclusionView from "./PhoneConclusionView";
import TelephonVisitPlanComponent from "../../util/TelephonVisitPlanComponent";
import { getWoPassCode } from "../../../../utils/PhoneUtils";
import { phonetype } from "../../../../utils/StringUtils"
import  Audio from "../../util/callAudio"
import NTIFrame from "../../../../components/NTIFrame";
import NTDragView from "../../../../components/NTDragView";
import Portal from "../../../../components/Portal";
import Settings from "../../../../utils/Settings";
import "../style/telephonyScreen.less"

function getPhoneNumbers(type,caller, callee)
{
    let str= caller + "  ->  " + callee;;

	return str;
}


class TelephonyServiceRecord extends React.Component {
	constructor(props)
	{
		super(props);

		this.state = {
			currentPage: 1,
            ModalShow: false,
            Visible: false,
            woVisible:false,
		}
	}

    componentDidMount() {
        let {callId} = this.props;
        this.getListdetails(callId);
    }

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.callId != this.props.callId)
		{
			this.getListdetails(nextProps.callId);
		}
	}

    onCallOutDetailsType(){
        this.props.onClick();
        this.props.setBraedCrumbFlag(false);
    }

	getSoundRecord(soundRecordUrls, isUnanswered)
	{
		if(soundRecordUrls && soundRecordUrls.length)
		{
			return (
				<div className="audioTelephonyRecord">
					<span style={{display:"inline-block",verticalAlign:"top",width:'0.8rem'}}>{isUnanswered ? "留言" : "录音"}</span>
                    <div style={{display:"inline-block"}}>
					{
						soundRecordUrls.map((item) => {
							return (
								<Audio src={item}  className="TelephonyScreen-audio"></Audio>
							)
						})
					}
                    </div>
				</div>
			);
		}

		return null;
	}

	getSunmmary(value, callId, remark)
	{
		if(this.props.editable)
		{
			return <PhoneConclusionView callId={callId}/>;
		}

		if(Array.isArray(value) && value.length > 0)
		{
			return [
				<div className="getSunmmary-box">
					<span>咨询分类</span>
					<span>
						{
							value.map((item) => item.content)
							.toString()
						}
					</span>
				</div>,
				<div  className="getSunmmary-box">
					<span style={{verticalAlign:"top"}}>备注</span>
					<span style={{width:320,wordBreak:"break-all"}}>
					{
                        value.map((item) => item.remark)

					}
				</span>
				</div>,
			]
		}

		return <span>空</span>;
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

    get phoneCallInfo()
	{
		let {telephonyScreen} = this.props;
		return telephonyScreen.get("phoneCallInfo") || {};
	}

	get crmPasscode()
	{
		let {telephonyScreen} = this.props;
		return telephonyScreen.get("crmPasscode") || {};
	}

	get woPasscode()
	{
		return getWoPassCode(this.customerId);
	}

	get customerId()
	{
		let {telephonyScreen} = this.props;

		return telephonyScreen.get("customId") || "";
	}

    isShow(value)
    {
        if (!this.woPasscode) {
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

	detailedRecord()
	{

		let {record, CallRecorlFlagTypes,showResult, recordInfo, fixedType,recordInfoList,recordList,braedCurnbFLag} = this.props,
            {ModalShow,Visible} =this.state,
            areaData = fixedType ? recordInfo : record,
            areaList = fixedType ? recordInfoList : record&&record.list || [],
			{
				callId, callType, callNumber,activeCallNumber,passiveCallNumber,qcellcore, nickName, hangupCauses,
				isTransfer, callDuration, soundRecordUrls = [], satisfaction, sunmmaryItemJsonArray = [], remark = ""
			} = areaData,
			isUnanswered = CallRecorlFlagTypes === "incomingunanswered" || CallRecorlFlagTypes === "calloutunanswered",
            isShowResult = showResult==='ServiceRecord';

		return (
			<div className="TelephonyScreen-right-Modal">
                <div>
                    {
                        braedCurnbFLag && fixedType?
                            <Button onClick={this.onCallOutDetailsType.bind(this)} style={{left:'-20px',top:'-0.15rem',border:"none"}}>
                                <span>{'<'}</span>&nbsp;&nbsp;返回
                            </Button>
                            :null
                    }
                </div>
				<div className="TelephonyScreen-right-Messages">
					<h6>通话信息</h6>
					<p><span>通话ID</span><span>{callId}</span>
                        {fixedType?
                            <a href="javascript:void(0)" style={{marginLeft:"7px"}} onClick={this.isShow.bind(this, true)}>+新建工单</a>
                        :null
                        }
                    </p>
					<p><span>类型</span><span>{phoneTypeMap[callType]}</span></p>
                    <p>
                        <span>主被叫号码</span>
                        <span>{getPhoneNumbers(phoneTypeMap[callType],activeCallNumber, passiveCallNumber)}</span>
                        {fixedType?
                            <a href="javascript:void(0)" style={{marginLeft:"7px"}} onClick={this.onVisitplanModal.bind(this)}>+预约回访</a>
                            :null
                        }
                    </p>
					<p><span>号码归属地</span><span>{qcellcore}</span></p>
					<p><span>责任客服</span><span>{nickName}</span></p>
					{
						!isUnanswered?
						[
							<p><span>通话时长</span><span>{formatTimes(callDuration)}</span></p>,
							<p><span>满意度</span><span>{satisfaction}</span></p>,
						    <p><span>独立咨询</span><span>{isTransfer == 1 ? "否" : "是"}</span></p>

						]
						:null
					}
					{
						CallRecorlFlagTypes=='incomingunanswered'?
							<p><span>挂机原因</span><span>{hangupCauses}</span></p>
						 : null
					}
                    {
                            this.getSoundRecord(soundRecordUrls, isUnanswered)
                    }

				 	
				</div>
				{/* <div className="TelephonyScreen-right-Journal">
					<h6>通话日志</h6>
					{
                        areaList.map((item) => {
							return <p><span>{formatTimestamp(item.callTime, true)}</span><span>{item.context}</span></p>
						})
					}
				</div> */}
				<div className="TelephonyScreen-right-Text" style={{marginBottom: 20}}>
					<h6>咨询总结</h6>
					{
						this.getSunmmary(sunmmaryItemJsonArray, callId, remark)
					}

				</div>
                <TelephonVisitPlanComponent onformData={this.onFormDatachange.bind(this)} PhoneNumber={callNumber}
                    callId={callId}
                    Modalshow={ModalShow} Visible={Visible}
                    handleCancel={this.onVisitPlanClose.bind(this)}/>
                {
                    this.newWoComp()
                }
			</div>
		)
	}

	getListdetails(callId)
	{
        let {fixedType} = this.props;
		this.props.getCallRecordDetails(callId,fixedType);
	}

	render()
	{
		return this.detailedRecord()
	}
}

export const phoneTypeMap = {
	0: "呼入",
	1: "呼出",
}

const mapStateToProps = (state) => {
	let {telephonyScreenReducer} = state;

	return {
        telephonyScreen: telephonyScreenReducer,
        recordInfo:telephonyScreenReducer.get("recordInfoList")||{},
        recordInfoList:telephonyScreenReducer.get("recordInfoList").list ||[],
		record: telephonyScreenReducer.get("recordListWithCallId") || {},
        braedCurnbFLag:telephonyScreenReducer.get("braedCurnbFLag"),
	};
}

const mapDispatchToProps = (dispatch) => (
	bindActionCreators({getCallRecordDetails,addVisilPlan,setBraedCrumbFlag}, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(TelephonyServiceRecord);

