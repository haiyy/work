import React from 'react'
import { Tabs, Icon, Button } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { fetchTrajectory } from '../../../../../actions/trajectory';
import { fetchTraOrders } from '../../../../../actions/traOrders';
import { fetchTraShops } from '../../../../../actions/traShops';
import { fetchNtid, fetchTraAll, fetchTraWeb, refreshTrailData } from '../../../../../actions/traAll';
import '../../../../../public/styles/chatpage/trajectory.scss';
import TraOrders from './TraOrders';
import TraShops from './TraShops';
import TraAll from './TraAll';
import { getLangTxt } from "../../../../../utils/MyUtil";

const TabPane = Tabs.TabPane;

class Trajectory extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			traAllPage: 1,	// 全部轨迹页码
			traWebPage: 1,  // 页面信息页码
			traProductPage: 1, // 商品信息页码
			traOrderPage: 1 // 订单信息页面
		};
	}
	
	componentWillMount()
	{
		this.requestTrailData(this.props.ntid);
	}
	
	componentWillUpdate(nextProps, nextState)
	{
		// 客服切换了咨询页签，导致访客身份(ntid)变更。重新请求所有轨迹数据
		if(nextProps.ntid != this.props.ntid)
		{
			//this.props.fetchNtid(nextProps.ntid);
			this.requestTrailData(nextProps.ntid);
			return;
		}
		else
		{
			// 同一访客身份，检查（全部轨迹，页面，商品，订单）页码是否变更
			if(nextState.traAllPage > this.state.traAllPage)
			{
				this.requestTraAll(this.props.ntid, nextState.traAllPage);
			}
			else if(nextState.traWebPage > this.state.traWebPage)
			{
				this.requestTraWeb(this.props.ntid, nextState.traWebPage);
			}
			else if(nextState.traProductPage > this.state.traProductPage)
			{
				this.requestTraShops(this.props.ntid, nextState.traProductPage);
			}
			else if(nextState.traOrderPage > this.state.traOrderPage)
			{
				this.requestTraOrders(this.props.ntid, nextState.traOrderPage);
			}
		}
	}
	
	requestTrailData = (ntid) => {
		if(!ntid) return;
		
		this.requestTraAll(ntid);
		this.requestTraWeb(ntid);
		this.requestTraShops(ntid);
		this.requestTraOrders(ntid);
	}
	
	requestTraAll(ntid, page)
	{
		this.props.fetchTraAll(ntid, page);
	}
	
	requestTraWeb(ntid, page)
	{
		this.props.fetchTraWeb(ntid, page);
	}
	
	requestTraShops(ntid, page)
	{
		this.props.fetchTraShops(ntid, page);
	}
	
	requestTraOrders(ntid, page)
	{
		this.props.fetchTraOrders(ntid, page);
	}
	
	nextPage = (pageName) => {
		this.setState({
			[pageName]: this.state[pageName] + 1
		});
	}
	
	// 点击刷新按钮
	handleRefreshClick = () => {
		// 刷新数据，重置（全部轨迹，页面，商品，订单）的页码
		this.setState({
			traAllPage: 1,	// 全部轨迹页码
			traWebPage: 1,  // 页面信息页码
			traProductPage: 1, // 商品信息页码
			traOrderPage: 1 // 订单信息页面
		});
		this.props.refreshTrailData();
		this.requestTrailData(this.props.ntid);
	}
	
	getNextPage(type)
	{
		return <div className="loadMore" onClick={this.nextPage.bind(this, type)}>
			<div>
				<Icon type="search"/>
				<span>{getLangTxt("rightpage_more")}</span>
			</div>
		</div>
	}
	
	getFreshBtn()
	{
		if(!this._freshBtn)
		{
			this._freshBtn = (
				<Button type="primary" shape="circle" size="small" onClick={this.handleRefreshClick}
				        style={{marginTop: '5px'}}>
					<i className="icon-shuaxin iconfont"/>
				</Button>);
		}
		
		return this._freshBtn;
	}
	
	render()
	{
		let {traOrders = []} = this.props,
			ordersLen = 0;
		
		if(Array.isArray(traOrders))
		{
			traOrders.forEach(value => {
				ordersLen += value.size;
			})
		}
		
		return (
			<div className="trajectory">
				<div className="traTab">
					<Tabs defaultActiveKey="1" type="card" tabBarExtraContent={this.getFreshBtn()}>
						<TabPane tab={getLangTxt("rightpage_tra_all")} key="1">
							<TraAll traAll={this.props.traAll} recordsOnly={false}/>
							{
								this.props.trailnp1 ? this.getNextPage("traAllPage") : null
							}
						</TabPane>
						
						<TabPane tab={getLangTxt("rightpage_web")} key="2">
							<TraAll traAll={this.props.traWeb} recordsOnly={true}/>
							{
								this.props.trailnp2 ? this.getNextPage("traWebPage") : null
							}
						</TabPane>
						
						<TabPane tab={getLangTxt("rightpage_goods")} key="3">
							<TraShops traShops={this.props.traShops}/>
							{
								this.props.trailnp3 ? this.getNextPage("traShopPage") : null
							}
						</TabPane>
						
						<TabPane tab={`${getLangTxt("rightpage_order")}(${ordersLen})`} key="4">
							<TraOrders traOrders={this.props.traOrders}/>
							{
								this.props.trailnp4 ? this.getNextPage("traOrderPage") : null
							}
						</TabPane>
					</Tabs>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		//ntid: state.trajectoryReducer.ntid,
		traject: state.trajectoryReducer,
		traStatistics: state.trajectoryReducer.traStatistics,
		traOrders: state.trajectoryReducer.traOrders,
		traShops: state.trajectoryReducer.traShops,
		traAll: state.trajectoryReducer.traAll,
		traWeb: state.trajectoryReducer.traWeb,
		trailnp1: state.trajectoryReducer.trailnp1,
		trailnp2: state.trajectoryReducer.trailnp2,
		trailnp3: state.trajectoryReducer.trailnp3,
		trailnp4: state.trajectoryReducer.trailnp4
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		fetchTrajectory, fetchTraOrders, fetchTraShops, fetchTraAll, fetchTraWeb, fetchNtid, refreshTrailData
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Trajectory);
