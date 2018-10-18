import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setPageRoute, getLeaveMsgList, getLeaveDetail, clearMessageTip, updateSelectedConditions, updateCommonUsedConditions, queryCommonUsedConditions, deleteCommonUsedConditions } from "../redux/leaveMsgReducer";
import HeadBreadcrumb from '../../../components/HeadBreadcrumb.js';
import NTTableWithPageRecord from "../../../components/NTTableWithPageRecord";
import { Popover, Modal } from 'antd';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { getProgressComp, formatTimestamp, getLangTxt } from "../../../utils/MyUtil";
import { truncateToPop } from "../../../utils/StringUtils";
import { startPageComp } from "../RecordUtils";
import SearchComponent from  "../public/SearchComponent";
import LeaveMsgAdvancedSearch from "../leavemsg/LeaveMsgAdvancedSearch";
import moment from 'moment';
import Tags from "../public/Tags";
import { List, Map } from "immutable";
import { removeInvalidData } from "../../../apps/record/RecordUtils";
import '../css/leaveMsgList.scss';
import ScrollArea from 'react-scrollbar';
import TagData from "../data/TagData";
import LeaveExportComponent from "./LeaveExportComponent";
import {getConversationCount} from "../redux/consultReducer";
import {setRecordCommonTime} from "../redux/recordTimeReducer";
import {shallowEqual} from "../../../utils/MyUtil";

class LeaveMsgList extends React.Component {

    constructor(props)
    {
        super(props);

        this.state = {
            advancedSearchIsShow: false,
            isShowAllFilterData:false,
            isShowCommonUsedFilterData: false,
            tagsWidth: 0,
            commonUsedTagsWidth: 0
        };

        this.delTag = this.delTag.bind(this);
        this.delCommonUsedTag = this.delCommonUsedTag.bind(this);

        this.searchConditions = {};
        this.terminalMap = {
            0: "other", 1: "web", 2: "wechat", 3: "wap", 4: "IOS App", 5: "Android App", 6: "Weibo", 7: "AliPay"
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(nextState, this.state) || !shallowEqual(nextProps, this.props);
    }

    refreshColumnsArrFun()
    {
        let tableData = [],
            mainConsultColumns = [
                {
                    title: getLangTxt("rightpage_tab_leave_time"),
                    dataIndex: 'time',
                    key: 'time',
                    width: '15%',
                    render: (time) =>
                    {
                        return (
                            <span > { formatTimestamp(time, true) } </span>
                        );
                    }
                },
                {
                    title: getLangTxt("record_table_head_guest_name"),
                    dataIndex: 'guestname',
                    key: 'guestname',
                    width: '6%',
                    className: "leaveMsgTd",
                    render: (guestname, record) => {
                        let typeEle = document.querySelector(".leaveMsgTd"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            guestShowName = guestname || record.guestid || getLangTxt("fk"),
                            titleInfo = truncateToPop(guestShowName, titleWidth) || {};

                        return  titleInfo.show ?
                                    <Popover content={<div
                                        style={{maxWidth: "500px", wordBreak: 'break-word'}}>{guestShowName}</div>}
                                        placement="topLeft" trigger="hover">
                                    <span >
                                        { titleInfo.content}
                                        {
                                            record.forbidden === 1 ?
                                                <i className="iconfont icon-heimingdan"></i>  : null
                                        }
                                    </span>
                                    </ Popover>
                                    :
                                    <span >
                                    {guestShowName}
                                        {
                                            record.forbidden === 1 ?
                                                <i className="iconfont icon-heimingdan"></i>  : null
                                        }
                                </span>
                    }
                },
                {
                    title: getLangTxt("rightpage_tab_leave_startpage"),
                    dataIndex: 'startpagetitle',
                    key: 'startpagetitle',
                    width: '8%',
                    render: (startpagetitle, record) => (
                        startPageComp(record.startpageurl, record.startpagetitle)
                    )
                },
                {
                    title: getLangTxt("record_tml"),
                    dataIndex: 'terminal',
                    key: 'terminal',
                    width: '6%',
                    className: 'terminalTd',
                    render: (terminal) => {
                        let terminalSofar = terminal >= 0 && terminal <= 7 ? terminal : 0,
                            typeEle = document.querySelector(".terminalTd"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(this.terminalMap[terminalSofar], titleWidth) || {};

                        return titleInfo.show ?
                            <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{this.terminalMap[terminalSofar]}</div>}
                                placement="topLeft" trigger="hover">
                                <span > {titleInfo.content} </span>
                            </ Popover>
                            :
                            <span > {this.terminalMap[terminalSofar]} </span>
                    }
                },
                {
                    title: getLangTxt("record_location"),
                    dataIndex: 'city',
                    key: 'city',
                    width: '6%',
                    className: 'cityTd',
                    render: (city) => {
                        let typeEle = document.querySelector(".cityTd"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(city, titleWidth) || {};

                        return titleInfo.show ?
                            <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{city}</div>}
                                placement="topLeft" trigger="hover">
                                <span > { titleInfo.content} </span>
                            </ Popover>
                            :
                            <span > {city} </span>
                    }
                },
                {
                    title: getLangTxt("rightpage_tab_leave_content"),
                    dataIndex: 'content',
                    key: 'content',
                    width: '6%',
                    className: 'contentTd',
                    render: (content) =>
                    {
                        let typeEle = document.querySelector(".contentTd"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(content, titleWidth) || {};

                        return (
                            titleInfo.show ?
                                <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{content}</div>}
                                    placement="topLeft" trigger="hover">
                                    <span > { titleInfo.content } </span>
                                </ Popover>
                                :
                                <span > { content } </span>
                        )
                    }
                },
                {
                    title: getLangTxt("record_kf"),
                    dataIndex: 'kf',
                    key: 'kf',
                    width: '6%',
                    className: 'zeren',
                    render: (kf) =>
                    {
                        let kfStr = "暂无";

                        if(Array.isArray(kf) && kf.length > 0)
                        {
                            kfStr = '';

                            kfStr += kf.map(kf => {
                                return kf.nickname + "[" + kf.externalname + "]";
                            });
                        }

                        let typeEle = document.querySelector(".zeren"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(kfStr, titleWidth) || {};

                        return titleInfo.show ?
                            <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{kfStr}</div>}
                                placement="topLeft" trigger="hover">
                                <span > { titleInfo.content } </span>
                            </ Popover>
                            :
                            <span> {kfStr} </span>
                    }
                },
                {
                    title: getLangTxt("setting_blacklist_ip"),
                    dataIndex: 'ip',
                    key: 'ip',
                    width: '8%',
                    className: 'ipTd',
                    render: (ip) =>
                    {
                        let typeEle = document.querySelector(".ipTd"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(ip, titleWidth) || {};

                        return titleInfo.show ?
                            <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{ip}</div>}
                                placement="topLeft" trigger="hover">
                                <span > { titleInfo.content } </span>
                            </Popover>
                            :
                            <span> {ip} </span>
                    }
                },
                {
                    title: getLangTxt("record_table_head_guest_phone"),
                    dataIndex: 'phone',
                    key: 'phone',
                    width: '6%',
                    className: 'phone',
                    render: (phone) =>
                    {
                        let typeEle = document.querySelector(".phone"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(phone, titleWidth) || {};

                        return titleInfo.show ?
                            <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{phone}</div>}
                                placement="topLeft" trigger="hover">
                                <span > { titleInfo.content } </span>
                            </ Popover>
                            :
                            <span> {phone} </span>
                    }
                }
            ], dealedArr = [
                {
                    title: getLangTxt("record_dealed_time"),
                    dataIndex: 'proccesstime',
                    key: 'proccesstime',
                    width: '15%',
                    render: (proccesstime, record) =>
                    {
                        return (
                            <span > { record.isproccessed ? formatTimestamp(proccesstime, true) : "" } </span>
                        );
                    }
                },
                {
                    title: getLangTxt("rightpage_tab_deal_mode"),
                    dataIndex: 'proccessmethod',
                    key: 'proccessmethod',
                    width: '6%',
                    render: (proccessmethod, record) => (
                        <span>{ record.isproccessed ? this.getProccessmethodFun(proccessmethod) : "" }</span>
                    )
                },
                {
                    title: getLangTxt("rightpage_tab_leave_deal"),
                    dataIndex: 'supplier',
                    key: 'supplier',
                    width: '12%',
                    className: 'supplierTd',
                    render: (supplier, record) => {
                        let supplierStr = getLangTxt("noData5");

                        if(Array.isArray(supplier) && supplier.length > 0)
                        {
                            supplierStr = supplier.map(supplier => supplier.nickname).toString();

                            supplierStr += "[" + supplier.map(supplier => supplier.externalname).toString() + "]";
                        }

                        let typeEle = document.querySelector(".supplierTd"),
                            titleWidth = typeEle && typeEle.clientWidth,
                            titleInfo = truncateToPop(supplierStr, titleWidth) || {};

                        if (record.isproccessed)
                            return titleInfo.show ?
                                <Popover content={<div style={{maxWidth: "500px", wordBreak: 'break-word'}}>{supplierStr}</div>}
                                    placement="topLeft" trigger="hover">
                                    <span > { titleInfo.content } </span>
                                </ Popover>
                                :
                                <span> {supplierStr} </span>
                        return null
                    }
                }
            ];

        tableData = mainConsultColumns.concat(dealedArr);

        return tableData;
    }

    componentWillReceiveProps(nextProps)
    {
        if(nextProps.type !== this.props.type)
        {
            this.setState({
                advancedSearchIsShow: false
            })
        }
    }

    /*获取处理方式的类型*/
    getProccessmethodFun(processmethod)
    {
        let processmethodText = getLangTxt("record_untreated");

        if(processmethod === 1)
        {
            processmethodText = getLangTxt("record_message");
        }
        else if(processmethod === 2)
        {
            processmethodText = getLangTxt("rightpage_tab_email");
        }
        else if(processmethod === 3)
        {
            processmethodText = getLangTxt("other");
        }
        return processmethodText;
    }

    jumpToDetailClick(record)
    {
        let {guestid, id, isproccessed} = record;

        this.props.clearMessageTip();
        this.props.getLeaveDetail(guestid, id);
        this.props.setPageRoute("record_detail", isproccessed);
    }

    get leaveMsgList()
    {
        return this.getData("data");
    }

    get total()
    {
        return this.getData("total") || 0;
    }

    get progress()
    {
        return this.getData("progress");
    }

    get isproccessed()
    {
        // return this.props.type === LeaveMessage.DEALED;
        return this.getData("isproccessed");
    }

    get currentPage()
    {
        return this.getData("currentPage");
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
            key = /*this.isproccessed ? */"leaveDealedMsg"/* : "leavePendingMsg"*/;

        return leaveMsgData.getIn([key, key2]);
    }

    reFreshFn()
    {
        if (this.props.type != undefined)
        {

            this.props.getLeaveMsgList(this.isproccessed, this.extra.search, this.extra);
        }
        else
        {
            this.props.getLeaveMsgList(this.isproccessed, this.extra.search, this.extra, true);
        }
    }

    //分页响应事件
    selectOnChange(page)
    {
        let obj = {...this.extra.search, page},
            leaveMsgTime = this.leaveMsgTime;

        if (this.props.type != undefined)
        {
            let {search = {}} = this.extra;
            obj = {
                page: page,
                ...leaveMsgTime
            };

            this.props.getLeaveMsgList(this.isproccessed, obj, this.extra);
        }
        else
        {
            this.props.getLeaveMsgList(this.isproccessed, obj, this.extra, true);
        }
    }

    /*点击筛选图标*/
    advancedSearchFun()
    {
        this.setState({
            advancedSearchIsShow: !this.state.advancedSearchIsShow
        })
    }

    setRecordCommonTime(startTamp, endTamp, selectValue)
    {
        let recordObj = {
                startTime: parseInt(startTamp),
                endTime: parseInt(endTamp)
            },
            leaveMsgObj = {
                time: [
                    {
                        "sign": ">=",
                        "value": parseInt(startTamp)
                    },
                    {
                        "sign": "<=",
                        "value": parseInt(endTamp)
                    }
                ]
            };

        this.props.setRecordCommonTime(recordObj, leaveMsgObj, selectValue);
    }

    /*日期确定的事件*/
    onOk(time, endTamp, selectValue)
    {

        let obj = {
            page: 1,
            time: [
                {
                    "sign": ">=",
                    "value": parseInt(time)
                },
                {
                    "sign": "<=",
                    "value": parseInt(endTamp)
                }
            ]
        },
            countObj = {
                startTime: parseInt(time),
                endTime: parseInt(endTamp)
            };

        if (this.isproccessed != undefined && typeof (this.isproccessed) == "number")
        {
            this.props.getLeaveMsgList(this.isproccessed, obj, {selectValue});
        }else
        {
            Object.assign(this.extra.search, obj);
            this.props.getLeaveMsgList(this.isproccessed, this.extra.search, {selectValue}, true);
        }

        this.setRecordCommonTime(time, endTamp, selectValue);
        this.props.getConversationCount(countObj);
    }

    get selectedConditions()
    {
        const {leaveMsgData} = this.props;

        return leaveMsgData.get("selectedConditions") || [];
    }

    get commonUsedConditions()
    {
        let {leaveMsgData} = this.props,
            commonUsedArr = leaveMsgData.get("commonUsed"),
            format = [];

        if (Array.isArray(commonUsedArr) && commonUsedArr.length > 0)
            commonUsedArr.map(item => {
                let tagData = new TagData();
                tagData.key = item.id;
                tagData.key2 = item.searchName;
                tagData.value = item.searchName;
                tagData.searchKey = 'commonUsed';
                tagData.isKey = false;
                tagData.selectedConditions = JSON.parse(item.searchContent);
                format.push(tagData);
            });

        return format;
    }

    getWidth(width)
    {
        if ( width !== 0)
            this.setState({tagsWidth: width});
    }

    getCommonUsedWidth(width)
    {
        if ( width !== 0)
            this.setState({commonUsedTagsWidth: width});
    }

    //点击展开筛选条件列表
    isShowAllFilterData(isShowAllFilterData)
    {
        this.setState({isShowAllFilterData: !isShowAllFilterData});
    }

    //点击展开常用搜索筛选条件列表
    isShowCommonUsedFilterData(isShowCommonUsedFilterData)
    {
        this.setState({isShowCommonUsedFilterData: !isShowCommonUsedFilterData})
    }

    regionFilterFn(data, tag)
    {
        let {key} = data,
            {searchKey} = tag;

        return key === searchKey;
    }

    getSearchQueryData(allQueryObj, selectedConditions)
    {
        searchMap.forEach(data => {
            let filterO = selectedConditions.filter(this.regionFilterFn.bind(this, data)),
                filterItem = filterO.length && filterO[0];

            if (data.type === 1)
            {
                allQueryObj[data.commitKey || data.key] = filterItem.value || "";
            }else if (data.type === 3)
            {
                allQueryObj[data.commitKey || data.key] = filterItem.key2;
            }
            else
            {
                allQueryObj[data.commitKey || data.key] = filterO.map(tag =>
                {
                    let tagData = new TagData();

                    for (let key in tag)
                    {
                        tagData[key] = tag[key];
                    }

                    return tagData.getKey();
                });
            }
        });
    }

    /*点击搜索按钮*/
    onAdvancedSearchOk(selectedConditions, startTamp, endTamp, selectValue)
    {
        let leaveMsgTime = this.leaveMsgTime,
            {startTime, endTime} = this.consultTime,
            {path} = this.props,
            countObj = {
                startTime: startTamp || startTime,
                endTime: endTamp || endTime
            };

        if (startTamp && endTamp)
        {
            this.searchConditions.time = [
                {"sign": ">=", "value": parseInt(startTamp)},
                {"sign": "<=", "value": parseInt(endTamp)}
            ];
            this.setRecordCommonTime(startTamp, endTamp, selectValue);
        }else
        {
            Object.assign(this.searchConditions, leaveMsgTime)
        }

        this.searchConditions.page = 1;
        this.setState({advancedSearchIsShow: !this.state.advancedSearchIsShow, thePage: 1});

        if(!selectValue && selectValue != '')
            selectValue = this.selectedValue;

        this.getSearchQueryData(this.searchConditions, selectedConditions);

        removeInvalidData(this.searchConditions);

        this.props.route([path[0], {key: "searchLeaveMsg"}]);
        this.props.updateSelectedConditions(selectedConditions);
        this.props.getConversationCount(countObj);
        this.props.getLeaveMsgList(this.isproccessed, this.searchConditions, {selectValue}, true);
        this.advancedSearchFun();
    }

    /*清空已选择的搜索条件*/
    emptySelectedConditions()
    {
        let leaveMsgTime = this.leaveMsgTime,
            selectedConditions = List(),
            obj={
                page: 1,
                ...leaveMsgTime
            };

        this.props.updateSelectedConditions(selectedConditions);

        this.props.getLeaveMsgList(this.isproccessed, obj, this.extra, true);
    }

    /*删除常用话术tag*/
    delCommonUsedTag(key)
    {
        Modal.confirm({
            title: getLangTxt("del_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            content: getLangTxt("record_del_common_search"),
            onOk: () =>
            {
                let {leaveMsgData} = this.props,
                    commonUsedArr = leaveMsgData.get("commonUsed");

                if(Array.isArray(commonUsedArr) && commonUsedArr.length > 0)
                {
                    let delIndex = commonUsedArr.findIndex(item => item.id === key);

                    if (delIndex > -1)
                    {
                        commonUsedArr.splice(delIndex, 1);
                        // this.props.updateCommonUsedConditions(this.commonUsedConditions);
                        this.props.deleteCommonUsedConditions(key);
                        this.forceUpdate();
                    }
                }
            }
        })
    }

    /*删除tag函数*/
    delTag(key)
    {
        let leaveMsgTime = this.leaveMsgTime,
            selectedConditions = this.selectedConditions,
            index = selectedConditions.findIndex(tag => tag.key === key);

        Object.assign(this.searchConditions, leaveMsgTime);

        if(index > -1)
        {
            selectedConditions.splice(index, 1);

            this.props.updateSelectedConditions(selectedConditions);

            this.getSearchQueryData(this.searchConditions, selectedConditions);

            removeInvalidData(this.searchConditions);

            let {path} = this.props;

            this.props.route([path[0], {key: "searchLeaveMsg"}]);
            this.props.getLeaveMsgList(this.isproccessed, this.searchConditions, this.extra, true);
        }
    }

    /*点击已保存常用搜索*/
    handleCommonSearch(tagInfo)
    {
        let leaveMsgTime = this.leaveMsgTime,
            selectValue = this.selectedValue,
            {search} = this.extra,
            selectedConditions = leaveMsgTime;

        if (tagInfo)
        {
            this.props.updateSelectedConditions(tagInfo.selectedConditions);
            this.setState({clickedSearchTag: tagInfo})
        }

        selectedConditions.page = 1;

        this.getSearchQueryData(selectedConditions, tagInfo.selectedConditions);

        removeInvalidData(selectedConditions);

        let {path} = this.props;

        this.props.route([path[0], {key: "searchLeaveMsg"}]);
        this.props.getLeaveMsgList(this.isproccessed, selectedConditions, {selectValue}, true);
    }

    get consultTime()
    {
        const {getRecordCommonTime} = this.props,
            consultTime = getRecordCommonTime.get("consultTime");

        if (Map.isMap(consultTime))
            return consultTime.toJS();

        return consultTime
    }

    get leaveMsgTime()
    {
        const {getRecordCommonTime} = this.props,
            consultTime = getRecordCommonTime.get("leaveMsgTime");

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
        let {leaveSearch} = this.props,
            progress = this.progress,
            columnsArr = this.refreshColumnsArrFun(),
            widthMore = false,
            commonUsedWidthMore = false,
            className = "",
            commonUsedClassName = '',
            filterDataBox = document.getElementById("leaveMsgListTags"),
            commonUsedFilterDataBox = document.getElementById("leaveMsgListCommonUsedTags"),
            filterWrapBox = document.getElementsByClassName("filterWrap")[0],
            {
                advancedSearchIsShow,
                isShowAllFilterData, commonUsedTagsWidth,
                isShowCommonUsedFilterData, tagsWidth
            } = this.state,
            leaveMsgTime = this.leaveMsgTime,
            {time} = leaveMsgTime,
            startTime = time[0].value,
            endTime = time[1].value,
            selectedRangeTime = [moment(startTime), moment(endTime)];

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        if (filterDataBox && filterWrapBox)
            widthMore = tagsWidth > filterWrapBox.clientWidth - 260;

        if (commonUsedFilterDataBox && filterWrapBox)
            commonUsedWidthMore = commonUsedTagsWidth > filterWrapBox.clientWidth - 400;

        if (!isShowAllFilterData)
        {
            filterDataBox && filterDataBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            filterDataBox && filterDataBox.setAttribute("class", "selectedBox showExtra");
        }

        if (!isShowCommonUsedFilterData)
        {
            commonUsedFilterDataBox && commonUsedFilterDataBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            commonUsedFilterDataBox && commonUsedFilterDataBox.setAttribute("class", "selectedBox showExtra");
        }

        className = !widthMore || isShowAllFilterData ? "showExtra" : "hideExtra";
        commonUsedClassName = !commonUsedWidthMore || isShowCommonUsedFilterData ? "showExtra" : "hideExtra";

        return (
            <div className="leaveMsgWrapper">
                <HeadBreadcrumb MenuData={{parentMenu: getLangTxt("record_all_leave_msg"), childMenu: this.isproccessed ? getLangTxt("record_dealed") : getLangTxt("record_pending")}}
                    time={selectedRangeTime} selectedValue={this.selectedValue}
                    _onOk={this.onOk.bind(this)}
                    path={this.props.path}
                    reFreshFn={this.reFreshFn.bind(this)}/>
                <ScrollArea  speed={1} style={{height: 'calc(100% - 0.192rem - 29px)', zIndex: 1}} horizontal={false} smoothScrolling>
                    <div className="filterWrap">
                        {
                            leaveSearch ?
                                <div className="listSelectedWrap">
                                    <div className="item">
                                        <label>{getLangTxt("record_common_search")}：</label>
                                        <Tags
                                            onClick={this.handleCommonSearch.bind(this)}
                                            tags={this.commonUsedConditions} delDataFn={this.delCommonUsedTag}
                                            getWidth={this.getCommonUsedWidth.bind(this)} classname={commonUsedClassName}
                                            idnames="leaveMsgListCommonUsedTags"
                                        />
                                        {
                                            commonUsedWidthMore ?
                                                <a className="stretch" onClick={this.isShowCommonUsedFilterData.bind(this, isShowCommonUsedFilterData)}>
                                                    {isShowCommonUsedFilterData ? getLangTxt("setting_webview_takeup") : getLangTxt("setting_webview_open")}
                                                </a> : null
                                        }
                                    </div>
                                    <div className="item">
                                        <label>{getLangTxt("record_selected_conditions")}：</label>
                                        <Tags tags={this.selectedConditions} delDataFn={this.delTag} getWidth={this.getWidth.bind(this)} classname={className} idnames="leaveMsgListTags"/>
                                        {
                                            widthMore && !List.isList(this.selectedConditions) &&  this.selectedConditions.length > 0 ?
                                                <a className="stretch" onClick={this.isShowAllFilterData.bind(this, isShowAllFilterData)}>
                                                    {isShowAllFilterData ? getLangTxt("setting_webview_takeup") : getLangTxt("setting_webview_open")}
                                                </a> : null
                                        }
                                        {
                                            !List.isList(this.selectedConditions) &&  this.selectedConditions.length > 0 ?
                                                <a className="empty" onClick={this.emptySelectedConditions.bind(this)}>{getLangTxt("clear")}</a> : null
                                        }
                                    </div>

                                </div> : null
                        }

                        <LeaveExportComponent search={this.extra.search}/>

                        {
                            leaveSearch ?
                                <SearchComponent advancedSearchFun={this.advancedSearchFun.bind(this)}/>
                                : null
                        }
                    </div>
                    <NTTableWithPageRecord currentPage={this.currentPage} columns={columnsArr} pageSize={10}
                        total={this.total} dataSource={this.leaveMsgList}
                        selectOnChange={this.selectOnChange.bind(this)}
                        onRowClick={this.jumpToDetailClick.bind(this)}/>
                </ScrollArea>
                {
                    getProgressComp(progress)
                }
                {
                    advancedSearchIsShow ?
                        <div>
                            <div className="advancedSearchContainer" onClick={this.advancedSearchFun.bind(this)}></div>
                            <LeaveMsgAdvancedSearch selectedValue={this.selectedValue}
                                time={selectedRangeTime}
                                isproccessed={this.isproccessed}
                                selectedConditions={this.selectedConditions}
                                commonSearchName={this.commonUsedConditions}
                                onCancel={this.advancedSearchFun.bind(this)}
                                onOk={this.onAdvancedSearchOk.bind(this)}
                            />
                        </div> : null
                }
            </div>
        );
    }
}

const searchMap = [
    {key: "guestname"},
    {key: "ip"},
    {key: "kfid"},
    {key: "proccessmethod"},
    {key: "terminal"},
    {key: "isproccessed", type: 3},
    {key: "startpageurl", type: 1}
];

function mapStateToProps(state)
{
    let {leaveMsgReducer: leaveMsgData, startUpData, getRecordCommonTime} = state,
        recordFunc = startUpData.get("record") || {},
        communicationRecored = startUpData.get("communicationRecored") || {},
        {leaveSearch} = recordFunc;

    return {leaveMsgData, leaveSearch, getRecordCommonTime};
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        setPageRoute, getLeaveMsgList,
        getLeaveDetail, clearMessageTip,
        updateSelectedConditions, updateCommonUsedConditions,
        queryCommonUsedConditions, deleteCommonUsedConditions, getConversationCount,
        setRecordCommonTime
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveMsgList);
