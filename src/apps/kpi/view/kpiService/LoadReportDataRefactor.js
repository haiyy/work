import React, { Component } from 'react'
import { requestReport } from '../../redux/requestReportData'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { urlLoader } from "../../../../lib/utils/cFetch"
import Settings from "../../../../utils/Settings"
import { loginUserProxy } from "../../../../utils/MyUtil"

class LoadReportDataRefactor extends Component {

	static LOADING = 1;
	static LOAD_COMPELE = 2;

	constructor()
	{
		super();
		this.query = "";
		this.date = [];
		this.nextList = [];
		this.queryList = {};
	}

	componentWillReceiveProps(nextProps)
	{
		if(this.props.list != nextProps.list || this.props.queryTime != nextProps.queryTime)
		{
			this.queryList = nextProps.queryList;

			clearInterval(this.timerId);

			if(nextProps.list.length === 0)
				return null;

			this.timerId = -1;
			this.index = 0;
			this.isStop = false;

			let {queryTime = []} = nextProps,
				query = JSON.stringify({time: {starttime: queryTime[0], endtime: queryTime[1]}});

			this.intervalLoad(nextProps.list, query);
		}
	}

	timerId = -1;
	index = 0;
	isStop = false;

	//循环加载报表数据
	intervalLoad(list, query)
	{
		this.gotoLoadData(list, query);

		clearInterval(this.timerId);

		this.timerId = setInterval(this.gotoLoadData.bind(this, list, query), 1000);
	}

	gotoLoadData(list, query)
	{
		if(this.index >= list.length - 1 && this.isStop)
		{
			//当前数组全部加载完成
			clearInterval(this.timerId);
			return;
		}

		if(this.index >= list.length)
		{
			this.isStop = true;
			this.index = 0;
		}

		this.nextLoadData(list, query, new Date().getTime());

		this.index++;
	}

	nextLoadData(list, query, time)
	{
		let reportData = list[this.index];

		if(reportData.progress === LoadReportDataRefactor.LOADING)
			return;

		if(reportData.progress === LoadReportDataRefactor.LOAD_COMPELE)
		{
			this.index++;
			this.gotoLoadData(list, query);
			return;
		}

		let {siteId: siteid, userId: userid} = loginUserProxy(),
			url = `${Settings.getPantherUrl()}/api/v1/dashboard/${reportData.name}/${reportData.id}/data`,
			options = {headers: {siteid, userid}, method: 'put'};

		reportData.progress = LoadReportDataRefactor.LOADING;
		options.body = query;

        this.props.requestReport(reportData.progress, '', reportData);

		urlLoader(url, options)
		.then(({jsonResult}) => {
			if(jsonResult.code === 500)  //加载数据失败
			{
				reportData.progress = LoadReportDataRefactor.LOAD_COMPELE;
				this.props.requestReport(reportData.progress, '', reportData);
			}

			if(jsonResult.state === "ok")
			{
				reportData.progress = LoadReportDataRefactor.LOAD_COMPELE;
				this.props.requestReport(reportData.progress, jsonResult.result, reportData);
			}

			if(new Date().getTime() - time <= 1000)
			{
				this.intervalLoad(list, query);
			}
		});
	}

	render()
	{
		return null;
	}
}

function mapStateToProps(state)
{
	let {loadReportData: {list, query}, queryTime = {queryDate: {}}} = state,
		{queryDate = {date: []}} = queryTime,
		{date = []} = queryDate,
		queryList = state.query.data || {};

	list = list ? list : [];

	return {list, query, queryList, queryTime: date};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({requestReport}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadReportDataRefactor);
