import React from "react";
import { getNoDataComp } from "../../../../utils/ComponentUtils";
import NTIFrame from "../../../../components/NTIFrame";
import Settings from "../../../../utils/Settings";
import { getCrmPassCode } from "../../../../utils/PhoneUtils";
import { shallowEqual } from "../../../../utils/MyUtil";

class CrmInfo extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		let {phone, customerId} = this.props;
		this.passCode = getCrmPassCode(phone, customerId);
	}
	
	shouldComponentUpdate(nextProps)
	{
		if(nextProps.phone !== this.props.phone || nextProps.customerId !== this.props.customerId)
		{
			this.passCode = getCrmPassCode(nextProps.phone, nextProps.customerId);
		}
		
		return !shallowEqual(this.props, nextProps);
	}
	
	render()
	{
		if(!this.passCode)
			return getNoDataComp();
		console.log("test height2:",this.props.height);
		return <NTIFrame src={Settings.getCrmWebUrl(this.passCode)} style={{height: this.props.height?this.props.height:700}}/>;
	}
	
}

export default CrmInfo;