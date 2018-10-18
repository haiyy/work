import React from 'react'
import { Form } from 'antd';
import CommonWorld from './CommonWord';

class CompanyUsedWords extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	render()
	{
		return (
			<div style={{position: 'relation', height: '100%'}}>
				<CommonWorld style={{height: '100%'}}/>
			</div>
		)
	}
}

export default Form.create()(CompanyUsedWords);
