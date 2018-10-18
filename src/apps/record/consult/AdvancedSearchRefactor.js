import React from 'react' ;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Input, Form, InputNumber, message } from 'antd';
import moment from 'moment';
import Tags from "../public/Tags";
import TagData from "../data/TagData";
import '../../../public/styles/record/AdvancedSearch.scss';
import DatePickerComponentRecord from "../public/DatePickerComponentRecord";
import NTButtonGroup from "../../../components/NTButtonGroup";
import NtTreeForSelect from "../../../components/NtTreeForSelect";
import ConsultSelectedComponent from "./ConsultSelectedComponent";
import { createMessageId } from "../../../lib/utils/Utils";
import { bglen } from "../../../utils/StringUtils";
import Modal from "../../../components/xn/modal/Modal";
import { getConsultList, getAccountGroup, getAccountList, getVisitorSourceGroup, getVisitorSourceList, updateCommonUsedConditions, updateSelectedConditions, saveCommonUsedConditions, deleteCommonUsedConditions } from "../redux/consultReducer";
import TreeSelect from "../../public/TreeSelect";
import TreeNode from "../../../components/antd2/tree/TreeNode";
import Select from "../../public/Select";

let FormItem = Form.Item, Option = Select.Option;

class AdvancedSearchRefactor extends React.PureComponent
{
    constructor(props)
    {
        super(props);

        this.search = {};

        this.state = {
            regionVisible: false,
            sourceVisible: false,
            treeData: [],
            selectedConditions: [...props.selectedConditions],
            startTamp: 0,
            endTamp: 0,
            selectValue: props.selectedValue,
            tagsWidth: 0,
            commonUsedTagsWidth: 0,
            isShowAllFilterData: false,
            isShowCommonUsedFilterData: false,
            commonUsedVisible: false,
            commonSearchName: [...props.commonSearchName],
            clickedSearchTag: [...props.clickedTag],
            customerPropsSelectedVal: "customername",
            customerPagesSelectedVal: "startpageurl"
        };

        let {selectedConditions} = props;

        if (selectedConditions.length)
            selectedConditions.forEach(item => {
                if (item.iptItem)
                {
                    let {searchKey, key2, signKey, valueKey, isTime} = item,
                        showItemObj = {sign: signKey, value: valueKey};

                    if (isTime)
                        showItemObj.type = isTime;

                    this.state[searchKey] = showItemObj;
                    this.state[key2] = true;
                }
            });
    }

    componentDidMount() {
        this.forceUpdate();
    }

    getData(key2)
    {
        let {consultData} = this.props;

        return consultData.getIn(["checkedData", key2]);
    }

    /*责任客服 loadDataFn*/
    kfLoadDataFn(groupid)
    {
        if(groupid)
        {
            this.props.getAccountList({groupid});
        }
        else
        {
            this.props.getAccountGroup();
        }
    }

    /*
     *责任客服 itemTitleFn
     * */
    kfItemTitleFn()
    {
        return item => {
            let {externalname, nickname, userid} = item, username = "";

            if(externalname && nickname)
            {
                username = nickname + "[" + externalname + "]";
            }
            else if(externalname || nickname)
            {
                username = externalname || nickname;
            }
            else
            {
                username = userid;
            }
            return username;
        }
    }

    //--------------------------------访客来源-------------------

    onSourceChange(sourceOption, value)
    {
        this.groupChange("source", sourceOption, value);
    }

    get sourceTags()
    {
        let {selectedConditions} = this.state;

        return selectedConditions.filter(tag => tag.searchKey === "source");
    }

    get sourceTags2()
    {
        return this.sourceTags.map(tag => tag.key2 || tag.key);
    }

    get sourceModalProps()
    {
        if(!this._sourceModalProps)
        {
            this._sourceModalProps = {
                title: "访客来源", width: 542, height: 506,
                wrapClassName: "regionModal", onCancel: this.onSourceCancel.bind(this),
                onOk: this.onSourceOk.bind(this)
            };
        }

        return this._sourceModalProps;
    }

    /*访客来源 Modal取消函数*/
    onSourceCancel()
    {
        this.setState({
            sourceVisible: !this.state.sourceVisible
        })
    }

    /*访客来源 Modal确定函数*/
    onSourceOk(tags)
    {
        this.setState({sourceVisible: !this.state.sourceVisible});

        let {selectedConditions} = this.state,
            arr = selectedConditions.filter(tag => tag.searchKey !== "source")
                .concat(tags);

        this.setState({selectedConditions: arr});
    }

    /*访客页面*/
    onVisitorPageCancel()
    {
        this.setState({
            visitorPageVisible: !this.state.visitorPageVisible
        })
    }

    onVisitorPageOk(tags)
    {
        this.setState({visitorPageVisible: !this.state.visitorPageVisible});

        let {selectedConditions} = this.state,
            arr = selectedConditions.filter(tag => tag.searchKey !== "visitorpage")
                .concat(tags);

        this.setState({selectedConditions: arr});
    }

    get visitorPageTags()
    {
        let {selectedConditions} = this.state;

        return selectedConditions.filter(tag => tag.searchKey === "visitorpage");
    }

    get visitorPageModalProps()
    {
        if(!this._visitorPageModalProps)
        {
            this._visitorPageModalProps = {
                title: "访客页面", width: 542, height: 506,
                wrapClassName: "regionModal", onCancel: this.onVisitorPageCancel.bind(this),
                onOk: this.onVisitorPageOk.bind(this)
            };
        }

        return this._visitorPageModalProps;
    }

    //--------------------------------访客地域-------------------
    get regionTags()
    {
        let {selectedConditions} = this.state;

        return selectedConditions.filter(tag => tag.searchKey === "region");
    }

    get regionModalProps()
    {
        if(!this._regionModalProps)
        {
            this._regionModalProps = {
                title: "访客地域", width: 542, height: 506,
                wrapClassName: "regionModal", onCancel: this.onRegionCancel.bind(this),
                onOk: this.onRegionOk.bind(this)
            };
        }

        return this._regionModalProps;
    }

    onRegionOk(tags)
    {
        this.setState({regionVisible: !this.state.regionVisible});

        let {selectedConditions} = this.state,
            arr = selectedConditions.filter(tag => tag.searchKey !== "region")
                .concat(tags);

        this.setState({selectedConditions: arr});
    }

    get regionTags2()
    {
        return this.regionTags.map(tag => tag.key2 || tag.key);
    }

    onRegionChange(value)
    {
        if(value)
        {
            let gTags = regionDefault.filter(options => value.includes(options.value))
                .map(options => {
                    let tagData = new TagData();
                    tagData.key = options.key;
                    tagData.key2 = options.value;
                    tagData.value = options.label;
                    tagData.searchKey = "region";
                    tagData.isKey = false;
                    return tagData;
                }),
                {selectedConditions} = this.state,
                rTags = selectedConditions.filter(tag => value.includes(tag.key) && (regionDefault.findIndex(v => v.key === tag.key) < 0)),
                tags = gTags.concat(this.getTagsWithout("region"))
                    .concat(rTags);

            this.setState({
                selectedConditions: tags,
                clickedSearchTag: ''
            });
        }
    }

    onRegionCancel()
    {
        this.setState({regionVisible: !this.state.regionVisible});
    }


    /*点击已保存常用搜索*/
    handleCommonSearch(tagInfo)
    {
        if(tagInfo)
            this.setState({
                selectedConditions: tagInfo.selectedConditions,
                clickedSearchTag: tagInfo
            })
    }

    onOk()
    {
        let {onOk, selectedValue} = this.props,
            {startTamp, endTamp, selectValue, selectedConditions} = this.state,
            sValue = selectValue == undefined ? selectedValue : selectValue;

        if(typeof onOk === "function")
            onOk(selectedConditions, startTamp, endTamp, sValue);
    }

    getTags(key)
    {
        let {selectedConditions} = this.state;

        return selectedConditions.filter(tag => tag.searchKey === key);
    }

    getTagsWithout(key, tags)
    {
        let selectedConditions = tags;

        if(!selectedConditions)
        {
            selectedConditions = this.state.selectedConditions;
        }

        return selectedConditions.filter(tag => tag.searchKey !== key);
    }

    /*评价结果1 值及内容*/
    get pleaseValue()
    {
        return this.getTags("pleased")
            .map(tag => tag.key2);
    }

    onPleasedChange(value)
    {
        //pleasedOptions
        this.groupChange("pleased", this.getEvaluateOption(1), value);
    }

    /*评价结果2 值及内容*/
    get solveValue()
    {
        return this.getTags("solve")
            .map(tag => tag.key2);
    }

    onSolveChange(value)
    {
        this.groupChange("solve", this.getEvaluateOption(2), value);
    }

    /*评价方式 值及内容*/
    get evaluateTypeValue()
    {
        return this.getTags("evaluatetype")
            .map(tag => tag.key2);
    }

    onEvaluateTypeChange(value)
    {
        this.groupChange("evaluatetype", evaluateType, value);
    }

    /*是否邀请评价 值及内容*/
    get isInviteValue()
    {
        return this.getTags("isinviteevaluate")
            .map(tag => tag.key2);
    }

    onIsInviteValueChange(value)
    {
        this.groupChange("isinviteevaluate", isInviteEvaluate, value);
    }

    /*咨询结果 值及内容*/
    get consultResultValue()
    {
        return this.getTags("consultresult")
            .map(tag => tag.key2);
    }

    onConsultResultChange(value)
    {
        if (value.length > 1)
            value = value.slice(-1);

        this.groupChange("consultresult", consultResult, value);
    }

    /*会话类型 值及内容*/
    get actiontypeValue()
    {
        return this.getTags("memberacts.actiontype")
            .map(tag => tag.key2);
    }

    onActiontypeChange(value)
    {
        this.groupChange("memberacts.actiontype", actiontypeOptions, value);
    }

    /*会话发起者类型 值及内容*/
    get consultInitTypeValue()
    {
        return this.getTags("consultInitTypeValue")
            .map(tag => tag.key2);
    }

    onConsultInitTypeChange(value)
    {
        this.groupChange("consultInitTypeValue", consultInitType, value);
    }

    /*会话最后发言者类型 值及内容*/
    get consultLastTypeValue()
    {
        return this.getTags("consultLastTypeValue")
            .map(tag => tag.key2);
    }

    onConsultLastTypeChange(value)
    {
        this.groupChange("consultLastTypeValue", consultLastType, value);
    }

    /*访客终端 值及内容*/
    get terminalValue()
    {
        return this.getTags("terminal")
            .map(tag => tag.key2);
    }

    onTerminalChange(value)
    {
        this.groupChange("terminal", terminalOptions, value);
    }

    /*咨询类型 值及内容*/
    get summaryTags()
    {
        let {selectedConditions} = this.state;

        return selectedConditions.filter(tag => tag.searchKey === "summary");
    }

    get summaryTags2()
    {
        return this.summaryTags.map(tag => tag.key2 || tag.key);
    }

    onSummaryChange(sourceOption, value)
    {
        this.groupChange("summary", sourceOption, value);
    }

    onSummaryCancel()
    {
        this.setState({summaryVisible: !this.state.summaryVisible})
    }

    get summaryModalProps()
    {
        if(!this._summaryModalProps)
        {
            this._summaryModalProps = {
                title: "咨询总结类型", width: 542, height: 506,
                wrapClassName: "regionModal", onCancel: this.onSummaryCancel.bind(this),
                onOk: this.onSummaryOk.bind(this)
            };
        }

        return this._summaryModalProps;
    }

    onSummaryOk(tags)
    {
        this.setState({summaryVisible: !this.state.summaryVisible});

        let {selectedConditions} = this.state,
            arr = selectedConditions.filter(tag => tag.searchKey !== "summary")
                .concat(tags);

        this.setState({selectedConditions: arr});
    }

    groupChange(key, goptions, value)
    {
        if(value)
        {
            let gTags = goptions.filter(options => value.includes(options.value))
                .map(options => {
                    let tagData = new TagData();
                    tagData.key = options.key;
                    tagData.key2 = options.value;
                    tagData.value = options.label;
                    tagData.searchKey = key;
                    tagData.isKey = false;
                    return tagData;
                }),
                tags = gTags.concat(this.getTagsWithout(key));

            this.setState({
                selectedConditions: tags,
                clickedSearchTag: ''
            });
        }
    }

    get kfValue()
    {
        return this.getTags("kfs.kfid")
            .map(tag => tag.key);
    }

    onSearchKf(searchKeys, treeSelectedData)
    {
        let usernameFn = this.kfItemTitleFn(),
            kfTags = treeSelectedData.filter(data => data)
                .map(data => {
                    let tagData = new TagData();
                    tagData.key = data.userid;
                    tagData.key2 = data.userid;
                    tagData.value = usernameFn(data);
                    tagData.searchKey = "kfs.kfid";

                    return tagData;
                }),
            tags = kfTags.concat(this.getTagsWithout("kfs.kfid"));

        tags = this.getTagsWithout("kfs.distributeid", tags);

        this.setState({selectedConditions: tags});
    }

    get kfResponseValue()
    {
        return this.getTags("kfs.kfresponseid")
            .map(tag => tag.key);
    }

    onSearchKfResponse(searchKeys, treeSelectedData)
    {
        let usernameFn = this.kfItemTitleFn(),
            kfTags = treeSelectedData.filter(data => data)
                .map(data => {
                    let tagData = new TagData();
                    tagData.key = data.userid;
                    tagData.key2 = data.userid;
                    tagData.value = usernameFn(data);
                    tagData.searchKey = "kfs.kfresponseid";

                    return tagData;
                }),
            tags = kfTags.concat(this.getTagsWithout("kfs.kfresponseid"));

        this.setState({selectedConditions: tags});
    }

    /*获取客服组值及组件*/
    get distributeValue()
    {
        return this.getTags("kfs.distributeid")
            .map(tag => tag.key);
    }

    getCheckedDistributeItems(treeSelectedKey)
    {
        let {groupData = []} = this.props,
            checkedItems = [];

        groupData.forEach(item => {
            if(treeSelectedKey.find(selectItem => selectItem === item.templateid))
                checkedItems.push(item)
        });
        return checkedItems;
    }

    onDistributeChange(treeSelectedKey)
    {
        let selectedItems = this.getCheckedDistributeItems(treeSelectedKey),
            kfTags = selectedItems.filter(data => data)
                .map(data => {
                    let tagData = new TagData();
                    tagData.key = data.templateid;
                    tagData.key2 = data.templateid;
                    tagData.value = data.name;
                    tagData.searchKey = "kfs.distributeid";

                    return tagData;
                }),
            tags = kfTags.concat(this.getTagsWithout("kfs.distributeid"));

        tags = this.getTagsWithout("kfs.kfid", tags);

        this.setState({selectedConditions: tags});
    }

    getDistributeNode()
    {
        let {groupData = []} = this.props;

        return groupData.map(item => {
            let {templateid, name} = item;

            if(item.children && item.children.length > 0)
            {
                return (
                    <TreeNode value={templateid} title={name} key={templateid}>
                        {
                            this.getDistributeNode(item.children)
                        }
                    </TreeNode>
                );
            }

            return <TreeNode value={templateid} title={name} key={templateid} item={item}/>;
        });

        return <TreeNode value="groupid" title="未获取到行政组" disabled/>;
    }

    /*获取search时间*/
    getSearchTime(startTamp, endTamp, selectValue)
    {
        this.setState({
            startTamp,
            endTamp,
            selectValue,
            searchTime: [moment(startTamp), moment(endTamp)]
        })

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

    /*删除常用搜索tag*/
    delCommonUsedTag(key)
    {
        let {commonSearchName} = this.state,
            tags = [...commonSearchName],
            index = tags.findIndex(tag => tag.key === key);

        if(index > -1)
        {
            tags.splice(index, 1);
            this.setState({
                commonSearchName: tags
            });
            // this.props.updateCommonUsedConditions(tags);

            this.props.deleteCommonUsedConditions(key);
        }
    }

    /*删除已选条件tag*/
    delTag(key)
    {
        let {selectedConditions} = this.state,
            tags = [...selectedConditions],
            index = tags.findIndex(tag => tag.key === key),
            tagItem = tags.find(tag => tag.key === key),
            keyStatus = tagItem.key2;

        if(index > -1)
        {
            tags.splice(index, 1);
            this.setState({selectedConditions: tags, [key]: ""});
            if (this.state[keyStatus])
                this.setState({[keyStatus]: false});
        }
    }

    /*添加至常用搜索*/
    addToCommonUsed()
    {
        this.setState({
            commonUsedVisible: true
        });

        this.props.form.setFieldsValue({"name": ''});
    }

    /*常用搜索 关闭*/
    handleCancel()
    {
        this.setState({
            commonUsedVisible: false,
            isUsedWarned: false
        })
    }

    /*常用搜索 保存*/
    handleOk()
    {
        let {form} = this.props,
            name = form.getFieldValue("name"),
            {commonSearchName, selectedConditions} = this.state,
            commonUsedObj = {};

        form.validateFields((errors) => {
            if(errors)
                return false;

            if(commonSearchName.length === 0)
            {
                let tagData = new TagData();
                tagData.key = createMessageId();
                tagData.key2 = name;
                tagData.value = name;
                tagData.searchKey = 'commonUsed';
                tagData.isKey = false;
                tagData.selectedConditions = [...selectedConditions];

                commonSearchName.push(tagData);

                this.setState({
                    commonSearchName,
                    clickedSearchTag: tagData
                });
            }
            else
            {
                for(let i = 0; i < commonSearchName.length; i++)
                {
                    if(commonSearchName[i].value === name)
                        break;

                    if(i === commonSearchName.length - 1)
                    {
                        let tagData = new TagData();
                        tagData.key = createMessageId();
                        tagData.key2 = name;
                        tagData.value = name;
                        tagData.searchKey = 'commonUsed';
                        tagData.isKey = false;
                        tagData.selectedConditions = [...selectedConditions];

                        commonSearchName.push(tagData);

                        this.setState({
                            commonSearchName,
                            clickedSearchTag: tagData
                        });
                    }
                }
            }

            commonUsedObj = {
                searchName: name,
                searchContent: selectedConditions,
                flag: "0"
            };

            this.props.saveCommonUsedConditions(commonUsedObj)
                .then(result => {
                    let saveStats = result.code !== 200,
                        newCommonSearch = [...commonSearchName],
                        addUsedItem = newCommonSearch.find(item => item.key2 === name);

                    addUsedItem.key = result.data;

                    this.setState({
                        commonUsedVisible: saveStats,
                        isUsedWarned: saveStats,
                        commonSearchName: newCommonSearch
                    });
                });

            this.props.updateCommonUsedConditions(commonSearchName);

        })
    }

    /*常用搜索 保存并搜索*/
    handleOkAndSearch()
    {
        let {form} = this.props,
            {selectedConditions} = this.state;

        form.validateFields((errors) => {
            if(errors)
                return false;

            this.handleOk();
            this.props.onCancel();

            this.props.updateSelectedConditions(selectedConditions);

            this.onOk();
        })
    }

    /*自定义校验常用搜索名称*/
    judgeCommonUsedName(rule, value, callback)
    {
        let char = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;

        if(bglen(value) <= 20 && char.test(value))
            callback();

        callback(" ");
    }

    handleValueOk(valueType, itemValues, isTimeType)
    {
        let {selectedConditions} = this.state,
            iptValObj = itemValues,
            {name, sign, value, type = ""} = iptValObj,
            showValue = name + sign + value + type,
            tags,
            tagData,
            dealedSelectedConditions = selectedConditions.filter(item => item.type != valueType),
            valueTypeStatus = valueType + 'status';

        if (this.state[valueTypeStatus])
        {
            this.delTag(valueType);
            this.setState({[valueTypeStatus]: false});
            return;
        }

        try
        {
            message.destroy();
        }
        catch(e) {}


        if (!name || !sign || !value || (isTimeType && !type))
        {
            message.error("请将搜索条件填写完整后添加！");
            return;
        }

        tagData = new TagData();
        tagData.key = valueType;
        tagData.key2 = valueTypeStatus;
        tagData.signKey = sign;
        tagData.valueKey = value;
        tagData.value = showValue;
        tagData.searchKey = valueType;
        tagData.isKey = false;
        tagData.type = valueType;
        tagData.iptItem = true;

        if (isTimeType)
            tagData.isTime = type;

        tags = [tagData].concat(dealedSelectedConditions);

        this.setState({
            selectedConditions: tags,
            clickedSearchTag: '',
            [valueTypeStatus]: true
        });
    }

    /**
     * 数字输入框值变化
     * */
    handleSignChange(valueType, typeCName, dataName, value)
    {
        let itemValues = this.state[valueType] || {},
            valueTypeStatus = valueType + 'status';

        itemValues[dataName] = value;
        itemValues.name = typeCName;

        try
        {
            message.destroy();
        }
        catch(e) {}

        if (value > 9999)
        {
            message.error("最大输入值为9999！");
            return;
        }

        this.forceUpdate();
        this.setState({[valueType]: itemValues, [valueTypeStatus]: false})
    }

    /*回话时长及条数组件*/
    getDialogDataComp(valueType, typeCName, itemValue, isTimeType)
    {
        let valueTypeStatus = valueType + 'status',
            iconColor = this.state[valueTypeStatus] ? "iconfont icon-001zhengque numberValIcon selectedColor" : "iconfont icon-001zhengque numberValIcon",
            {sign, value, type} = itemValue,
            commonComp;

        commonComp = [
            <Select className="dialogSelect" size="large"
                value={sign} onChange={this.handleSignChange.bind(this, valueType, typeCName, "sign")}
                option={[<Option key={0} value=">"> 大于 </Option>,
                <Option key={1} value="<"> 小于 </Option>]}
            />,
            <InputNumber min={0} max={9999} precision={0} value={value} className="dialogIpt" onChange={this.handleSignChange.bind(this, valueType, typeCName, 'value')}/>
        ];

        if(isTimeType)
        {
            commonComp.push(
                <Select className="dialogSelect" size="large" value={type}
                    onChange={this.handleSignChange.bind(this, valueType, typeCName, 'type')}
                    option={[<Option key={3} value="秒"> 秒 </Option>,
                    <Option key={4} value="分"> 分 </Option>]}
                />
            )
        }
        else
        {
            commonComp.push(<span>条</span>)
        }

        commonComp.push(<i className={iconColor} onClick={this.handleValueOk.bind(this, valueType, itemValue, isTimeType)}/>);

        return commonComp
    }

    getEvaluateOption(rank)
    {

        let {evaluateList} = this.props,
            {conversationEvaluationItems = []} = evaluateList,
            evaluateNameArr = [];

        if(conversationEvaluationItems.length)
        {
            let currentEvaluate = conversationEvaluationItems.find(item => item.rank === rank),
                {option = []} = currentEvaluate;

            option.forEach(item => {
                let obj = {label: item.content, value: item.content, key: createMessageId()};

                evaluateNameArr.push(obj)
            })
        }

        return evaluateNameArr
    }

    /*按照访客ip id 或名称搜索*/
    handleSelectCustomerProps(handleOkType, customerProps)
    {
        let selectedValKey = handleOkType + 'Val',
            typeStatus = handleOkType + 'status';

        this.setState({
            clickedSearchTag: '',
            [typeStatus]: false,
            [selectedValKey]: customerProps
        });
    }

    /**
     * 点击对号保存input框输入内容
     *
     * valueType 用于区分字段
     * selectedConditions 已选tag条件
     * customerPropsSelectedVal 访客属性selected框值
     * customerPagesSelectedVal 访客页面selected框值
     * */
    handleSelectValue(valueType, selectedKey)
    {
        let {selectedConditions} = this.state,
            valueTypeStatus = valueType + 'status',
            iptVal = this.state[selectedKey],
            tags,
            tagData,
            dealedSelectedConditions = selectedConditions.filter(item => item.type != selectedKey);

        if (this.state[valueTypeStatus])
        {
            this.delTag(selectedKey);
            this.setState({[valueTypeStatus]: false});
            return;
        }

        try
        {
            message.destroy();
        }
        catch(e) {}

        if (!selectedKey || !iptVal)
        {
            message.error("请将搜索条件填写完整后添加！");
            return;
        }

        if (selectedKey === "customerKeyword" && bglen(iptVal) > 40)
        {
            message.error("会话详情关键词最多输入20个字符，请修改后添加！");
            return;
        }

        tagData = new TagData();
        tagData.key = selectedKey;
        tagData.key2 = valueTypeStatus;
        tagData.value = iptVal;
        tagData.searchKey = selectedKey;
        tagData.isKey = false;
        tagData.type = selectedKey;

        tags = [tagData].concat(dealedSelectedConditions);

        this.setState({
            selectedConditions: tags,
            clickedSearchTag: '',
            [valueTypeStatus]: true
        });
    }

    /*访客属性及页面输入框值回调*/
    onCustomerPropsChange(handleOkType, e)
    {
        let value = e.target.value,
            typeStatus = handleOkType + 'status',
            {customerPropsSelectedVal, customerPagesSelectedVal} = this.state,
            selectedValKey = handleOkType === 'customerPropsSelected' ? customerPropsSelectedVal : customerPagesSelectedVal;

        this.setState({
            [selectedValKey]: value,
            [typeStatus]: false,
            clickedSearchTag: ''
        });
    }

    render()
    {
        let {
                form, consultData,
                onCancel, selectedValue,
                summaryTypeTree, keyPageData,
                visitorSourceData, visitorSourceDefault,
                summaryDefaultData, regionData
            } = this.props,
            {
                regionVisible, sourceVisible,
                summaryVisible, visitorPageVisible,
                treeData, isShowAllFilterData,
                isShowCommonUsedFilterData, tagsWidth,
                commonUsedVisible, commonSearchName,
                commonUsedTagsWidth, selectedConditions,
                isUsedWarned, customerPropsSelectedVal,
                customerPropsSelectedstatus,
                customerPagesSelectedVal,
                customerPagesSelectedstatus,
                totalMsg = {},
                guesttotalMsg = {},
                kfTotalMsg = {},
                rounds = {},
                totalTime = {},
                firstResponseTime = {},
                avgResponseTime = {}
            } = this.state,
            {getFieldDecorator} = form,
            visitorSource = consultData.getIn(["visitorSource", "data"]) || [],
            mainkfsGroup = consultData.getIn(["account", "data"]) || [],
            widthMore = tagsWidth > 512,
            commonUsedWidthMore = commonUsedTagsWidth > 512,
            className = !widthMore || isShowAllFilterData ? "showExtra" : "hideExtra",
            commonUsedClassName = !commonUsedWidthMore || isShowCommonUsedFilterData ? "showExtra" : "hideExtra",
            filterDataBox = document.getElementById("advancedSearchTags"),
            filterCommonUsedBox = document.getElementById("commonSearchTags"),
            commonBtnIsClick = selectedConditions.length <= 0;

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
            filterCommonUsedBox && filterCommonUsedBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            filterCommonUsedBox && filterCommonUsedBox.setAttribute("class", "selectedBox showExtra");
        }

        /**
         * checkedIcon 输入框条件完成图标颜色
         * unCheckedIcon 输入框条件置灰
         * propsIcon 访客ip id 名称 控制保存图标条件
         * pagesIcon 访客页面 控制保存图标条件
         * customerPropsSelected customerPagesSelected 管理图标所属模块
         * */
        let checkedIcon = "iconfont icon-001zhengque numberValIcon selectedColor",
            unCheckedIcon = "iconfont icon-001zhengque numberValIcon",
            propsIcon = customerPropsSelectedstatus ? checkedIcon : unCheckedIcon,
            pagesIcon = customerPagesSelectedstatus ? checkedIcon : unCheckedIcon;

        return (
            <div className="advancedSearchContent">
                <div className="advancedSearchScroll">
                    <div className="dataWrap">
                        <DatePickerComponentRecord
                            selectedValue={this.state.selectValue == undefined ? selectedValue : this.state.selectValue}
                            time={this.state.searchTime || this.props.time}
                            _onOk={this.getSearchTime.bind(this)}
                        />
                    </div>
                    <div className="dataWrap dataWrapUnderLine">
                        <Select className="customerPropsSelect" value={customerPropsSelectedVal}
                            getPopupContainer={() => document.querySelector(".dataWrap")}
                            placeholder="请选择"
                            onSelect={this.handleSelectCustomerProps.bind(this, "customerPropsSelected")}
                            option={[<Option value="customername">访客名称</Option>,
                            <Option value="customerid">访客ID</Option>,
                            <Option value="customerip">访客IP</Option>,
                            <Option value="customerConverID">会话ID</Option>,
                            <Option value="customerKeyword">会话详情关键词</Option>]}
                        />
                        <Input className="customerPropsValue" value={this.state[customerPropsSelectedVal]}
                            onChange={this.onCustomerPropsChange.bind(this, "customerPropsSelected")}/>
                        <i className={propsIcon} onClick={this.handleSelectValue.bind(this, "customerPropsSelected", customerPropsSelectedVal)}/>
                    </div>
                    <div className="selectedCondition">
                        <div className="commonSearchTagDiv">
                            <label className="conditionTitle">常用搜索</label>
                            <Tags idnames="commonSearchTags"
                                tags={commonSearchName}
                                classname={commonUsedClassName}
                                onClick={this.handleCommonSearch.bind(this)}
                                delDataFn={this.delCommonUsedTag.bind(this)}
                                getWidth={this.getCommonUsedWidth.bind(this)}
                            />
                            {
                                commonUsedWidthMore ?
                                    <a onClick={this.isShowCommonUsedFilterData.bind(this, isShowCommonUsedFilterData)}>
                                        {isShowCommonUsedFilterData ? '收起' : '展开'}
                                    </a> : null
                            }
                        </div>
                        <div>
                            <label className="conditionTitle">已选条件</label>
                            <Tags idnames="advancedSearchTags"
                                tags={selectedConditions}
                                classname={className}
                                delDataFn={this.delTag.bind(this)}
                                getWidth={this.getWidth.bind(this)}
                            />
                            {
                                widthMore ?
                                    <a onClick={this.isShowAllFilterData.bind(this, isShowAllFilterData)}>
                                        {isShowAllFilterData ? '收起' : '展开'}
                                    </a> : null
                            }
                        </div>
                    </div>

                    <div className="conditionContainer">
                        <p className="conditionTitle">客服信息</p>
                        <div className="perSelect responsibilityKFSelect">
                            <label className="marginLabel">责任客服</label>
                            <NtTreeForSelect treeData={mainkfsGroup}
                                checkedKeys={this.kfValue}
                                selectedValue={this.kfResponseValue}
                                itemInfo={{itemid: "userid"}}
                                searchFn={this.onSearchKf.bind(this)}
                                loadDataFn={this.kfLoadDataFn.bind(this)}
                                itemTitleFn={this.kfItemTitleFn()}
                                popupContainer="perSelect"
                            />
                        </div>
                        <div className="perSelect responsibilityKFSelect">
                            <label className="marginLabel">客服组</label>
                            <TreeSelect value={this.distributeValue} multiple treeCheckable
                                onChange={this.onDistributeChange.bind(this)}
                                getPopupContainer={() => document.getElementsByClassName("perSelect")[0]}
                                treeNode={this.getDistributeNode()}
                            />
                        </div>
                        <div className="perSelect responsibilityKFSelect">
                            <label className="marginLabel">参与客服</label>
                            <NtTreeForSelect treeData={mainkfsGroup}
                                checkedKeys={this.kfResponseValue}
                                selectedValue={this.kfValue}
                                itemInfo={{itemid: "userid"}}
                                searchFn={this.onSearchKfResponse.bind(this)}
                                loadDataFn={this.kfLoadDataFn.bind(this)}
                                itemTitleFn={this.kfItemTitleFn()}
                                popupContainer="perSelect"
                            />

                        </div>
                        <p className="conditionTitle">访客信息</p>
                        <div className="perSelect">
                            <label className="marginLabel">访客地域</label>
                            <NTButtonGroup options={regionDefault} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.regionTags2} onChange={this.onRegionChange.bind(this)}/>
                            <a className="moreSelectionBtn" onClick={this.onRegionCancel.bind(this)}>更多</a>
                            {
                                /*<Tags tags={this.regionTags}
                                 delDataFn={this.delTag.bind(this)}
                                 getWidth={this.getWidth.bind(this)}
                                 classnames="regionTags"
                                 />*/
                            }

                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">访客来源</label>
                            <NTButtonGroup options={visitorSourceDefault} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.sourceTags2} onChange={this.onSourceChange.bind(this, visitorSourceDefault)}/>

                            <a className="moreSelectionBtn" onClick={this.onSourceCancel.bind(this)}>更多</a>
                            {
                                /*<Tags tags={this.sourceTags}
                                 delDataFn={this.delTag.bind(this)}
                                 getWidth={this.getWidth.bind(this)}
                                 classnames="sourceTags"
                                 />*/
                            }

                        </div>

                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">访客终端</label>
                            <NTButtonGroup options={terminalOptions} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.terminalValue} onChange={this.onTerminalChange.bind(this)}/>
                        </div>

                        <div className="perSelect">
                            <label className="marginLabel visitorPageLabel">访客页面</label>
                            <Select className="customerPropsSelect" value={customerPagesSelectedVal}
                                getPopupContainer={() => document.querySelector(".perSelect")}
                                placeholder="请选择"
                                onSelect={this.handleSelectCustomerProps.bind(this, "customerPagesSelected")}
                                option={[<Option value="startpageurl">咨询发起页</Option>,
                                <Option value="sourcepage">来源页</Option>,
                                <Option value="landpage">着陆页</Option>]}
                            />
                            <Input className="customerPropsValue customerPageValue" value={this.state[customerPagesSelectedVal]} onChange={this.onCustomerPropsChange.bind(this, 'customerPagesSelected')}/>
                            <i className={pagesIcon} onClick={this.handleSelectValue.bind(this, "customerPagesSelected", customerPagesSelectedVal)}/>
                        </div>

                        <p className="conditionTitle">会话情况</p>

                        <div className="perSelect">
                            <label className="marginLabel">咨询总结类型</label>
                            <NTButtonGroup options={summaryDefaultData} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.summaryTags2} onChange={this.onSummaryChange.bind(this, summaryDefaultData)}/>
                            <a className="moreSelectionBtn" onClick={this.onSummaryCancel.bind(this)}>更多</a>
                            {
                                /*<Tags tags={this.summaryTags}
                                 delDataFn={this.delTag.bind(this)}
                                 getWidth={this.getWidth.bind(this)}
                                 classnames="sourceTags"
                                 />*/
                            }

                        </div>

                        {
                            <div className="perSelect selectButtonBox">
                                <label className="marginLabel">咨询结果</label>
                                <NTButtonGroup options={consultResult} itemClassName="perSelectItem"
                                    className="perSelectNTButtonGroup"
                                    value={this.consultResultValue}
                                    onChange={this.onConsultResultChange.bind(this)}/>
                            </div>
                        }

                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">会话类型</label>
                            <NTButtonGroup options={actiontypeOptions} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.actiontypeValue}
                                onChange={this.onActiontypeChange.bind(this)}/>
                        </div>
                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">会话发起者类型</label>
                            <NTButtonGroup options={consultInitType} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.consultInitTypeValue}
                                onChange={this.onConsultInitTypeChange.bind(this)}/>
                        </div>
                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">最后发言者类型</label>
                            <NTButtonGroup options={consultLastType} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.consultLastTypeValue}
                                onChange={this.onConsultLastTypeChange.bind(this)}/>
                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">消息总条数</label>
                            {this.getDialogDataComp("totalMsg", "消息总条数", totalMsg)}
                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">访客消息条数</label>
                            {this.getDialogDataComp("guesttotalMsg", "访客消息条数", guesttotalMsg)}
                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">客服消息条数</label>
                            {this.getDialogDataComp("kfTotalMsg", "客服消息条数", kfTotalMsg)}
                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">会话回合数</label>
                            {this.getDialogDataComp("rounds", "会话回合数", rounds)}
                        </div>

                        <div className="perSelect">
                            <label className="marginLabel">会话总时长</label>
                            {this.getDialogDataComp("totalTime", "会话总时长", totalTime, true)}
                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">首次响应时间</label>
                            {this.getDialogDataComp("firstResponseTime", "首次响应时间", firstResponseTime, true)}
                        </div>
                        <div className="perSelect">
                            <label className="marginLabel">平均响应时间</label>
                            {this.getDialogDataComp("avgResponseTime", "平均响应时间", avgResponseTime, true)}
                        </div>

                        <p className="conditionTitle">访客评价</p>
                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">满意度评价</label>
                            <NTButtonGroup options={this.getEvaluateOption(1)} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.pleaseValue}
                                onChange={this.onPleasedChange.bind(this)}
                            />
                        </div>

                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">是否解决问题</label>
                            <NTButtonGroup options={this.getEvaluateOption(2)} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.solveValue}
                                onChange={this.onSolveChange.bind(this)}/>
                        </div>

                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">评价方式</label>
                            <NTButtonGroup options={evaluateType} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.evaluateTypeValue}
                                onChange={this.onEvaluateTypeChange.bind(this)}/>
                        </div>

                        <div className="perSelect selectButtonBox">
                            <label className="marginLabel">是否邀请评价</label>
                            <NTButtonGroup options={isInviteEvaluate} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.isInviteValue}
                                onChange={this.onIsInviteValueChange.bind(this)}/>
                        </div>
                    </div>
                </div>
                <div className="btnContainer">
                    <Button className="btn" type="primary" onClick={this.onOk.bind(this)}>确定</Button>
                    <Button className="btn" onClick={onCancel}>取消</Button>
                    <Button className="addToCommonBtn" disabled={commonBtnIsClick}
                        onClick={this.addToCommonUsed.bind(this)}>
                        添加至常用检索
                    </Button>
                </div>
                {
                    //访客地域
                    regionVisible ?
                        <ConsultSelectedComponent modalProps={this.regionModalProps}
                            tags={this.regionTags}
                            treeData={regionData}
                            searchKey="region"
                            groupInfo={{groupid: "id", groupname: "name"}}
                            itemInfo={{itemid: "id", itemname: 'name'}}
                            getWidth={this.getWidth.bind(this)}/> : null
                }
                {
                    //访客来源
                    sourceVisible ?
                        <ConsultSelectedComponent modalProps={this.sourceModalProps}
                            tags={this.sourceTags}
                            searchKey="source"
                            treeData={visitorSourceData}
                            groupInfo={groupInfo}
                            itemInfo={{itemid: "ename", itemname: 'typename'}}
                            getWidth={this.getWidth.bind(this)}/> : null
                }

                {
                    //咨询总结类型
                    summaryVisible ?
                        <ConsultSelectedComponent modalProps={this.summaryModalProps}
                            tags={this.summaryTags}
                            searchKey="summary"
                            treeData={summaryTypeTree}
                            groupInfo={{groupid: "summaryid", groupname: "content"}}
                            itemInfo={{itemid: "summaryid", itemname: 'content'}}
                            getWidth={this.getWidth.bind(this)}/> : null
                }

                {
                    //访客页面
                    visitorPageVisible ?
                        <ConsultSelectedComponent modalProps={this.visitorPageModalProps}
                            tags={this.visitorPageTags}
                            searchKey="visitorpage"
                            treeData={keyPageData}
                            groupInfo={{groupid: "key", groupname: "name", children: "subset"}}
                            itemInfo={{itemid: "urlreg", itemname: 'keyname'}}
                            getWidth={this.getWidth.bind(this)}/> : null
                }

                <Modal title="设置常用搜索"
                    visible={commonUsedVisible}
                    width={540}
                    wrapClassName='addCommonUsed'
                    footer={[
					         <Button onClick={this.handleCancel.bind(this)}>取消</Button>,
					         <Button type="primary" onClick={this.handleOk.bind(this)}>保存</Button>,
					         <Button type="primary" onClick={this.handleOkAndSearch.bind(this)}>保存并搜索</Button>
				         ]}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form>
                        <FormItem>
                            <p>设置并显示常用搜索名称</p>
                            {
                                getFieldDecorator('name', {
                                    initialValue: '',
                                    rules: [{
                                        required: true, whitespace: true
                                    }, {validator: this.judgeCommonUsedName.bind(this)}]
                                })(<Input/>)
                            }
                            {isUsedWarned ? <p className="commonUsedWarned">该常用搜索名称已存在！</p> : null}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

AdvancedSearchRefactor = Form.create()(AdvancedSearchRefactor);

const pleasedOptions = [
        {label: '非常满意', value: 5, key: createMessageId()},
        {label: '满意', value: 4, key: createMessageId()},
        {label: '一般', value: 3, key: createMessageId()},
        {label: '不满意', value: 2, key: createMessageId()},
        {label: '非常不满意', value: 1, key: createMessageId()},
        {label: '未评价', value: 0, key: createMessageId()}
    ],
    solveOptions = [
        {label: '已解决', value: 9, key: createMessageId()},
        {label: '跟进中', value: 8, key: createMessageId()},
        {label: '未解决', value: 7, key: createMessageId()},
        {label: '未评价', value: 6, key: createMessageId()}
    ],
    evaluateType = [
        {label: '强制评价', value: 2, key: createMessageId()},
        {label: '主动评价', value: 0, key: createMessageId()},
        {label: '邀请评价', value: 1, key: createMessageId()}
    ],
    isInviteEvaluate = [
        {label: '是', value: 1, key: createMessageId()},
        {label: '否', value: 0, key: createMessageId()}
    ],
    consultResult = [
        {label: '有效咨询', value: 1, key: createMessageId()},
        {label: '无效咨询', value: 0, key: createMessageId()},
        {label: '访客无应答', value: -2, key: createMessageId()},
        {label: '客服无应答', value: -1, key: createMessageId()}
    ],
    actiontypeOptions = [
        {label: '独立咨询', value: 0, key: createMessageId()},
        {label: '转接咨询', value: 3, key: createMessageId()},
        {label: '邀请咨询', value: 2, key: createMessageId()},
        {label: '协助咨询', value: 6, key: createMessageId()},
        {label: '接管咨询', value: 7, key: createMessageId()}
    ],
    consultInitType = [
        {label: '访客', value: 2, key: createMessageId()},
        {label: '客服', value: 1, key: createMessageId()}
    ],
    consultLastType = [
        {label: '访客', value: 2, key: createMessageId()},
        {label: '客服', value: 1, key: createMessageId()}
    ],
    terminalOptions = [
        {label: 'Web', value: 'web', key: createMessageId()},
        {label: '微信', value: 'wechat', key: createMessageId()},
        {label: 'Wap', value: 'wap', key: createMessageId()},
        {label: 'iOS app', value: 'IOS App', key: createMessageId()},
        {label: 'Android app', value: 'Android App', key: createMessageId()},
        {label: '微博', value: 'weibo', key: createMessageId()},
        {label: '支付宝', value: 'AliPay', key: createMessageId()},
        {label: '其他', value: 'Others', key: createMessageId()}
    ],
    regionDefault = [
        {label: '北京', value: '1096', key: '1096'},
        {label: '上海', value: '1217', key: '1217'},
        {label: '广州', value: '1087', key: '1087'},
        {label: '深圳', value: '1084', key: '1084'},
        {label: '成都', value: '1071', key: '1071'},
        {label: '天津', value: '1244', key: '1244'},
        {label: '苏州', value: '1227', key: '1227'}
    ],
    groupInfo = {groupid: "source_type_id", groupname: "typename"};

function mapStateToProps(state)
{
    let {consultReducer1: consultData, summaryReducer, distributeReducer, searchTreeDataReducer, getEvaluateList, loadDataReducer} = state,
        regionData = loadDataReducer.get("region")
            .get("data");

    return {
        visitorSourceData: searchTreeDataReducer.get("visitorSourceData") || [],
        visitorSourceDefault: searchTreeDataReducer.get("visitorSourceDefault") || [],
        summaryTypeTree: searchTreeDataReducer.get("summaryAllData") || [],
        summaryDefaultData: searchTreeDataReducer.get("summaryDefaultData") || [],
        keyPageData: searchTreeDataReducer.get("keyPageData") || [],
        summaryProgress: summaryReducer.groupProgress,
        consultData,
        groupData: distributeReducer.data || [],
        evaluateList: getEvaluateList.data || {},
        regionData
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getConsultList, getAccountGroup,
        getVisitorSourceGroup, getVisitorSourceList,
        getAccountList, updateCommonUsedConditions,
        updateSelectedConditions, saveCommonUsedConditions,
        deleteCommonUsedConditions
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSearchRefactor);
