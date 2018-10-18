import React from 'react';
import { Modal } from 'antd';
import '../view/style/visitplan.less'

class ChatServiceRecord extends React.Component {
    constructor(props)
    {
        super(props);
    }

    componentDidMount()
    {
    }

    //上一通
    frontClick() {}

    //下一通
    nextClick() {}

    render() {
        let {visible,onCancel} = this.props;
        return <Modal visible={visible} onCancel={onCancel} title="查看服务记录" footer={null}>
                   <div style={{minHeight:200,marginBottom:50}}></div>
                   <div className="serviceRecordBtn">
                       <a onClick={this.frontClick.bind(this)}>上一通</a>
                       <a onClick={this.nextClick.bind(this)}>下一通</a>
                   </div>
                </Modal>
    }
}

export default ChatServiceRecord;