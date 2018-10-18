import React, {PropTypes} from 'react'
import {Radio, Select, TreeSelect, Form, Button, DatePicker, Input} from 'antd'
import {
    fetchFilter,
    filterData,
    addQuery,
    getAccount,
    getRegionData,
    getVisitorSourceList,
    keyPage,
    distribute
} from '../redux/filterReducer'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import moment from 'moment'
import ScrollArea from 'react-scrollbar'
import {filterItem, parentNode, getUser} from './kpiService/filter'
import {getLangTxt} from "../../../utils/MyUtil";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
const {RangePicker} = DatePicker;

let uuid = 1;

class ShowScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ['0-0-0'],
            buttonValue: "And",
            valueDiv: [{
                id: 0,
                name: "",
                operation: "=",
                multiSelect: true,
                ui: "",
                value: ""
            }]
        }
    }

    componentWillMount() {
        let stateValue,
            name = this.props.name,
            _query = {...this.props.query},
            query = _query[name];
        if (_query === undefined || _query === false || _query.length === 0 || !query) {
            return;//第一次走这个路径
        }
        stateValue = {valueDiv: [...query]};
        this.setState(stateValue);

    }

    //改变筛选条件,选择日期时间还是客服等
    _changeQuery(index, name)//name 显示当前名字，index显示当前valueDiv的个数
    {
        let items = [...this.props.filter],
            nextValueDiv = [...this.state.valueDiv],
            filterCriteria = this.props.filterCriteria;//筛选条件第三个框的数据
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === name) {
                if (!filterCriteria.hasOwnProperty(name))//默认client，如果选region2属性，但是filterCriteria不包含region2，则请求
                {
                    if (name === 'region2') {
                        this.props.getRegionData();
                    }
                    else if (name === 'search_from') {
                        this.props.getVisitorSourceList()
                    }
                    else if (name === 'key_page_level') {
                        this.props.keyPage()
                    }
                    else if (name === 'cs_group') {
                        this.props.distribute()
                    }
                    else {
                        this.props.filterData(name);//对cs单独路径规划发起请求
                    }
                }

                nextValueDiv[index] = items[i];
                nextValueDiv[index].value = "";
                this.setState({
                    valueDiv: nextValueDiv
                });
            }
        }
    }

    //不同维度关系
    changeButton(e) {
        this.setState({
            buttonValue: e.target.value
        })
    }

    //删除维度
    remove(index) {
        let value = this.state.valueDiv;
        value.splice(index, 1);
        this.setState({
            valueDiv: value
        })
    }

    //添加维度
    add() {
        let value = this.state.valueDiv;

        // let {filter = []} = this.props; //可根据filter长度来确定筛选条件条数 当超过filter长度则不可添加（）

        value.push({id: uuid, name: "", operation: "=", multiSelect: true, ui: "", value: ""});
        this.setState({
            valueDiv: value
        });
        uuid++;
    }

    //确认获取全部维度
    confirm() {
        let valueDiv = this.state.valueDiv.concat(),
            currUser = valueDiv.concat([]);
        if (currUser.length != 0) {
            for (let i = currUser.length; i--;) {
                if (currUser[i].name === "") {
                    currUser.splice(i, 1);
                    valueDiv.splice(i, 1);
                }
            }
        }
        this.props.addQuery(valueDiv, this.props.name);
        this.props.close(currUser);
    }

    //异步加载数据（客服）
    onLoadData(treesData, index, treeNode) {
        let groupid = treeNode.props.eventKey,
            i,
            data,
            value,
            nexValue = this.state.valueDiv;
        return new Promise((resolve) => {
            setTimeout(() => {
                getAccount(groupid).then((result) => {
                    if (result.code != 200) {
                        resolve();
                        return;
                    }
                    data = result.data;
                    if (data.length == 0) {
                        resolve();
                    }
                    for (i = 0; i < data.length; i++) {
                        data[i]["key"] = data[i].userid;
                        data[i]["value"] = data[i].username;
                        data[i]["label"] = data[i].username;
                    }
                    value = this.props.filterCriteria.cs;

                    getUser(value, groupid, data);

                    this.setState({
                        valueDiv: [...nexValue]
                    })
                });
                resolve();
            }, 500);
        });
    }

    //取消筛选
    cancle() {
        this.props.close([]);
    }

    //改变筛选时间
    _changeDate(index, dateString, value) {
        let dateTime = {};
        dateTime.valueDiv = this.state.valueDiv;
        dateTime.valueDiv[index].value = `${value[0]},${value[1]}`;
        if (dateString.length == 0) {
            dateTime.valueDiv[index].value = "";
        }
        this.setState(dateTime);
    }


    //改变文本输入框内容
    onIptValueChange(index, e) {
        let valueDiv = this.state.valueDiv;
        valueDiv[index].value = e.target.value;
        this.setState({valueDiv});
    }

    //下拉选框可选值
    _selectNodes(data, index) {
        let nexData, selectOption,
            filterCriteria = this.props.filterCriteria;
        nexData = filterCriteria.hasOwnProperty(data.name) ? filterCriteria[data.name] : [];
        selectOption = nexData.length != 0 ? nexData.map((item, index) => {
                return <Option key={index} value={item.name}>{item.title}</Option>
            }
        ) : <Option value="noData" disabled>{getLangTxt("noData1")}</Option>;

        return selectOption;
    }

    //下拉选框选择的选中值
    _changeSeletValue(index, value) {
        let valueDiv = this.state.valueDiv;
        valueDiv[index].value = value.toString();
        this.setState({
            valueDiv: valueDiv
        })
    }

    //改变树选择的选中值
    _changeTreeValue(index, value) {
        let valueDiv = this.state.valueDiv;
        valueDiv[index].value = value.join();

        this.setState({
            valueDiv: valueDiv
        })
    }

    //选择客服
    _selectTreeValue(index, value) {
        let valueDiv = this.state.valueDiv;
        valueDiv[index].value = value.join();

        this.setState({
            valueDiv: valueDiv
        })
    }

    //改变筛选条件关联
    _operation(index, value) {
        let data = this.state.valueDiv;
        data[index].operation = value;
        this.setState({
            valueDiv: data
        })
    }

    /*
     * 用户地域  对应值渲染  TreeSelect
     * @param currentFilterData = {} 当前操作筛选条件条目值
     * */
    getUserRegionComponent(index) {
        let valueDiv = this.state.valueDiv[index],
            name = valueDiv.name,
            treeData = this.props.filterCriteria.hasOwnProperty(name) ? this.props.filterCriteria[name] : [],
            value = valueDiv.value ? valueDiv.value.split(",") : [];

        let loop = data => data.length > 0 ? data.map((item) => {
            if (item.id > 2) {
                item.isLeaf = true
            }
            if (item.children) {
                return <TreeNode title={item.name} key={item.id} value={item.name}
                                 isLeaf={item.isLeaf}>{loop(item.children)}</TreeNode>;
            }
            return <TreeNode title={item.name} key={item.id} value={item.name} isLeaf={item.isLeaf}/>;
        }) : null;

        return (
            <TreeSelect
                className="areaSelectStyle"
                multiple={true}
                getPopupContainer={() => document.querySelector(".ant-layout-aside")}
                value={value}
                treeCheckable={true}
                dropdownStyle={{maxHeight: 340, overflowX: 'hidden', overflowY: 'auto'}}
                placeholder={getLangTxt("kpi_placeholder")}
                onChange={this._changeTreeValue.bind(this, index)}
                style={{width: 517, margin: "10px 10px 0 22px"}}>
                {
                    loop(treeData)
                }
            </TreeSelect>
        )
    }

    //具体筛选数据显示UI及具体数据
    _selectValueUi(data, index) {
        let ui = data.ui, treeNode, treesData, atProps, value, name = data.name,
            filterCriteria = this.props.filterCriteria,//过滤
            multiSelect = data.multiSelect,
            select;

        treesData = filterCriteria.hasOwnProperty(name) ? filterCriteria[name] : [];

        value = data.value ? data.value.split(",") : [];

        switch (ui) {
            case "tree":
                if (treesData.length == 0) {
                    return (
                        <TreeSelect size="large" style={{width: 517, margin: "10px 10px 0 22px"}}>
                            <TreeNode value="noData" title={getLangTxt("noData1")} key="random" disabled/>
                        </TreeSelect>
                    )
                } else if (name === "cs") {
                    const loop = data => data.map((item) => {
                        const {groupname, key, children} = item,
                            isGroup = item.hasOwnProperty("children");
                        if (isGroup) {
                            let disableCheckbox = children.length <= 0;
                            return (
                                disableCheckbox ?
                                    <TreeNode title={groupname} key={key} value={groupname}
                                              disableCheckbox={disableCheckbox} kftype={2}>
                                        <TreeNode key={key + "_"} title={getLangTxt("noData3")} disableCheckbox={true}/>
                                    </TreeNode>
                                    :
                                    <TreeNode TreeNode title={groupname} key={key} value={groupname}
                                              disableCheckbox={disableCheckbox} kftype={2}>
                                        {
                                            loop(children)
                                        }
                                    </TreeNode>
                            );
                        }
                        else if (item.externalname) {
                            let {externalname, nickname, userid} = item, username = "";

                            if (externalname && nickname) {
                                username = nickname + "[" + externalname + "]";
                            }
                            else if (externalname || nickname) {
                                username = externalname || nickname;
                            }
                            else {
                                username = userid;
                            }
                            return <TreeNode title={username} key={item.key} isLeaf={true} value={userid}
                                             search={userid}/>;
                        }

                        return <TreeNode title={groupname} key={key} value={groupname}/>;
                    });

                    return (
                        <TreeSelect key="1" size="large"
                                    value={value}
                                    getPopupContainer={() => document.querySelector(".filterListContainer")}
                                    style={{width: 517, margin: "10px 10px 0 22px"}}
                                    treeCheckable={true}
                                    dropdownMatchSelectWidth={false}
                                    dropdownStyle={{height: 230, overflowY: "auto", width: 517}}
                                    loadData={this.onLoadData.bind(this, treesData, index)}
                                    onChange={this._selectTreeValue.bind(this, index)}
                        >
                            {
                                loop(treesData)
                            }
                        </TreeSelect>
                    )
                }
                else if (name === "region2") {
                    return this.getUserRegionComponent(index);
                }
                else {
                    const loopTreeNode = data => data.map((item) => {
                        if (item.children) {
                            return (
                                <TreeNode title={item.groupname} key={item.key} value={item.groupname}>
                                    {loopTreeNode(item.children)}
                                </TreeNode>
                            );
                        }
                        return <TreeNode title={item.groupname} key={item.key} value={item.groupname}/>;
                    });

                    return (
                        <TreeSelect key="2"
                                    size="large"
                                    searchPlaceholder='Please select'
                                    getPopupContainer={() => document.querySelector(".filterListContainer")}
                                    value={value}
                                    style={{width: 517, margin: "10px 10px 0 22px"}}
                                    treeCheckable={true}
                                    dropdownMatchSelectWidth={false}
                                    dropdownStyle={{height: 230, overflowY: "auto", width: 517}}
                                    onChange={this._changeTreeValue.bind(this, index)}
                        >
                            {
                                loopTreeNode(treesData)
                            }
                        </TreeSelect>
                    )
                }
                break;

            case "datetime":
                if (value.length == 2) {
                    let defaultvalue = [moment(value[0]), moment(value[1])];
                    return (
                        <RangePicker
                            defaultValue={defaultvalue}
                            showTime
                            getCalendarContainer={() => document.querySelector(".filterListContainer")}
                            format="YYYY-MM-DD HH:00:00"
                            placeholder={[getLangTxt("start_time"), getLangTxt("end_time")]}
                            style={{margin: "10px 10px 0 22px", width: 517}}
                            size="large"
                            popupStyle={{zIndex: '10000'}}
                            // disabledDate={disabledDate}
                            onChange={this._changeDate.bind(this, index)}
                        />
                    )
                }

                return (
                    <RangePicker
                        showTime
                        getCalendarContainer={() => document.querySelector(".filterListContainer")}
                        format="YYYY-MM-DD HH:00:00"
                        placeholder={[getLangTxt("start_time"), getLangTxt("end_time")]}
                        style={{margin: "10px 10px 0 22px", width: 517}}
                        size="large"
                        popupStyle={{zIndex: '10000'}}
                        // disabledDate={disabledDate}
                        onChange={this._changeDate.bind(this, index)}
                    />
                )
                break;

            case "select":
                select = multiSelect ? "multiple" : multiSelect;
                return (
                    <Select size="large"
                            style={{width: 517, marginRight: 10, margin: "10px 10px 0 22px"}}
                            mode={select}
                            notFoundContent="Not Data"
                            getPopupContainer={() => document.querySelector(".filterListContainer")}
                            defaultValue={value}
                            onChange={this._changeSeletValue.bind(this, index)}
                    >
                        {this._selectNodes(data, index)}
                    </Select>
                );
                break;
            case "input":
                value = data.value;
                return (
                    <div style={{width: "517px", display: "inline-block", margin: "10px 10px 0 22px"}}><Input
                        size="large" onBlur={this.onIptValueChange.bind(this, index)} defaultValue={value}/></div>
                )
                break;
            default:
                return (
                    <div style={{width: "517px", display: "inline-block", margin: "10px 10px 0 22px"}}><Input
                        size="large"/></div>
                )
        }
    }

    //筛选关联条件匹配
    _selectOperation(data, index) {
        if (data.ui == "datetime") {
            data.operation = "between";
            return (
                <Select size="large" style={{width: 116}} value={"between"}
                        getPopupContainer={() => document.querySelector(".filterListContainer")}
                        onChange={this._operation.bind(this, index)}>
                    <Option key="between" value="between">{getLangTxt("contain")}</Option>
                </Select>
            )
        } else {
            return (
                <Select size="large" style={{width: 116}} value={data.operation || "="}
                        getPopupContainer={() => document.querySelector(".filterListContainer")}
                        onChange={this._operation.bind(this, index)}>
                    <Option key="=" value="=">=</Option>
                    {/*					<Option key="!" value="!">≠</Option>
					<Option key="in" value="in">{getLangTxt("contain")}</Option>*/}
                </Select>
            )
        }
    }

    render() {
        let filter = this.props.filter || [],
            valueDiv = this.state.valueDiv;

        let filterConditions = filter.length !== 0 ?//第一个选择项
            filter.map((item, index) => {
                if (!filterItem(item.name, valueDiv))//当前valueDiv中是否存在item.name
                {
                    return (
                        <Option key={index} value={item.name}>{item.title}</Option>
                    )
                } else {
                    return (
                        <Option key={index} value={item.name} disabled>{item.title}</Option>
                    )
                }
            }) : null;
        let form = valueDiv.length != 0 ? valueDiv.map((item, index) => {
            return (
                <div key={index} style={{position: "inherit"}}>
                    {
                        index !== 0 ?
                            <svg style={{
                                width: "8px",
                                height: "8px",
                                position: "absolute",
                                left: "-4px",
                                top: "13px",
                                zIndex: "10"
                            }}>
                                <circle cx="4" cy="4" r="4"/>
                            </svg> :
                            null
                    }
                    {
                        index !== 0 ?
                            <Form inline>
                                <span className='queueList-border'></span>
                                <RadioButton style={{borderRadius: '6px'}}>{this.state.buttonValue}</RadioButton>
                            </Form> :
                            null
                    }
                    <div className="ant-form value">
                        <span className='queueList-border'></span>

                        <Select size="large" style={{width: 389}} value={item.name || ""}
                                getPopupContainer={() => document.querySelector(".filterListContainer")}
                                onChange={this._changeQuery.bind(this, index)}>
                            {filterConditions}
                        </Select>

                        {this._selectOperation(item, index)}

                        {this._selectValueUi(item, index)}

                        {index !== 0 ? <i className="iconfont icon icon-006jianxiao"
                                          onClick={this.remove.bind(this, index)}/> : null}

                    </div>
                </div>
            );
        }) : null;
        return (
            <div className="screen">
                <div className="mask" onClick={this.cancle.bind(this)}></div>
                <div className="content">
                    <div
                        className="area showScreenScroll"
                        style={{height: 'calc(100% - 50px)'}}
                        horizontal={false}
                        smoothScrolling
                    >
                        <RadioGroup disabled defaultValue={this.state.buttonValue}
                                    onChange={this.changeButton.bind(this)}>
                            <RadioButton value="And">And</RadioButton>
                        </RadioGroup>
                        <div className="main filterListContainer">
                            {form}
                            <div className="add" onClick={this.add.bind(this)}>
                                <i className="iconfont icon icon-tianjia1"/>
                                <span>{getLangTxt("kpi_add_conditions")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <Button type="primary" onClick={this.confirm.bind(this)}>{getLangTxt("sure")}</Button>
                        <Button type="ghost" onClick={this.cancle.bind(this)}>{getLangTxt("cancel")}</Button>
                    </div>
                </div>
            </div>
        )
    }
}

function disabledDate(current) {
    return current && current.valueOf() > Date.now();
}

function mapStateToProps(state) {
    return {
        filter: state.filterConditions.data,
        query: state.query.data,
        filterCriteria: state.filterCriteria.data || {},
        progress: state.query.progress
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchFilter,
        addQuery,
        filterData,
        getRegionData,
        getVisitorSourceList,
        keyPage,
        distribute
    }, dispatch);
}

ShowScreen = Form.create()(ShowScreen);

export default connect(mapStateToProps, mapDispatchToProps)(ShowScreen);
