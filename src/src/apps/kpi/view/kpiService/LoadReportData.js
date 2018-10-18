import React, { Component } from 'react'
import { requestReport } from '../../redux/requestReportData'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { urlLoader } from "../../../../lib/utils/cFetch"
import Settings from "../../../../utils/Settings"
import { loginUserProxy } from "../../../../utils/MyUtil"
import getQuery from './getQuery'

class LoadReportData extends Component {

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
        if(this.props.list != nextProps.list || this.props.query != nextProps.query)
        {
            this.queryList = nextProps.queryList;

            clearInterval(this.timerId);

            if(nextProps.list.length === 0)
                return null;

            this.timerId = -1;
            this.index = 0;
            this.isStop = false;
            this.intervalLoad(nextProps.list, nextProps.query);
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

        if(reportData.progress === LoadReportData.LOADING && !reportData.loadId)
            return;

        this.isStop = this.isStop && reportData.progress === LoadReportData.LOAD_COMPELE;

        if(reportData.progress === LoadReportData.LOAD_COMPELE)
        {
            this.index++;
            this.gotoLoadData(list, query);
            return;
        }

        let {siteId: siteid, userId: userid} = loginUserProxy(),
            qry = "",
            url = `${Settings.getPantherUrl()}/api/report/`,
            options = {headers: {siteid, userid, 'isExport': 'unexport'}};

        if(reportData.loadId)
        {
            url += reportData.loadId;
        }
        else
        {

            if(this.queryList.hasOwnProperty(reportData.name))
            {
                query = getQuery(this.queryList[reportData.name]);
            }

            qry = query + '&&business|=|' + siteid;
            url += reportData.name + "/v1";
            options.body = JSON.stringify({name: reportData.name, qry});
            options.method = 'put';
        }

        reportData.progress = LoadReportData.LOADING;

        urlLoader(url, options)
            .then(({jsonResult}) =>
            {
                if(jsonResult.code === 500)  //加载数据失败
                {
                    reportData.progress = LoadReportData.LOAD_COMPELE;
                    this.props.requestReport(reportData.progress, '', reportData);
                }

                if(jsonResult.state === "ok")
                {
                    reportData.progress = LoadReportData.LOAD_COMPELE;
                    this.props.requestReport(reportData.progress, jsonResult.result, reportData);
                }
                else if(jsonResult.state === "starting")
                {
                    reportData.progress = LoadReportData.LOADING;
                    reportData.loadId = jsonResult.id;

                    this.index = list.findIndex(item => item === reportData);
                    this.isStop = false;
                    this.gotoLoadData(list, query);

                    this.props.requestReport(reportData.progress, '', reportData);

                    return;
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
    let {loadReportData: {list, query}} = state,
        queryList = state.query.data || {};

    list = list ? list : [];

    return {list, query, queryList};
}
function mapDispatchToProps(dispatch)
{
    return bindActionCreators({requestReport}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadReportData);
