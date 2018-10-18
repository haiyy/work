import React from "react"
import { Button } from 'antd';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import ConclusionView from "../../../chat/view/send/toolbar/ConclusionView";
import {editConsultationReload } from "../../redux/reducers/telephonyScreenReducer"
import { getDataFromResult, getLoadData, loginUserProxy } from "../../../../utils/MyUtil";
import Settings from "../../../../utils/Settings";
import { urlLoader } from "../../../../lib/utils/cFetch";
import { bglen } from "../../../../utils/StringUtils";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=99451202
class PhoneConclusionView extends React.Component {
	constructor(props)
	{
		super(props);
		
		this.selectedSummary = [];
		this.state = {
			remark:""
		};
	}
	
	getSummariesData(callId)
	{
		if(!callId)
			return;
		console.log(callId);
		getLoadData(Settings.phoneSummaryUrl("?callId=" + callId))
		.then(getDataFromResult)
		.then(info => {
			if(!info) {
				this.setState({selectedKeys: []});
				return;
			}
			
			let {sunmmaryItemJsonArray} = info;
			
			if(sunmmaryItemJsonArray && sunmmaryItemJsonArray.length)
			{
				this.setState({selectedKeys: sunmmaryItemJsonArray.map(value => value.id),remark:info.remark});
			} else {
				this.setState({selectedKeys: [],remark:""});
			}
	
		})
	}

	componentWillReceiveProps(nextProps){
		if(this.props.callId != nextProps.callId){
			this.setState({
				result:""
			})
		}
		
	}
	
	onSubmitSummariesData()
	{
		if(Object.keys(this.selectedSummary).length <= 0)
			return;
		
		if(bglen(this.selectedSummary.reduce) > 140)
			return;
		
		let {callId} = this.props,
			hash={};
		this.selectedSummary.callId = callId;

		this.selectedSummary.sunmmaryItemJsonArray = this.selectedSummary.sunmmaryItemJsonArray.reduce((item, next)=>{
   		 hash[next.id] ? '' : hash[next.id] = true && item.push(next);
  		  return item
		}, [])

		urlLoader(Settings.phoneSummaryUrl(), {
			headers: {token: loginUserProxy().ntoken},
			body: JSON.stringify(this.selectedSummary),
			method: 'POST'
		})
		.then(info => {
			if(!info)
				return;
			
			if(info.jsonResult && info.jsonResult.code === 200)
			{
				this.setState({result:<span>提交成功！</span>});
				
				this.props.editConsultationReload();

				this.intervalID = setTimeout(()=>{
					clearTimeout(this.intervalID);
					
					this.setState({result:null});
				}, 10000)
			}
		})
	}
	
	getResult(data)
	{
		this.selectedSummary = {};
		
		if(data)
		{
			this.selectedSummary = {
				sunmmaryItemJsonArray: data.summary,
				remark: data.remark
			};
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
	
	render()
	{
		let {callId} = this.props,
			{remark} = this.state;
		
		return (
			<div style={{position: 'relative'}}>
				<ConclusionView ref="summarymodal" getSummariesData={this.getSummariesData} rosterUser={{}}
								remark={remark}
				                converId={callId} getResult={this.getResult.bind(this)} historyHide={true}/>
				
				{
					this.state.result
				}
				<div style={{textAlign:"right"}}>
				<Button type="primary" onClick={this.onSubmitSummariesData.bind(this)}
				        className="conclusionSaveBtn">保存</Button>
			</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {

	return {
 
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({editConsultationReload}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PhoneConclusionView);
