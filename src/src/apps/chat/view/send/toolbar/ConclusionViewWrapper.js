import React from 'react'
import { sendT2DEvent, loginUser } from "../../../../../utils/MyUtil";
import { CLOSE } from "../../../../event/TabEvent";
import SessionEvent from "../../../../event/SessionEvent";
import { getTabDataByUserId } from "../../../../../utils/ConverUtils";
import ConclusionView from "./ConclusionView";
import { Button, Checkbox, Modal } from 'antd';
import GlobalEvtEmitter from "../../../../../lib/utils/GlobalEvtEmitter";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveConsultationSummary } from "../../../redux/reducers/consultationSummaryReducer";
import { tabClosed } from "../../../redux/reducers/eventsReducer";

class ConclusionViewWrapper extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		let autoopenSummary = false,
			userid = loginUser().userId;
		
		if(userid)
		{
			try
			{
				let userSetting = localStorage.getItem(userid);
				if(userSetting)
				{
					
					userSetting = JSON.parse(userSetting);
					autoopenSummary = userSetting.autoopenSummary;
					
				}
			}
			catch(e)
			{
			}
		}
		
		this.state = {
			autoopenSummary: autoopenSummary,
			top: -1,
			left: -1
		};
		
		this.handleOk = this.handleOk.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.close = this.close.bind(this);
		this.handleSummaryAutoOpen = this.handleSummaryAutoOpen.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		
		document.addEventListener("mousemove", this.onMouseMove, false);
		document.addEventListener("mouseup", this.onMouseUp, false);
		
		this.onMouseDown = this.onMouseDown.bind(this);
		
		if(wapper)
		{
			wapper.close();
		}
		
		wapper = this;
	}
	
	componentDidMount()
	{
		this.componentDidUpdate();
	}
	
	componentDidUpdate()
	{
		if(this.header)
			return;
		
		let headers = document.getElementsByClassName("chatSummarHeader");
		if(headers.length > 0 && headers[0])
		{
			this.header = headers[0];
			this.header.addEventListener("mousedown", this.onMouseDown, false);
		}
	}
	
	componentWillUnmount()
	{
		document.removeEventListener("mousemove", this.onMouseMove, false);
		document.removeEventListener("mouseup", this.onMouseUp, false);
	}
	
	handleOk()
	{
		var flag = true;
		if(flag)
		{
			var info = this.selectedSummary;
			
			if(info.summary && info.summary.length > 0)
			{
				if(this.props.isCurrent)
				{
					sendT2DEvent({
						listen: SessionEvent.REQUEST_SUBMIT_SUMMARY,
						params: [this.props.converId, info.summary, info.remark]
					});
					
					this.close();
					return;
				}
				
				let {converId} = this.props,
                    obj = {
					converId,
					sunmmaryItemJsonArray: info.summary,
					remark: info.remark
				};
				
				this.props.saveConsultationSummary(obj)
				.then(result => {
					if(result && result.code === 200)
					{
						this.props.getSummaryText && this.props.getSummaryText(converId);
						this.close();
					}
					else
					{
						Modal.warning({
							title: '错误提示',
							width: '320px',
							iconType: 'exclamation-circle',
							className: 'errorTip',
							content: "数据保存失败！",
							okText: '确定'
						});
					}
				});
			}
			else
			{
				this.close();
			}
		}
	}
	
	handleCancel()
	{
		if(this.refs.summarymodal)
		{
			this.refs.summarymodal.getWrappedInstance()
			.clear(true);
		}
	}
	
	close()
	{
		let rosterUser = this.props.rosterUser || {},
			userId = rosterUser.userId;
		
		if(userId)
		{
			let tabData = getTabDataByUserId(userId);
			if(tabData && tabData.forceClose)
			{
				GlobalEvtEmitter.emit(CLOSE, [this.name]);
			}
		}
		
		this.props.close();
		wapper = null;
	}
	
	handleSummaryAutoOpen(e)
	{
		let userid = loginUser().userId;
		if(!userid)
		{
			return;
		}
		
		let userSetting = localStorage.getItem(userid);
		if(!userSetting)
		{
			userSetting = {autoopenSummary: false};
		}
		else
		{
			try
			{
				userSetting = JSON.parse(userSetting);
			}catch(e)
			{
				userSetting = {autoopenSummary: false};
			}
		}
		
		userSetting.autoopenSummary = e.target.checked ? true : false;
		
		localStorage.setItem(userid, JSON.stringify(userSetting));
		
		this.setState({
			autoopenSummary: e.target.checked
		});
	}
	
	getFooter()
	{
		return [
			<Checkbox key="summary_autoopen" checked={this.state.autoopenSummary}
			          style={{position: 'absolute', left: '0.17rem'}}
			          onChange={this.handleSummaryAutoOpen}>
				关闭会话时自动弹出
			</Checkbox>,
			<Button key="summary_cancel" onClick={this.handleCancel}>清空</Button>,
			<Button key="summary_submit" type="primary" onClick={this.handleOk}>保存</Button>
		];
	}
	
	getMidTop()
	{
		let width = (this.clientWidth > 1390 ? 1390 : this.clientWidth) * 100 / 1024 * 6.82,
			height = width * 465.89 / 682.66;
		
		if(this.clientHeight - height <= 0)
			return 0;
		
		return (this.clientHeight - height) / 2;
	}
	
	get clientWidth()
	{
		if(!document)
			return -1;
		
		return document.getElementById("app").clientWidth || -1;
	}
	
	get clientHeight()
	{
		if(!document)
			return -1;
		
		return document.getElementById("app").clientHeight || -1;
	}
	
	getMidleft()
	{
		let num = (this.clientWidth > 1390 ? 1390 : this.clientWidth) * 100 / 1024 * 6.82;
		
		if(this.clientWidth - num <= 0)
			return 0;
		
		return (this.clientWidth - num) / 2;
	}
	
	onMouseMove(e)
	{
		if(e.buttons !== 1 || this.currentX < 0)
		{
			this.currentX = -1;
			this.currentY = -1;
			return;
		}
		
		var nowX = e.clientX, nowY = e.clientY;
		var disX = nowX - this.currentX,
			disY = nowY - this.currentY;
		
		this.setState({top: this.top + disY, left: this.left + disX, margin: "0"});
	}
	
	onMouseDown(event)
	{
		this.currentX = event.clientX;
		this.currentY = event.clientY;
		this.top = this.state.top !== -1 ? this.state.top : this.getMidTop();
		this.left = this.state.left !== -1 ? this.state.left : this.getMidleft();
		event.currentTarget.focus();
	}
	
	onMouseUp(event)
	{
		this.currentX = -1;
		this.currentY = -1;
	}
	
	getResult(data)
	{
		this.selectedSummary = data || {};
	}
	
	render()
	{
		let {top, left} = this.state,
			{visible} = this.props,
			propsStyle;
		
		if(top > -1 || left > -1)
		{
			propsStyle = {top, left, margin: "0"}
		}
		else
		{
			propsStyle = {top: this.getMidTop(), left: this.getMidleft(), margin: "0"}
		}
		
		if(!visible && this.header)
		{
			this.header.removeEventListener("mousedown", this.onMouseDown);
			this.header = null;
			
			this.state.top = this.getMidTop();
			this.state.left = this.getMidleft();
		}
		
		return (
			visible ?
				<div className="chatSummarModalDiv" style={propsStyle}>
					<span className="chatSummarClose" onClick={this.close.bind(this)}></span>
					
					<div className="chatSummarHeader">
						咨询总结
					</div>
					
					<div className="chatSummarBody">
						<ConclusionView ref="summarymodal" visible={visible} rosterUser={this.props.rosterUser}
						                converId={this.props.converId} getResult={this.getResult.bind(this)}/>
					</div>
					
					<div className="chatSummarfooter">
						{this.getFooter()}
					</div>
				</div>
				: null
		);
	}
}

let wapper = null;

export function getWapper()
{
	return wapper;
}

function mapStateToProps(state)
{
	return {
		state
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		saveConsultationSummary, tabClosed
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConclusionViewWrapper);
