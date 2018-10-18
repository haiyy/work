import React, { PropTypes } from 'react'
import { Timeline, Badge } from 'antd';
import { getATag, getLangTxt } from "../../../../../utils/MyUtil";

let headerTime;

class AllList extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	componentDidMount()
	{
		this.props.handleHeaderName('headerTime');
		let recordList = this.props.allList;
		headerTime = 0;
		recordList.forEach((record, index) => {
			if(headerTime == 0 || record.time < headerTime)
			{
				headerTime = record.time
			}
		});
		this.props.handleHeaderName(headerTime);
	}
	
	render()
	{
		let recordList = this.props.allList ? [].concat(this.props.allList) : [];
		
		let shopList = recordList.reverse()
		.map((record, index) => {
			let page, badgeColor,
				badgeColorArr = ['#6DCDF3', '#1696FF', '#BCD434', '#69BC36', '#FFBD1F', '#FF6633', '#FF1D77'],
				pcSymbol = 'icon-pc',
				wapSymbol = 'icon-shouji';
			
			if(record.time < headerTime)
			{
				headerTime = record.time
			}
			
			let {
				keylevel = 1,
				keyname = "",
				ttl = "",
				url = "",
				dv = "",
				stayTime
			} = record;
			
			badgeColor = {backgroundColor: badgeColorArr[keylevel - 1]};
			
			let visitorNum = (
				<p className="visitNum">
					<span>
						{
							record.time
						}
					</span>
					<i className={"icon iconfont " + (dv.toLowerCase() === "pc" ? pcSymbol : wapSymbol)}></i>
					<b>{getLangTxt("rightpage_staytime")}{stayTime}</b>
				</p>);
			
			switch(keylevel)
			{
				case 1:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								{
									keyname ? <span className="all-list-page"
									                style={{marginRight: '10px'}}>{keyname}</span> : null
								}
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
						</div>
					)
					break;
				case 2:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								<span className="all-list-page" style={{marginRight: '10px'}}>{keyname}</span>
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
						</div>
					)
					break;
				case 3:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								<span style={{color: '#F3A916', marginRight: '10px'}}>{keyname}</span>
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
							<ul className="ordTitle traAll">
								<li>
									<span className="ordLeft">{getLangTxt("rightpage_commodity_id")}</span>
									<span>{record.prid}</span>
								</li>
								<li>
									<span className="ordLeft">{getLangTxt("rightpage_commodity_name")}</span>
									<span>{record.pn}</span>
								</li>
								<li>
									<span className="ordLeft">{getLangTxt("rightpage_commodity_brand")}</span>
									<span>{record.br}</span>
								</li>
								<li>
									<span className="ordLeft">{getLangTxt("rightpage_price")}</span>
									<span>{record.mp}</span>
								</li>
								<li>
									<span className="ordLeft">{getLangTxt("rightpage_visit_time")}</span>
									<span>{record.currentCount}</span>
								</li>
							</ul>
						</div>
					)
					break;
				case 4:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								<span className="all-list-page" style={{marginRight: '10px'}}>{keyname}</span>
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
						
						</div>
					)
					break;
				case 5:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								<span style={{color: '#FF6D6C', marginRight: '10px'}}>{keyname}</span>
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
						</div>
					)
					break;
				case 6:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								<span style={{color: '#009900', marginRight: '10px'}}>{keyname}</span>
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
							<ul className="ordTitle traAll">
								<li>
									<b className="ordLeft">{getLangTxt("rightpage_order_num")}</b>
									<span>{record.oi}</span>
								</li>
								{record.op ? (<li>
									<b className="ordLeft">{getLangTxt("rightpage_price1")}</b>
									<span>{record.op}</span>
								</li>) : null}
							</ul>
						</div>
					)
					break;
				case 7:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								<span style={{color: '#009900', marginRight: '10px'}}>{keyname}</span>
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
						</div>
					)
					break;
				default:
					page = (
						<div className="traPage">
							{visitorNum}
							<p className="pageLev">
								{
									getATag(url, ttl, "all-list-page")
								}
							</p>
						</div>
					)
					break;
			}
			let badge = (<Badge count={recordList.length - index} style={badgeColor}> </Badge>);
			
			return (
				<Timeline.Item key={index} dot={badge}>
					{page}
				</Timeline.Item>
			)
		});
		
		return (
			<Timeline>
				{shopList}
			</Timeline>
		)
	}
}

export default AllList
