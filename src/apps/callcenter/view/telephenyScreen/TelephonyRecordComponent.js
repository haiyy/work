import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { getListTelephony, getCallRecordDetails } from "../../redux/reducers/telephonyScreenReducer";
import NTTableWithPage from "../../../../components/NTTableWithPage"
import moment from "moment"
import TelephonyServiceRecord from "./TelephonyServiceRecord"
import { formatTimestamp,formatTimes } from "../../../../utils/MyUtil";


class TelephonyRecordComponent extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			RowClickType: false,
            currentPage:1,
		}
	}

	componentDidMount()
	{
		this.getList(); //回访计划
	}

	getList(currentPage=1) {
        let {actions, phonenumber} = this.props;
 

		actions.getListTelephony(phonenumber,currentPage);
	}

	getHeaders()
	{
		return [

			{
				key: 'callTime',
				dataIndex: 'callTime',
				title: '时间',
				width: 150,
				render: (text) => {
					return <span>{formatTimestamp(text, true)}</span>
				}
			}, {
				key: 'callType',
				dataIndex: 'callType',
				title: '类型',
				width: 100,
			}, {
				key: 'consultClassify',
				dataIndex: 'consultClassify',
				title: '咨询类型',
				width: 100,
			},
			{
				key: 'resultType',
				dataIndex: 'resultType',
				title: '接听状态',
				width: 100,
			},
			{
				key: 'callDuration',
				dataIndex: 'callDuration',
				title: '通话时长',
				width: 100,
                render:((text)=>{
                    return (
                        text=formatTimes(text)
                    )
                })
			},
			{
				key: 'satisfaction',
				dataIndex: 'satisfaction',
				title: '满意度',
				width: 100,
			},

		]
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.reloadFlag && !this.props.reloadFlag)
		{
			this.getList();
			this.state.currentPage=1;
		}
	}


	onRowListData(data)
	{
		if(data)
		{
			this.setState({
				RowClickType: true,
				callId: data.callId
			})
		}
	}

    selectOnChange(value)
    {
        this.setState({
            currentPage:value
        })

        this.getList(value);
    }

	render()
	{
		let {dataList, recordList} = this.props,
            {totalRecord,list}= dataList,
			{RowClickType,currentPage,callId} = this.state;

		if(recordList)
		{
			return <div>
				<div>
					<NTTableWithPage
                        currentPage={currentPage}
						total={totalRecord}
                        selectOnChange={this.selectOnChange.bind(this)}
                        onRow={this.onRowListData.bind(this)} flagTypes={"TelePhony"} dataSource={list}
					                 columns={this.getHeaders()} pageShow={false}/>
				</div>
				{
					callId ? <TelephonyServiceRecord callId={callId} showResult={'ServiceRecord'}/> : null
				}
			</div>
		}
	}
}

const mapStateToProps = (state) => {
	let {telephonyScreenReducer} = state;

	return {
		dataList: telephonyScreenReducer.get("dataList") || {},
		reloadFlag:telephonyScreenReducer.get("consultationreloadFlag") || false,
		record: telephonyScreenReducer.get("recordList") || {},
		recordList: telephonyScreenReducer.get("recordList").list || [],
		phoneCallInfo: telephonyScreenReducer.get("phoneCallInfo") || {},

	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({getListTelephony, getCallRecordDetails}, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(TelephonyRecordComponent);

