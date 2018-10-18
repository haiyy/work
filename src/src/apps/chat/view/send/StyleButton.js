import React, { Component } from 'react';

class StyleButton extends Component {
	
	constructor(props)
	{
		super();
		
		this.state = {
			borderState: props.border
		};
	}
	
	onToggle(e)
	{
		e.preventDefault();
		
		let borderState = !this.state.borderState;
		
		this.props.onToggle(this.props.style, borderState);
		
		this.setState({borderState});
	};
	
	render()
	{
		let className = 'RichEditor-styleButton',
			borders = {border: '1px solid #ccc', background: '#eee'};
		
		return (
			<button style={this.state.borderState ? borders : null}
			        className={className} onMouseDown={this.onToggle.bind(this)}>
				{this.props.label}
			</button>
		);
	}
}
export default StyleButton;
