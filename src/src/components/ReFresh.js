import React from 'react';
import { getLangTxt } from "../utils/MyUtil";

export class ReFresh extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let {reFreshStyle} = this.props;
		
		return (
			<div className="loadFail_CompanyInfo" style={reFreshStyle}>
				<div>
					{getLangTxt("load_note1")}
					<span onClick={this.props.reFreshFn}>
	                    {getLangTxt("load_note2")}
                    </span>
				</div>
			</div>
		);
	}
}

export default ReFresh;
