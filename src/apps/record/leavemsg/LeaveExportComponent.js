import React from 'react';
import { Button } from 'antd';
import { configProxy, token, downloadByATag, getLangTxt } from "../../../utils/MyUtil";

class LeaveExportComponent extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	handleExport()
	{
		let {search = {}} = this.props,
			copySearch = {...search};
		
		if(!search)
			return;
		
		copySearch.isproccessed = search.isproccessed ? 1 : 0;
		
		let valueStringfy = encodeURIComponent(JSON.stringify(copySearch)),
			tokenValue = token(),
			exportUrl = configProxy().nCrocodileServer + '/leaveMessage/list/export?paramJson=' + valueStringfy + '&token=' + tokenValue;
		
		downloadByATag(exportUrl);
	}
	
	render()
	{
		return (
			<Button type="primary" className="exportBtn" onClick={this.handleExport.bind(this)}>
				{getLangTxt("export")}
			</Button>
		);
	}
}

export default LeaveExportComponent;
