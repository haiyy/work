import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Form, Tabs, Button } from 'antd';
import QueuePlanListReadOnly from "./QueuePlanListReadOnly";
import DefineQueuePlan from "./DefineQueuePlan";
import DefineQueueGroup from "./DefineQueueGroup";
import QueueManageWordReadOnly from "./QueueManageWordReadOnly";
import QueueRulesReadOnly from "./QueueRulesReadOnly";
import {getQueueManageList, addQueue} from "./reducer/queueManageReducer";
import { getLangTxt } from "../../../utils/MyUtil";

const TabPane = Tabs.TabPane;

class QueueManageReadOnly extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
            isShowNewPage: false,//新增排队方案
            isShowDefinePlan: false,//新增定义排队方案
            link: 'new',//新建页面或编辑
            newData: {},//已填写数据
            editData: {},//编辑数据
            queueRuleType: 0,//排队规则按人数
		};
	}

    queueList = ['queuemanage_strategy', 'queuemanage_note', 'queuemanage_rule'];

    //点击新建排队计划
    handleNewPlan(link, editData)
    {
        this.setState({isShowNewPage: true, link, editData})
    }

    //点击执行下一步
    handleNextStep(queueGroupData)
    {
        this.setState({isShowDefinePlan: true, queueGroupData})
    }

    //取消新增
    handleKillCreatePage()
    {
        this.setState({isShowNewPage: false, isShowDefinePlan: false})
    }

    componentWillUnmount()
    {
        this.queueList = null;
    }

    getTabPanes(queueSettingList)
    {
        return queueSettingList.map(item =>
        {
            switch(item)
            {
                case 'queuemanage_strategy':
                    return <TabPane tab={getLangTxt("setting_queue_distr")} key="1" style={{height: '100%'}}>
                        <div className="createQueuePlan">
                            <Button disabled type="primary">{getLangTxt("setting_queue_add")}</Button>
                        </div>
                        <QueuePlanListReadOnly/>
                    </TabPane>;

                case 'queuemanage_note':
                    return <TabPane tab={getLangTxt("setting_queue_word")} key="2">
                        <QueueManageWordReadOnly/>
                    </TabPane>;

                case 'queuemanage_rule':
                    return <TabPane tab={getLangTxt("setting_queue_rule")} key="3">
                        <QueueRulesReadOnly/>
                    </TabPane>;
            }
        });
    }

    getTabs()
    {
        return (
            <Tabs className="queueTabs" defaultActiveKey="1">

                {this.getTabPanes(this.queueList)}

            </Tabs>
        );
    }

	render()
	{
        let {isShowNewPage, isShowDefinePlan, link, queueGroupData, editData} = this.state;

        return (
            <div className="queueManageBox">
                {
                    isShowNewPage ?
                        <div className="newQueuePage">
                            {
                                isShowDefinePlan ?
                                    <DefineQueuePlan
                                        link={link}
                                        editData={editData}
                                        queueGroupData={queueGroupData}
                                        handleKillCreatePage={this.handleKillCreatePage.bind(this)}
                                    />
                                    :
                                    <DefineQueueGroup
                                        link={link}
                                        editData={editData}
                                        handleNextStep={this.handleNextStep.bind(this)}
                                        handleKillCreatePage={this.handleKillCreatePage.bind(this)}
                                    />
                            }
                        </div>
                        :
                        this.getTabs()
                }
            </div>
        )
	}
}

QueueManageReadOnly = Form.create()(QueueManageReadOnly);

function mapStateToProps(state)
{
    let {startUpData} = state,
        setting = startUpData.get("setting") || [];
	return {
        setting
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQueueManageList, addQueue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueManageReadOnly);
