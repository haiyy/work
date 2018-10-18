import React from 'react'
import { Timeline, Badge } from 'antd';
import { getLangTxt } from "../../../../../utils/MyUtil";

class OrderList extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	render()
	{
		let arr = this.props.orderData || [];
		
		let pcSymbol = 'icon-pc';
		let wapSymbol = 'icon-shouji';
		
		let orderList = arr.reverse()
		.map((item, index, arr) =>
		{
			let badge = (<Badge count={arr.length - index} className="order-list-badge"> </Badge>);
			
			return (
				<Timeline.Item key={index} dot={badge}>
					<p className="visitNum">
						<span>{item.time}</span>
						<i className={"icon iconfont " + (item.dv.toLowerCase() === "pc" ? pcSymbol : wapSymbol)}></i>
						<b>{getLangTxt("rightpage_staytime") + item.stayTime}</b>
					</p>
					
					<ul className="ordTitle">
						<li>
							<span className="ordLeft">{getLangTxt("rightpage_order_num")}</span>
							<span>{item.oi}</span>
						</li>
						{
							item.op ? (<li>
								<span className="ordLeft">{getLangTxt("rightpage_price1")}</span>
								<span>{item.op}</span>
							</li>) : null
						}
					</ul>
				</Timeline.Item>
			)
		});
		
		return (
			<Timeline>
				{orderList}
			</Timeline>
		)
	}
}

export default OrderList
