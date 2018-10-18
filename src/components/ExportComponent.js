import React from 'react';
import { downloadByATag, getLangTxt } from "../utils/MyUtil";
import Button from "./xn/Button";

class ExportComponent extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	handleExport(url)
	{
		downloadByATag(url);
	}
	
	render()
	{
		let {url, clsName = "", isexportAll} = this.props;
		
		return (
			<Button type="primary" className={clsName} onClick={this.handleExport.bind(this, url)}>
				{
					isexportAll ? getLangTxt("exportall") : getLangTxt("export")
				}
			</Button>
		);
	}
}

export default ExportComponent;
