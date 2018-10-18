import React from 'react';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tree, Popover, Tooltip } from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { truncateToPop } from "../../../utils/StringUtils"
import {getProgressComp} from "../../../utils/MyUtil";
import CreateShopGroup from "./CreateShopGroup";
import {getShopGroup, addShopGroup, editShopGroup, delShopGroup, getShopItem, clearErrorNewGroupProgress} from "./reducer/shopAccountReducer";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

//const confirm = Modal.confirm;

class ShopGroup extends React.PureComponent {

	static NEW_GROUP = 0;  //新建商户分组
	static EDIT_GROUP = 1;  //编辑商户分组

    constructor(props)
    {
        super(props);

        this.state = {
            display: false,
            info: null,
            link: false,
            selectedKeys: null
        };
    }

    componentDidMount()
    {
        let groupInfo = {
            page: 1,
            size: 10
        };
        this.props.getShopGroup();
        this.props.getShopItem(groupInfo);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedGroupId !== this.props.selectedGroupId)
        {
            this.setState({selectedKeys: [nextProps.selectedGroupId]});
            let obj = {
                groupid: nextProps.selectedGroupId,
                page: 1,
                size: 10
            };

            if (nextProps.selectedGroupId)
                this.props.getShopItem(obj);
        }
    }

    selectClick(selectedKeys)
    {
        this.setState({selectedKeys})
    }

    createGroup()
    {
        this.setState({display: true, model: ShopGroup.NEW_GROUP})
    }

    typeOk()
    {
        this.setState({display: false, link: true});
    }

    typeCancel()
    {
        this.setState({display: false, link: false})
    }

    getAddGroup(data)
    {
        const {model} = this.state;

        if(model === ShopGroup.NEW_GROUP)
        {
            this.props.addShopGroup(data)

        }
        else if(model == ShopGroup.EDIT_GROUP)
        {
            let editOldParentId = data.oldParentid;
            delete data.oldParentid;
            this.props.editShopGroup(data, editOldParentId);
        }
    }

    _onGetListData(groupId)
    {
        let obj = {
            groupid: groupId,
            page: 1,
            size: 10
        };

        this.props.getCurrentGroup(groupId);
        this.props.getShopItem(obj);
        this.setState({selectedKeys: [groupId]});
    }

    handleRemoveGroup(groupid, e)
    {
        e.stopPropagation();

        let obj = {groupid};
        this.modal = confirm({
            title: '删除提示',
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            okText:'确定',
            content: '是否确定删除该商铺分组？',
            onOk: () => {
                this.props.delShopGroup(obj);
                this.modal = null;
            }
        });
    }

    handleEditGroup(item, e)
    {
        e.stopPropagation();

        this.setState({
            display: true,
            model: ShopGroup.EDIT_GROUP,
            info: item
        });
    }

    //账号分组排序 type: -1向上; 1向下;
    handleShopGroupRange(type, groupid = "")
    {
        let rangeGroupIds = [groupid],
            changedItems = [];

        let index = this.shopGroupList.findIndex(item => item.groupid === groupid);

        if (index === 0 && type === -1 || index === this.shopGroupList.length - 1 && type === 1)
            return;

        let item = this.shopGroupList[index],
            target = this.shopGroupList[index + type];

        this.shopGroupList.sort((a, b) => a.rank - b.rank);

        if( !changedItems.includes(item) )
        {
            changedItems.push(item);
        }

        if( !changedItems.includes(target))
        {
            changedItems.push(target);
        }
        if (rangeGroupIds.length < 1)
            return;

        if (changedItems.length > 0)
            this.props.editorGroupRank(changedItems);

        this.setState({
            rangeDone: !this.state.rangeDone
        });
    }

    getContainerWidth(floor)
    {
        if (!getComputedStyle(window.document.documentElement)['font-size'])
            return;

        let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
            htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
            maxWidth = 1.95 * htmlFontSize;

        return floor > 1 ? maxWidth - 18 * floor - 54 : maxWidth - 18 * floor - 100;
    }

    _getGroupTile(item, groupid, level)
    {
        let boxWidth = this.getContainerWidth(level),
            contentInfo = truncateToPop(item.groupname, boxWidth) || {},
            className=level > 1 ? "accountGroupName" : "accountGroupName accountGroupPadding";

        return (
            <div className={className}>
                {
                    contentInfo.show ?
                        <Popover content={<div style={{maxWidth: "1.5rem", height: "auto", wordBreak: "break-word"}}>{item.groupname}</div>} placement="topLeft">
                            <div className="accountName" onClick={ this._onGetListData.bind(this, groupid) }>{contentInfo.content}</div>
                        </Popover>
                        :
                        <div className="accountName" onClick={ this._onGetListData.bind(this, groupid) }>{item.groupname}</div>
                }
				<span className="accountNameOperateBox">
                    {/*<Tooltip placement="bottom" title="上移">
                        <i className="iconfont icon-shangyi rangeIcon"
                            onClick={this.handleShopGroupRange.bind(this,-1, groupid)}/>
                    </Tooltip>
                    <Tooltip placement="bottom" title="下移">
                        <i className="iconfont icon-xiayi rangeIcon"
                        onClick={this.handleShopGroupRange.bind(this,1, groupid)}/>
                        </Tooltip>*/}
                    <Tooltip placement="bottom" title="编辑">
                        <i className="iconfont icon-bianji"
                            onClick={this.handleEditGroup.bind(this, item)}/>
                    </Tooltip>
                    <Tooltip placement="bottom" title="删除">
                        <i className="iconfont icon-shanchu"
                            onClick={this.handleRemoveGroup.bind(this, groupid)}/>
                    </Tooltip>
				</span>
            </div>
        );
    }

    _createTreeNodes(data, level)
    {
        if (!data)
            return null;

        return data.map(
            item =>
            {
                const {groupid} = item;
                return (
                    <TreeNode key={groupid} title={this._getGroupTile(item, groupid, level + 1)}>
                        {
                            item.children && item.children.length>0 ? this._createTreeNodes(item.children, level + 1) : null
                        }
                    </TreeNode>
                );
            }
        );
    }

    newShopGroupModal()
    {
        if(this.state.display)
        {
            const {info, model} = this.state;

            return (
                <CreateShopGroup info={info} model={model}
                    selectedGroupId={ this.props.selectedGroupId }
                    getCurrentGroup={ this.props.getCurrentGroup.bind(this) }
                    groupInfo={ this.shopGroupList }
                    getAddGroup={ this.getAddGroup.bind(this) }
                    typeOk={ this.typeOk.bind(this) }
                    typeCancel={ this.typeCancel.bind(this) }
                />
            );
        }

        return null;
    }

    reFreshFn()
    {
        this.props.getShopGroup();
    }

    _getProgressComp()
    {
        let {progress} = this;

        if (progress && progress.left)
        {
            if (progress.left === LoadProgressConst.LOAD_COMPLETE || progress.left === LoadProgressConst.SAVING_SUCCESS)
                return;

            if(progress.left === LoadProgressConst.LOADING || progress.left === LoadProgressConst.SAVING)//正在加载或正在保存
            {
                return getProgressComp(progress.left);
            }
            else if(progress.left === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
                return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
            }else
            {
                let errorMsg = '', classname = '';
                if (progress.left === LoadProgressConst.DUPLICATE)
                {
                    errorMsg = '该商铺分组已存在';
                    classname = 'warnTip';

                }else if (progress.left === LoadProgressConst.SAVING_FAILED)
                {
                    errorMsg = '数据保存失败！';
                    classname = 'errorTip';
                }else if (progress.left === LoadProgressConst.UNDELETED)
                {
                    errorMsg = '该商铺分组下存在账号或下级分组，请删除后重试！';
                    classname = 'errorTip';
                }else if (progress.left === LoadProgressConst.LEVEL_EXCEED)
                {
                    errorMsg = '商铺分组最多创建6级！';
                    classname = 'errorTip';
                }
                else if (progress.left === LoadProgressConst.ACCOUNT_EXCEED)
                {
                    errorMsg = '创建分组已达到上限！';
                    classname = 'errorTip';
                }

                this.props.clearErrorNewGroupProgress();


                this.errorModal = error({
                    title: '错误提示',
                    iconType: 'exclamation-circle',
                    className: classname,
                    content: errorMsg,
                    okText: '确定',
                    width: '320px',
                    onOk:() => {
                        this.errorModal = null;
                    }
                });
            }
        }

        return null;
    }

    get shopGroupList()
    {
        let {shopData} = this.props;

        return shopData.get("shopGroupList")
    }
    get progress()
    {
        let {shopData} = this.props;

        return shopData.get("progress")
    }

	render()
	{
        let {data} = this.props,
            {selectedKeys = ""} = this.state;

        return (
            <div className="shopGroupComp">
                <div className='shopGroupHead'>
                    <span>商品分组</span>
					<span className='tree-icon'>
                        <Tooltip placement="bottom" title="添加分组">
                            <i className="iconfont icon-tianjia1"
                                onClick={this.createGroup.bind(this)}/>
                        </Tooltip>
			        </span>
                </div>
                <div className='shopGroupCon'>
                    <ScrollArea
                        speed={1} smoothScrolling
                        horizontal={false}
                        style={{height: "100%"}}
                    >
                        <Tree
                            className="shopGroupTree"
                            selectedKeys={selectedKeys}
                        >
                            {
                                this._createTreeNodes(this.shopGroupList, 0)
                            }
                        </Tree>
                    </ScrollArea>
                    {
                        this._getProgressComp()
                    }
                </div>
                {
                    this.newShopGroupModal(data)
                }
            </div>
		)
	}
}

function mapStateToProps(state)
{

	return {
        shopData: state.shopAccountReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getShopGroup, addShopGroup, editShopGroup, delShopGroup, getShopItem, clearErrorNewGroupProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopGroup);
