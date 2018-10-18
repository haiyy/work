import React  from 'react';
import {Cascader, Button, Modal, Tabs, Table, Switch, Form, Select, Input, Tooltip, message} from 'antd';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import moment from 'moment';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import {ReFresh} from "../../../components/ReFresh";
import { bglen } from "../../../utils/StringUtils"
import NTModal from "../../../components/NTModal";
import {truncateToPop} from "../../../utils/StringUtils";
import CreateShop from "./CreateShop";
import {delShopItem, enableShopItem, getShopItem, getSearchShopItem, clearErrorNewItemProgress} from "./reducer/shopAccountReducer";

const TabPane = Tabs.TabPane,
    confirm = Modal.confirm,
    FormItem = Form.Item,
    Option = Select.Option,
    Search = Input.Search;

class ShopList extends React.PureComponent {

    static NEW_SHOP_ITEM = 1;  //新建商户
    static EDIT_SHOP_ITEM = 2;  //编辑商户

    constructor(props) {
        super(props);
        this.state = {
            pageData: 1,
            isSearch: false
        };

        this.searchInfo = {
            page: 1,
            size: 10,
        }
    }

    componentDidMount() {
        this.setState({})
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedGroupId != this.props.selectedGroupId)
        {
            this.setState({ pageData: 1, isSearch: false });
        }
    }

    //判断内部名规则可输入汉字
    judgeShowNameSpace(rule, value, callback)
    {
        let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

        if(value === "" || accountNameRe.test(value))
        {
            callback();
        }
        callback(" ");
    }

    //判断账户名规则，不可输入汉字
    judgeSpace(rule, value, callback)
    {
        // let accountNameRe = /^\w{1,16}$/;
        // if(value === "" || accountNameRe.test(value))

        if(value && value.trim() !== "" &&  bglen(value) <= 32)
        {
            callback();
        }
        callback(" ");
    }

    onShopTimeChange(value)
    {
        switch(value[0])
        {
            case "all":
                delete this.searchInfo.creatTime;
                delete this.searchInfo.grade;
                break;
            case "time":
                delete this.searchInfo.grade;
                this.searchInfo.creatTime = value[1];
                break;
            case "grade":
                delete this.searchInfo.creatTime;
                delete this.searchInfo.keyword;
                this.searchInfo.grade = 1;
                break;
        }
        if (value[0] !== "grade")
        {
            this.searchInfo.page = 1;
            this.props.getSearchShopItem(this.searchInfo);
            this.setState({isSearch: true, pageData: 1});
            this.props.getCurrentGroup("");
        }
    }

    displayRender(label)
    {
        return label[label.length - 1];
    }

    onSearchShopAccount(e)
    {
        let searchVal = e.target.value;
        if (this.searchInfo.grade)
        {
            this.searchInfo.grade = searchVal
        }else
        {
            this.searchInfo.keyword = searchVal
        }
    }

    handleSearchShop()
    {
        this.searchInfo.page = 1;
        this.props.getSearchShopItem(this.searchInfo);
        this.setState({isSearch: true, pageData: 1});
        this.props.getCurrentGroup("");
    }

    handleShopItemIO(record, checked)
    {
        let enabled = checked ? 1 : 0;
        record.enabled = enabled;

        this.props.enableShopItem({enabled}, record.siteid);
        this.forceUpdate();
    }

    showDelShopConfirm(record)
    {
        let {siteid, groupid} = record,
            {selectedGroupId} = this.props,
            {pageData, isSearch} = this.state,
            finalPage;

        Modal.confirm({
            title: '删除提示',
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            content: '是否确定删除此项？',
            onOk : () => {
                finalPage = this.shopItemList.length === 1 ? pageData - 1 : pageData;

                this.props.delShopItem({siteid}, finalPage, selectedGroupId, isSearch, this.searchInfo);
            }
        });
    }

    handleNewShop(record)
    {
        let modalType = record ? ShopList.EDIT_SHOP_ITEM : ShopList.NEW_SHOP_ITEM;
        this.setState({modalType, record});
    }

    handleCancelNewShop()
    {
        this.setState({modalType: null})
    }

    getCreateShopModal()
    {
        let {modalType, record, pageData} = this.state,
            {selectedGroupId} = this.props;

        if (modalType)
        {
            return <CreateShop
                        pageData={pageData}
                        selectedGroupId={selectedGroupId}
                        getCurrentGroup={this.props.getCurrentGroup.bind(this)}
                        modalType={modalType} editGroupInfo={record}
                        handleCancel={this.handleCancelNewShop.bind(this)}
                    />
        }
    }


    reFreshFn(obj) {

        this.props.getShopItem(obj);
        this.setState({currentPage: 1})
    }


    _getProgressComp(obj) {
        let {progress} = this,
            errorMsg = "数据保存失败！";

        if (progress.right) {
            if (progress.right === LoadProgressConst.LOAD_COMPLETE || progress.right === LoadProgressConst.SAVING_SUCCESS)
                return;

            if (progress.right === LoadProgressConst.LOADING || progress.right === LoadProgressConst.SAVING)  //正在加载或正在保存
            {
                return (
                    <div className="shopAccountProgress">
                        <Spin style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
                    </div>
                );
            } else if (progress.right === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
                return <ReFresh reFreshStyle={{width: "calc(100% - 2.03rem)"}} reFreshFn={this.reFreshFn.bind(this,obj)}/>;
            }
            else
            {
                if (progress.right === LoadProgressConst.SAVING_FAILED)  //保存失败
                {
                    errorMsg = "操作失败！";
                }
                else if (progress.right === LoadProgressConst.DUPLICATE)  //用户名重复
                {
                    errorMsg = "商户已存在！";
                }

                this.props.clearErrorNewItemProgress();

                this.errorModal = Modal.error({
                    title: "操作失败",
                    iconType: 'exclamation-circle',
                    className: "errorTip",
                    content: errorMsg,
                    okText: '确定',
                    width: '320px',
                    onOk:() => {
                        this.errorModal = null
                    }
                });
            }

        }
        return null;
    }

    get shopItemList()
    {
        let {shopData} = this.props;

        return shopData.get("shopItemList") || []
    }

    get shopListCount()
    {
        let {shopData} = this.props;

        return shopData.get("totalCount")
    }

    get progress()
    {
        let {shopData} = this.props;

        return shopData.get("progress")
    }

    render() {
        let options = getOption.call(this),
            columns = getColumn.call(this),
            {selectedGroupId} = this.props,
            {pageData, isSearch} = this.state,
            groupInfo,
            pagination = {
                total: this.shopListCount || 0,
                showQuickJumper: true,
                current: pageData,
                showTotal: (total) => {
                    return `总计 ${total} 条`;
                },
                onChange: (pageData) => {
                    groupInfo = {
                        page: pageData,
                        size: 10
                    };

                    if (selectedGroupId && !isSearch)
                        groupInfo.groupid = selectedGroupId;

                    if (isSearch)
                    {
                        this.searchInfo.page = pageData;
                        this.props.getSearchShopItem(this.searchInfo);
                    }else
                    {
                        this.props.getShopItem(groupInfo);
                    }
                    this.setState({pageData})
                }
            };

        return (
            <div className="shopListComp">
                <div className="shopListOperate">
                    <Cascader
                        options={options}
                        expandTrigger="hover"
                        defaultValue={["time"]}
                        allowClear={false}
                        displayRender={this.displayRender.bind(this)}
                        onChange={this.onShopTimeChange.bind(this)}
                    />
                    { /*<Button type="primary">导出</Button>
                        <Button type="primary">导入</Button>
                        <Button type="primary">下载模板</Button>*/}
                    <Button type="primary" onClick={this.handleNewShop.bind(this, false)}>新建商户</Button>
                    <div className="searchBox">
                        <Input onKeyUp={this.onSearchShopAccount.bind(this)} className="searchIpt"/>
                        <Button className="searchBtn" type="primary" onClick={this.handleSearchShop.bind(this)} icon="search"/>
                    </div>
                </div>
                <div className="shopAccountListCon">
                    <Table columns={columns}
                        dataSource={this.shopItemList}
                        pagination={pagination}
                    />
                </div>
                {
                    this.getCreateShopModal()
                }
                {
                    this._getProgressComp(groupInfo)
                }
            </div>
        )
    }

}


ShopList = Form.create()(ShopList);

function getOption()
{
    return [{
            value: 'all',
            label: '全部'
        }, {
            value: 'time',
            label: '创建时间',
            children: [{
                value: "0",
                label: '近一周'
            },{
                value: "1",
                label: '近一个月'
            },{
                value: "2",
                label: '近三个月'
            }]
        },{
            value: 'grade',
            label: '按等级'
        }];
}

function getColumn()
{
    return [{
        key: 'enabled',
        title: '启用',
        dataIndex: 'enabled',
        width: '10%',
        render: (data, record)=>
            <Switch checked={data === 1} onChange={this.handleShopItemIO.bind(this, record)}/>
    }, {
        key: 'name',
        title: '商户名',
        dataIndex: 'name',
        width: '14%'
    }, {
        key: 'shopid',
        title: '商户ID',
        dataIndex: 'shopid',
        width: '15%'
    }, {
        key: 'grade',
        title: '商户等级',
        dataIndex: 'grade',
        width: '17%'
    }, {
        key: 'usernum',
        title: '商户坐席数',
        dataIndex: 'usernum',
        width: '17%'
    }, {
        key: 'createtime',
        title: '创建时间',
        dataIndex: 'createtime',
        width: '17%',
        render: text => text && moment(text).format('YYYY-MM-DD HH:mm:ss') || '无'
    }, {
        title: '操作',
        key: 'action',
        width: '10%',
        render: (data, record) =>
            <div className="shopOperate">
                <Tooltip placement="bottom" title="编辑">
                    <i className="iconfont icon-bianji" onClick={this.handleNewShop.bind(this, record)}/>
                </Tooltip>
                <Tooltip placement="bottom" title="删除">
                    <i className="iconfont icon-shanchu" onClick={this.showDelShopConfirm.bind(this, record)}/>
                </Tooltip>
            </div>
    }];
}

function mapStateToProps(state) {
    return {
        shopData: state.shopAccountReducer
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({delShopItem, enableShopItem, getShopItem, getSearchShopItem, clearErrorNewItemProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopList);
