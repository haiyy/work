import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  Popover, Button } from 'antd';
import ScrollArea from 'react-scrollbar';
import { List, Map } from "immutable";
import NTTableWithPageRecord from "../../../components/NTTableWithPageRecord";
import HeadBreadcrumb from '../../../components/HeadBreadcrumb.js';
import { formatTimestamp, getProgressComp, formatTime, getATag, loginUserProxy, getLangTxt } from "../../../utils/MyUtil";
import { setPageRoute, getConsultList, getConsultDetail, queryCommonUsedConditions, updateSelectedConditions, updateCommonUsedConditions, deleteCommonUsedConditions, getTableHeader } from "../redux/consultReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import SearchComponent from "../public/SearchComponent";
import AdvancedSearchRefactor from "../consult/AdvancedSearchRefactor";
import ExportComponent from "./ExportComponent";
import Tags from "../public/Tags";
import moment from 'moment';
import TagData from "../data/TagData";
import "../../../public/styles/record/ConsultList.scss";
import { removeInvalidData } from "../../../apps/record/RecordUtils";
import RecordFormatType from "../RecordFormatType";
import UserDefinedExport from "./UserDefinedExport";
import UserDefinedShow from "./UserDefinedShow";
import { truncateToPop } from "../../../utils/StringUtils";
import SearchByShopComp from "../public/SearchByShopComp";
import {getConversationCount} from "../redux/consultReducer";
import {setRecordCommonTime} from "../redux/recordTimeReducer";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class ConsultList extends React.PureComponent {

    constructor(props)
    {
        super(props);

        this.state = {
            visible: false,
            advancedSearchIsShow: false,
            isShowAllFilterData: false,
            isShowCommonUsedFilterData: false,
            tagsWidth: 0,
            commonUsedTagsWidth: 0,
            commonSearchName: null,
            clickedSearchTag: {}
        };

        this.searchConditions = {};

        this.delTag = this.delTag.bind(this);
        this.delCommonUsedTag = this.delCommonUsedTag.bind(this);
    }

    componentDidMount()
    {
        this.props.getTableHeader();
        this.props.queryCommonUsedConditions();
    }

    componentWillReceiveProps(nextProps)
    {
        if(nextProps.type !== this.props.type)
            this.setState({
                advancedSearchIsShow: false
            })
    }

    get clientWidth()
    {
        let recordTableEle = document.getElementsByClassName('recordTable');

        if(recordTableEle && recordTableEle[0])
        {
            return recordTableEle[0].clientWidth;
        }

        return 0;
    }

    /**********************表格数据*************************/
    getColumns()
    {
        let arr = this.getTableHeader,
            newArr = [],
            totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0),
            tableWidth = this.clientWidth,
            isPercent = tableWidth > totalWidth && false;

        arr.map(item => {
            let {fieldName, key, width = '100', format} = item,
                cwidth = this.getColumnWidth(width, isPercent, tableWidth),
                itemObj = {
                    title: fieldName,
                    dataIndex: key,
                    key: key,
                    width: cwidth,
                    render: (text, record) => {
                        return this.getTdContent(text, format, cwidth);
                    }
                };

            newArr.push(itemObj);
        });

        return newArr;
    }

    getColumnWidth(itemWidth, isPercent, totalWidth)
    {
        return isPercent ? itemWidth / totalWidth * 100 + '%' : itemWidth;
    }

    get totalWidth()
    {
        let arr = this.getTableHeader,
            totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0);

        if(totalWidth > this.clientWidth)
        {
            return totalWidth;
        }

        return this.clientWidth;
    }

    getTdContent(text, format, width)
    {
        let comp = '',
            value,
            truncateToPopInfo = {};

        switch(format)
        {
            case RecordFormatType.STRING:
                truncateToPopInfo = truncateToPop(text, width*2 - 4);

                comp = truncateToPopInfo&&truncateToPopInfo.show ?
                    <Popover content={<div style={{width: '100px',height:'auto',wordWrap: 'break-word'}}>{text}</div>} placement="topLeft">
                        <span>{truncateToPopInfo.content}</span>
                    </Popover>
                    :
                    <span>{text}</span>;
                break;

            case RecordFormatType.PERCENT:
                comp = <span>{text * 100 + '%'}</span>;
                break;

            case RecordFormatType.INT:
                value = text < 0 ? "会话进行中" : text;

                comp = <span>{value}</span>;
                break;

            case RecordFormatType.ARRAY:
                truncateToPopInfo = truncateToPop(text.toString(), width*2 - 4);

                comp = truncateToPopInfo.show ?
                    <Popover content={<div style={{width: '100px',height:'auto',wordWrap: 'break-word'}}>{text}</div>} placement="topLeft">
                        <span>{truncateToPopInfo.content}</span>
                    </Popover>
                    :
                    <span>{text.toString()}</span>;
                break;

            case RecordFormatType.TIME:
                let time = Math.round(text / 1000);
                value = text < 0 ? "会话进行中" : formatTime(time);

                comp = <span>{value}</span>;
                break;

            case RecordFormatType.DATE:
                comp = <span>{formatTimestamp(text, true)}</span>;
                break;

            case RecordFormatType.LINK:
                comp = this.getPage(text);
                break;

            case RecordFormatType.ACTION:
                //comp = <span>{text}</span>;
                break;

        }
        return comp;
    }

    getPage(value)
    {
        let {url, title} = value;

        return getATag(url, title);
    }

    /*进入详情页面的点击事件*/
    jumpToDetailClick(record)
    {
        let {converId} = record;

        this.props.setPageRoute('consult_detail');//切换到详情页面

        if(converId)
        {
            this.props.getConsultDetail(converId);//获取详情列表
            this.props.setPageRoute("consult_detail");
        }
    }

    /*分页响应事件*/
    selectOnChange(pageNo)
    {
        let obj = {...this.extra.search, pageNo},
            consultTime = this.consultTime;

        if (this.isEffective != undefined)
        {
            let countObj = {
                pageNo: pageNo,
                ...consultTime
            };

            this.props.getConsultList(this.isEffective, countObj, this.extra);
        }else
        {
            this.props.getConsultList(this.isEffective, obj, this.extra, true);
        }
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
    onOk(startTamp, endTamp, selectValue)
    {
        let obj = {
                ...this.extra.search,
                pageNo: 1,
                startTime: parseInt(startTamp),
                endTime: parseInt(endTamp)
            },
            extra = {
                ...obj,
                selectValue
            },
            countObj = {
                startTime: parseInt(startTamp),
                endTime: parseInt(endTamp)
            };

        if (this.isEffective != undefined)
        {
            obj = {
                pageNo: 1,
                startTime: parseInt(startTamp),
                endTime: parseInt(endTamp)
            };

            this.props.getConsultList(this.isEffective, obj, extra);
        }else
        {
            this.props.getConsultList(this.isEffective, obj, extra, true);
        }

        this.setRecordCommonTime(startTamp, endTamp, selectValue);
        this.props.getConversationCount(countObj);
    }

    get consultList()
    {
        return this.getData("data");
    }

    get total()
    {
        return this.getData("total");
    }

    get progress()
    {
        return this.getData("progress");
    }

    get currentPage()
    {
        return this.getData("currentPage");
    }

    get extra()
    {
        return this.getData("extra") || {};
    }

    get isEffective()
    {
        return this.props.type;
    }

    getData(key2)
    {
        let {consultData} = this.props,
            key ="validConsult";

        return consultData.getIn([key, key2]);
    }

    reFreshFn()
    {
        let obj = {}, isSearch = this.isEffective == undefined,
            {search} = this.extra;

        if (search)
        {
            obj = {
                startTime: search.startTime,
                endTime: search.endTime
            }
        }

        this.props.getConsultList(this.isEffective, this.extra.search, this.extra, isSearch);

        this.props.getConversationCount(obj);

    }

    /*点击筛选图标*/
    onAdvancedSearchCancel()
    {
        this.setState({
            advancedSearchIsShow: !this.state.advancedSearchIsShow
        })
    }

    /*搜索函数*/
    onAdvancedSearchOk(selectedConditions, startTamp, endTamp, selectValue)
    {
        let {startTime, endTime} = this.consultTime,
            timeBegin = startTamp || startTime,
            timeEnd = endTamp || endTime;

        this.setState({advancedSearchIsShow: !this.state.advancedSearchIsShow});

        this.props.updateSelectedConditions(selectedConditions);

        this.searchConditions.pageNo = 1;

        if(!selectValue && selectValue != '')
            selectValue = this.selectedValue;

        // this.searchConditions.merchantIds = this.extra.search.merchantIds;

        if(timeBegin)
            this.searchConditions.startTime = parseInt(timeBegin);

        if(timeEnd)
            this.searchConditions.endTime = parseInt(timeEnd);


        this.setRecordCommonTime(timeBegin, timeEnd, selectValue);

        this.getSearchQueryData(this.searchConditions, selectedConditions);

        // this.searchConditions["customer.customerName"] =
        removeInvalidData(this.searchConditions);

        let {path} = this.props,
            countObj = {
                startTime: timeBegin,
                endTime: timeEnd
            };

        this.props.route([path[0], path[1]]);

        this.props.getConsultList(this.isEffective, this.searchConditions, {selectValue}, true);
        this.props.getConversationCount(countObj);
    }

    /*取消导出弹框*/
    handleCancel(e)
    {
        this.setState({
            visible: false
        });
    }

    /*点击已保存常用搜索*/
    handleCommonSearch(tagInfo)
    {
        let consultTime = this.consultTime,
            {startTime, endTime} = consultTime,
            selectValue = this.selectedValue,
            selectedConditions = {};

        if(tagInfo)
        {
            this.props.updateSelectedConditions(tagInfo.selectedConditions);
            this.setState({clickedSearchTag: tagInfo})
        }
        selectedConditions.startTime = startTime;
        selectedConditions.endTime = endTime;
        selectedConditions.pageNo = 1;
        // selectedConditions.merchantIds = this.extra.merchantIds;

        this.getSearchQueryData(selectedConditions, tagInfo.selectedConditions);

        removeInvalidData(selectedConditions);

        let {path} = this.props;

        this.props.route([path[0], path[1]]);

        this.props.getConsultList(this.isEffective, selectedConditions, {selectValue}, true);
    }

    /*删除常用话术tag*/
    delCommonUsedTag(key)
    {
        confirm({
            title: '删除提示',
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            content: '是否确定删除该常用搜索？',
            onOk: () => {
                let {consultData} = this.props,
                    commonUsedArr = consultData.get("commonUsed");

                if(Array.isArray(commonUsedArr) && commonUsedArr.length > 0)
                {
                    let delIndex = commonUsedArr.findIndex(item => item.id === key);

                    if(delIndex > -1)
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

    getSearchQueryData(allQueryObj, selectedConditions)
    {

        searchMap.forEach(data => {
            let filterO = selectedConditions.filter(this.regionFilterFn.bind(this, data)),
                filterItem = filterO.length && filterO[0];

            if (data.type === 1)
            {
                allQueryObj[data.commitKey] = filterItem.value || "";
            }else if (data.type === 2)
            {
                let queryObj = {
                    sign: filterItem.signKey,
                    content: filterItem.valueKey
                };

                if (filterItem.isTime)
                {
                    queryObj.content = filterItem.isTime === "分" ? filterItem.valueKey * 60 * 1000 : filterItem.valueKey * 1000;
                }

                allQueryObj[data.commitKey] = queryObj.sign ? queryObj : "";
            }
            else if (data.type === 3)
            {
                allQueryObj[data.commitKey] = filterItem.key2 || "";
            }
            else
            {
                allQueryObj[data.commitKey || data.key] = filterO.map(tag =>
                {
                    if(data.key === "region"/* || data.key === "terminal"*/)
                        return tag.value;

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

    /*删除tag函数*/
    delTag(key)
    {
        let consultTime = this.consultTime,
            {startTime, endTime} = consultTime,
            selectedConditions = this.selectedConditions,
            index = selectedConditions.findIndex(tag => tag.key === key),
            {search = {pageNo: 1}} = this.extra,
            selectValue = this.selectedValue,
            {pageNo} = search;

        this.searchConditions = {
            pageNo: pageNo || 1
        };

        // this.searchConditions.merchantIds = this.extra.search.merchantIds;

        if(!this.searchConditions.starttime)
        {
            if(startTime)
                this.searchConditions.startTime = parseInt(startTime);

            if(endTime)
                this.searchConditions.endTime = parseInt(endTime);
        }

        if(index > -1)
        {
            selectedConditions.splice(index, 1);

            this.props.updateSelectedConditions(selectedConditions);

            this.getSearchQueryData(this.searchConditions, selectedConditions);

            removeInvalidData(this.searchConditions);

            let {path} = this.props;

            this.props.route([path[0], path[1]]);

            this.props.getConsultList(this.isEffective, this.searchConditions, {selectValue}, true);
        }
    }

    get selectedConditions()
    {
        const {consultData} = this.props;

        return consultData.get("selectedConditions") || [];
    }

    get commonUsedConditions()
    {
        let {consultData} = this.props,
            commonUsedArr = consultData.get("commonUsed"),
            format = [];

        if(Array.isArray(commonUsedArr) && commonUsedArr.length > 0)
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

    get getTableHeader()
    {
        const {consultData} = this.props;

        return consultData.get("headerList") || [];
    }

    regionFilterFn(data, tag)
    {
        let {key} = data,
            {searchKey} = tag;

        return key === searchKey;
    }

    //点击展开筛选条件列表
    isShowAllFilterData(isShowAllFilterData)
    {
        this.setState({isShowAllFilterData: !isShowAllFilterData})
    }

    //点击展开常用搜索筛选条件列表
    isShowCommonUsedFilterData(isShowCommonUsedFilterData)
    {
        this.setState({isShowCommonUsedFilterData: !isShowCommonUsedFilterData})
    }

    getWidth(width)
    {
        if(width !== 0)
            this.setState({tagsWidth: width});
    }

    getCommonUsedWidth(width)
    {
        if(width !== 0)
            this.setState({commonUsedTagsWidth: width});
    }

    /*清空已选择的搜索条件*/
    emptySelectedConditions()
    {
        let consultTime = this.consultTime,
            {startTime, endTime} = consultTime,
            selectedConditions = List();

        if(!this.searchConditions.startTime)
        {
            if(startTime)
                this.searchConditions.startTime = parseInt(startTime);

            if(endTime)
                this.searchConditions.endTime = parseInt(endTime);
        }

        // this.searchConditions.merchantIds = this.extra.merchantIds;

        this.props.updateSelectedConditions(selectedConditions);

        let {path} = this.props;

        this.props.route([path[0], path[1]]);

        this.props.getConsultList(this.isEffective, consultTime, this.extra, true);
    }

    /*点击打开导出页面*/
    handleOpenExportPage(isShowExportPage)
    {
        this.setState({isShowExportPage});
    }

    handleShowContent()
    {
        let {isShowDefinePage} = this.state;
        this.setState({isShowDefinePage: !isShowDefinePage})
    }

    getShopIdList(merchantIds)
    {
        let selectValue = this.selectedValue,
            obj = {
                ...this.extra.search
            },
            extra = {
                ...this.extra.search,
                selectValue
            };
        delete obj.merchantIds;
        delete extra.merchantIds;

        if (merchantIds)
        {
            obj = {
                ...this.extra.search,
                merchantIds
            };
            extra = {
                ...this.extra.search,
                merchantIds,
                selectValue
            };
        }

        this.setState({merchantIds});

        let {path} = this.props;

        this.props.route([path[0], path[1]]);

        this.props.getConsultList(this.isEffective, obj, extra, true);
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
        let progress = this.progress,
            widthMore = false,
            commonUsedWidthMore = false,
            className = "",
            commonUsedClassName = '',
            filterDataBox = document.getElementById("consultListtags"),
            commonUsedFilterDataBox = document.getElementById("consultListCommonUsed"),
            filterWrapBox = document.getElementsByClassName("filterWrap")[0],
            mainConsultColumns = this.getColumns(),
            {isShowExportPage, isShowDefinePage, isShowSearchShop, merchantIds} = this.state,
            {siteId = ""} = loginUserProxy(),
            siteIdArr = siteId.split("_"),
            isShowShopSearch = siteIdArr[0] !== "kf" && siteIdArr[1] === "1000";

        const {
            advancedSearchIsShow, isShowAllFilterData,
            clickedSearchTag,
            isShowCommonUsedFilterData, tagsWidth,
            commonUsedTagsWidth
        } = this.state,
            consultTime = this.consultTime,
            {startTime, endTime} = consultTime,
            searchTime = [moment(startTime), moment(endTime)],
            selectValue = this.selectedValue;

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        if(filterDataBox && filterWrapBox)
            widthMore = tagsWidth > filterWrapBox.clientWidth - 390;//290

        if(commonUsedFilterDataBox && filterWrapBox)
            commonUsedWidthMore = commonUsedTagsWidth > filterWrapBox.clientWidth - 400;//290

        if(!isShowAllFilterData)
        {
            filterDataBox && filterDataBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            filterDataBox && filterDataBox.setAttribute("class", "selectedBox showExtra");
        }

        if(!isShowCommonUsedFilterData)
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
            <div className="consultList">
                <HeadBreadcrumb MenuData={{parentMenu: getLangTxt("record_online_record"), childMenu: this.isEffective ? getLangTxt("record_valid_consult") : getLangTxt("record_invalid_consult")}}
                    selectedValue={selectValue}
                    time={searchTime}
                    path={this.props.path}
                    _onOk={this.onOk.bind(this)} reFreshFn={this.reFreshFn.bind(this)}/>
                {
                    isShowShopSearch ?
                        <SearchByShopComp getShopIdList={this.getShopIdList.bind(this)} queryType={1}/> : null
                }
                <ScrollArea speed={1} style={{height: 'calc(100% - 0.192rem - 29px)', zIndex: 1}} horizontal={false}
                    smoothScrolling>
                    <div className="filterWrap">
                        {
                            this.props.converAdvancedSearch ?
                                <div className="listSelectedWrap">
                                    <div className="item">
                                        <label>{getLangTxt("record_common_search")}：</label>
                                        <Tags onClick={this.handleCommonSearch.bind(this)}
                                            tags={this.commonUsedConditions} delDataFn={this.delCommonUsedTag}
                                            getWidth={this.getCommonUsedWidth.bind(this)}
                                            classname={commonUsedClassName} idnames="consultListCommonUsed"/>
                                        {
                                            commonUsedWidthMore ?
                                                <a className="stretch"
                                                    onClick={this.isShowCommonUsedFilterData.bind(this, isShowCommonUsedFilterData)}>
                                                    {isShowCommonUsedFilterData ? getLangTxt("setting_webview_takeup") : getLangTxt("setting_webview_open")}
                                                </a> : null
                                        }
                                    </div>
                                    <div className="item">
                                        <label>{getLangTxt("record_selected_conditions")}：</label>
                                        <Tags tags={this.selectedConditions} delDataFn={this.delTag}
                                            getWidth={this.getWidth.bind(this)}
                                            classname={className} idnames="consultListtags"/>
                                        {
                                            widthMore && !List.isList(this.selectedConditions) && this.selectedConditions.length > 0 ?
                                                <a className="stretch"
                                                    onClick={this.isShowAllFilterData.bind(this, isShowAllFilterData)}>
                                                    {isShowAllFilterData ? getLangTxt("setting_webview_takeup") : getLangTxt("setting_webview_open")}
                                                </a> : null
                                        }
                                        {
                                            !List.isList(this.selectedConditions) && this.selectedConditions.length > 0 ?
                                                <a className="empty"
                                                    onClick={this.emptySelectedConditions.bind(this)}>{getLangTxt("clear")}</a> : null
                                        }
                                    </div>
                                </div> : null
                        }
                        {
                            this.props.converAdvancedSearch ?
                                <SearchComponent advancedSearchFun={this.onAdvancedSearchCancel.bind(this)}/>
                                : null
                        }
                        {
                            this.props.converExport ?
                                <ExportComponent search={this.extra.search} handleOpenExportPage={this.handleOpenExportPage.bind(this)}/>
                                : null
                        }
                        <Button type="primary" className="showContentBtn" onClick={this.handleShowContent.bind(this)}>{getLangTxt("kpi_select_content")}</Button>
                        {
                            isShowDefinePage? <UserDefinedShow
                                handleOpenExportPage={this.handleShowContent.bind(this)}
                                refreshList={this.selectOnChange.bind(this)}
                            /> : null
                        }
                        {

                            isShowExportPage ? <UserDefinedExport handleOpenExportPage={this.handleOpenExportPage.bind(this)} search={this.extra.search}/> : null
                        }
                    </div>

                    <NTTableWithPageRecord currentPage={this.currentPage} total={this.total} scrollX={this.totalWidth}
                        columns={mainConsultColumns} dataSource={this.consultList}
                        selectOnChange={this.selectOnChange.bind(this)}
                        onRowClick={this.jumpToDetailClick.bind(this)}/>
                </ScrollArea>
                {
                    getProgressComp(progress)
                }
                {
                    advancedSearchIsShow ?
                        <div>
                            <div className="advancedSearchContainer"
                                onClick={this.onAdvancedSearchCancel.bind(this)}></div>
                            <AdvancedSearchRefactor selectedValue={selectValue}
                                merchantIds={merchantIds}
                                time={searchTime}
                                selectedConditions={this.selectedConditions}
                                commonSearchName={this.commonUsedConditions}
                                onCancel={this.onAdvancedSearchCancel.bind(this)}
                                clickedTag={clickedSearchTag}
                                onOk={this.onAdvancedSearchOk.bind(this)}/>
                        </div> : null
                }
            </div>
        );
    }
}

const searchMap = [
	{key: "kfs.kfid", commitKey: "mainKfIds"},
	{key: "kfs.distributeid", commitKey: "templateId"},
	{key: "kfs.kfresponseid", commitKey: "takePartInKfIds"},
	{key: "memberacts.actiontype", commitKey: "converType"},
	{key: "customeridentity"},
	{key: "terminal", commitKey: "customer.terminal"},
	{key: "region", commitKey: "customer.city"},
	{key: "source", commitKey: "customer.source"},
	{key: "visitorpage", commitKey: "customer.startPageUrl"},
	{key: "summary", commitKey: "summary.ids"},
	{key: "consultInitTypeValue", commitKey: "referType"},
	{key: "consultLastTypeValue", commitKey: "lasterType"},
	/*{key: "consultresult", commitKey: "effective"},*/
	{key: "pleased", commitKey: "evaluate.evaluateContent1"},
	{key: "solve", commitKey: "evaluate.evaluateContent2"},
	{key: "evaluatetype", commitKey: "evaluate.evaluateMethod"},
	{key: "isinviteevaluate", commitKey: "isInviteEvaluate"},
	{key: "customername", commitKey: "customer.customerName", type: 1},
	{key: "customerid", commitKey: "customer.customerId", type: 1},
	{key: "customerip", commitKey: "customer.ip", type: 1},

	{key: "customerConverID", commitKey: "converId", type: 1},
	{key: "customerKeyword", commitKey: "messageContent", type: 1},

	{key: "startpageurl", commitKey: "customer.startPageUrl", type: 1},
	{key: "sourcepage", commitKey: "customer.sourcePage", type: 1},
	{key: "landpage", commitKey: "customer.landPage", type: 1},
	{key: "consultresult", commitKey: "effective", type: 3},

	{key: "totalMsg", commitKey: "totalMsg", type: 2},
	{key: "guesttotalMsg", commitKey: "customerTotalMsg", type: 2},
	{key: "kfTotalMsg", commitKey: "kfTotalMsg", type: 2},
	{key: "rounds", commitKey: "rounds", type: 2},

	{key: "totalTime", commitKey: "totalTime", type: 2},
	{key: "firstResponseTime", commitKey: "firstResponseTime", type: 2},
	{key: "avgResponseTime", commitKey: "avgResponseTime", type: 2}
];

function mapStateToProps(state)
{
    let {consultReducer1: consultData, startUpData, getRecordCommonTime} = state,
        recordFunc = startUpData.get("record") || {},
        {converExport, converAdvancedSearch} = recordFunc;

    return {consultData, converExport, converAdvancedSearch, getRecordCommonTime};
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        setPageRoute, getConsultList, getConsultDetail, queryCommonUsedConditions, updateSelectedConditions, updateCommonUsedConditions,
        deleteCommonUsedConditions, getTableHeader, getConversationCount, setRecordCommonTime
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultList);
