import React from 'react'
import { Switch, Radio, Input, Button, Table, InputNumber, Modal, message } from 'antd';
import './style/earlyWarning.scss';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getEarlyWarningParams, setEarlyWarningParams, clearErrorProgress } from "./reducer/earlyWarningReducer";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import ReFresh from "../../../components/ReFresh";
import NTModal from "../../../components/NTModal";
import { truncateToPop } from "../../../utils/StringUtils";

const RadioGroup = Radio.Group;

class EarlyWarning extends React.PureComponent {

    constructor(props)
    {
        super(props);
        this.state = {
            isKeyWordOk: true,
            keyWordVal: null,
            noAnswerValue: true,
            chatTimeoutMinValue: true,
            chatTimeoutSecValue: true,
            isChatTimeOk: true,
            chatCountValue: true,
            errorMsg: ""
        }
    }

    componentDidMount()
    {
        this.props.getEarlyWarningParams();
    }

    componentWillReceiveProps(nextProps) {
        let {warningData} = this.props,
            {warningData: nextWarningData} = nextProps,
            warningInfo = warningData.get("warningData"),
            nextWarningInfo = nextWarningData.get("warningData");

        if (JSON.stringify(warningInfo) === '{}' && JSON.stringify(nextWarningInfo) !== '{}')
        {
            let {chatCountValue, noAnswerValue, chatTimeoutMinValue, chatTimeoutSecValue} = nextWarningInfo,
                numberReg = new RegExp("^[0-9]*$"),
                isChatMinOk = numberReg.test(chatTimeoutMinValue) && chatTimeoutMinValue != 0 || (chatTimeoutMinValue == 0 && (numberReg.test(chatTimeoutSecValue) && chatTimeoutSecValue != 0)) || chatTimeoutMinValue == "",
                isChatSecOk = numberReg.test(chatTimeoutSecValue) && chatTimeoutSecValue != 0 || (chatTimeoutSecValue == 0 && (numberReg.test(chatTimeoutMinValue) && chatTimeoutMinValue != 0)) || chatTimeoutSecValue == "";

            this.setState({
                chatCountValue: (numberReg.test(chatCountValue) || chatCountValue == "") && chatCountValue != 0,
                noAnswerValue: (numberReg.test(noAnswerValue) || noAnswerValue == "") && noAnswerValue != 0,
                chatTimeoutMinValue: isChatMinOk,
                chatTimeoutSecValue: isChatSecOk,
                isChatTimeOk: isChatMinOk && isChatSecOk
            });
        }
    }

    reFreshFn()
    {
        this.props.getEarlyWarningParams();
    }

    getKeyWordValue(type, e)
    {
        let value = e.target.value,
            word = value.split(/[,，]/g);

        // this.warningData[type] = e.target.value;
        // this.forceUpdate();
        this.setState({isKeyWordOk: !(word.length > 50 || value.length - word.length + 1 >= 200), keyWordVal: value});
    }

    getRadioGroupValue(type, e)
    {
        this.warningData[type] = e.target.value;
        this.forceUpdate();
    }

    getIptValue(type, value)
    {
        if(!value)
            value = 1;
        this.warningData[type] = value;
        this.forceUpdate();
    }

    /*点击开关switch*/
    handleStatus(record, checked)
    {
        let {isKeyWordOk, isChatTimeOk, noAnswerValueiptValue, chatTimeoutMinValueiptValue, chatTimeoutSecValueiptValue, chatCountValueiptValue} = this.state;

        try
        {
            message.destroy();
        }
        catch(e) {}

        if(record.dataSource === "keywordEnabled")
        {
            if(isKeyWordOk)
            {
                this.warningData["keywordEnabled"] = checked ? 1 : 0;
            }
            else
            {
                message.error(getLangTxt("setting_early_note1"));
            }
        }else if(record.dataSource === "chatTimeoutEnabled")
        {
            if (isChatTimeOk && (chatTimeoutMinValueiptValue != "" && chatTimeoutSecValueiptValue != ""))
                this.warningData["chatTimeoutEnabled"] = checked ? 1 : 0;

        }else if(record.dataSource === "chatCountEnabled")
        {
            if (this.state["chatCountValue"] && chatCountValueiptValue != "")
                this.warningData["chatCountEnabled"] = checked ? 1 : 0;
        }else if(record.dataSource === "noAnswerEnabled")
        {
            if (this.state["noAnswerValue"] && noAnswerValueiptValue != "")
                this.warningData["noAnswerEnabled"] = checked ? 1 : 0;
        }else
        {
            this.warningData[record.dataSource] = checked ? 1 : 0;
        }

        this.forceUpdate();
    }

    handleSubmit()
    {
        let {isKeyWordOk, isChatTimeOk, noAnswerValue, chatCountValue} = this.state;

        try
        {
            message.destroy();
        }
        catch(e) {}
        if(isKeyWordOk && isChatTimeOk && noAnswerValue && chatCountValue)
        {
            this.props.setEarlyWarningParams(this.warningData);
        }
        else
        {
            if (!isKeyWordOk)
                message.error(getLangTxt("setting_early_note2"));
        }

    }

    get warningData()
    {
        let {warningData} = this.props;

        return warningData.getIn(["warningData"]);
    }

    get progress()
    {
        let {warningData} = this.props;

        return warningData.getIn(["progress"]);
    }

    get errorMsg()
    {
        let {warningData} = this.props;

        return warningData.getIn(["errorMsg"]);
    }

    savingErrorTips()
    {
        let msg = this.errorMsg ? this.errorMsg : getLangTxt("setting_early_note3");

        if(this.modal)
            return;

        this.modal = Modal.warning({
            title: getLangTxt("err_tip"),
            iconType: 'exclamation-circle',
            className: 'errorTip',
            content: msg,
            width: '320px',
            okText: getLangTxt("sure"),
            onOk: () => {
                this.props.clearErrorProgress();
                this.modal = null;
            }
        });
    }

    setKeyWordModal()
    {
        let {isShowKeyModal} = this.state,
            textEle = document.getElementsByClassName("keyWordIpt")[0];
        if(textEle)
            textEle.value = this.warningData["keywordValue"];
        this.setState({isShowKeyModal: !isShowKeyModal, isKeyWordOk: true})
    }

    setKeyWordVal()
    {
        let {isShowKeyModal, isKeyWordOk} = this.state;

        if(isKeyWordOk)
        {
            this.warningData["keywordValue"] = this.state.keyWordVal;
            this.setState({isShowKeyModal: !isShowKeyModal})
        }
    }

    gettestIptValue(type, dataSource, e)
    {
        let numberReg = new RegExp("^[0-9]*$"),
            dealedValue = e.target.value,
            iptVal = dealedValue.replace(/[^\d]/g,''),
            isValueOk = numberReg.test(iptVal) || iptVal == "",
            isChatTimeOk,
            chatTimeoutSecValue,
            chatTimeoutMinValue,
            chatSecVal = this.warningData["chatTimeoutSecValue"],
            chatMinVal = this.warningData["chatTimeoutMinValue"],
            errorMsg = getLangTxt("setting_early_error_msg"),
            typeValue = type + "iptValue";

        //noAnswerValueiptValue, chatTimeoutMinValueiptValue, chatTimeoutSecValueiptValue, chatCountValueiptValue

        this.warningData[type] = iptVal;
        this.setState({[type]: isValueOk, [typeValue]: iptVal});
        this.forceUpdate();
        if (type === "chatTimeoutMinValue")
        {
            chatTimeoutMinValue = (isValueOk && iptVal != 0 || iptVal == "") || (iptVal == 0 && (numberReg.test(chatSecVal) && chatSecVal != 0 && chatSecVal <= 59));
            isChatTimeOk = chatTimeoutMinValue && this.state.chatTimeoutSecValue;

            if (!isChatTimeOk)
                this.warningData[dataSource] = 0;

            if (!chatTimeoutMinValue)
            {
                if ((parseInt(chatSecVal) == 0 || !Boolean(chatSecVal)))
                {
                    errorMsg = getLangTxt("setting_early_error_msg")
                }else
                {
                    errorMsg = getLangTxt("setting_early_error_msg0")
                }
                this.setState({errorMsg})
            }else
            {
                if (this.state.chatTimeoutSecValueiptValue == 0)
                {
                    isChatTimeOk = true;
                    this.setState({chatTimeoutSecValue: true})
                }
            }

            this.setState({
                isChatTimeOk: isChatTimeOk,
                chatTimeoutMinValue
            });
            if (isChatTimeOk)
            {
                this.setState({
                    chatTimeoutSecValue: isChatTimeOk
                });
            }
        }else if (type === "chatTimeoutSecValue")
        {
            chatTimeoutSecValue = isValueOk && iptVal != 0 && iptVal <= 59 || iptVal == "" || (iptVal == 0 && this.state.chatTimeoutMinValueiptValue != 0 && this.state.chatTimeoutMinValue);

            isChatTimeOk = chatTimeoutSecValue && this.state.chatTimeoutMinValue;

            if (!chatTimeoutSecValue)
            {
                if ((parseInt(chatMinVal) == 0 || !Boolean(chatMinVal)))
                {
                    errorMsg = getLangTxt("setting_early_error_msg2")
                }else
                {
                    errorMsg = getLangTxt("setting_early_error_msg1")
                }
                this.setState({errorMsg})
            }else
            {
                if (this.state.chatTimeoutMinValueiptValue == 0)
                {
                    isChatTimeOk = true;
                    this.setState({chatTimeoutMinValue: true})
                }
            }

            if (!isChatTimeOk)
                this.warningData[dataSource] = 0;

            this.setState({
                isChatTimeOk: isChatTimeOk,
                chatTimeoutSecValue
            });

            if (isChatTimeOk)
            {
                this.setState({
                    chatTimeoutMinValue: isChatTimeOk
                });
            }
        }else
        {
            if (!isValueOk || iptVal == 0)
                this.warningData[dataSource] = 0;

            this.setState({[type]: isValueOk && iptVal != 0 || iptVal == ""});
        }
    }

    getDealedData()
    {
        if(!this.warningData)
            return [];
        let dataArr = [
                /*{
                 rank: 1,
                 dataSource:"vipAdviceEnabled",
                 Scenes: "vip咨询预警",
                 value: "",
                 instruction: "转接人工",
                 status: ""
                 },*/
                {
                    rank: 1,
                    dataSource: "picEnabled",
                    Scenes: getLangTxt("setting_early_warning_image"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                }, {
                    rank: 2,
                    dataSource: "voiceEnabled",
                    Scenes: getLangTxt("setting_early_warning_audio"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                },
                {
                    rank: 3,
                    dataSource: "fileEnabled",
                    Scenes: getLangTxt("setting_early_warning_file"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                },
                {
                    rank: 4,
                    dataSource: "noAnswerEnabled",
                    Scenes: getLangTxt("setting_early_warning_no_answer"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                }/*,{
                 rank: 6,
                 dataSource:"evaluateEnabled",
                 Scenes: "差评预警",
                 value: "",
                 instruction: "转接人工",
                 status: ""
                 }*/,
                {
                    rank: 5,
                    dataSource: "chatTimeoutEnabled",
                    Scenes: getLangTxt("setting_early_warning_conver_time"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                },
                {
                    rank: 6,
                    dataSource: "chatCountEnabled",
                    Scenes: getLangTxt("setting_early_warning_conver_count"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                },
                {
                    rank: 7,
                    dataSource: "keywordEnabled",
                    Scenes: getLangTxt("setting_early_warning_keys"),
                    value: "",
                    instruction: getLangTxt("setting_early_warning_transfer"),
                    status: ""
                }
            ],
            {noAnswerValue, chatTimeoutMinValue, chatTimeoutSecValue, isChatTimeOk, chatCountValue, errorMsg} = this.state,
            className = "",
            className1 = "";

        dataArr.forEach(item => {
            item.status = this.warningData[item.dataSource];
            switch(item.dataSource)
            {
                case "noAnswerEnabled":
                    className = noAnswerValue ? "noAnswerTime" : "noAnswerTime errorIpt";
                    item.value = [
                        /*<RadioGroup value={this.warningData["noAnswerType"]} onChange={this.getRadioGroupValue.bind(this, "noAnswerType")}>
                         <Radio value={0}>连续</Radio>
                         <Radio value={1}>累计</Radio>
                         </RadioGroup>,*/
                        <span>{getLangTxt("accumulative")}</span>,
                        <Input className={className} value={this.warningData["noAnswerValue"]}
                            onChange={this.gettestIptValue.bind(this, "noAnswerValue", item.dataSource)} style={{width: "50px"}}/>, <span>{getLangTxt("frequency")}</span>,
                        !noAnswerValue ? <span className="earlyWarningError">{getLangTxt("setting_early_error_msg")}</span> : null
                    ];
                    break;
                case "evaluateEnabled":
                    item.value = <RadioGroup value={this.warningData["evaluateValue"]}
                        onChange={this.getRadioGroupValue.bind(this, "evaluateValue")}>
                        <Radio value={1}>1星</Radio>
                        <Radio value={2}>2星</Radio>
                        <Radio value={3}>3星</Radio>
                        <Radio value={4}>4星</Radio>
                        <Radio value={5}>5星</Radio>
                    </RadioGroup>;
                    break;
                case "chatTimeoutEnabled":
                    className = chatTimeoutMinValue ? "chatTimeStyle" : "chatTimeStyle errorIpt";
                    className1 = chatTimeoutSecValue ? "chatTimeStyle" : "chatTimeStyle errorIpt";

                    item.value = [
                        <Input className={className} value={this.warningData["chatTimeoutMinValue"]}
                            onChange={this.gettestIptValue.bind(this, "chatTimeoutMinValue", item.dataSource)}
                            style={{width: "50px"}}/>,
                        <span className="chatTimeStyle">{getLangTxt("minute")}</span>,
                        <Input className={className1} value={this.warningData["chatTimeoutSecValue"]}
                            onChange={this.gettestIptValue.bind(this, "chatTimeoutSecValue", item.dataSource)}
                            style={{width: "50px"}}
                        />,
                        <span className="chatTimeStyle">{getLangTxt("second")}</span>,
                        !isChatTimeOk ? <span className="earlyWarningError">{errorMsg}</span> : null
                    ];
                    break;
                case "chatCountEnabled":
                    className = chatCountValue ? "chatTimeStyle" : "chatTimeStyle errorIpt";
                    item.value = [
                        <Input className={className} value={this.warningData["chatCountValue"]}
                            onChange={this.gettestIptValue.bind(this, "chatCountValue", item.dataSource)} style={{width: "50px"}}
                        />,
                        getLangTxt("page"),
                        !chatCountValue ? <span className="earlyWarningError">{getLangTxt("setting_early_error_msg")}</span> : null
                    ]
                    ;
                    break;
                case "keywordEnabled":
                    let keyWord = this.warningData["keywordValue"],
                        {keyWordVal} = this.state,
                        container = document.getElementsByClassName("relativeValue")[0],
                        containerWidth = container && container.clientWidth - 30,
                        ellipsisVal = truncateToPop(keyWord, containerWidth);

                    if(keyWordVal == null)
                        this.setState({keyWordVal: keyWord});

                    item.value = [
                        /*<Input className={keyWordCls} value={keyWord} onChange={this.getKeyWordValue.bind(this, "keywordValue")}/>,*/
                        <span className="keyWordShow">{ellipsisVal && ellipsisVal.content || keyWord}</span>,
                        keyWord ?
                            <i className=" iconfont icon-tianjia1 addKeyWordIcon"
                                onClick={this.setKeyWordModal.bind(this)}/>
                            : <Button type="primary" onClick={this.setKeyWordModal.bind(this)}>{getLangTxt("setting_early_add_keywords")}</Button>
                    ];
                    break;
                default:
                    item.value = <div>{getLangTxt("noData3")}</div>
            }
        });

        return dataArr;
    }

    render()
    {
        let dataArr = this.getDealedData();
        if(this.progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        let keyWord = this.warningData["keywordValue"],
            keyWordArr = keyWord && keyWord.split(/[,，]/g) || [],
            {isKeyWordOk, isShowKeyModal} = this.state,
            keyWordCls = isKeyWordOk ? "keyWordIpt" : "keyWordIpt keyWordIptIllegle";
        if(isKeyWordOk == null)
            this.setState({isKeyWordOk: !(keyWordArr.length > 50 || keyWord && keyWord.length - keyWordArr.length + 1 >= 200)});

        return (
            <div className="early-warning">
                <Table pagination={false} columns={this.getColumns()} dataSource={dataArr}/>
                <div className="company-footer">
                    <Button className="primary" type="primary" onClick={this.handleSubmit.bind(this)}>{getLangTxt("sure")}</Button>
                </div>
                <NTModal visible={isShowKeyModal} className="earlyWarinitKeyWordModal modalCommonStyle" title={getLangTxt("setting_early_add_keywords")}
                    onCancel={this.setKeyWordModal.bind(this)}
                    onOk={this.setKeyWordVal.bind(this)}>
                    <Input type="textarea" className={keyWordCls} defaultValue={keyWord}
                        onChange={this.getKeyWordValue.bind(this, "keywordValue")}/>
                    <p className="attentionOne">{getLangTxt("setting_early_note4")}</p>
                    <p>{getLangTxt("setting_early_note5")}</p>
                </NTModal>
                {
                    _getProgressComp(this.progress)
                }
                {
                    this.progress === LoadProgressConst.SAVING_FAILED ?
                        this.savingErrorTips() : null
                }
            </div>
        )
    }

    getColumns()
    {
        return [
            {
                dataIndex: "rank",
                title: getLangTxt("serial_number"),
                className: "rankStyle",
                width: "10%"
            }, {
                dataIndex: "Scenes",
                title: getLangTxt("setting_early_warning_scene"),
                width: "20%"
            }, {
                dataIndex: "value",
                title: getLangTxt("setting_early_warning_value"),
                width: "60%",
                className: "relativeValue"
            }, {
                dataIndex: "instruction",
                title: getLangTxt("setting_early_warning_instructions"),
                width: "10%"
            }, {
                dataIndex: "status",
                title: getLangTxt("setting_early_warning_state"),
                width: "10%",
                render: (text, record) => <Switch className="warningSwitch" checked={text == 1}
                    onChange={this.handleStatus.bind(this, record)}/>
            }
        ]
    }
}

function mapStateToProps(state)
{
    return {warningData: state.earlyWarningReducer}
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getEarlyWarningParams, setEarlyWarningParams, clearErrorProgress
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(EarlyWarning)
