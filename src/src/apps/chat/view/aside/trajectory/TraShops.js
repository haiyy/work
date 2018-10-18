import React from 'react'
import { Collapse } from 'antd';
import ShopList  from './ShopList';
import { getNoDataComp } from "../../../../../utils/ComponentUtils";
import ScrollArea from 'react-scrollbar';
import { getLangTxt } from "../../../../../utils/MyUtil";

const Panel = Collapse.Panel;

class TraShops extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	onChange()
	{
		if(this.refs.traShopsScrollArea)
		{
			this.refs.traShopsScrollArea.scrollTop()
		}
	}
	
	render()
	{
		let traShops = this.props.traShops || [],
			len = traShops.length,
			traPanel = traShops.map((traShop, index) =>
			{
				let headerName,
					timeStr = traShop.time ? ` ( ${traShop.time} )` : "";
				
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
						<ShopList shopList={traShop.getAll()}/>
					</Panel>
				)
			});
		let scrollHeight;
		
		if(document.getElementsByClassName("infoAside")[0])
		{
			scrollHeight = document.getElementsByClassName("infoAside")[0].clientHeight - 107;
		}
		
		return (
			<div className="traOrders">
				<ScrollArea speed={1} horizontal={false} ref="traShopsScrollArea"
				            style={{height: scrollHeight}} smoothScrolling>
					{
						traShops.reverse().length > 0 ?
							<Collapse
								defaultActiveKey={['0']}
								onChange={this.onChange.bind(this)}
								accordion>
								{traPanel}
							</Collapse>
							:
							getNoDataComp()
					}
				</ScrollArea>
			</div>
		)
	}
}

export default TraShops
