import React from 'react';
import { DatePicker, Select } from 'antd';
import moment from 'moment';

const {RangePicker} = DatePicker;
const Option = Select.Option;

/**
 * selectedRangeTime => [moment(startTime), moment(endTime)]
 * selectValue =》 String
 * */
class DatePickerComponent extends React.Component {

	static TODAY = "TODAY";
	static YESTERDAY = "YESTERDAY";
	static THIS_WEEK = "THIS_WEEK";
	static LAST_WEEK = "LAST_WEEK";
	static THIS_MONTH = "THIS_MONTH";
	static LAST_MONTH = "LAST_MONTH";
	static NEARLY_THREE_DAYS = "NEARLY_THREE_DAYS";
	static NEARLY_SEVEN_DAYS = "NEARLY_SEVEN_DAYS";

	constructor(props)
	{
		super(props);

		let selectValue = this.props.selectValue,
			rangeTime = this.props.rangeTime,
			resultValue = this.props.resultValue,
			resultTypes = this.props.resultTypes;

		this.state = {
			selectValue: selectValue !== '' ? selectValue : '今天',
			selectedRangeTime: rangeTime,
			resultValue: resultValue ? resultValue : "所有结果",
			resultTypes: resultTypes
		}
	}

	componentDidMount()
	{
		let {time: rangeTime, selectValue} = this.props;

		this.setState({
			selectValue: selectValue !== '' ? selectValue : '今天',
			rangeTime
		});
	}

	componentWillReceiveProps(nextProps)
	{
		 let selectValue = nextProps.selectValue,
			 rangeTime = nextProps.rangeTime;

		 this.setState({
		 	selectValue: selectValue !== undefined ? selectValue : '今天',
		 	selectedRangeTime: rangeTime
		 })
	}

	_onOk(dates)
	{
		let startTamp = null,
			endTamp = null,
			selectValue = "";

		if(dates[0] && dates[1])
		{
			startTamp = dates[0].toDate()
			.getTime();
			endTamp = dates[1].toDate()
			.getTime();
		}

		this.setState({selectValue, selectedRangeTime: dates});
		this.props._onOk(startTamp, endTamp, selectValue);
	}

	handleTimeChange(selectedRangeTime)
	{
		let today = new Date().getDate(),
			selectedEndDay = selectedRangeTime[1].toDate()
			.getDate(),
			startTime = selectedRangeTime[0].toDate()
			.getTime(),
			endTime = selectedRangeTime[1].toDate()
			.getTime();

		 if (today != selectedEndDay)
		     endTime =  new Date(selectedRangeTime[1].toDate().setHours(23, 59, 59, 999)).getTime();
		 
		this.setState({selectedRangeTime: [moment(startTime), moment(endTime)]})
	}

	selectDateChange(value)
	{
		let [startTamp, endTamp] = getTime(value);

		this.setState({
			selectValue: value,
			changeRangeDay: true,
			selectedRangeTime: [moment(startTamp), moment(endTamp)]
		});

		this.props._onOk(startTamp, endTamp, value);
	}

	onResultChange(value)
	{
		this.setState({resultValue: value});
		
		this.props.onResultValue(value)
	}

	render()
	{

		let {selectValue, selectedRangeTime, resultValue, resultTypes} = this.state;
		
		if(selectValue != undefined && selectedRangeTime == undefined)
		{
			this.selectDateChange(DatePickerComponent.TODAY)
		}
		
		return (
			<div style={{overflow: 'hidden',top:8,position:'absolute',right:0}}>
				<div className="rightDatePickerContainer">
					<RangePicker
						onOk={this._onOk.bind(this)}
						onChange={this.handleTimeChange.bind(this)}
						allowClear={true}
						value={selectedRangeTime}
						showTime
						format="YYYY/MM/DD HH:mm:ss"
						getCalendarContainer={() => document.querySelector(".callCenterScrollArea")}
					/>
				</div>

				<div className="leftDatePickerContainer">
					<Select value={selectValue} onSelect={this.selectDateChange.bind(this)} style={{width: '100%'}}
					        getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
						<Option value={DatePickerComponent.TODAY}> 今天 </Option>
						<Option value={DatePickerComponent.YESTERDAY}> 昨天 </Option>
						<Option value={DatePickerComponent.THIS_WEEK}> 本周 </Option>
						<Option value={DatePickerComponent.LAST_WEEK}> 上周 </Option>
						<Option value={DatePickerComponent.THIS_MONTH}> 本月 </Option>
						<Option value={DatePickerComponent.LAST_MONTH}> 上月 </Option>
						<Option value={DatePickerComponent.NEARLY_THREE_DAYS}> 近三天 </Option>
						<Option value={DatePickerComponent.NEARLY_SEVEN_DAYS}> 近七天 </Option>
					</Select>
				</div>
				{resultTypes ?
					<div className="leftDatePickerContainer" style={{marginRight:0}}>
						<Select value={resultValue} onSelect={this.onResultChange.bind(this)} style={{width: 100}}
						        getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
                            <Option value={-1}>所有结果</Option>
                            <Option value={0}>未呼叫</Option>
							<Option value={1}>未接通</Option>
							<Option value={2}>已接通</Option>
						</Select>
					</div>
					: ""
				}

			</div>
		);
	}
}


export function getTime(value)
{
	let startTamp = null,
		endTamp = null,
		timeStamp = new Date(new Date().setHours(0, 0, 0, 0)),
		now = new Date(),// 当前的日期
		nowDay = now.getDate(), //当前的日
		nowMonth = now.getMonth(), //获取当前的月
		nowYear = now.getFullYear(); // 当前的年

	let object = {
		/*'全部' : function (){
		 startTamp = null;
		 endTamp = null;
		 },*/
		[DatePickerComponent.TODAY]: function() {
			startTamp = timeStamp.getTime();
			endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
		},
		[DatePickerComponent.YESTERDAY]: function() {
			//一天是86400秒   故n天前的时间戳为
			startTamp = timeStamp - 86400 * 1 * 1000;
			endTamp = timeStamp - 1;
		},
		[DatePickerComponent.THIS_WEEK]: function() {
			let weekStartDate = new Date(nowYear, nowMonth, nowDay - now.getDay() + 1).getTime();

			startTamp = weekStartDate;
			endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;// now.getTime()
		},
		[DatePickerComponent.LAST_WEEK]: function() {
			let weekStartDate = new Date(nowYear, nowMonth, nowDay - now.getDay() - 6).getTime(),
				weekEndDate = new Date(nowYear, nowMonth, nowDay - now.getDay() + 1).getTime() - 1;

			startTamp = weekStartDate;
			endTamp = weekEndDate;
		},
		[DatePickerComponent.THIS_MONTH]: function() {
			let mothStartDate = new Date(nowYear, nowMonth, 1).getTime();

			startTamp = mothStartDate;
			endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;// now.getTime()
		},
		[DatePickerComponent.LAST_MONTH]: function() {
			let mothStartDate = new Date(nowYear, nowMonth * 1 - 1, 1).getTime(),
				mothEndDate = new Date(nowYear, nowMonth, 1).getTime() - 1;

			startTamp = mothStartDate;
			endTamp = mothEndDate;
		},
		[DatePickerComponent.NEARLY_THREE_DAYS]: function() {
			startTamp = timeStamp.getTime() - 86400 * 2 * 1000;
			endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
		},
		[DatePickerComponent.NEARLY_SEVEN_DAYS]: function() {
			startTamp = timeStamp.getTime() - 86400 * 6 * 1000;
			endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
		}
	};

	object[value]();

	return [startTamp, endTamp];
}

function disabledDate(current)
{
	return current && current.valueOf() > Date.now();
}

export default DatePickerComponent;
