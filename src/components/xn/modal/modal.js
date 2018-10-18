/**
 * 1.接收visible字段控制提示框的显示和隐藏;
 * 2.title设置提示框标题;
 * 3.okText设置确定按钮的文字内容，字符串,cancelText设置取消按钮的文字内容，字符串;
 * 4.width设置提示框宽度;
 * 5.style设置样式;
 * 6.onOK 成功的回调;
 * 7.onCancel 取消的回调;
 * 8.iconType 头部icon;
 */

import { Modal as AModal, Button, Icon } from 'antd';
import React, { Component } from 'react';
import { getLangTxt, omit } from "../../../utils/MyUtil.js";
import "../style/modal.less";
import classNames from 'classnames';

/**
 * API继承antd Modal;
 * 新增接口;
 * @param {Array} footer [true, true] => [sureBtn, cancelBtn] or [Component, Component];
 * @param {Component} icon 标题ICON;
 * @param {String} type 值为warning, danger, error Modal面板类型;
 * */

class Modal extends Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {visible: true};
	}
	
	// setTitle()
	// {
	// 	let {title, icon, type} = this.props,
	// 		titleColor = "#8dc85f";
		
	// 	switch(type)
	// 	{
	// 		case "warning":
	// 			titleColor = "#e7ab60";
	// 			break;
			
	// 		case "danger":
	// 			titleColor = "#ea7160";
	// 			break;
			
	// 		case "error":
	// 			titleColor = "#eb705e";
	// 			icon = icon || <i className="iconfont icon-009cuowu" style={{color: titleColor}}/>;
	// 			break;
	// 	}
		
	// 	return (
	// 		<div className="title">
	// 			{icon || <Icon type="exclamation-circle" theme="outlined" style={{color: titleColor}}/>}
	// 			<span>
    //                 {
	//                     title || getLangTxt("tip")
    //                 }
    //             </span>
	// 		</div>
	// 	)
	// }
	
	getFooter()
	{
		let {footer, okText, cancelText} = this.props,
			footers = [];
		
		if( footer === null || footer==="" || footer===false){
			return null;
		}else if(footer){
			let [ok, cancel] = footer;
			
			if(ok === true)
			{
				footers.push(
					<Button key="submit" type="primary" onClick={this.showModal.bind(this, true)}>
						{okText || getLangTxt("sure")}
					</Button>
				);
			}
			else
			{
				ok && footers.push(ok);
			}
			
			if(cancel === true)
			{
				footers.push(
					<Button key="back" onClick={this.showModal.bind(this, false)}>
						{cancelText || getLangTxt("cancel")}
					</Button>
				);
			}
			else
			{
				cancel && footers.push(cancel);
			}
			
			return footers;
		}else{
			return [
				<Button key="submit" type="primary" onClick={this.showModal.bind(this, true)}>
					{okText || getLangTxt("sure")}
				</Button>,
				<Button key="back" onClick={this.showModal.bind(this, false)}>
					{cancelText || getLangTxt("cancel")}
				</Button>
			]
		}
			
		
		
	}
	
	showModal(bool)
	{
		this.setState({visible: false});
		
		if(bool)
		{
			this.props.onOk && this.props.onOk();
		}
		else
		{
			this.props.onCancel && this.props.onCancel();
		}
	}
	
	render()
	{
		if(!this.state.visible)
			return null;
		
		let tempProps = omit(this.props, ["title","footer"]),
			{ title, iconType } = this.props;

		return (
			<AModal width={this.props.width } title={ title || getLangTxt("tip")}
			 	   iconType = { iconType || ""}
				   visible={this.props.visible || this.state.visible} 
				   footer={this.getFooter()}
				   onCancel={this.showModal.bind(this, false)} 
				   {...tempProps} 
				   mask={this.props.mask || Modal.mask}
			/>
		)
	}
}

Modal.mask = Type !== 1;  //如果显示端是安装版，蒙层不显示

export default Modal;

export function info(props) {
	
	return AModal.info({
		iconType: "exclamation-circle",
		width: "320px",
		title:getLangTxt("tip"),
		...props,
		className:classNames(props.className, "info")
	});
}

export function warning(props) {
	return AModal.warning({
		iconType: "exclamation-circle",
		width: "320px",
		title:getLangTxt("tip"),
		...props,
		className:classNames(props.className, "warning")
	});
}

export function error(props) {
	return AModal.error({
		//iconType: "exclamation-circle",
		width: "320px",
		title:getLangTxt("tip"),
		...props,
		className:classNames(props.className, "error")
	});
}

export function confirm(props) {
	return AModal.confirm({
		iconType: "exclamation-circle",
		width: "320px",
		title:getLangTxt("tip"),
		...props,
		className:classNames(props.className, "confirm")
	});
}

export function success(props){
	return AModal.success({
		//iconType: "exclamation-circle",
		width: "320px",
		title:getLangTxt("tip"),
		...props,
		className:classNames(props.className, "success")
	});
}




