import React, { Component } from "react";
import EmojiCommon from "./EmojiCommon";
import { Tooltip } from "antd";
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';

class SmileyView extends Component {

	constructor(props)
	{
		super(props);

		this.state = {isOpen: false};
	}

	onPopupVisibleChange(value = false)
	{
		this.setState({isOpen: value});
	}

	render()
	{
		return (
			<Trigger getPopupContainer={undefined && (trigger => trigger.parentNode)} popupPlacement="top"
			         popupAlign={{offset: [-76]}} action={["click"]} popupVisible={this.state.isOpen}
			         builtinPlacements={{top: {points: ['bc', 'tc'],}}}
			         popup={
				         <EmojiCommon getChooseEmiji={ this.props.getChooseEmiji}
				                      callBack={this.onPopupVisibleChange.bind(this)}/>
			         }
			         onPopupVisibleChange={this.onPopupVisibleChange.bind(this)}>
				<Tooltip placement="bottom" title={this.props.toolTip}
                        overlayStyle={{lineHeight: '0.16rem'}}
				         arrowPointAtCenter>
					<i style={{position: "relative"}} className={this.props.propsClassName}/>
				</Tooltip>
			</Trigger>
		)
	}
}

export default SmileyView;
