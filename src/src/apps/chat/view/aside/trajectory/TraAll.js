import React, { PropTypes } from 'react'
import { Collapse } from 'antd';
import AllList from './AllList';
import { getNoDataComp } from "../../../../../utils/ComponentUtils";
import ScrollArea from 'react-scrollbar';
import { getLangTxt } from "../../../../../utils/MyUtil";

const Panel = Collapse.Panel;

class TraAll extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {
			headerName: 0
		}
	}
	
	handleHeaderName(time)
	{
		this.setState({
			headerName: time
		});
	}
	
	get sessions()
	{
		let {traAll = {}} = this.props;
		
		if(typeof traAll.getSessions === "function")
		{
			return [].concat(traAll.getSessions());
		}
		
		return [];
	}
	
	onChange()
	{
		if(this.refs.traAllScrollArea)
		{
			this.refs.traAllScrollArea.scrollTop()
		}
	}
	
	render()
	{
		let sessions = this.sessions,
			len = sessions.length,
			scrollHeight;
		
		if(document.getElementsByClassName("infoAside")[0])
		{
			scrollHeight = document.getElementsByClassName("infoAside")[0].clientHeight - 107;
		}
		
		let panel = sessions.map((session, index) => {
			let headerName = this.state.headerName,
				timeStr = session.records && session.records.time ? ` ( ${session.records.time} )` : "";
			
			if(index === 0)
			{
				headerName = `${getLangTxt("rightpage_visit")}${timeStr}`;
			}
			else
			{
				headerName = `${getLangTxt("rightpage_web_node_count", len - index)}${timeStr}`;
			}
			
			let sub = session.infos.getAll()
			.map((info, index) => {
				return (
					<ul key={index} className="traDetail">
						{
							keysMap.map(value => {
								if(!info[value.key])
									return null;
								
								return (
									<li>
										<b>{getLangTxt(value.label)}</b>
										<span>{info[value.key]}</span>
									</li>
								);
							})
						}
					</ul>
				)
			});
			
			return (
				<Panel header={headerName} key={index}>
					{
						/*
						 仅展示记录时，不显示info信息
						 全部轨迹与页面页签，组件复用
						 */
						this.props.recordsOnly ? null : sub
					}
					<div className="traInfo">{getLangTxt("record_trail_info")}</div>
					<AllList allList={session.records.getAll ? session.records.getAll() : []}
					         handleHeaderName={this.handleHeaderName.bind(this)}/>
				</Panel>
			)
		});
		
		return (
			<div className="traOrders">
				<ScrollArea speed={1} horizontal={false} smoothScrolling ref="traAllScrollArea"
				            style={{height: scrollHeight}}>
					{
						sessions.length > 0 ?
							<Collapse
								defaultActiveKey={['0']}
								onChange={this.onChange.bind(this)}
								accordion>
								{panel}
							</Collapse>
							:
							getNoDataComp()
					}
				</ScrollArea>
			</div>
		)
	}
}

const keysMap = [
	{key: "ipAddress", label: "rightpage_ip_location"},
	{key: "terminal", label: "rightpage_tml"},
	{key: "device", label: "rightpage_device"},
	{key: "source", label: "rightpage_source"},
	{key: "keyword", label: "user_keyword"},
	{key: "visitPageCount", label: "rightpage_visit_page"},
	{key: "maxVisitLevel", label: "rightpage_visit_level"},
	{key: "stayTime", label: "rightpage_stay_time"},
];

export default TraAll
