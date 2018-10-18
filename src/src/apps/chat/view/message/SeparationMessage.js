import React from 'react';

class SeparationMessage extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let message = this.props.message;
		
		return (
			<div className="sentence-message">
				<span></span>
				<span className="sentence-body">
					{
						message.messageBody
					}
				</span>
				<span className="sentence-right"/>
			</div>
		);
	}
}

export default SeparationMessage;
