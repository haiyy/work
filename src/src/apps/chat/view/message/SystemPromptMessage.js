import React, { Component } from 'react';
import SystemSentence from "../../../../model/vo/sentence/SystemSentence";

class SystemPromptMessage extends React.PureComponent {

	constructor(props)
	{
		super(props);
	}

	render()
	{
		let message = this.props.message, getIcon, color;

		switch(message.errorType)
		{
			case SystemSentence.TIP:
				getIcon = "icon-001zhengque";
				color = "#11cd6e";
				break;

			case SystemSentence.WARN:
				getIcon = "icon-011tishi";
				color = "#ff6600";
				break;

			case SystemSentence.ERROR:
				getIcon = "icon-009cuowu";
				color = "#eb4f38";
				break;
		}

		if(message.systemType === SystemSentence.STARTPAGE_TYPE && message.message)
		{
			let startPage = message.message;
			return (
				<div className="systemPrompt" style={{color}}>
					<a href={startPage.url} target="_blank">{startPage.pagetitle}</a>
				</div>
			);
		}
		else
		{
			return <div className="systemPrompt">
                <i className={"iconfont " + getIcon} style={{marginRight: '6px'}} style={{color}} />
                <span style={{color:'#666'}}>
                   {
                       message.messageBody
                   }
                </span>
            </div>;
		}

		return null;
	}
}

export default SystemPromptMessage;
