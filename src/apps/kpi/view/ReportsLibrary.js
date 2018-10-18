import React, { PropTypes } from 'react'
import { fetchList } from '../redux/kpiListReducer'
import { attentionReportList, subscribe, unsubscribe } from '../redux/attentionReducer'
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
import { getLangTxt, reoperation } from "../../../utils/MyUtil";

let data = [], itemHeight = 374 + 10; //item.height + gap

class ReportsLibrary extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			index: [],
			date: this.props.date
		};
		
		this.scrollData  = reoperation(this.scrollData.bind(this), 500);
	}

	componentWillMount()
	{
		this.props.attentionReportList();
		this.props.fetchList();

	}

	componentDidMount()
	{

		this.date = this.props.date;
		this.query = getQuery(undefined, this.date);//return nextQry,一個關於日期的字符創
		this.list = this.props.list || [];

		for(let i in this.list)
		{
			delete this.list[i].loadId;
			this.list[i].progress = -1;
		}

		if(!this.props.list)
		{
			this.props.fetchList();
		}

		//this.props.loadReport({list: this.list, query: this.query});

		this.scrollData();

		this.refs.library.addEventListener('scroll', this.scrollData);

	}

	componentWillReceiveProps(nextProps)
	{

		if(nextProps.value !== "" || nextProps.activeKey !== 'ReportsLibrary')
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
		if(this.props.date !== nextProps.date)//当前日期
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
		if(this.props.attention != nextProps.attention)
		{
			let attention = nextProps.attention;
			if(attention === undefined)
			{
				return null;
			}
			else
			{
				data = [];
				for(let elem of attention)
				{
					if(!data.includes(elem.id))
					{
						data.push(elem.id)
					}
				}
			}
			this.setState({
				index: data
			})
		}

		//this.props.loadReport({list: this.list, query: this.query});
		this.scrollData();
	}
	
	scrollData()
	{
		let arry = document.getElementsByClassName("kpi_box"),
			top = this.refs.library.scrollTop,
			indexTitle;

		if(arry.length <= 0 || this.list.length <= 0)
			return;

		for(let i = 0; i < arry.length; i++)
		{
			let item = arry[i];
			if(item.offsetParent.offsetTop + item.offsetHeight > top)
			{
				indexTitle = item.classList[2];
				i = arry.length;
			}
		}

		indexTitle = indexTitle ? indexTitle : arry[0].classList[2];

		let newlist;

		this.list.forEach((item, index)=>{
			if(item.name === indexTitle)
			{
				newlist = this.list.slice(index, 6 + index);
				this.props.loadReport({list: newlist, query: this.query});
			}
		});

		if(!newlist)
		{
			newlist = this.list.slice(0, 6);
			this.props.loadReport({list: newlist, query: this.query});
		}
	}

	/**
	 * 添加删除收藏
	 **/
	_onCollect(value, e)
	{
		let name = value.name,
			{attention} = this.props,

			index = attention.findIndex(item => item.name === name);

		e.stopPropagation();

		if(index > -1)
		{
			this.props.unsubscribe(name);
		}
		else
		{
			this.props.subscribe(name, value);
		}
	}

	//报表详情页
	details(item)
	{
		this.props.showDetails(item, getLangTxt("kpi_report_base"))
	}

	_getProgress()
	{
		let progress = this.props.progress;

		if(progress === LoadProgressConst.LOADING)
		{
			return (
				<Loading/>
			)
		}
	}

	getArry(list)
	{
		let leftHeight = 0,
			rightHeight = 0,
			leftArry = [],
			item,
			rightArry = [],
			clientHeight = document.documentElement.clientHeight - 120;

		for(let i = 0; i < list.length; i++)
		{
			item = list[i];
			let height = (item.ui === "dashboard" || item.ui === "number") ? 194 : 388;

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

	mapReport(list)
	{

		let indexs = this.state.index,
			ui, height, color;

		return (
			list && list.map((item, index) => {
				ui = item.ui;
				height = (ui == "dashboard" || ui == "number") ? "180px" : `${itemHeight}px`;
				color = indexs.includes(item.id) ? "#6edefb" : "#dcdcdc";

				return (
					<ShowKpiData key={item.name} height={height} item={item} date={this.state.date}
					             color={color} group="reportsLibrary"
					             click={this.details.bind(this)}
					             onCollect={this._onCollect.bind(this)}/>
				)
			})
		)
	}

	reFreshFn()
	{
		this.props.attentionReportList();
		this.props.fetchList();
	}

	render()
	{
		let list = this.props.list,
			progress = this.props.progress;

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="report data" ref="library">

				{
					progress && list && list.length !== 0 ?
						<div className="data_main" ref={node=>this.container = node}>
							{this.getArry(list)}
						</div> :
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
		list: state.reportsList.data,
		attention: state.attentionList.data || [],
		progress: state.reportsList.progress,
		query: state.query.data
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({fetchList, attentionReportList, loadReport, subscribe, unsubscribe}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportsLibrary);
