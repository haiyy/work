import React from "react";
import { SketchPicker } from "react-color";

class Color extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		let color = props.color ? props.color : "#000000";
		
		this.state = {
			color
		};
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.color)
		{
			this.setState({color: nextProps.color});
		}
	}
	
	handleChangeComplete(color)
	{
		this.props.onClose();
		
		this.setState({color: color.hex});
		
		let data = this.state.color;
		
		let selectColor = this.props.selectColor;
		if(typeof selectColor === "function")
		{
			selectColor(data);
		}
	};
	
	render()
	{
		return <SketchPicker color={this.state.color} disableAlpha={true}
		                     onChangeComplete={this.handleChangeComplete.bind(this)}/>;
	}
}

export default Color;
