import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ConsultList from './ConsultList';
import ConsultDetail from './ConsultDetail';
import { setPageRoute, getConsultList, queryCommonUsedConditions, getAccountGroup, updateSelectedConditions } from "../redux/consultReducer";
import {getConversationCount} from "../redux/consultReducer";
import { distribute } from "../../setting/distribution/action/distribute"
import { getSummaryAllTreeData, getAllKeyPageData, getSummaryAllVisitorSource } from "../redux/searchTreeDataReducer";
import { getEvaluation } from "../../setting/consultativeEvaluation/action/consultativeEvaluation";
import { getRegion } from "../../../reducers/loadDataReducer";

class Consult extends React.PureComponent
{

    static UNVALIDCONSULT = 0;
    static UNVALIDCONSULT_CUSTOMERNOTREPLY = -2; //访客无应答
    static UNVALIDCONSULT_CSNOTREPLY = -1; //客服无应答


    static VALIDCONSULT = 1;
    static VALIDCONSULT_CONVERSATION = 2;
    static VALIDCONSULT_EFFECTIVE = 3;

    static VALIDCONSULT_SUMMARY = 2; //已总结数量
    static VALIDCONSULT_UNSUMMARY = 3; //未总结数量
    static VALIDCONSULT_GOODSTART = 4; //商品页咨询数量

    static VALIDCONSULT_CARTSTART = 5; //购物车咨询数量
    static VALIDCONSULT_ORDERSTART = 6; //订单页咨询数量
    static VALIDCONSULT_PAYSTART = 7; //支付页咨询数量
    static VALIDCONSULT_OTHERSTART = 8; //其他页面咨询数量

    constructor(props)
	{
		super(props);

        this.state = {type: ""}
	}

	componentDidMount()
	{
        this.gotoUpdate(this.props);

        let obj = {item: 8};

        this.props.getAccountGroup();
        this.props.distribute("template");
        this.props.getSummaryAllTreeData();
        this.props.getAllKeyPageData();
        this.props.getSummaryAllVisitorSource();

        this.props.getEvaluation(obj);
        this.props.getRegion();
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.type !== this.state.type)
		{
            this.gotoUpdate(nextProps);
		}
	}

    gotoUpdate(nextProps)
    {
        this.state.type = nextProps.type;

        this.props.setPageRoute('main');

        this.extra.search && (this.extra.search.pageNo = 1);

        // if (this.starttime && this.starttime.length > 0)
        //     Object.assign(this.extra.search, {startTime:this.starttime});

        if (nextProps.type != undefined)
        {
            let {getRecordCommonTime, consultReducer1} = nextProps,
                consultTime = getRecordCommonTime.get("consultTime"),
                extra = consultReducer1.getIn(["validConsult", "extra"]),
                {search = {}} = extra,
                {startTime, endTime} = consultTime,
                obj = {
                    startTime,
                    endTime,
                    pageNo: search.pageNo
                };

            this.props.getConsultList( nextProps.type, obj, extra);
            this.props.updateSelectedConditions([]);
        }
    }

    get starttime()
    {
        return this.getData("starttime");
    }

    get isEffective()
    {
        return this.props.type === Consult.VALIDCONSULT;
    }

    get extra()
    {
        return this.getData("extra") || {};
    }

    getData(key2)
    {
        let { consultReducer1 } = this.props,
            key = "validConsult";

        return consultReducer1.getIn([key, key2]);
    }

    get consultTime()
    {
        const {getRecordCommonTime} = this.props,
            consultTime = getRecordCommonTime.get("consultTime");

        if (Map.isMap(consultTime))
            return consultTime.toJS();

        return consultTime
    }

    get selectedValue()
    {
        const {getRecordCommonTime} = this.props;

        return getRecordCommonTime.get("selectedValue");
    }

	render()
	{
        return (
			<div className="consultWrapper">
				{
					this.props.pageRoute === 'main' ?
						<ConsultList type={this.props.type} path={this.props.path} route={this.props.route.bind(this)}/>
						: <ConsultDetail />
				}
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {consultReducer1, getRecordCommonTime} = state,
		pageRoute = consultReducer1.get("pageRoute");

	return {consultReducer1, pageRoute, getRecordCommonTime};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		setPageRoute, getConsultList,
        queryCommonUsedConditions, getConversationCount, distribute,
        getSummaryAllTreeData, getAllKeyPageData, getSummaryAllVisitorSource,
        getEvaluation, getRegion, getAccountGroup, updateSelectedConditions
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Consult);
