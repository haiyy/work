import React  from 'react';
import { Button } from 'antd';
import NTModal from "./NTModal";
import { getLangTxt } from "../utils/MyUtil";

class NTErrorModal extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {visible: true};
	}

	_handleCancel(callBack)
	{
		this.destroy(callBack)
	}

	_handleOk(callBack)
	{
		this.destroy(callBack);
	}

	destroy(callBack = null)
	{
		if(typeof callBack === "function")
		{
			callBack();
		}

		callBack = null;
		this.setState({visible: false});
	}

	render()
	{
		let {title, content, onCancel, onOk} = this.props,
			{visible = false} = this.state;

		if(!visible)
			return  null;

		return (
			<NTModal visible title="" footer="" okText={getLangTxt("sure")} cancelText="" width={416}
			       onCancel={this._handleCancel.bind(this, onCancel)}>

				<i className="iconfont icon-009cuowu"/>

				<span>
					{
						title
					}
				</span>
				<p>
					{
						content
					}
				</p>

				<Button type="primary" onClick={this._handleOk.bind(this, onOk)}>{getLangTxt("sure")}</Button>
			</NTModal>
		);
	}
}

export default NTErrorModal;
