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
		let width = document.querySelector(".mailCon") ? document.querySelector(".mailCon").clientWidth : 811,
			w1 = width*0.38 < 380 ? 380 : '38%', w2 = width*0.38 < 380 ? 'calc(100% - 380px)' : 'calc(62% - 2px)';
		return (
			<div>
				<div style={{width: w1, float:'left', padding:'0.15rem 0.2rem 0.36rem'}} ref="leftcontent">
					<TelephonyServiceRecord  onClick={this.onClick.bind(this)} RowClickType {...this.props} callId={callInfo && callInfo.callId} editable fixedType={true}/>
			    </div>
				<div className="TelephonyScreen-border" style={{minHeight:this.props.height,left: w1}}/>
				<TelephonyTabs width={w2} height={rheight} isDetails callInfo={callInfo}/>


			</div>
		);
	}
}

export default CallRecordDetails;

