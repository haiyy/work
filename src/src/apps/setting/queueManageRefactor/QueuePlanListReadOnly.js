import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Table, Switch, Tooltip } from 'antd';
import ScrollArea from 'react-scrollbar';
import './style/queueManage.scss';
import {getQueueManageList} from "./reducer/queueManageReducer";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import ReFresh from "../../../components/ReFresh";
class QueuePlanListReadOnly extends React.PureComponent {

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

    getQueueListCol()
    {
        return [{
            title: getLangTxt("onoff"),
            dataIndex: 'useable',
            key: 'useable',
            width: '18%',
            render:(record, data)=>{
                return <Switch disabled checked={record === 1}/>
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
                return <div>
                    {
                        data.strategyType === 1 ?
                                <div className="inletPriorityBox"> {record} </div>
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
                                     <i className="iconfont icon-bianji"/>
                                </Tooltip>
                                <Tooltip placement="bottom" title={getLangTxt("del")}>
                                     <i className="iconfont icon-shanchu"/>
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
	return bindActionCreators({getQueueManageList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueuePlanListReadOnly);
