import React from "react"
import CallRecord from "./CallRecord"
import TelephonyScreen from "../view/telephenyScreen/TelephonyScreen"
import CallRecordDetails from "./CallRecordDetails";

class CallRecordFlag extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			detailsFlag: false,
			currentPage:1
		};
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(this.props.CallRecorlFlagTypes !== nextProps.CallRecorlFlagTypes)
		{
			this.state.detailsFlag = false;
		}
	}
	
	componentDidMount()
	{
	}

	onCalloutDetailsType(detailsFlag, record, page)
	{
		page = page ? page : this.state.currentPage;
		this.setState({
			detailsFlag,
			callInfo: record,
			currentPage: page
		})
	}

	CallRecordSetting()
	{
		let {CallRecorlFlagTypes, height} = this.props,
			CallRecordMain, {currentPage} = this.state;
		
		console.log("CallRecorlFlagTypes",CallRecorlFlagTypes)
			
		switch(CallRecorlFlagTypes)
		{
			case 'incomingrecord':
				CallRecordMain =
					<CallRecord DetailsShow={this.onCalloutDetailsType.bind(this)} callType={0} resultType={1}
					            height={height} componentsname={'incomingrecord'} currentPage={currentPage}/>
				break;
			case 'calloutrecord':
				CallRecordMain =
					<CallRecord DetailsShow={this.onCalloutDetailsType.bind(this)} callType={1} resultType={1}
					            height={height} componentsname={'calloutrecord'} currentPage={currentPage}/>
				break;
			case 'incomingunanswered':
				CallRecordMain =
					<CallRecord DetailsShow={this.onCalloutDetailsType.bind(this)} callType={0} resultType={0}
					            height={height} componentsname={'incomingunanswered'} currentPage={currentPage}/>
				break;
			case 'calloutunanswered':
				CallRecordMain =
					<CallRecord DetailsShow={this.onCalloutDetailsType.bind(this)} callType={1} resultType={0}
					            height={height} componentsname={'calloutunanswered'} currentPage={currentPage}/>
				break;
		}
		return CallRecordMain;
	}

	render()
	{
		let {detailsFlag} = this.state,
			CallRecorlFlagTypes = this.props.CallRecorlFlagTypes;

		return (
			<div>
				{
					detailsFlag ?
						<CallRecordDetails height={this.props.height} callInfo={this.state.callInfo}
						                   CallRecorlFlagTypes={CallRecorlFlagTypes}
						                   DetailsShow={this.onCalloutDetailsType.bind(this, false)}/>
						:
						this.CallRecordSetting()
				}
			</div>
		);
	}
}

export default CallRecordFlag;
