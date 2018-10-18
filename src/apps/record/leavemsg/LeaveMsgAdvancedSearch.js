import React from 'react' ;
import { connect } from 'react-redux';
import { Button, Input, Form } from 'antd';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { getAccountGroup, getAccountList } from "../../../apps/record/redux/consultReducer";
import { getLeaveMsgList, updateCommonUsedConditions, updateSelectedConditions, saveCommonUsedConditions, deleteCommonUsedConditions } from "../../../apps/record/redux/leaveMsgReducer";
import DatePickerComponentRecord from "../public/DatePickerComponentRecord";
import moment from 'moment';
import NtTreeForSelect from "../../../components/NtTreeForSelect";
import "../css/leaveMsgAdvancedSearch.scss";
import Tags from "../public/Tags";
import { createMessageId } from "../../../lib/utils/Utils";
import NTButtonGroup from "../../../components/NTButtonGroup";
import TagData from "../data/TagData";
import { bglen } from "../../../utils/StringUtils";
import Modal from "../../../components/xn/modal/Modal";
import { getLangTxt } from "../../../utils/MyUtil";

let FormItem = Form.Item;

class LeaveMsgAdvancedSearch extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.search = {};
        this.state = {
            selectValue: props.selectedValue,
            isShowAllFilterData: false,
            selectedConditions: [...props.selectedConditions],
            startTamp: 0,
            endTamp: 0,
            guestnameValue: '',
            ipValue: '',
            tagsWidth: 0,
            isShowCommonUsedFilterData: false,
            commonUsedTagsWidth: 0,
            commonUsedVisible: false,
            commonSearchName: [...props.commonSearchName]
        };

        this.clientWidth = 0;
	}

    componentDidMount()
    {
        this.props.getAccountGroup();
        let {selectedConditions} = this.props,
            guestnameValue = selectedConditions.find(tag => tag.searchKey === "guestname"),
            ipValue = selectedConditions.find(tag => tag.searchKey === "ip");

        if (guestnameValue)
            this.setState({
                guestnameValue: guestnameValue.value
            });

        if (ipValue)
            this.setState({
                ipValue: ipValue.value
            });
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
        return (item=>{
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
        })
    }

    /*责任客服searchFn函数*/
    onSearchKf(searchKeys, treeSelectedData)
    {
        let usernameFn = this.kfItemTitleFn(),
            kfTags = treeSelectedData.filter(data => data)
                .map(data => {
                    let tagData = new TagData();
                    tagData.key = data.userid;
                    tagData.value = usernameFn(data);
                    tagData.searchKey = "kfid";

                    return tagData;
                }),
            tags = kfTags.concat(this.getTagsWithout("kfid"));

        this.setState({selectedConditions: tags});
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

    delTag(key)
    {
        let {selectedConditions} = this.state,
            tags = [...selectedConditions],
            index = tags.findIndex(tag => tag.key === key);

        let delItem = tags.find(item => item.key === key);

        if(delItem.searchKey==='guestname')
            this.setState({
                guestnameValue: ''
            });

        if(delItem.searchKey==='ip')
            this.setState({
                ipValue: ''
            });

        if(index > -1)
        {
            tags.splice(index, 1);
            this.setState({selectedConditions: tags});
        }
    }

    getWidth(width)
    {
        if (width !== 0)
            this.clientWidth = width;

        this.setState({tagsWidth: this.clientWidth});
    }

    getTags(key)
    {
        let {selectedConditions} = this.state;

            return selectedConditions.filter(tag => tag.searchKey === key);
    }

    get processModeValue()
    {
        return this.getTags("proccessmethod")
            .map(tag => tag.key2);
    }

    get operatingTerminalValue()
    {
        return this.getTags("terminal")
            .map(tag => tag.key2);
    }

    get dealedResultValue()
    {
        return this.getTags("isproccessed")
            .map(tag => tag.key2);
    }

    get startPageValue()
    {
        return this.getTags("startpageurl")
            .map(tag => tag.key2);
    }

    onProcessModeChange(value)
    {
        this.groupChange("proccessmethod", processModeOptions, value);
    }

    onOperatingTerminalChange(value)
    {
        this.groupChange("terminal", operatingTerminalOptions, value);
    }

    ondealedResultChange(value)
    {
        if (value.length > 1)
            value = value.slice(-1);

        this.groupChange("isproccessed", dealedResult, value);
    }

    onStartPageChange(type, e)
    {
        let startPageValue = e.target.value,
            tagData,
            tags;

        if (startPageValue)
        {
            tagData = new TagData();
            tagData.key = type;
            tagData.key2 = startPageValue;
            tagData.value = startPageValue;
            tagData.searchKey = type;
            tagData.isKey = false;
            tagData.type = type;

            tags = [tagData].concat(this.getTagsWithout(type));
            this.setState({selectedConditions: tags});
        }else
        {
            this.delTag(type)
        }
    }

    getTagsWithout(key)
    {
        let {selectedConditions} = this.state;

        return selectedConditions.filter(tag => tag.searchKey !== key);
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
                    tagData.value = getLangTxt(options.label) || options.label;
                    tagData.searchKey = key;
                    tagData.isKey = false;
                    return tagData;
                }),
                tags = gTags.concat(this.getTagsWithout(key));

            this.setState({selectedConditions: tags});
        }
    }

    onOk()
    {
        let {onOk, selectedValue} = this.props,
            {startTamp, endTamp, selectValue, selectedConditions} = this.state,
            sValue = selectValue == undefined ? selectedValue : selectValue;

        if(typeof onOk === "function")
            onOk(selectedConditions, startTamp, endTamp, sValue);
    }

    get kfValue()
    {
        return this.getTags("kfid")
            .map(tag => tag.key);
    }

    onBlurName(e)
    {
        let userNameInput = e.target.value;

        this.inputChange("guestname", userNameInput);
    }

    onBlurIp(e)
    {
        let userIpInput = e.target.value;

        this.inputChange("ip", userIpInput);
    }

    inputChange(key, value)
    {
        let {selectedConditions = []} = this.state,
            filterArray = this.getTagsWithout(key);

        if(value)
        {
            let tagData = new TagData();
            tagData.key = createMessageId();
            tagData.key2 = value;
            tagData.value = value;
            tagData.searchKey = key;
            tagData.isKey = false;

            filterArray.push(tagData);
        }
        this.setState({
            selectedConditions: filterArray
        });
    }

    guestnameOnChange(e)
    {
        this.setState({
            guestnameValue: e.target.value
        })
    }

    ipOnChange(e)
    {
        this.setState({
            ipValue: e.target.value
        })
    }
    //点击展开常用搜索筛选条件列表
    isShowCommonUsedFilterData(isShowCommonUsedFilterData)
    {
        this.setState({isShowCommonUsedFilterData: !isShowCommonUsedFilterData})
    }


    //点击展开筛选条件列表
    isShowAllFilterData(isShowAllFilterData)
    {
        this.setState({isShowAllFilterData: !isShowAllFilterData})
    }

    getCommonUsedWidth(width)
    {
        if (width !== 0)
            this.setState({commonUsedTagsWidth: width});
    }

    /*删除常用搜索tag*/
    delCommonUsedTag(key)
    {
        let { commonSearchName } = this.state,
            tags = [...commonSearchName],
            index = tags.findIndex(tag => tag.key === key);

        if (index > -1)
        {
            tags.splice(index, 1);
            this.setState({
                commonSearchName: tags
            })
            // this.props.updateCommonUsedConditions(tags);

            this.props.deleteCommonUsedConditions(key);
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

    /*自定义校验常用搜索名称*/
    judgeCommonUsedName(rule, value, callback)
    {
        let char = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;

        if(bglen(value) <= 20 && char.test(value))
            callback();

        callback(" ");
    }

    /*常用搜索 关闭*/
    handleCancel()
    {
        this.setState({
            commonUsedVisible: false,
            isUsedWarned: false,
            isOverCount: false
        })
    }

    /*常用搜索 保存*/
    handleOk()
    {
        let {form} = this.props,
            name = form.getFieldValue("name"),
            {commonSearchName, selectedConditions} = this.state,
            commonUsedObj={};

        form.validateFields((errors) => {
            if (errors)
                return false;

            if(commonSearchName.length >= 50)
            {
                this.setState({isOverCount: true});
                return false;
            }

            if (commonSearchName.length === 0) {
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
            else {
                for (let i = 0; i < commonSearchName.length; i++) {
                    if (commonSearchName[i].value === name)
                        break;

                    if (i === commonSearchName.length - 1) {
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
                flag: "1"
            };

            this.props.saveCommonUsedConditions(commonUsedObj)
                .then(result => {
                let {code, data} = result,
	                saveStats = code !== 200,
                    newCommonSearch = [...commonSearchName],
                    addUsedItem = newCommonSearch.find(item => item.key2 === name);

                addUsedItem.key = data;

                code == 200 && this.props.updateCommonUsedConditions(commonSearchName);

                this.setState({commonUsedVisible: saveStats,
                    isUsedWarned: code,
                    commonSearchName: newCommonSearch
                });
            });
        })
    }

    /*常用搜索 保存并搜索*/
    handleOkAndSearch()
    {

        let {form} = this.props,
            {selectedConditions, commonSearchName} = this.state;

        form.validateFields((errors) => {
            if (errors)
                return false;

            if(commonSearchName.length >= 50)
            {
                this.setState({isOverCount: true});
                return false;
            }

            this.handleOk();
            this.props.onCancel();

            this.props.updateSelectedConditions(selectedConditions);
            this.onOk();
        })
    }

    /*点击已保存常用搜索*/
    handleCommonSearch(tagInfo)
    {
        if (tagInfo)
            this.setState({
                selectedConditions: tagInfo.selectedConditions,
                clickedSearchTag: tagInfo
            })
    }

    render()
	{
        let {leaveMsgData, isproccessed, selectedValue, time, onCancel} = this.props,
            mainkfsGroup = leaveMsgData.getIn(["account", "data"]) || [],
            className = "",
            commonUsedClassName = '',
            widthMore = false,
            commonUsedWidthMore = false,
            filterDataBox = document.getElementById("leaveMsgAdvancedSearchTags"),
            filterCommonUsedBox = document.getElementById("leaveMsgCommonSearchTags"),
            {tagsWidth, isShowAllFilterData, selectedConditions, guestnameValue, ipValue, commonUsedTagsWidth, commonUsedVisible, isShowCommonUsedFilterData, commonSearchName, isUsedWarned, isOverCount} = this.state,
            commonBtnIsClick = selectedConditions.length > 0 ? false : true;

        const {getFieldDecorator} = this.props.form;

        widthMore = tagsWidth > 512;
        commonUsedWidthMore = commonUsedTagsWidth > 512;

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
            filterCommonUsedBox && filterCommonUsedBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            filterCommonUsedBox && filterCommonUsedBox.setAttribute("class", "selectedBox showExtra");
        }

        className = !widthMore || isShowAllFilterData ? "showExtra" : "hideExtra";
        commonUsedClassName = !commonUsedWidthMore || isShowCommonUsedFilterData ? "showExtra" : "hideExtra";

        return(
            <div className="advancedSearchContent">
                <ScrollArea speed={1} style={{height: 'calc(100% - 0.24rem - 28px)'}} horizontal={false} smoothScrolling>
                    <div className="dataWrap">
                        <DatePickerComponentRecord selectedValue={this.state.selectValue == undefined ? selectedValue : this.state.selectValue}
                            time={this.state.searchTime || time}
                            _onOk={this.getSearchTime.bind(this)}/>
                    </div>

                    <div className="selectedCondition">
                        <div>
                            <label>{getLangTxt("record_common_search")}</label>
                            <Tags tags={commonSearchName} onClick={this.handleCommonSearch.bind(this)} delDataFn={this.delCommonUsedTag.bind(this)} getWidth={this.getCommonUsedWidth.bind(this)} classname={commonUsedClassName} idnames="leaveMsgCommonSearchTags"/>
                            {
                                commonUsedWidthMore ?
                                    <a onClick={this.isShowCommonUsedFilterData.bind(this, isShowCommonUsedFilterData)}>
                                        {isShowCommonUsedFilterData ? getLangTxt("setting_webview_takeup") : getLangTxt("setting_webview_open")}
                                    </a> : null
                            }
                        </div>
                        <div>
                            <label>已选条件</label>
                            <Tags tags={selectedConditions}
                                delDataFn={this.delTag.bind(this)}
                                getWidth={this.getWidth.bind(this)}
                                classname={className}
                                idnames="leaveMsgAdvancedSearchTags"/>
                            {
                                widthMore ?
                                    <a onClick={this.isShowAllFilterData.bind(this, isShowAllFilterData)}>
                                        {isShowAllFilterData ? getLangTxt("setting_webview_takeup") : getLangTxt("setting_webview_open")}
                                    </a> : null
                            }
                        </div>
                    </div>

                    <div className="leaveMsgUserinfo">
                        <span className="leaveMsgUserinfo_name">{getLangTxt("setting_blacklist_username")}</span>
                        <Input placeholder={getLangTxt("userNameTip")} ref="userNameInput" value={guestnameValue}
                            className="leaveMsgUserinfo_nameI"
                            onChange={this.guestnameOnChange.bind(this)}
                            onBlur={this.onBlurName.bind(this)}/>

                        <span className="leaveMsgUserinfo_name">{getLangTxt("rightpage_tab_ip")}</span>
                        <Input placeholder={getLangTxt("rightpage_tab_note3")} ref="userIpInput" value={ipValue}
                            onChange={this.ipOnChange.bind(this)}
                            onBlur={this.onBlurIp.bind(this)}/>
                    </div>

                    <div className="center">
                        <div className="responsibilityKFSelect perSelect">
                            <label className="customerLabel">{getLangTxt("record_kf")}</label>
                            <NtTreeForSelect treeData={mainkfsGroup}
                                checkedKeys={this.kfValue}
                                itemInfo={{itemid: "userid"}}
                                searchFn={this.onSearchKf.bind(this)}
                                loadDataFn={this.kfLoadDataFn.bind(this)}
                                itemTitleFn={this.kfItemTitleFn()}
                                popupContainer="advancedSearchContent"
                            />
                        </div>

                        {
                            isproccessed ?
                                <div className="perSelect">
                                    <label>{getLangTxt("rightpage_tab_deal_mode")}</label>
                                    <NTButtonGroup options={processModeOptions} itemClassName="perSelectItem"
                                        className="perSelectNTButtonGroup"
                                        value={this.processModeValue} onChange={this.onProcessModeChange.bind(this)}/>
                                </div> : null
                        }

                        <div className="perSelect">
                            <label>{getLangTxt("rightpage_tab_tml")}</label>
                            <NTButtonGroup options={operatingTerminalOptions} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.operatingTerminalValue} onChange={this.onOperatingTerminalChange.bind(this)}/>
                        </div>
                        <div className="perSelect">
                            <label>{getLangTxt("record_dealed_result")}</label>
                            <NTButtonGroup options={dealedResult} itemClassName="perSelectItem"
                                className="perSelectNTButtonGroup"
                                value={this.dealedResultValue} onChange={this.ondealedResultChange.bind(this)}/>
                        </div>
                        <div className="perSelect">
                            <label className="startPageLabel">{getLangTxt("record_start_page")}</label>
                            <Input className="customerPropsValue startPageIpt" value={this.startPageValue}
                                onChange={this.onStartPageChange.bind(this, "startpageurl")}/>
                        </div>
                    </div>
                </ScrollArea>
                <div className="btnContainer">
                    <Button className="btn" type="primary" onClick={this.onOk.bind(this)}>{getLangTxt("sure")}</Button>
                    <Button className="btn" onClick={onCancel}>{getLangTxt("cancel")}</Button>
                    <Button className="addToCommonBtn" disabled={commonBtnIsClick} onClick={this.addToCommonUsed.bind(this)}>
	                    {getLangTxt("record_add_common_conditions")}
                    </Button>
                </div>

                <Modal title={getLangTxt("record_common_search")}
                    visible={commonUsedVisible}
                    width={540}
                    wrapClassName='addCommonUsed'
                    footer={[
                        <Button onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>,
                        <Button type="primary" onClick={this.handleOk.bind(this)}>{getLangTxt("save")}</Button>,
                        <Button type="primary" onClick={this.handleOkAndSearch.bind(this)}>{getLangTxt("seach_save")}</Button>
                        ]}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form>
                        <FormItem>
                            <p>{getLangTxt("record_common_search_name")}</p>
                            {
                                getFieldDecorator('name', {
                                    initialValue: '',
                                    rules: [{required: true, whitespace:true}, { validator: this.judgeCommonUsedName.bind(this)}]
                                })(<Input />)
                            }
                            {
                            	this.getWarnedMessage(isUsedWarned)
                            }
                            {isOverCount ?  <p className="commonUsedWarned">{getLangTxt("record_common_note1")}</p> : null}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
	}

	getWarnedMessage(isUsedWarned)
	{
		let message = "";
		if(isUsedWarned == 399)
		{
			message = getLangTxt("record_common_note2");
		}
		else if(isUsedWarned == 400 || isUsedWarned == 500)
		{
			message = getLangTxt("20034");
		}

		return message ? <p className="commonUsedWarned">{getLangTxt("record_common_note2")}</p> : null;
	}
}

LeaveMsgAdvancedSearch = Form.create()(LeaveMsgAdvancedSearch);

const processModeOptions = [
        {label: "record_message", value: 1, key: createMessageId()},
        {label: 'rightpage_tab_email', value: 2, key: createMessageId()},
        {label: 'other', value: 3, key: createMessageId()}
    ],
    dealedResult = [
        {label: "record_dealedresult", value: true, key: createMessageId()},
        {label: 'record_undealed', value: false, key: createMessageId()}
    ],
    operatingTerminalOptions = [
        {label: 'Web', value: 1, key: createMessageId()},
        {label: 'setting_queue_weChat', value: 2, key: createMessageId()},
        {label: 'Wap', value: 3, key: createMessageId()},
        {label: 'iOS app', value: 4, key: createMessageId()},
        {label: 'Android app', value: 5, key: createMessageId()},
        {label: 'other', value: 0, key: createMessageId()}
    ];

function mapStateToProps(state)
{
	let {leaveMsgReducer: leaveMsgData} = state;

	return {
        leaveMsgData
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
        getLeaveMsgList, getAccountGroup, getAccountList, updateCommonUsedConditions, updateSelectedConditions, saveCommonUsedConditions, deleteCommonUsedConditions
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveMsgAdvancedSearch);
