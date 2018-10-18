import React, { Component } from 'react'
import { attentionReportList, unsubscribe, changeAttention, resetProgress } from '../redux/attentionReducer'
import { loadReport } from '../redux/loadReportData'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
//import Loading from './Loading'
import Loading from "../../../components/xn/loading/Loading"
import ShowKpiData from './ShowKpiData'
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import NoData from './NoData'
import { ReFresh } from "../../../components/ReFresh"
import getQuery from './kpiService/getQuery'
import { getLangTxt } from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class AttentionData extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			index: [],
			date: this.props.date,
			warnVisible: false
		};
	}

	componentDidMount()
	{
		this.props.attentionReportList();
		this.query = getQuery(undefined, this.props.date);
		if(this.refs.attention)
		{
			this.refs.attention.addEventListener('scroll', this.debounce(this.scrollData.bind(this), 500));
		}
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.value !== "")
		{
			return false;
		}
		//如果两者不等且引用类型是数组的情况下将传递过来的list赋值给this.list
		if(this.props.list != nextProps.list)
		{
			if(nextProps.list instanceof Array)
			{
				this.list = nextProps.list;

			}
		}
		if(this.props.date !== nextProps.date)
		{
			for(let i in this.list)
			{
				delete this.list[i].loadId;//offline34a4ff2a-5715-4f41-b0b1-91becb1d1006"随机字符串
				this.list[i].progress = -1;
			}
			this.query = getQuery(undefined, nextProps.date);
			this.setState({
				date: nextProps.date
			})
		}

		this.props.loadReport({list: this.list, query: this.query});
	}

	//防止页面抖动，返回一个延时器函数
	debounce(fn, wait)
	{
		let timeout = null;
		return function() {
			if(timeout !== null) clearTimeout(timeout);
			timeout = setTimeout(fn, wait);
		}
	}

	scrollData()
	{
		let arry = document.getElementsByClassName("box"),
			top = this.refs.attention.scrollTop,//attention获取滚动条垂直高度
			indexTitle;
		for(let i = 0; i < arry.length; i++)
		{
			let item = arry[i];
			if(item.offsetTop + item.offsetHeight > top)
			{

				indexTitle = item.classList[1];
				i = arry.length;
			}
		}
		for(let i in this.list)
		{
			if(this.list[i].name === indexTitle)
			{
				let newlist = this.list.slice(i),//从i到末尾
					list = this.list.slice(0, i);//从0到i
				this.list = newlist.concat(list);//倒序
				this.props.loadReport({list: this.list, query: this.query});
				i = this.list.length;
			}
		}
	}

	details(item)
	{
		this.props.showDetails(item, getLangTxt("kpi_concerned_data"));//父组件传递过来的props
	}

	/**
	 * 删除收藏
	 **/
	_onCollect(data, e)
	{
		e.stopPropagation();

		this.props.unsubscribe(data.name);
	}

	_getProgress()
	{
		let progress = this.props.progress;

		if(progress === LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)
		{
			return (
				<Loading/>
			)
		}
		else if(progress === LoadProgressConst.SAVING_FAILED)
		{
			error({
				title: getLangTxt("kpi_concerned_data"),
                iconType: 'exclamation-circle',
                className: 'errorTip',
                okText: getLangTxt("sure"),
				content: getLangTxt("20034")
			});
		}
	}

	//render函数渲染条件成立的时候执行，传过来的list是map映射过来的，
	getArry(list)
	{
		let leftHeight = 0,
			rightHeight = 0,
			leftArry = [],
			item,
			rightArry = [],
			clientHeight = document.documentElement.clientHeight - 120,
			indexs = this.state.index;

		for(let i = 0; i < list.length; i++)
		{
			item = list[i];
			let height = (item.ui === "dashboard" || item.ui === "number") ? 194 : 388;

			if(indexs.includes(item.id))
			{
				continue;
			}

			if(leftHeight - rightHeight <= 0)
			{
				leftArry.push(item);
				leftHeight = leftHeight + height;
			}
			else
			{
				rightArry.push(item);
				rightHeight = rightHeight + height;
			}
		}
		return (
			<div style={{'overflow': 'hidden'}}>
				<div className="leftReportList">{leftArry.length !== 0 ? this.mapReport(leftArry) : null}</div>
				<div className="rightReportList">{rightArry.length !== 0 ? this.mapReport(rightArry) : null}</div>
			</div>
		)
	}

	//映射list列表，分为左右两块
	mapReport(list)
	{
		let indexs = this.state.index,
			ui, height;
		return (
			list.map((item, index) => {
				if(indexs.includes(item.id))
				{
					return "";
				}
				else
				{
					ui = item.ui;
					height = (ui === "dashboard" || ui === "number") ? "180px" : "374px";
					//核心echarts列表
					return (
						<div key={item.name}>
							<ShowKpiData key={item.name} height={height} item={item}
							             color="#6edefb" group="attention"
							             click={this.details.bind(this)}
							             onCollect={this._onCollect.bind(this)}
							             query={this.query}/>
                        </div>
					)
				}
			})
		)
	}

	componentWillUnmount()
	{
		this.props.attentionReportList();
	}

	reFreshFn()
	{
		this.props.attentionReportList();
	}

	render()
	{
		let list = this.props.list || [],
			indexs = this.state.index,
			progress = this.props.progress;//progress为登录状态

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;//重新加载

		return (
			<div className="attention data" ref="attention">
				{
					progress && list.length !== 0 && indexs.length !== list.length ?
						<div className="data_main">
							{this.getArry(list)}
						</div>
						:
						<div className="main">
							<NoData style={{height: '93%'}}/>
						</div>
				}
				{
					this._getProgress()
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		list: state.attentionList.data || [],
		progress: state.attentionList.progress,
		query: state.query.data
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({attentionReportList, loadReport, unsubscribe, changeAttention, resetProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AttentionData);
