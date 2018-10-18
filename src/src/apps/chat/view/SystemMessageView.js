import React from 'react';
import { Alert } from 'antd';
import '../../../public/styles/chatpage/message/systemMessageView.scss';

class SystemMessageView extends React.Component {

	constructor(props)
	{
		super(props);
	}

	render()
	{
		let {systemMessage = {}} = this.props;

		return (
			<div className="systemMessageView">
				<Alert message={systemMessage.messageBody} type="warning" closable showIcon/>
			</div>
		);
	}

}

export default SystemMessageView;
