import React from 'react'
import {Switch, Radio, Button, Input, Form, Table, Checkbox, Tabs} from 'antd';
import ScrollArea from 'react-scrollbar';
import './style/leaveMessage.scss';
import {getLeaveMessage} from './leaveMessageAction';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

const RadioGroup = Radio.Group, FormItem = Form.Item, TabPane = Tabs.TabPane;

class LeaveMessageReadOnly extends React.PureComponent {

    constructor(props)
    {
        super(props);

        this.state = {
            open: 1,
            noticeContent: null,
            typeSetting: false,
            editOrderRank: "",
            isUpdate: false,
            isWarned: false

        };
        this.leaveMsgData={};
    }

    componentDidMount()
    {
        this.props.getLeaveMessage();
    }

    reFreshFn()
    {
        this.props.getLeaveMessage();
    }

    render() {
        let { data = { useable : 0, plan : 0, isNotice : 0, noticeContent : "", params : [], url:"", open_type : 0 }, progress } = this.props,
            { useable, plan, isNotice = 0, noticeContent = "", params = [], url = "", open_type = 0 } = data;

        let noticeConLength = this.state.noticeContent || noticeContent.length;

        const {getFieldDecorator} = this.props.form,
            formItemLayout = {
                labelCol: {span: 3},
                wrapperCol: {span: 12}
            },
            columns = [{
                title: getLangTxt("setting_msgset_fieldname"),
                dataIndex: 'title',
                className: 'name'
            }/*, {
                title: '顺序',
                className: 'order',
                dataIndex: 'rank',
                render: (text, record) =>
                {
                    let { name } = record;
                    return <div onDoubleClick={this.getOrderRank.bind(this,name)}>
                        {
                            name === this.state.editOrderRank ?
                            <Input defaultValue={text} onBlur={this.getOrderRankData.bind(this, name)}
                                   disabled={false}/> : text
                        }
                    </div>
                }
            }*/, {
                title: getLangTxt("setting_msgset_required_title"),
                render: text =>
                    <Checkbox disabled checked={text.isRequired==1}>
	                    {getLangTxt("setting_msgset_required")}
                    </Checkbox>

            }, {
                title: getLangTxt("setting_msgset_show_title"),
                render: text =>
                    <Checkbox disabled checked={text.show==1}>
	                    {getLangTxt("setting_msgset_show")}
                    </Checkbox>

            }],
            system = <div className="system">
                <div className="noticeWrapper">
                    <span className="leave-title">{getLangTxt("notice")}</span>
                    <Switch disabled defaultChecked={isNotice == 1}/>
                    <div className="textareaBox">
                        <Form>
                            <FormItem help={noticeConLength+"/500"}>
                                {getFieldDecorator('noticeContent',{
                                    initialValue : noticeContent
                                })(
                                    <Input disabled type="textarea" rows={4} style={{resize:'none', wordBreak: 'break-all'}}/>
                                )}
                            </FormItem>
                        </Form>
                    </div>
                </div>

                <Table columns={columns} dataSource={params} pagination={false} size="middle"/>
            </div>,
            customize = <div className="customize">
                <Form>
                    <FormItem {...formItemLayout} label={getLangTxt("setting_msgset_specify_link")}>
                        {getFieldDecorator('Link',{
                            initialValue : url
                        })(
                            <Input disabled style={{ width: '276px'}}/>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label={getLangTxt("setting_msgset_open_mode")}
                                                 help={getLangTxt("setting_msgset_note2")}>
                        {
                            getFieldDecorator('Radio',{
                                initialValue: open_type
                            })(
                                <RadioGroup disabled>
                                    <Radio key="c" value={1}>{getLangTxt("setting_msgset_open_inner")}</Radio>
                                    <Radio key="d" value={0}>{getLangTxt("setting_msgset_open_exter")}</Radio>
                                </RadioGroup>
                            )
                        }
                    </FormItem>
                </Form>
            </div>, main = plan == 1 ? system : customize;

        this.leaveMsgData = data;

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        return (
            <div className="message leaveMessageWrap">

                <Tabs defaultActiveKey="1">

                    <TabPane tab={<span>{getLangTxt("setting_msgset")}</span>} key="1">
                        <ScrollArea
                            speed={1}
                            horizontal={false}
                            className="leaveMsgScrollArea">
                            <div className="top">
                                <div>
                                    <span className="leave-title">{getLangTxt("setting_msgset_on")}</span>
                                    <Switch disabled checked={useable == 1} style={{margin:'8px 20px 15px'}}/>
                                </div>
                                <div style={{paddingLeft: "5px"}}>
                                    <span className="leave-title">{getLangTxt("setting_msgset_scheme_default")}</span>
                                    <Switch disabled checked={plan == 1} defaultChecked={plan == 1}/>
                                    <span className="leave-title" style={{width:"5%"}}>{getLangTxt("setting_msgset_scheme_custom")}</span>
                                    <Switch disabled checked={plan == 2} defaultChecked={plan == 2}/>
                                </div>
                            </div>

                            <div className="main">{main}</div>
                        </ScrollArea>
                    </TabPane>

                    {/*<TabPane tab={<span>留言回复签名</span>} key="2">
                        Tab 2
                    </TabPane>*/}

            </Tabs>


                <div className="company-footer">
                    <Button disabled className="primary" type="primary">{getLangTxt("save")}</Button>
                </div>

                {
                    _getProgressComp(progress, "submitStatus")
                }
            </div>
        )
    }
}

LeaveMessageReadOnly = Form.create()(LeaveMessageReadOnly);

function mapStateToProps(state) {
    return {
        data : state.leaveMessageData.data || {},
        progress: state.leaveMessageData.progress
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getLeaveMessage}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveMessageReadOnly);
