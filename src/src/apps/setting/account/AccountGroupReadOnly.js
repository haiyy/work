import React from 'react';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tree, Popover, Tooltip } from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import { getAccountGroup} from './accountAction/sessionLabel';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { truncateToPop } from "../../../utils/StringUtils"
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";

class AccountGroupReadOnly extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            display: false,
            info: null,
            link: false,
            selectedKeys: null
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            this.setState({selectedKeys: [nextProps.currentId]})
        }
    }

    _onGetListData(groupId) {
        let obj = {
            groupid: groupId,
            page: 1,
            size: 10
        };
        this.props.getCurrentGroup(groupId);
        this.props.getListData(obj);
        this.setState({selectedKeys: [groupId]});
    }

    getContainerWidth(floor) {
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
            className = level > 1 ? "accountGroupName" : "accountGroupName accountGroupPadding";

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
                    <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                        <i className="iconfont icon-shangyi rangeIcon"/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                        <i className="iconfont icon-xiayi rangeIcon"/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("edit")}>
                        <i className="iconfont icon-bianji"/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("del")}>
                        <i className="iconfont icon-shanchu"/>
                    </Tooltip>
				</span>
            </div>
        );
    }

    _createTreeNodes(data, level) {
        if (!data)
            return null;

        return data.map(
            item => {
                const {groupid} = item;
                return (
                    <TreeNode key={groupid} title={this._getGroupTile(item, groupid, level + 1)}>
                        {
                            item.children && item.children.length > 0 ? this._createTreeNodes(item.children, level + 1) : null
                        }
                    </TreeNode>
                );
            }
        );
    }

    reFreshFn() {
        this.props.getAccountGroup();
    }

    _getProgressComp() {
        let {groupProgress} = this.props;
        if (groupProgress) {
            if (groupProgress.left === LoadProgressConst.LOAD_COMPLETE || groupProgress.left === LoadProgressConst.SAVING_SUCCESS)
                return;

            if (groupProgress.left === LoadProgressConst.LOADING || groupProgress.left === LoadProgressConst.SAVING)//正在加载或正在保存
            {
                return getProgressComp(groupProgress.left);
            }
            else if (groupProgress.left === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
                return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
            }
        }

        return null;
    }

    scrollIng(value) {
        if (!value.topPosition) {
            value.topPosition = 0;
        }
    }

    render() {
        let {data} = this.props,
            {selectedKeys = ""} = this.state;

        return (
            <div style={{height: "100%"}}>
                <div className='tree-head'>
                    <span>{getLangTxt("setting_account_group_info")}</span>
                    <span className='tree-icon'>
                        {/*<i style={{cursor: "pointer"}} className="iconfont icon-sousuo"/>*/}
                        {/*<i style={{cursor: "pointer"}} className="iconfont icon-shanchu"
                         onClick={this.removeClick.bind(this)}/>*/}
                        <Tooltip placement="bottom" title={getLangTxt("add_group")}>
                            <i className="iconfont icon-tianjia1"/>
                        </Tooltip>
			        </span>
                </div>

                <div className='tree-con'>
                    <ScrollArea speed={1} smoothScrolling horizontal={false} style={{height: "100%"}} onScroll={this.scrollIng.bind(this)}>
                        <Tree className="myCls" selectedKeys={selectedKeys}>
                            {
                                this._createTreeNodes(data, 0)
                            }
                        </Tree> </ScrollArea> {
                    this._getProgressComp()
                }
                </div>
            </div>
        )
    }
}
function mapStateToProps(state)
{
	return {
		groupProgress: state.accountReducer.progress,
        data: state.accountReducer.data,
        state
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAccountGroup}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountGroupReadOnly);
