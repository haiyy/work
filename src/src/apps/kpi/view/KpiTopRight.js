import React, {PropTypes} from 'react'
import {DatePicker, Select, Button} from 'antd'
import moment from 'moment'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {addQuery} from '../redux/filterReducer'
import {dateTime} from './kpiService/getQuery'
import 'moment/locale/zh-cn';
import {is} from 'immutable'
import {getLangTxt} from "../../../utils/MyUtil";
import "./scss/KpiTopRight.scss";

moment.locale('cn');

const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

class KpiTopRight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: [moment().startOf('d').subtract(1, 'd').add(1, 'days'), moment({
                hour: 0,
                minute: 0,
                seconds: 0
            }).add(1, 'day')],
            value: "1"
        };
        this.date = [moment().startOf('d').subtract(1, 'd').add(1, 'days'), moment({
            hour: 0,
            minute: 0,
            seconds: 0
        }).add(1, 'day')];//默认当前时间
        //this.showTime = false;
    }

    componentDidMount() {
        this.setState({date: [moment(this.props.date[0]), moment(this.props.date[1])], value: this.props.isChangeTime});
    }

    _dateTime(key) {
        switch (key) {
            case "1"://今天
                return [moment().startOf('d').subtract(1, 'd').add(1, 'days'), moment({
                    hour: 0,
                    minute: 0,
                    seconds: 0
                }).add(1, 'day')]; //moment()
            case "2"://昨天
                return [moment().startOf('d').subtract(1, 'd'), moment({hour: 0, minute: 0, seconds: 0})]; //moment().endOf('d').subtract(1, 'd')]
            case "3"://本周
                return [moment().startOf('week'), moment({hour: 0, minute: 0, seconds: 0}).add(1, 'day')];
            case "4"://上周
                return [moment().startOf('week').subtract(1, 'week'), moment().startOf('week').subtract(1, 'week').add(1, 'week')]; //moment().endOf('week').subtract(1,'week')]
            case "5"://本月
                return [moment().startOf('months'), moment({hour: 0, minute: 0, seconds: 0}).add(1, 'day')];
            case "6"://上月
                return [moment().startOf('months').subtract(1, 'months'), moment().startOf('months').subtract(1, 'months').add(1, 'month')];
            case "7"://近三天
                return [moment().startOf('d').subtract(2, 'd'), moment({hour: 0, minute: 0, seconds: 0}).add(1, 'day')];
            case "8"://近七天
                return [moment().startOf('d').subtract(6, 'd'), moment({hour: 0, minute: 0, seconds: 0}).add(1, 'day')];
        }
    }

    //日期选择快捷键
    _onSelectTime(value) {
        let date = this._dateTime(value),//第一个选择项时间moment化
            nextDate = [];
        nextDate.push(date[0].format("YYYY-MM-DD HH:mm:ss"));
        nextDate.push(date[1].format("YYYY-MM-DD HH:mm:ss"));
        console.log(nextDate);
        console.log(value);
        this.props.quickDate(nextDate, value);

        if (this.props.value === "") {
            let query = this.props.query,//筛选条件
                keys = Object.keys(query);//返回筛选条件的数组[0,1,2]
            if (keys.length !== 0) {
                keys.map(item => {
                    query[item] = dateTime(query[item], nextDate);//筛选query(item)，有则date字符串化，没有则添加一项默认时间
                });
            }
            this.setState({
                date: date,
                value: value
            });
            this.date = date;
        }
    }

    range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }

    disabledRangeTime(_, type) {
        if (type === 'start') {
            return {
                disabledHours: () => [],
                disabledMinutes: () => this.range(1, 60),
                disabledSeconds: () => this.range(1, 60)
            };
        }
        return {
            disabledHours: () => [],
            disabledMinutes: () => this.range(1, 60),
            disabledSeconds: () => this.range(1, 60)
        };
    }

    //改变日期
    _onChangeTime(dates, dateStrings) {
        let now = moment();
        //目的：判断当前用户是否点击选择日期按钮，如果点击，则时间会变化，就不用格式化为23:59:59
        let arrDateOne = dateStrings[0].split(' ')[1],//判断是否是00:00:00
            arrDateTwo = dateStrings[1].split(' ')[1].split(":"),//判断是否是当前时分秒的截取
            arrDateTwoHour = arrDateTwo[0],//点击的当前时
            arrDateTwoMinute = arrDateTwo[1],//点击的当前分
            arrNow = now.format('YYYY-MM-DD HH:mm:ss').split(' ')[1].split(':'),//当前时间
            arrNowHour = arrNow[0],//现在的时
            arrNowMinute = arrNow[1];//现在的分，秒会有延迟差，不好比较
        //dates[1] = now;
        if (dateStrings[1].split(' ')[0] != now.format('YYYY-MM-DD HH:mm:ss').split(' ')[0] && (arrDateOne === '00:00:00' || arrDateTwoHour === arrNowHour && arrDateTwoMinute === arrNowMinute)) {
            dates[0] = moment(dates[0].format("YYYY-MM-DD HH:mm:ss"));
            dates[1] = moment(dates[1].format("YYYY-MM-DD HH:mm:ss"));
            if (moment(dates[1].isSame(now)))
            {
                dates[1] = moment(dates[1].format("YYYY-MM-DD 23:59:59"));
            }
        }
        if(dateStrings[1].split(' ')[0] === now.format('YYYY/MM/DD HH:mm:ss').split(' ')[0])
        {
            dates[1] = now;
        }
        this.setState({
            date: dates,
            value: ""
        });
    }

    _onOk(dates) {
        this.date = dates;
        let nextDate = [];
        if (this.state.date.length != '0') {
            nextDate.push(dates[0].format("YYYY-MM-DD HH:mm:ss"));
            nextDate.push(dates[1].format("YYYY-MM-DD HH:mm:ss"));

            let query = this.props.query,
                keys = Object.keys(query);
            if (keys.length !== 0) {
                keys.map(item => {
                    query[item] = dateTime(query[item], nextDate);//不存在日期时间则加上这项
                });
            }
            this.props.quickDate(nextDate, "");
        } else if (this.state.value == '' && this.state.date.length == '0') {
            this.props.quickDate([]);
        }

    }

    _onOpenChange(status) {
        if (!status && this.state.length !== 0)//关闭弹窗的时候
        {
            let nextDate = [], oldDate = [];
            oldDate.push(this.date[0].format("YYYY-MM-DD HH:mm:ss"));
            oldDate.push(this.date[1].format("YYYY-MM-DD HH:mm:ss"));
            nextDate.push(this.state.date[0].format("YYYY-MM-DD HH:mm:ss"));
            nextDate.push(this.state.date[1].format("YYYY-MM-DD HH:mm:ss"));
            if (nextDate.toString() === oldDate.toString())//关闭弹窗后条件满足
            {
                return;
            }
            this.setState({
                date: this.date,//今天昨天选择框的时间
                value: ""
            })
        }


    }

    style = {width: 89};

    //刷新报表列表数据
    refreshList() {
        this._onSelectTime('1');//刷新数据则是显示今天
    }

    render() {
        let disabled = this.props.value !== "" ? true : false,
            //now = moment(),//详情页不可点击topright
            defaultValue = [moment().startOf('week').subtract(1, 'week'), moment().endOf('week').subtract(1, 'week'), moment().startOf('d').subtract(1, 'd').add(1, 'days')] //默认时间是今天
        return (
            <div className="topRight">
                <Select value={this.state.value} style={this.style}
                        className="topRight_left"
                        getPopupContainer={() => document.querySelector(".ant-layout-aside")}
                        dropdownClassName="selectDate" onChange={this._onSelectTime.bind(this)}>
                    <Option value="1">{getLangTxt("today")}</Option>
                    <Option value="2">{getLangTxt("yesterday")}</Option>
                    <Option value="3">{getLangTxt("this_week")}</Option>
                    <Option value="4">{getLangTxt("last_week")}</Option>
                    <Option value="5">{getLangTxt("this_month")}</Option>
                    <Option value="6">{getLangTxt("last_month")}</Option>
                    <Option value="7">{getLangTxt("nearly_three_days")}</Option>
                    <Option value="8">{getLangTxt("nearly_seven_days")}</Option>
                    {/*<Option value="9" disabled/>*/}
                </Select>

                <RangePicker
                    style={{width: 290}}
                    className="topRight_right"
                    format="YYYY/MM/DD HH:mm:ss"
                    placeholder={[getLangTxt("start_time"), getLangTxt("end_time")]}
                    getCalendarContainer={() => document.querySelector(".topRight")}
                    defaultValue={defaultValue}
                    value={this.state.date}
                    // disabledDate={disabledDate}
                    popupStyle={{zIndex: '10000'}}
                    showTime
                    onChange={this._onChangeTime.bind(this)}
                    onOk={this._onOk.bind(this)}
                    onOpenChange={this._onOpenChange.bind(this)}
                   /* disabledTime={this.disabledRangeTime.bind(this)}*/
                />
                {/*<Button type="primary" shape="circle" onClick={this.refreshList.bind(this)}>
					<i className="icon-shuaxin iconfont" style={{position:'relative',top:'1px'}} />
				</Button>*/}
            </div>
        )
    }
}

function disabledDate(current) {
    return current && current.valueOf() > Date.now();
}

function mapStateToProps(state) {
    return {
        query: state.query.data || {},
        date: state.queryTime.queryDate.date,
        isChangeTime: state.queryTime.queryDate.isChangeTime
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({addQuery}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KpiTopRight);
