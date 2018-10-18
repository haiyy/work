import React, { Component } from 'react';
import { Input } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

class WebContent extends Component {
	constructor(props)
	{
		super(props);
		this.styles = {
			nameColor: {color: "#999"},
			contentColor: {color: "#999"}
		}
	}

	checkName(rule, value, callback)
	{
		const form = this.props.form;
		if(value.length > 4 || value.length < 1)
		{
			this.styles.nameColor = {color: "red"};
            callback(" ")
		}
		else
		{
			this.styles.nameColor = {color: "#999"};
		}

		callback();
	}

	checkContent(rule, value, callback)
	{
		const form = this.props.form;
		if(value.length > 500)
		{
			this.styles.contentColor = {color: "red"};
		}
		else
		{
			this.styles.contentColor = {color: "#999"};
		}
		callback();
	}

	render()
	{
		let content = this.props.content, FormItem = this.props.FormItem,
			getFieldDecorator = this.props.getFieldDecorator;


		return (
			<div style={{padding: "0 12px"}} className="web_content">
				<p>{getLangTxt("setting_webview_tagname")}</p>
				<FormItem>
					{getFieldDecorator('webName', {
						initialValue: content ? content.name : "",
						rules: [{max: 4, message: ' '}, {'validator': this.checkName.bind(this)}]
					})(
						<Input type="text"/>
					)}
				</FormItem>
				<p style={this.styles.nameColor}>{getLangTxt("setting_webview_tagname_note")}</p>

				<p>{getLangTxt("setting_webview_tagcontent")}</p>
				<FormItem>
					{
						getFieldDecorator('webContent', {
							initialValue: content ? content.content : "",
							rules: [{max: 500, message: ' '}, {'validator': this.checkContent.bind(this)}]
						})(
							<Input type="textarea" style={{height: "80px", resize: "none",wordBreak: 'break-all'}}/>
						)}
				</FormItem>
				<p style={this.styles.contentColor}>{getLangTxt("setting_webview_note1")}</p>
			</div>
		)
	}
}

export default WebContent;
