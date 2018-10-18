import React from "react";
import { LocaleProvider } from 'antd';
import enGB from "antd/lib/locale-provider/en_GB";
import moment from "moment";

class NTLocaleProvider extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {};
	}

	render()
	{
		let locale;
		if(this.props.lang == "zh-cn")
		{
			locale = {};
            moment.locale("zh-cn");
		}
		else
		{
			locale = enGB;
            moment.locale("en");
		}

		return (
			<LocaleProvider locale={locale}>
				{
					this.props.children
				}
			</LocaleProvider>
		);
	}
}

export default NTLocaleProvider;
