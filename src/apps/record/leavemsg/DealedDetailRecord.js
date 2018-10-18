import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RecordDetailHead from './RecordDetailHead';
import '../../../public/styles/enterpriseSetting/dealedDetailRecord.scss';
import ContentList from './ContentList';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { setPageRoute, getLeaveDetail } from "../../../apps/record/redux/leaveMsgReducer";
import { formatTimestamp, getLangTxt, getProgressComp, getSourceForDevice } from "../../../utils/MyUtil";

class DealedDetailRecord extends React.PureComponent {

	constructor(props)
	{
		super(props);

        this.terminalMap = {
            0: "Others", 1: "web", 2: "wechat", 3: "wap", 4: "IOS App", 5: "Android App", 6: "weibo", 7: "AliPay"
        };
	}

	backClick()
	{
		this.props.setPageRoute('main');
	}

	componentDidMount()
	{
		if(this.pageRoute !== 'record_detail')
			this.props.setPageRoute('main');
	}

	get pageRoute()
	{
		let {leaveMsgData} = this.props;
		return leaveMsgData.get("pageRoute");
	}

	get recordDetail()
	{
		return this.getData("data") || {};
	}

	get progress()
	{
		return this.getData("progress");
	}

	get search()
	{
		return this.getData("search");
	}

    get extra()
    {
        return this.getData("extra") || {};
    }

	getData(key2)
	{
		let {leaveMsgData} = this.props;

		return leaveMsgData.getIn(["leaveDetail", key2]);
	}

	reFreshFn()
	{
		let params = this.search;

		if(Array.isArray(params))
			this.props.getLeaveDetail(params[0], params[1]);
	}

	render()
	{
		let recordDetail = this.recordDetail,
			leaveMessage = recordDetail.leaveMessage || {},
			{guestname, source, terminal} = leaveMessage,
			progress = this.progress,
            url = getSourceForDevice(source, this.terminalMap[terminal]);

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="dealedDetailRecord">
				{/*<RecordDetailHead username={guestname || ""} url={getSourceForDevice(source, terminal)}*/}
				<RecordDetailHead username={guestname || ""} url={url} backCilck={this.backClick.bind(this)}/>

				<div className="content">
					<div className="left">
						<div className="topContianer">
							<div className="customInfo">
								<div className="customName"> { leaveMessage.guestname || getLangTxt("rightpage_tab_note1") }</div>
								<div
									className="infoTime"> { formatTimestamp(leaveMessage.time && leaveMessage.time) }</div>
							</div>
							<ContentList data={this.recordDetail} type="dealedDetailTop"/>
						</div>
						<div className="bottomContainer">
							<ContentList data={this.recordDetail} type="dealedDetailBottom"/>
						</div>
					</div>
				</div>
				{
					getProgressComp(progress)
				}
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {leaveMsgReducer: leaveMsgData} = state;

	return {leaveMsgData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		setPageRoute, getLeaveDetail
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DealedDetailRecord);
