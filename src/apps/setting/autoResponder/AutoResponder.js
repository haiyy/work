import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './style/autoResponder.scss';
import AutoGreetings from './AutoGreetings';
import AutoAnswer from './AutoAnswer';
import { autoResponse, autoResponseGreet, getAutowelcomelevel, getResponselevel,resetAnswerProgress } from "./action/autoResponse";
import { editConfigLevel } from "../configLevel/configLevel";
import { getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import AutoGreetingsReadOnly from "./AutoGreetingsReadOnly";
import AutoAnswerReadOnly from "./AutoAnswerReadOnly";
import { _getProgressComp } from "../../../utils/ComponentUtils";

const TabPane = Tabs.TabPane;

class AutoResponder extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			readyToCommit: false
		};
		this._activeKey = "1";

		this.greeting = ["autoreplay_greetings_edit", "autoreplay_greetings_check"];
		this.answer = ["autoreplay_response_edit", "autoreplay_response_check"];
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

    componentWillUnmount() {
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
		let {welcomeProgress, replyProgress, progress, settingOperation, errorData} = this.props,
            GreetingComp = fnMap[getFnkey(this.greeting, settingOperation)],
            AnswerComp = fnMap[getFnkey(this.answer, settingOperation)],
			autoProgress = this._activeKey === "1" && GreetingComp ? welcomeProgress : replyProgress;

        if (!GreetingComp && !AnswerComp)
            return <div className="noLimitModuleComp"><span>{getLangTxt("load_note3")}</span></div>;

		if(autoProgress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		console.log(this.props);
		return (
			<div className="autoResponder">
				<div className="autoTabs">
					{
                        _getProgressComp(progress)
					}
					<Tabs/* defaultActiveKey="1"*/ onChange={this._onTabClick.bind(this)}>
                        {
                            GreetingComp ?
                                <TabPane tab={getLangTxt("setting_autoreply_greeting")} key="1">
                                    <GreetingComp  route={this.props.route}/>
                                </TabPane> : null
                        }

                        {
                            AnswerComp ?
                                <TabPane tab={getLangTxt("autoResp")} key="2">
                                    <AnswerComp route={this.props.route} noPadding={!GreetingComp}/>
                                </TabPane> : null
                        }
					</Tabs>
				</div>
			</div>
		)
	}
}

const fnMap = {
	autoreplay_greetings_check: AutoGreetingsReadOnly,
	autoreplay_greetings_edit: AutoGreetings,
	autoreplay_response_check: AutoAnswerReadOnly,
	autoreplay_response_edit: AutoAnswer
};

function getFnkey(fns, setting)
{
	/*if (fns.length && fns.length < 2)
		return fns[0];

	return fns.find(key => setting.includes(key));*/
    let showFns = fns.filter(item => setting.includes(item));

    if (showFns.length > 1)
    {
        return showFns[0];
    }
    else if(showFns.length === 1)
    {
        if (fns.length === 1)
        {
            return showFns[0];
        }
        else
        {
            if (showFns[0] === fns[1]) //确保check
            {
                return showFns[0];
            }
        }
    }

    return '';
}

function mapStateToProps(state)
{
	let {startUpData} = state,
		settingOperation = startUpData.get("settingOperation") || [];

	return {
		/*configLevel: state.getConfigLevel.data,*/
		greetData: state.getAutoWelcome.data,
		welcomeProgress: state.getAutoWelcome.progress,
		autoReplyData: state.getResponselevel.data,
		replyProgress: state.getResponselevel.progress,
		errorData: state.autoresponse.data,
        progress: state.autoresponse.progress,
		settingOperation
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		autoResponse, autoResponseGreet, editConfigLevel, getAutowelcomelevel, getResponselevel, resetAnswerProgress
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoResponder);
