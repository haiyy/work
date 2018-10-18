import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './style/autoResponder.scss';
import AutoGreetingsReadOnly from './AutoGreetingsReadOnly';
import AutoAnswerReadOnly from './AutoAnswerReadOnly';
import { autoResponse, autoResponseGreet, getAutowelcomelevel, getResponselevel,resetAnswerProgress } from "./action/autoResponse";
import { editConfigLevel } from "../configLevel/configLevel";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

const TabPane = Tabs.TabPane;

class AutoResponderReadOnly extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			readyToCommit: false
		};
		this._activeKey = "1";
	}

	componentDidMount()
	{
		this.props.getAutowelcomelevel();
		this.props.getResponselevel();
	}

	_onTabClick(key)
	{
		this._activeKey = key;
        this.props.resetAnswerProgress()
	}

	/*setAutoGreet(data)
	{
		this._autoGreet = data;
	}*/

	/*setAutoAnswer(data)
	{
		this._autoAnswer = data;
	}*/

	/*isCommitOk(msg)
	{
		this.setState({readyToCommit: msg})
	}*/

	/*handleSubmit()
	{
		if(this._autoGreet && this._activeKey === "1")
		{
			let greetingData = {
				welcome: this._autoGreet
			};

			this.props.autoResponseGreet(greetingData);
		}
		else if(this._autoAnswer)
		{
			let answerData = {
				autoReply: this._autoAnswer
			};
			this.props.autoResponse(answerData);

			this.props.editConfigLevel({item: 2, level: this._autoAnswer.level});
		}
	}*/

	reFreshFn()
	{
		this.props.getAutowelcomelevel();
		this.props.getResponselevel();
	}

	render()
	{
		let {welcomeProgress, replyProgress, progress} = this.props,
			autoProgress = this._activeKey === 1 ? welcomeProgress : replyProgress;
		if(autoProgress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="autoResponder">
				<div className="autoTabs">
					{
                        _getProgressComp(progress)
					}
					<Tabs defaultActiveKey="1" onChange={this._onTabClick.bind(this)}>
						<TabPane tab={getLangTxt("setting_autoreply_greeting")} key="1">
							<AutoGreetingsReadOnly route={this.props.route}/>

						</TabPane>

						<TabPane tab={getLangTxt("setting_autoreply1")} key="2">
							<AutoAnswerReadOnly route={this.props.route}/>

						</TabPane>
					</Tabs>
				</div>


			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		/*configLevel: state.getConfigLevel.data,*/
		greetData: state.getAutoWelcome.data,
		welcomeProgress: state.getAutoWelcome.progress,
		autoReplyData: state.getResponselevel.data,
		replyProgress: state.getResponselevel.progress,
		errorData: state.autoresponse.data,
        progress: state.autoresponse.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		autoResponse, autoResponseGreet, editConfigLevel, getAutowelcomelevel, getResponselevel, resetAnswerProgress
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoResponderReadOnly);
