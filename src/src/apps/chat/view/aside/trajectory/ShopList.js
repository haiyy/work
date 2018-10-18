import React, { PropTypes } from 'react'
import { Timeline, Badge } from 'antd';
import { getLangTxt } from "../../../../../utils/MyUtil";

class ShopList extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	render()
	{
		let shopList = this.props.shopList || [],
			shopListView = shopList.reverse()
			.map((item, index, arr) =>
			{
				let badge = (<Badge count={arr.length - index} style={{backgroundColor: '#BCD434'}}> </Badge>);
				
				let pcSymbol = 'icon-pc';
				let wapSymbol = 'icon-shouji';
				
				return (
					<Timeline.Item key={index} dot={badge}>
						<p className="visitNum">
							<span>{item.time}</span>
							<i className={"icon iconfont " + (item.dv.toLowerCase() === "pc" ? pcSymbol : wapSymbol)}></i>
							<b>{getLangTxt("rightpage_staytime")}{item.stayTime}</b>
						</p>
						<ul className="ordTitle">
							<li>
								<span className="ordLeft">{getLangTxt("rightpage_commodity_id")}</span>
								<span>{item.prid}</span>
							</li>
							<li>
								<span className="ordLeft">{getLangTxt("rightpage_commodity_name")}</span>
								<span>{item.pn}</span>
							</li>
							<li>
								<span className="ordLeft">{getLangTxt("rightpage_commodity_brand")}</span>
								<span>{item.br}</span>
							</li>
							<li>
								<span className="ordLeft">{getLangTxt("rightpage_price")}</span>
								<span>{item.mp}</span>
							</li>
							<li>
								<span className="ordLeft">{getLangTxt("rightpage_visit_time")}</span>
								<span>{item.currentCount}</span>
							</li>
						</ul>
					</Timeline.Item>
				)
			});
		
		return (
			<Timeline>
				{shopListView}
			</Timeline>
		)
	}
}

export default ShopList
