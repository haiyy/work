import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Table, Switch, Tooltip, InputNumber } from 'antd';
import ScrollArea from 'react-scrollbar';
import './style/queueManage.scss';
import {getQueueManageList, editQueue, delQueue} from "./reducer/queueManageReducer";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import ReFresh from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class QueuePlanList extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
            currentPage: 1,
            editPriorityId: ""
		};
	}

    componentDidMount()
    {
        let obj = {
            page: 1,
            rp: 10
        };
        this.props.getQueueManageList(obj)
    }

    //排队计划开启关闭
    onUseableChange(record, checked)
    {
        let useable = checked ? 1 : 0,
            obj = {strategyId: record.strategyId, useable};

        record.useable = useable;
        this.props.editQueue(obj, true).then(result =>
        {
            if (!result.success)
            {
                error({
                    title: getLangTxt("err_tip"),
                    width: '320px',
                    iconType: 'exclamation-circle',
                    className: 'errorTip',
                    content: getLangTxt("20034"),
                    okText: getLangTxt("sure"),
                    onOk: () =>
                    {
                        let {currentPage} = this.state,
                            obj = {
                                page: currentPage,
                                rp: 10
                            };
                        this.props.getQueueManageList(obj)
                    }
                })
            }
        });

        this.setState({isUpdate: !this.state.isUpdate})
    }

    //点击编辑排队
    editQueuePage(record)
    {
        this.props.handleNewPlan("editor", record)
    }

    //删除排队
    delQueuePage(record)
    {
        confirm({
            title: getLangTxt("del_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            content: getLangTxt("setting_queue_rule_note"),
            onOk: () =>
            {
                let delObj = {strategyId: record.strategyId},
                    {currentPage} = this.state,
                    {queueMangeData} = this.props,
                    queueList = queueMangeData.getIn(["queueList"]),
                    getListObj = {
                        page: currentPage,
                        rp: 10
                    };
                this.props.delQueue(delObj).then( result =>
                {
                    if (result && result.success)
                    {
                        if (currentPage > 1 && queueList.length === 1)
                        {
                            getListObj.page -= 1;
                            this.setState({currentPage: getListObj.page})
                        }

                        this.props.getQueueManageList(getListObj)
                    }else
                    {
                        error({
                            title: getLangTxt("err_tip"),
                            width: '320px',
                            iconType: 'exclamation-circle',
                            className: 'errorTip',
                            content: getLangTxt("20034"),
                            okText: getLangTxt("sure")
                        })
                    }
                });
            }
        });
    }

    //列表直接修改优先级
    editInletPriority(data)
    {
        this.setState({editPriorityId: data.strategyId})
    }

    //保存优先级修改
    saveEditPriority(data, e)
    {
        data.inletPriority = parseInt(e.target.value);
        this.props.editQueue(data).then(result =>
        {
            if (!result.success)
            {
                error({
                    title: getLangTxt("err_tip"),
                    width: '320px',
                    iconType: 'exclamation-circle',
                    className: 'errorTip',
                    content: result.msg || getLangTxt("20034"),
                    okText: getLangTxt("sure"),
                    onOk: () =>
                    {
                        let {currentPage} = this.state,
                            obj = {
                            page: currentPage,
                            rp: 10
                        };
                        this.props.getQueueManageList(obj)
                    }
                })
            }
        });
        this.setState({editPriorityId: ""})
    }

    getQueueListCol()
    {
        return [{
            title: getLangTxt("onoff"),
            dataIndex: 'useable',
            key: 'useable',
            width: '18%',
            render:(record, data)=>{
                return <Switch checked={record === 1} onChange={this.onUseableChange.bind(this, data)}/>
            }
        }, {
            title: getLangTxt("setting_queue_name"),
            dataIndex: 'name',
            key: 'name',
            width: '20%'
        }, {
            title: getLangTxt("setting_queue_plan"),
            dataIndex: 'strategyType',
            key: 'strategyType',
            width: '26%',
            render:(record, data) => {
                let queueWord = data.inletType === 0 ? getLangTxt("setting_queue_no") : data.strategyType === 0 ? getLangTxt("setting_queue_default_strategy") : getLangTxt("setting_queue_insert");
                return <div>
                        {queueWord}
                    </div>
            }
        }, {
            title: getLangTxt("setting_queue_priority"),
            dataIndex: 'inletPriority',
            key: 'inletPriority',
            width: '20%',
            render: (record, data) =>
            {
                let {editPriorityId} = this.state;

                return <div>
                    {
                        data.strategyType === 1 && data.inletType == 1 ?
                            editPriorityId === data.strategyId ?
                                <InputNumber min={1} autoFocus defaultValue={record} onBlur={this.saveEditPriority.bind(this, data)}/>
                                :
                                <div className="inletPriorityBox" onDoubleClick={this.editInletPriority.bind(this, data)}> {record} </div>
                            : null
                    }

                </div>
            }
        }, {
            key: 'operate',
            title: getLangTxt("operation"),
            width: '16%',
            render: (record, data) => {
                return <div className="queueListOperate">
                    {
                        data.useable == 0 ?
                            <span>
                                <Tooltip placement="bottom" title={getLangTxt("edit")}>
                                     <i className="iconfont icon-bianji" onClick={this.editQueuePage.bind(this, record)}/>
                                </Tooltip>
                                <Tooltip placement="bottom" title={getLangTxt("del")}>
                                     <i className="iconfont icon-shanchu" onClick={this.delQueuePage.bind(this, record)}/>
                                </Tooltip>
                            </span> : null
                    }
                </div>
            }
        }];
    }

    refreshQueueList()
    {
        let {currentPage} = this.state,
            obj = {
            page: currentPage,
            rp: 10
        };
        this.props.getQueueManageList(obj)
    }

	render()
	{

        let {queueMangeData} = this.props,
            queueList = queueMangeData.getIn(["queueList"]) || [],
            total = queueMangeData.getIn(["total"]) || 0,
            progress = queueMangeData.getIn(["progress"]),
            pagination = {
                total: total,
                showQuickJumper: true,
                current: this.state.currentPage,
                showTotal: (total) => {
                    return getLangTxt("total", total);
                },
                onChange: (currentPage) =>
                {
                    this.setState({currentPage});
                    let obj = {
                        page: currentPage,
                        rp: 10
                    };
                    this.props.getQueueManageList(obj)
                }
            };

		return (
			<div className="queueListBox">
                {
                    progress === LoadProgressConst.LOAD_FAILED ?
                    <ReFresh reFreshFn={this.refreshQueueList.bind(this)}/>
                :
                    <ScrollArea
                        speed={1}
                        horizontal={false}
                        className="queueListScrollArea">
                        <Table dataSource={queueList.length > 0 ? queueList : []} columns={this.getQueueListCol()} pagination={pagination}/>
                    </ScrollArea>
                }

                {
                    getProgressComp(progress)
                }
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		queueMangeData: state.queueManageReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQueueManageList, editQueue, delQueue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueuePlanList);
