import React from 'react';
import {bindActionCreators} from 'redux';
import ScrollArea from 'react-scrollbar';
import {connect} from 'react-redux';
import { Table, Tree, message, Popover, Tooltip, Button, Spin} from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import { visitorItems, getVisitorData } from './action/visitorSourceSetting';
import './style/visitorSource.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { bglen, truncateToPop } from "../../../utils/StringUtils"
import { getLangTxt } from "../../../utils/MyUtil";

class VisitorSourceReadOnly extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            display: true,
            selectedKey: []
        }
    }

    componentDidMount() {
        this.props.visitorItems().then(result =>
        {
            if (result && result.success)
                this.props.getVisitorData(-1);
        });
    }

    onSelect(selectedKey,info) {
        let eventKey = info.node.props.eventKey;
        this.setState({
            eventKey,
            selectedKey:selectedKey
        });
        this.props.getVisitorData(eventKey);
    }

    changeClick() {
        this.setState({
            display: !this.state.display
        })
    }

    getContainerWidth(floor)
    {
        if (!getComputedStyle(window.document.documentElement)['font-size'])
            return;

        let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
            htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
            maxWidth = 1.95 * htmlFontSize;

        return maxWidth - 18 * floor - 75;
    }

    _createTreeNodes(states, level = 0) {
        let styles = {
            editor: {color: '#a9b7b7', marginRight: "8px"},
            remove: {color: '#a9b7b7', marginRight: "8px"}
        };

        if (states) return states.map(item => {
            let boxWidth = this.getContainerWidth(level),
                contentInfo = truncateToPop(item.typename, boxWidth) || {};

            return (
                <TreeNode key={item.source_type_id} title={
	                <div className="sourceTree">
	                {
                        contentInfo.show ?
                            <Popover content={<div style={{maxWidth:'200px',height:'auto',wordWrap: 'break-word'}}>{item.typename}</div>} placement="topLeft">
                                <div className="tipsGroupStyle">{contentInfo.content}</div>
                            </Popover>
                            :
                            <div style={{width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "42px"}}> {item.typename} </div>
                    }
                    {
                         item.sys === 2 ?
                             <span style={{position:"absolute",top:"0",right:"0"}}>
                                <Tooltip placement="bottom" title={getLangTxt("edit")}>
                                    <i className="icon-bianji iconfont" style={styles.editor}/>
                                 </Tooltip>
                                 <Tooltip placement="bottom" title={getLangTxt("del")}>
                                    <i className="icon-shanchu iconfont" style={styles.remove}/>
                                </Tooltip>
                             </span> : null
                      }
	                </div>}>
                    {item.children && item.children.length > 0 ? this._createTreeNodes(item.children, level + 1) : null}
                </TreeNode>
            );
        });
    }

    error(data)
    {
        message.error(data);
    }

    scrollIng (value)  //滚动条复位
    {
        if(!value.topPosition){
            value.topPosition  = 0;
        }
    }

    _getPopoverText(text)
    {
        return (
                bglen(text) >= 8 ?
                    <Popover
                content={<span style={{display:'block',maxWidth:'150px',height:'auto',wordWrap: 'break-word'}}>{text}</span>}>
                <span style={{display:"block",maxWidth:"150px",overflow: "hidden",whiteSpace: 'nowrap',textOverflow: 'ellipsis'}}>{text}</span>
            </Popover>
                    :
                <span style={{display:"block",maxWidth:"150px",overflow: "hidden",whiteSpace: 'nowrap',textOverflow: 'ellipsis'}}>{text}</span>
        )
    }

    _getProgressComp(progress)
    {
        let progressNum = progress && progress.left ? progress && progress.left : progress && progress.right;

        if(progressNum === LoadProgressConst.SAVING || progressNum === LoadProgressConst.LOADING)//正在保存 || 正在加载
        {
            return (
                progress.right ?
                    <div style={{height:'460px'}}>
                        <Spin style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}/>
                    </div>
                    :
                    <Spin style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}/>
            );
        }else if (progressNum === LoadProgressConst.LOAD_FAILED){  //加载失败
            if (progress.left)
            {
                return <ReFresh reFreshFn={this.reFreshLeftFn.bind(this)}/>;
            }else
            {
                return <ReFresh reFreshStyle={this.state.display?{padding: '10px 20px 0 284px'}:{padding: '10px 20px 0 20px'}} reFreshFn={this.reFreshRightFn.bind(this)}/>;
            }
        }

        return null;
    }

    reFreshLeftFn()
    {
        this.props.visitorItems();
    }

    reFreshRightFn(){
        this.props.getVisitorData(this.state.eventKey);
    }

    render() {
        const styles = {width: "24px", height: "24px"};

        const columns = [{
            key: 'key',
            dataIndex: 'key'
        }, {
            key: 'type',
            title: <span className="title">{getLangTxt("setting_source_type")}</span>,
            dataIndex: 'type',
            /*sorter: (a, b) => a.type - b.type,*/
            render: (text) => this._getPopoverText(text)
        }, {
            key: 'cname',
            title: <span className="title">{getLangTxt("setting_source_cname")}</span>,
            dataIndex: 'cname',
            /*sorter: (a, b) => a.cname - b.cname,*/
            render: (text)=>
                this._getPopoverText(text)
        }, {
            key: 'ename',
            title: <span className="title">{getLangTxt("setting_source_ename")}</span>,
            dataIndex: 'ename',
            /*sorter: (a, b) => a.ename - b.ename,*/
            render: (text)=>
                this._getPopoverText(text)
        }, {
            key: 'domain',
            title: <span className="title">{getLangTxt("setting_source_domain")}</span>,
            dataIndex: 'domain',
            /*sorter: (a, b) => a.domain - b.domain,*/
            render: (text)=>
                this._getPopoverText(text)
        }, {
            key: 'weblogo',
            title: 'web logo',
            render: (text)=>
                <span>
                    {
                        text.source_logo != "" && text.sourceHttp == 1 ?
                            <img src={text.source_logo} style={styles} /> :
                            <i className={"icon iconfont icon-"+text.source_logo} style={{fontSize:"24px", color:"#3a7dda"}} />
                    }
                </span>
        }, {
            key: 'waplogo',
            title: 'wap logo',
            render: (text)=>
                <span>
                    {
                        text.wap_logo != "" && text.wapHttp == 1 ?
                        <img src={text.wap_logo} style={styles} /> :
                        <i className={"icon iconfont icon-"+text.wap_logo} style={{fontSize:"24px", color:"#3a7dda"}} />
                    }
                </span>
        }, {
            key: 'ref_word_rex',
            title: getLangTxt("setting_source_keyword_rule"),
            dataIndex: 'ref_word_rex',
            render: (text)=>
                this._getPopoverText(text)
        }, {
            key: 'encode',
            title: getLangTxt("setting_source_encode"),
            dataIndex: 'encode',
            render: (text)=>
                this._getPopoverText(text)
        }, {
            key: 'url_reg',
            title: <span className="title">{getLangTxt("setting_source_rule_set")}</span>,
            dataIndex: 'url_reg',
            /*sorter: (a, b) => a.url_reg - b.url_reg,*/
            render: (text)=>
                this._getPopoverText(text)
        }, {
            key: 'remove',
            title: getLangTxt("operation"),
            render: (record)=> {
                return (

                    record.sys === 2 ?
                        <div>
                            <Tooltip placement="bottom" title={getLangTxt("edit")}>
                                <i style={{cursor: 'pointer', marginRight: '10px'}}
                                    className="icon-bianji iconfont"/>
                            </Tooltip>
                            <Tooltip placement="bottom" title={getLangTxt("del")}>
                                <i style={{cursor: 'pointer'}}
                                    className="icon-shanchu iconfont"/>
                            </Tooltip>
                        </div>
                        : null
                )
            }
        }];

        let tableData = this.props.dataList ? this.props.dataList : [],
            treeData = this.props.treeData ? this.props.treeData : [],
            groupNum = 0,
            loop = (treeData) => treeData.map((m)=> {
                if (m.children) {
                    loop(m.children);
                }
                groupNum++;
            });
        const pagination = {
            total: tableData.length,
            /*showSizeChanger: true,
            onShowSizeChange: (current, pageSize) => {
            },*/
            showQuickJumper: true,
            showTotal: (total) => {
                return getLangTxt("total", total);
            },
            onChange: (current) => {
                /*this.scrollIng();*/
            }
        };

        loop(treeData);

        let { groupProgress, progress } = this.props;

        return (
            <div className='visitor-source' style={{height: '100%'}}>
                <div className='visitor-source-left'
                     style={this.state.display? {width: '1.95rem', height: '100%'}:{width: '0.05rem', height: '100%'}}>
                    { this.state.display ?
                        <div style={{height: "100%"}}>
                            <div className='source-head'>
                                <span>{getLangTxt("setting_source_type")}</span>
                                <Tooltip placement="bottom" title={getLangTxt("add_group")}>
                                    <i style={{cursor: 'pointer', float: 'right'}}
                                        className="icon-tianjia1 iconfont"/>
                                </Tooltip>
                            </div>

                            <div className="myClsWrap">
                                <Tree className="myCls"
                                    selectedKeys={this.state.selectedKey}
                                    onSelect={this.onSelect.bind(this)}>
                                    { this._createTreeNodes(treeData, 0) }
                                </Tree>
                            </div>
                            <img src={require("./image/visGroupClose.png")} className="visitor-source-button" onClick={this.changeClick.bind(this)}/>
                            {
                                this._getProgressComp(groupProgress)
                            }
                        </div> :
                        <img src={require("./image/visGroupOpen.png")} className="visitor-source-button visitor-source-open" onClick={this.changeClick.bind(this)}/>
                    }
                </div>

                <div className='visitor-source-right'
                     style={this.state.display?{height: '100%', padding: '0.1rem 0 0 1.97rem'}:{height: '100%', padding: '0.1rem 0 0 0.07rem'}}>
                    <Button disabled className="crearSourceBtn"
                        type="primary">{getLangTxt("setting_source_add")}</Button>
                    <ScrollArea
                        speed={1} smoothScrolling
                        horizontal={false}
                        onScroll={this.scrollIng.bind(this)}
                        className="visitor-source-scroll">
                        <Table dataSource={tableData} columns={columns} pagination={pagination} /* rowSelection={} onSelect={this.selectRow.bind(this)}*//>
                        {
                            this._getProgressComp(progress)
                        }
                    </ScrollArea>

                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        treeData: state.getVisitorType.data,
        groupProgress: state.getVisitorType.groupProgress,
        dataList: state.getVisitor.data,
        progress: state.getVisitor.progress
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        visitorItems,
        getVisitorData
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VisitorSourceReadOnly);
