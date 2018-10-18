import React from 'react'
import { Collapse } from 'antd';
import OrderList  from './OrderList';
import { getNoDataComp } from "../../../../../utils/ComponentUtils";
import ScrollArea from 'react-scrollbar';
import { getLangTxt } from "../../../../../utils/MyUtil";

const Panel = Collapse.Panel;

class TraOrders extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	onChange()
	{
		if(this.refs.traOrderScrollArea)
		{
			this.refs.traOrderScrollArea.scrollTop()
		}
	}
	
	render()
	{
		
		let traOrders = this.props.traOrders || [],
			len = traOrders.length,
			panel = traOrders.map((traOrder, index) =>
			{
				let headerName,
					timeStr = traOrder.time ? ` ( ${traOrder.time} )` : "";
				
				if(index === 0)
				{
					headerName = getLangTxt("rightpage_visit") + timeStr;
				}
				else
				{
					headerName = getLangTxt("rightpage_web_node_count", len - index) + timeStr;
				}
				
				return (
					<Panel header={headerName} key={index}>
						<OrderList orderData={traOrder.getAll()}/>
					</Panel>
				)
			});
		
		let scrollHeight;
		
		if(document.getElementsByClassName("infoAside")[0])
		{
			scrollHeight = document.getElementsByClassName("infoAside")[0].clientHeight - 107;
		}
		console.log('TraAll render scrollHeight = ', scrollHeight);
		
		return (
			<div className="traOrders">
				<ScrollArea speed={1} horizontal={false} smoothScrolling ref="traOrderScrollArea"
				            style={{height: scrollHeight}} smoothScrolling>
					{
						traOrders.reverse().length > 0 ?
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

export default TraOrders;
