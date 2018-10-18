import React, { Component } from 'react'
import Lang from "../../../im/i18n/Lang";
import CooperateData from "../../../model/vo/CooperateData";
import Timer from "../../../components/Timer";
import TranslateProxy from "../../../model/chat/TranslateProxy";

class CooperateUI extends Component {

	constructor(props)
	{
		super(props);
	}

	onOperation(operation)
	{
		this.props.requestCooperateAction(["", operation]);
	}

	_cooperateCountDown(expiredtime = 60)
	{
		expiredtime = expiredtime > 1 ? expiredtime : 60;

		return (
			<Timer date={ expiredtime } mode={Timer.COUNT_DOWN}
			       onTimerComplete={this.onOperation.bind(this, CooperateData.TIMEOUT)}/>
		);
	}

	_getCoopOperateUI(cooperateData)
	{
		if(cooperateData.isSponsor)
		{
			return (
				<span onClick={this.onOperation.bind(this, CooperateData.CANCEL)} className="button"
				      style={{ cursor: 'pointer' }}>
					{ Lang.getLangTxt("cancel") }
				</span>
			);
		}
		return (
			<div>
				<span onClick={this.onOperation.bind(this, CooperateData.ACCEPT)} className="button"
				      style={{cursor: 'pointer'}}>
					{ Lang.getLangTxt("accept") }
				</span>

				<span onClick={this.onOperation.bind(this, CooperateData.REFUSE)} className="button"
				      style={{cursor: 'pointer'}}>
					{ Lang.getLangTxt("refuse") }
				</span>
			</div>
		);
	}

	render()
	{
		let cooperateData = this.props.cooperateData,
            sendBoxClsName = TranslateProxy.Enabled ? "alert_information" : "alert_information alert_information-without-trans";

		if(!cooperateData || !cooperateData.isRuning())
			return null;

		return (
			<div className={sendBoxClsName}>
				<span className="alert_information_message">
					{
						cooperateData.getCoopMessage()
					}
				</span>
				{
					this._cooperateCountDown(parseInt(cooperateData.getDuration() / 1000))
				}
				{
					this._getCoopOperateUI(cooperateData)
				}
			</div>
		);
	}
}

export default CooperateUI;
