import React from 'react';
import '../../../../public/styles/chatpage/send/sendType.scss';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import Lang from "../../../../im/i18n/Lang";

class SendType extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			isOpen: false
		}
	}

	_onEnterSwitch({target})
	{
		if(target.innerText === "Enter")
		{
			localStorage.setItem("sendMsgShortcut", "Enter");
		}
		else
		{
			localStorage.setItem("sendMsgShortcut", "Ctrl+Enter");
		}

		this.setState({isOpen: false});
	}

	_getUI()
	{
		this.enterType = localStorage.getItem("sendMsgShortcut") || "Enter";
		let enterTypeClassName = this.enterType == "Enter" ? "enterTypeStyle" : "enterTypeDefaultStyle",
			enterCtrlTypeClassName = this.enterType == "Ctrl+Enter" ? "enterTypeStyle" : "enterTypeDefaultStyle",
            {enabled} = this.props;

		return (
            enabled ?
                <ul className="types" onClick={this._onEnterSwitch.bind(this)}>
                    <li className={enterTypeClassName}>
                        <i style={this.enterType == "Enter" ? {display: "block"} : {display: "none"}}
                           className="iconfont icon-zhengque"/>
                        Enter
                    </li>
                    <li className={enterCtrlTypeClassName}>
                        <i style={this.enterType == "Ctrl+Enter" ? {display: "block"} : {display: "none"}}
                           className="iconfont icon-zhengque"/>
                        Ctrl+Enter
                    </li>
                </ul> : <div></div>
		);
	}

	onPopupVisibleChange(value = false)
	{
		this.setState({isOpen: value});
	}

	render()
	{
		const icon = this.state.isOpen ? "icon-xiala1-xiangshang iconfont" : "icon-xiala1 iconfont",
            {style} = this.props;

		return (
			<Trigger
				getPopupContainer={undefined && (trigger => trigger.parentNode)}
				popupPlacement="top"
				popupAlign={{
					offset: [0, 0]
				}}
				action={["click"]}
				popupVisible={this.state.isOpen}
				builtinPlacements={{
					top: {
						points: ['br', 'tr'],
					}
				}}
				popup={ this._getUI() }
				onPopupVisibleChange={this.onPopupVisibleChange.bind(this)}>
                    <div className="sendType">
                        <i className={icon} style={style}/>
                    </div>
			</Trigger>
		)
	}
}

export default SendType;
