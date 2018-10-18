import React from 'react';
import classNames from 'classnames';
import { Button as AButton } from "antd";

/**
 * Icon
 * props传值
 * clsName 样式名称
 * style 样式对象  {margin: "100px auto"}
 * */
export class Icon extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let {className} = this.props;
		
		return (
			<i {...this.props} className={classNames(className, {"xn-icon": true})}/>
		);
	}
	
}

/**
 * Button
 * 默认宽高为（56px，26px）
 * */
export default class Button extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let {className} = this.props;
		
		return <AButton style={{height: 26}}{...this.props}
		                className={classNames(className, {"xn-button": true})}/>;
	}
}
