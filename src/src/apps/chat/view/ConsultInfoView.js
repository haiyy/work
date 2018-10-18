import React from 'react';
import Timer from '../../../components/Timer';
import '../../../public/styles/chatpage/messageState.scss';
import { formatTime, get, getLangTxt, loginUserProxy, shallowEqual } from "../../../utils/MyUtil";
import { bglen, substr, truncateToPop } from "../../../utils/StringUtils";
import ChatStatus from "../../../model/vo/ChatStatus";
import { Popover } from 'antd';
import { enabledForSelected } from "../../extra/ZhilianSelected";

export class ConsultInfoView extends React.Component {
	
	_templatename = "";
	_sessionDuration = undefined;
	_evaluate = [];
	__rosterUser = null;
	
	_userName = "";
	_address = "";  //地域
	_evaluateValue = "";
	_title = "";
	_url = "";
	
	_averageTimeVo = null;
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			averageTime: 0,
			secondLineWidth: 0
		};
	}
	
	componentDidMount()
	{
		if(!window)
		{
			return;
		}
		if(window.addEventListener)
		{
			window.addEventListener('resize', this.getSecondLineUI.bind(this));
		}
		else
		{
			window.attachEvent('onresize', this.getSecondLineUI.bind(this));
		}
	}
	
	componentWillReceiveProps(nextProps)
	{
		const {chatDataVo: {templatename = "", averageTimeVo}} = nextProps;
		
		if(this._averageTimeVo && (!averageTimeVo || this._averageTimeVo.converId !== averageTimeVo.converId))
		{
			this._intervalId > 0 && clearInterval(this._intervalId);
			this._intervalId = -1;
			this.state.averageTime = 0;
		}
		
		this._averageTimeVo = averageTimeVo;
		this._templatename = templatename;
	}
	
	shouldComponentUpdate(nextProps, nextState)
	{
		return shallowEqual(nextProps.chatDataVo, this.props.chatDataVo, true, 2) || shallowEqual(nextState, this.state);
	}
	
	set _startTime(value)
	{
		if(typeof value === "number" && value > 0)
		{
			this._sessionDuration = parseInt((new Date().getTime() - value) / 1000);
			if(this._sessionDuration > 0)
			{
				this._sessionDuration = this._sessionDuration > MAX_CHAT_TIME ? MAX_CHAT_TIME : this._sessionDuration;
			}
			else
			{
				this._sessionDuration = 0;
			}
		}
		else
		{
			this._sessionDuration = -1;
		}
	}
	
	get _startTime()
	{
		return this._sessionDuration;
	}
	
	set _rosterUser(value)
	{
		if(value)
		{
			let tRosterUser = value,
				bChangedUser = !this.__rosterUser || (tRosterUser && !this.__rosterUser.weakEqual(tRosterUser));
			
			if(bChangedUser)
			{
				this.clear();
				
				this.__rosterUser = value;
			}
			
			if(this.__rosterUser)
			{
				let userTrail = this.__rosterUser.userInfo && this.__rosterUser.userInfo.userTrail || {},
					
					{keyword = "", oname = "",} = userTrail;
				
				this._keyword = keyword;
				
				this._userName = this.__rosterUser.userName;
				this._address = this.__rosterUser.address;
				this._userId = this.__rosterUser.userId;
				this._siteId = loginUserProxy().siteId;
				
				this._currentPage = this.__rosterUser.startpage;
			}
		}
		else
		{
			this.clear();
		}
	}
	
	set _currentPage(value)
	{
		if(!value)
			return;
		
		this._title = value.pagetitle || value.levelname || value.url;
		this._url = value.url;
	}
	
	update()
	{
		if(!this._averageTimeVo || this._intervalId > 0)
			return;
		
		this.state.averageTime = this._averageTimeVo.averageResponseTime;
		
		this._intervalId = setInterval(() => {
			if(this._averageTimeVo)
			{
				let averageTime = this._averageTimeVo.averageResponseTime;
				
				if(averageTime !== this.state.averageTime)
				{
					this.setState({averageTime});
				}
			}
		}, 1000);
	}
	
	get clientWidth()
	{
		if(!document)
			return -1;
		
		return document.getElementById("app").clientWidth || -1;
	}
	
	getMessageStateIntroPadding()
	{
		let MessageStateIntroPadding = 0;
		
		if(this.clientWidth < 1024)
		{
			MessageStateIntroPadding = 8;
		}
		else if(this.clientWidth > 1390)
		{
			MessageStateIntroPadding = 1390 * 100 / 1024 * 0.08;
		}
		else
		{
			MessageStateIntroPadding = this.clientWidth * 100 / 1024 * 0.08;
		}
		
		return MessageStateIntroPadding;
	}
	
	getCountNum()
	{
		const {chatDataVo: {evalutionResult}} = this.props;
		let countNum = 0;
		
		if(this._templatename)
			countNum++;
		
		if(this._title)
			countNum++;
		
		if(evalutionResult)
			countNum++;
		
		return countNum;
	}
	
	getContainer()
	{
		let MessageStateIntro = document.getElementsByClassName("MessageStateIntro"),
			MessageStateIntroPadding = this.getMessageStateIntroPadding(),
			{secondLineWidth = 0} = this.state;
		
		if(MessageStateIntro && MessageStateIntro[0])
		{
			if(secondLineWidth != MessageStateIntro[0].clientWidth - MessageStateIntroPadding)
				this.setState({secondLineWidth: MessageStateIntro[0].clientWidth - MessageStateIntroPadding});
			return MessageStateIntro[0].clientWidth - MessageStateIntroPadding;
		}
		
		return null;
	}
	
	getSecondLineUI()
	{
		let containerWidth = this.getContainer();
		/*总容器的宽*/
		
		if(!containerWidth)
			return null;
		
		const {chatDataVo: {evalutionResult}} = this.props;
		
		let countNum = this.getCountNum(), /*个数*/
			averageValueWidth = containerWidth / countNum, /*平均宽*/
			
			spaceWidth = 16, /*中间间隔‘|’所占空间*/
			spaceNum = 0, /*中间间隔‘|’个数*/
			
			valueWidth = this._templatename && Math.ceil(bglen(this._templatename) / 2 * 12) || 0, /*咨询入口的内容所占空间*/
			
			titleValueWidth = this._title && bglen(this._title) / 2 * 12 || 0, /*当前页的内容所占空间*/
			titleTotalWidth = titleValueWidth ? titleValueWidth + 12 * 3.5 : 0, /*当前页总空间*/
			
			evalutionResultValueWidth = evalutionResult && bglen(evalutionResult) / 2 * 12 || 0, /*评价结果的内容所占空间*/
			evalutionResultTotalWidth = evalutionResultValueWidth ? evalutionResultValueWidth + 12 * 4.5 : 0, /*评价结果总空间*/
			
			limitedWidth,
			realTitleWidth = 0,
			titleData,
			realTempNameWidth = 0,
			tempNameData,
			realEvalutionResultWidth = 0,
			evalutionResultData;
		
		/**计算咨询入口真实宽度*/
		let gap = 0;
		if(valueWidth > 0)
		{
			if(titleTotalWidth < averageValueWidth)
			{
				gap = averageValueWidth - titleTotalWidth;
			}
			
			if(evalutionResultTotalWidth < averageValueWidth)
			{
				gap += averageValueWidth - evalutionResultTotalWidth;
			}
			
			limitedWidth = gap + averageValueWidth;
			
			tempNameData = truncateToPop(this._templatename, limitedWidth - 12 * 5);
			
			realTempNameWidth = Math.ceil(bglen(tempNameData.content) / 2 * 12) + 12 * 5;
			
			spaceNum++;
		}
		
		/**当前页真实宽度*/
		if(titleTotalWidth > 0)
		{
			averageValueWidth = (containerWidth - realTempNameWidth) / 2 - spaceWidth * spaceNum;
			
			if(evalutionResultTotalWidth < averageValueWidth)
			{
				gap = averageValueWidth - evalutionResultTotalWidth;
			}
			
			limitedWidth = gap + averageValueWidth;
			
			titleData = truncateToPop(this._title, limitedWidth - 12 * 4);
			
			realTitleWidth = Math.ceil(bglen(titleData.content) / 2 * 12) + 12 * 4;
			
			spaceNum++;
		}
		
		/**评价结果真实宽度*/
		if(evalutionResultTotalWidth > 0)
		{
			limitedWidth = containerWidth - realTempNameWidth - spaceWidth * spaceNum - realTitleWidth; //spaceWidth误差忽略
			evalutionResultData = truncateToPop(evalutionResult, limitedWidth - 12 * 5);
		}
		
		let cutOffRuleOne = (this._templatename && this._title) || (this._templatename && evalutionResult),
			cutOffRuleTwo = this._title && evalutionResult;
		
		return (
			<p className="secondP">
				{
					this._templatename ? this.getTemplatenameUI(tempNameData) : null
				}
				{
					cutOffRuleOne ? <span style={cutOffRuleOne ? {margin: '0 0.04rem'} : {}}>|</span> : null
				}
				{
					this._title ? this.getCurrentPageUI(titleData) : null
				}
				{
					cutOffRuleTwo ? <span style={cutOffRuleTwo ? {margin: '0 0.04rem'} : {}}>|</span> : null
				}
				{
					evalutionResult ? this.getEvalutionResultUI(evalutionResultData) : null
				}
			</p>
		);
	}
	
	getTemplatenameUI({show, popString, content})
	{
		if(show)
		{
			return (
				<span>
	                {getLangTxt("consult_templatename")}
					<Popover content={<div style={{maxWidth: "1.5rem", height: "auto", wordBreak: "break-word"}}>
						{popString}</div>} placement="topLeft">
                        <span>{content}</span>
                    </Popover>
                </span>
			);
		}
		
		return <span> {getLangTxt("consult_templatename")}{content}</span>;
	}
	
	getCurrentPageUI({show, popString, content})
	{
		return (
			<span>
	            {getLangTxt("consult_currentPage")}
				<a className="now-page" href={this._url} target="_blank">
					{
						show ? (
							<Popover
								content={<div style={{maxWidth: "1.5rem", height: "auto", wordBreak: "break-word"}}>
									{popString}</div>} placement="topLeft">
								{content}
							</Popover>
						) : content
					}
				</a>
			</span>
		);
	}
	
	getEvalutionResultUI({show, popString, content})
	{
		if(show)
		{
			return (
				<span>
	                {getLangTxt("consult_evalue")}
					<Popover content={<div style={{maxWidth: "1.5rem", height: "auto", wordBreak: "break-word"}}>
						{popString}</div>} placement="topLeft">
                        <span>{content}</span>
                    </Popover>
                </span>
			);
		}
		
		return <span>{getLangTxt("consult_evalue")}{content}</span>;
	}
	
	render()
	{
		const {chatDataVo: {rosterUser, startChatTime, chatStatus, evalutionResult}} = this.props;
		
		this._rosterUser = rosterUser;
		this._startTime = startChatTime;
		
		this.update();
		
		let bStop = chatStatus === ChatStatus.CLOSED || chatStatus === ChatStatus.OFFLINE;
		
		return (
			<div className="MessageState_con">
				<div className="MessageStateLeft">
					<div className="MessageStateIntro">
						<p className="firstP">
							{
								bglen(this._userName) > 14 ?
									<Popover content={this._userName} placement="topLeft">
										<span>{substr(this._userName, 7) + "..."}</span> </Popover>
									:
									<span>{this._userName}</span>
							}
							
							<span style={this._address ? {margin: '0 0.04rem'} : {}}>{this._address ? "|" : ""}</span>
							
							{
								bglen(this._address) > 14 ?
									<Popover content={this._address} placement="topLeft">
										<span>{substr(this._address, 7) + "..."}</span> </Popover>
									:
									<span>{this._address}</span>
							}
							
							<span style={this._keyword ? {margin: '0 0.04rem'} : {}}>{this._keyword ? '|' : ''}</span>
							
							{
								this._keyword ?
									bglen(this._keyword) > 14 ?
										<Popover content={this._keyword} placement="topLeft">
											<span>{substr(this._keyword, 7) + "..."}</span> </Popover>
										:
										<span>{this._keyword}</span>
									: null
							}
							
							<span
								style={enabledForSelected(this._siteId) && this._userId ? {margin: '0 0.04rem'} : {}}>{enabledForSelected(this._siteId) && this._userId ? '|' : ''}</span>
							
							{
								(enabledForSelected(this._siteId) && this._userId) ?
									<span>{getLangTxt("consult_fk_id") + this._userId}</span> : null
							}
						</p>
					</div>
					<div className="MessageStateIntro" style={{marginTop: '5px'}}>
						{
							this.getSecondLineUI()
						}
					</div>
				</div>
				
				<div className="MessageStateright">
					<p>
						{
							this._sessionDuration > -1 ?
								<span className="MessageStaterightSpan">{getLangTxt("consult_starttime")} {
									bStop ?
										<span style={{paddingLeft: '3px'}}>{formatTime(this._startTime)}</span>
										:
										<Timer date={this._startTime}/>
								}
								</span> : null
						}
					</p>
					<p>
						{
							this.state.averageTime > 0 ?
								<span className="MessageStaterightSpan">{getLangTxt("consult_averagetime")}
									<span style={{paddingLeft: '3px'}}>
                                        {
	                                        formatTime(this.state.averageTime)
                                        }
									</span>
								</span> : null
						}
					</p>
				</div>
			</div>
		);
	}
	
	clear()
	{
		this._entrance = "";
		this._sessionDuration = undefined;
		this._evaluate = null;
		this.__rosterUser = null;
		
		this._userName = "";
		this._address = "";
		this._evaluateValue = "";
		this._title = "";
		this._url = "";
		this._keyword = "";
		this._userId = "";
		this._siteId = "";
	}
}

let MAX_CHAT_TIME = 86400;  //24 * 60 * 60最大时间限制为one day

export default ConsultInfoView;
