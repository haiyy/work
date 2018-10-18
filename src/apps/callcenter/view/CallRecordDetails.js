import React from "react"
import { Icon } from 'antd';
import TelephonyServiceRecord from "./telephenyScreen/TelephonyServiceRecord";
import TelephonyTabs from "./telephenyScreen/TelephonyTabs";

class CallRecordDetails extends React.Component {

	constructor(props)
	{
		super(props);
	}

	onClick()
	{
		if(this.props.DetailsShow)
		{
			this.props.DetailsShow();
		}
	}

	render()
	{
		let {callInfo} = this.props;
		let rheight = this.refs.leftcontent?this.refs.leftcontent.clientHeight:0;
		rheight = rheight>this.props.height?rheight:this.props.height;
		return (
			<div>
				<div style={{width:'38%', float:'left', padding:'0.15rem 0.2rem 0.36rem'}} ref="leftcontent">
					<TelephonyServiceRecord  onClick={this.onClick.bind(this)} RowClickType {...this.props} callId={callInfo && callInfo.callId} editable fixedType={true}/>
			    </div>
				<div className="TelephonyScreen-border" style={{minHeight:this.props.height}}/>
				<TelephonyTabs height={rheight} isDetails callInfo={callInfo}/>


			</div>
		);
	}
}

export default CallRecordDetails;

