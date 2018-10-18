import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {Checkbox, Tree} from 'antd';
import { List, is, Map } from "immutable";
import './style/consultBinding.less'
import {getConsultBindingList, getBindingShopGroup/*, getShopGroupItem*/} from "./reducer/consultBindingReducer";
import ScrollArea from 'react-scrollbar';
import TreeNode from "../../../components/antd2/tree/TreeNode";

const CheckboxGroup = Checkbox.Group;

class ConsultBindingCon extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
            halfChecked: [],  //半代理选中
            fallChecked: [],  //全代理选中
            halfDisabled: [],  //半代理所有不可选
            fallDisabled:[],  //全代理所有不可选
            halfSelectedAll: false,  //全代理全选
            fallSelectedAll: false,  //半代理全选
            halfSelectedState: [],  //半代理其他商户绑定
            fallSelectedState: []  //全代理其他商户绑定
		};
	}

    componentDidMount() {
        this.props.getBindingShopGroup(4);
    }

    getCheckedDetailId(proxyIds = [], disabled)
    {
        let state = disabled ? 1 : 0,
            filterArray = [];

        if (proxyIds.length)
        {
            proxyIds.forEach(item => {
                if (item.selecttate === state)
                    filterArray.push(item.merchantid)
            })
        }

        return filterArray
    }

    componentWillReceiveProps(nextProps) {

        let {bindingDetail: nextDetail} = nextProps,
            {bindingDetail: thisDetail} = this.props;

        if (!is(thisDetail, nextDetail) && nextDetail)
        {
            let {fullproxy = {merchantids: []}, halfproxy = {merchantids: [], isBusy}} = nextDetail,
                {merchantids: fallMerchantids} = fullproxy,
                {merchantids: halfMerchantids, isBusy} = halfproxy,
                halfChecked = this.getCheckedDetailId(halfMerchantids, false),
                fallChecked = this.getCheckedDetailId(fallMerchantids, false),
                halfSelectedState = this.getCheckedDetailId(halfMerchantids, true),
                halfDisabled = halfSelectedState.concat(fallChecked),
                fallSelectedState = this.getCheckedDetailId(fallMerchantids, true),
                fallDisabled = fallSelectedState.concat(halfChecked);

            this.setState({halfChecked, fallChecked, halfDisabled, fallDisabled, halfSelectedState, fallSelectedState})
        }
    }

	componentDidCatch(error, info) {
		// Display fallback UI
	}

    handleEffectiveRange(halfproxy, {target: {checked}})
    {

        halfproxy.isBusy = checked ? 1 : 0;

        this.forceUpdate();
    }

    getTreeUserNodes(userArray = [], bindType)
    {
        let {fallChecked = [], halfChecked = [], halfDisabled = [], fallDisabled = []} = this.state,
            checkedKey = bindType === "half" ? fallChecked : halfChecked,
            disabledCheckedKey = bindType === "half" ? halfDisabled : fallDisabled;

        if (userArray.length)
            return userArray.map(item => {

                let userIdString = item.siteid.toString();
                return (
                    <TreeNode title={item.name}
                        key={userIdString} value={userIdString}
                        dataRef={item} isLeaf={true}
                        disabled={disabledCheckedKey.includes(userIdString) || checkedKey.includes(userIdString)}
                    >
                    </TreeNode>
                );
            });
    }

    //获取分组下商铺
    renderTreeNodes(dataArray, bindType)
    {
        return dataArray.map(item => {
                return (
                    <TreeNode title={item.groupname}
                        key={item.groupid} value={item.groupid}
                        dataRef={item} isLeaf={item.isLeaf}
                        disableCheckbox = {true}
                    >
                        {
                            item.children && item.children.length > 0 ? this.renderTreeNodes(item.children, bindType) : null
                        }
                        {
                            this.getTreeUserNodes(item.merchants, bindType)
                        }
                    </TreeNode>
                );
        });
    }

    getAllUserId()
    {
        let idArray = [],
            loop = (group) => {
            group.forEach(item =>
            {
                if (item.merchants && item.merchants.length)
                    item.merchants.forEach(userItem => {
                        idArray.push(userItem.siteid.toString())
                    });

                if (item.children&& item.children.length)
                    loop(item.children)
            })
        };
        loop(this.shopGroupTreeData);

        return idArray;
    }

    //全选商户
    handleAllShop(proxyData, bindType, {target: {checked}}) {
        if (checked)
        {
            let allIds = this.getAllUserId(),
                {halfDisabled = [], fallDisabled = []} = this.state,
                disabledIds = bindType === "half" ? halfDisabled : fallDisabled,
                filtDisabledId = allIds.filter(item => !disabledIds.includes(item)),
                allProxyIds =  this.getAllProxyIds(filtDisabledId, 0),
                disabledProxyIds = this.getAllProxyIds(disabledIds, 1);

            if (bindType === "half")
            {
                this.setState({halfChecked: filtDisabledId, halfSelectedAll: true})
            }else
            {
                this.setState({fallChecked: filtDisabledId, fallSelectedAll: true})
            }

            proxyData.merchantids = allProxyIds;

        }else
        {
            if (bindType === "half")
            {
                this.setState({halfChecked: [], halfSelectedAll: false})
            }else
            {
                this.setState({fallChecked: [], fallSelectedAll: false})
            }
            proxyData.merchantids = [];
        }
    }

    getAllProxyIds(idKeys, selecttate){
        let dealedKey = [];

        idKeys.forEach(item => {
            let obj = {
                merchantid: item,
                selecttate
            };
            dealedKey.push(obj);
        });

        return dealedKey || [];
    }

    uniqueArray(array)
    {
        return array.filter( (item, index ,arr) => arr.indexOf(item) === index )
    }

    //选中分组下商户
    onCheckShopItem(bindType, proxyData, checkedKeys)
    {
        let {halfDisabled, fallDisabled, halfSelectedState, fallSelectedState} = this.state,
            {checked = []} = checkedKeys,
            disabledCheck = bindType === "half" ?  fallSelectedState.concat(checked) : halfSelectedState.concat(checked),
            checkedProxyId = this.getAllProxyIds(checked, 0);

        proxyData.merchantids = checkedProxyId;

        disabledCheck = this.uniqueArray(disabledCheck);

        if (bindType === "half")
        {
            this.setState({halfChecked: checked, halfSelectedAll: false, fallDisabled: disabledCheck})

        }else
        {
            this.setState({fallChecked: checked, fallSelectedAll: false, halfDisabled: disabledCheck})

        }
    }

    //获取商户树组件
    getShopTreeComp(groupArray, bindType, proxyData)
    {
        let {halfChecked = [], fallChecked = []} = this.state,
            checkedKey = bindType === "half" ? halfChecked: fallChecked;

        return <Tree multiple checkable
                    checkedKeys={checkedKey}
                    checkStrictly={true}
                    onCheck={this.onCheckShopItem.bind(this, bindType, proxyData)}
                >
                {
                    this.renderTreeNodes(groupArray, bindType)
                }
            </Tree>
    }

    get shopGroupTreeData()
    {
        let {consultBinding} = this.props;

        return consultBinding.get("consultBindingShop") || [];
    }

	render()
	{
        const options = [
            /*{ label: '仅商户接待时间内', value: 'time' },*/
            { label: '仅绑定客服组有空闲客服时', value: '1' }
        ];

        let {bindingDetail={halfproxy : {}}} = this.props,
            {halfproxy={isBusy}, fullproxy = {}} = bindingDetail,
            {isBusy} = halfproxy,
            {fallSelectedAll, halfSelectedAll} = this.state;

		return (
			<div className="consultBindingCon">
                <div className="halfProxyCon">
                    <div className="proxyHeader">半代理</div>
                    <div className="proxyContent">
                        <ScrollArea speed={1} horizontal={false} smoothScrolling
                            style={{height: '100%'}}>
                            <p>生效范围：</p>
                            <Checkbox className="isBusyCheck" options={options} checked={halfproxy.isBusy == 1} onChange={this.handleEffectiveRange.bind(this, halfproxy)}>仅绑定客服组有空闲客服时</Checkbox>
                            <p>绑定商户：</p>
                            <Checkbox className="isAllCheck" disabled={fallSelectedAll} checked={halfSelectedAll} onChange={this.handleAllShop.bind(this, halfproxy, "half")}>全部</Checkbox>
                            {
                                this.getShopTreeComp(this.shopGroupTreeData, "half", halfproxy)
                            }
                        </ScrollArea>
                    </div>
                </div>
                <div className="fallProxyCon">
                    <div className="proxyHeader">全代理</div>
                    <div className="proxyContent">
                        <ScrollArea speed={1} horizontal={false} smoothScrolling
                            style={{height: '100%'}}>
                            <p>绑定商户：</p>
                            <Checkbox className="isAllCheck" disabled={halfSelectedAll} checked={fallSelectedAll} onChange={this.handleAllShop.bind(this, fullproxy, "fall")}>全部</Checkbox>
                            {
                                this.getShopTreeComp(this.shopGroupTreeData, "fall", fullproxy)
                            }
                        </ScrollArea>
                    </div>
                </div>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	return {
        consultBinding: state.consultBindingReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getConsultBindingList, getBindingShopGroup/*, getShopGroupItem*/}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultBindingCon);
