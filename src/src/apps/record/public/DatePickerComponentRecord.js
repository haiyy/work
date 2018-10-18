import React from 'react';
import { DatePicker, Select } from 'antd';
import moment from 'moment';
import { getLangTxt } from "../../../utils/MyUtil";

const {RangePicker} = DatePicker;
const Option = Select.Option;

class DatePickerComponentRecord extends React.Component {
	constructor(props)
	{
		super(props);

		let selectValue = this.props.selectedValue,
			selectedRangeTime = this.props.time;

		this.state = {
			selectValue: selectValue !== undefined ? selectValue : '今天',
			selectedRangeTime
		}
	}

	componentDidMount()
	{
		let {time: selectedRangeTime, selectedValue} = this.props;

		this.setState({
			selectValue: selectedValue !== undefined ? selectedValue : '今天',
			selectedRangeTime
		})
	}

	componentWillReceiveProps(nextProps)
	{
		let selectValue = nextProps.selectedValue,
			selectedTime = nextProps.time;

		if(selectValue && this.props.selectValue != selectValue)
		{
			let [startTamp, endTamp] = this.getSelectTime(selectValue);

			selectedTime = [moment(startTamp), moment(endTamp)];
		}

		this.setState({
			selectValue: selectValue !== undefined ? selectValue : '今天',
			selectedRangeTime: selectedTime
		});
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

		if(startTime == endTime)
			return;

		// if (today != selectedEndDay)
		//     endTime =  new Date(selectedRangeTime[1].toDate().setHours(23, 59, 59, 999));

		this.setState({selectedRangeTime: [moment(startTime), moment(endTime)], selectValue: ""})
	}

	selectDateChange(value)
	{
		let [startTamp, endTamp] = this.getSelectTime(value);

		this.setState({
			selectValue: value,
			changeRangeDay: true,
			selectedRangeTime: [moment(startTamp), moment(endTamp)]
		});

		this.props._onOk(startTamp, endTamp, value);
	}

	getSelectTime(value)
	{
		let startTamp = null,
			endTamp = null,
			timeStamp = new Date(new Date().setHours(0, 0, 0, 0)),
			now = new Date(),// 当前的日期
			nowDay = now.getDate(), //当前的日
			nowMonth = now.getMonth(), //获取当前的月
			nowYear = now.getFullYear(); // 当前的年

		let object = {
			'今天': function() {
				startTamp = timeStamp.getTime();
				endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
			},
			'昨天': function() {
				//一天是86400秒   故n天前的时间戳为
				startTamp = timeStamp - 86400 * 1 * 1000;
				endTamp = timeStamp - 1;
			},
			'本周': function() {
				let weekStartDate = new Date(nowYear, nowMonth, nowDay - now.getDay() + 1).getTime();

				startTamp = weekStartDate;
				endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;// now.getTime()
			},
			'上周': function() {
				let weekStartDate = new Date(nowYear, nowMonth, nowDay - now.getDay() - 6).getTime(),
					weekEndDate = new Date(nowYear, nowMonth, nowDay - now.getDay() + 1).getTime() - 1;

				startTamp = weekStartDate;
				endTamp = weekEndDate;
			},
			'本月': function() {
				let mothStartDate = new Date(nowYear, nowMonth, 1).getTime();

				startTamp = mothStartDate;
				endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;// now.getTime()
			},
			'上月': function() {
				let mothStartDate = new Date(nowYear, nowMonth * 1 - 1, 1).getTime(),
					mothEndDate = new Date(nowYear, nowMonth, 1).getTime() - 1;

				startTamp = mothStartDate;
				endTamp = mothEndDate;
			},
			'近三天': function() {
				startTamp = timeStamp.getTime() - 86400 * 2 * 1000;
				endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
			},
			'近七天': function() {
				startTamp = timeStamp.getTime() - 86400 * 6 * 1000;
				endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
			}
		};

		let fn = object[value];

		fn && fn();

		/*return [moment(startTamp), moment(endTamp)];*/
		return [startTamp, endTamp];
	}

	render()
	{
		let {selectValue, selectedRangeTime} = this.state;

		return (
			<div style={{overflow: 'hidden', display: "inline-block"}} className="advancedSearchTime">
				<div className="rightDatePickerContainer">
					<RangePicker
						onOk={this._onOk.bind(this)}
						onChange={this.handleTimeChange.bind(this)}
						allowClear={true}
						value={selectedRangeTime}
						showTime
						format="YYYY/MM/DD HH:mm:ss"
						disabledDate={disabledDate}
						getCalendarContainer={() => document.querySelector(".ant-layout-aside")}
					/>
				</div>

				<div className="leftDatePickerContainer">
					<Select value={selectValue} onSelect={this.selectDateChange.bind(this)} style={{width: '100%'}}
					        getPopupContainer={() => document.querySelector(".ant-layout-aside")}>
						<Option value="今天">{getLangTxt("today")}</Option>
						<Option value="昨天">{getLangTxt("yesterday")}</Option>
						<Option value="本周">{getLangTxt("this_week")}</Option>
						<Option value="上周">{getLangTxt("last_week")}</Option>
						<Option value="本月">{getLangTxt("this_month")}</Option>
						<Option value="上月">{getLangTxt("last_month")}</Option>
						<Option value="近三天">{getLangTxt("nearly_three_days")}</Option>
						<Option value="近七天">{getLangTxt("nearly_seven_days")}</Option>
					</Select>
				</div>
			</div>
		);
	}
}

function disabledDate(current)
{
	// return current && current.valueOf() > Date.now();
	// return current && current > moment()
	// .endOf('day');
    return !(current <= moment().endOf('day') && current > moment().subtract(1, "years").subtract(1, "days"))
}

export default DatePickerComponentRecord;
