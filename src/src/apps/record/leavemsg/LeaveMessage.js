import React from 'react' ;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setPageRoute, getLeaveMsgList, queryCommonUsedConditions, updateSelectedConditions } from "../redux/leaveMsgReducer";
import LeaveMsgList from './LeaveMsgList';
import DealedDetailRecord from './DealedDetailRecord';
import PendingDetailRecord from './PendingDetailRecord';
import { Map } from "immutable";
import {getConversationCount} from "../redux/consultReducer";

class LeaveMessage extends React.PureComponent {

    static DEALED = 0;
    static PENDING = 1;


	constructor(props)
	{
		super(props);
	}

	componentDidMount()
	{
        let leaveMsgTime = this.leaveMsgTime,
            {time} = leaveMsgTime,
            countObj = {
                startTime: time[0].value,
                endTime: time[1].value
            };
        if (Map.isMap(this.extra))
        {
            let obj = {
                    page: 1,
                    ...leaveMsgTime
                };

            this.props.getLeaveMsgList(LeaveMessage.DEALED === this.props.type, obj);

            // this.props.getConversationCount(countObj);
        }
        else
        {
            if (this.props.type != undefined)
            {
                let {search = {}} = this.extra,
                    obj = {
                        ...leaveMsgTime,
                        page: 1
                    };

                this.props.updateSelectedConditions([]);
                this.props.getLeaveMsgList(LeaveMessage.DEALED === this.props.type, obj, this.extra);
            }else
            {
                this.props.getLeaveMsgList(LeaveMessage.DEALED === this.props.type, this.extra.search, this.extra);
            }

            // this.props.getConversationCount(countObj);
        }
        this.props.queryCommonUsedConditions();
	}

	componentWillReceiveProps(nextProps)
	{
        let {getRecordCommonTime, leaveMsgData} = nextProps,
            leaveMsgTime = getRecordCommonTime.get("leaveMsgTime"),
            extra = leaveMsgData.getIn(["leaveDealedMsg", "extra"]);

		//这一段来控制 页面的跳转
        if(nextProps.type !== this.props.type)
        {
            this.props.setPageRoute('main');

            if (nextProps.type != undefined)
            {
                let obj = {
                        ...leaveMsgTime,
                        page: 1
                    };

                this.props.updateSelectedConditions([]);
                this.props.getLeaveMsgList(LeaveMessage.DEALED === nextProps.type, obj, extra);
            }
        }
	}

    get isproccessed()
    {
        return this.props.type === LeaveMessage.DEALED;
    }

    get time()
    {
        return this.getData("time");
    }

    get extra()
    {
        return this.getData("extra") || {};
    }

    getData(key2)
    {
        let {leaveMsgData} = this.props,
            key = "leaveDealedMsg";

        return leaveMsgData.getIn([key, key2]);
    }

	getDetailComponent()
	{
        let {leaveMsgData = Map()} = this.props,
            isproccessed = leaveMsgData.get("isproccessed");

        return isproccessed ? <DealedDetailRecord /> : <PendingDetailRecord />;
	}

    get leaveMsgTime()
    {
        const {getRecordCommonTime} = this.props,
            leaveMsgTime = getRecordCommonTime.get("leaveMsgTime");

        if (Map.isMap(leaveMsgTime))
            return leaveMsgTime.toJS();

        return leaveMsgTime
    }

    get selectedValue()
    {
        const {getRecordCommonTime} = this.props;

        return getRecordCommonTime.get("selectedValue");
    }

	render()
	{
        let {leaveMsgData = Map()} = this.props,
            pageRoute = leaveMsgData.get("pageRoute");

		return (
			<div className="leaveMessageWrapper">
				{
                    pageRoute === 'main' ?
                        <LeaveMsgList type={this.props.type}  path={this.props.path} route={this.props.route.bind(this)}/>
                        : this.getDetailComponent()
				}
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {leaveMsgReducer: leaveMsgData, getRecordCommonTime} = state;

	return {leaveMsgData, getRecordCommonTime};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		setPageRoute, getLeaveMsgList, queryCommonUsedConditions, getConversationCount, updateSelectedConditions
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveMessage);
