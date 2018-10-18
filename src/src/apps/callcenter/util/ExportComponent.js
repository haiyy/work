import React from 'react';
import { Button } from 'antd';
import { configProxy, getLangTxt, token } from "../../../utils/MyUtil";

class ExportComponent extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}

	render()
	{
		let {search = {}} = this.props,
			valueStringfy = JSON.stringify(search),
			url = configProxy().nCrocodileServer + '/conversation/list/export',
			tokenValue = token();

		return (
			<Button type="primary" className="exportBtn">
				{getLangTxt("export")}
				<form action={url} method="get">
					<input type="text" name="where" value={valueStringfy} hidden/>
					<input type="text" name="suffix" value="xlsx" hidden/>
					<input type="text" name="token" id="token" value={tokenValue} hidden/>
					<input type="submit" value="" className="submitInput"/>
				</form>
			</Button>
		);
	}
}

export default ExportComponent;
