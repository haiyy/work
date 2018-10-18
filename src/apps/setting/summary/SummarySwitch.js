import React, {Component} from 'react';
import {Switch, Radio, Input} from 'antd';
import '../../../../node_modules/antd/dist/antd.css';
import './style/summary.css';

const RadioGroup = Radio.Group;

export default class SummarySwitch extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isCommonSwitchValue: 1
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange() {

    }

    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            marginLeft: '20px'
        };

        const inputStyle = {
            width: '30px',
            textAlign: 'center',
            margin: "0 10px"
        };

        return (
            <div className="summary-switch-container">
                <div className="summary-switch-wrapper">
                    <span className="summary-switch-title">关闭聊窗后自动弹出:</span>
                    <Switch defaultChecked={true} onChange={this.onChange}/>
                </div>
                <div className="summary-switch-wrapper">
                    <div className="summary-switch-title">常用咨询总结:</div>
                    <div className="summary-switch-common-wrapper">
                        <div>
                            <Switch defaultChecked={true} onChange={this.onChange}/>
                        </div>
                        <RadioGroup onChange={this.onChange} value={this.state.isCommonSwitchValue}>
                            <Radio style={radioStyle} value={1}>手动设置</Radio> 
                            {/*<Radio style={radioStyle} value={2}>
                                系统自动计算，近<Input style={inputStyle} type="text" defaultValue="7"/> 天使用频率最高的总结
                            </Radio>*/}
                        </RadioGroup>
                    </div>
                </div>
            </div>
        );
    }
}
