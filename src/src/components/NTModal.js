import React from 'react';
import { Modal } from 'antd';

class NTModal extends React.Component {

    constructor(props)
    {
        super(props);
    }

    render()
    {
        return <Modal {...this.props} mask={this.props.mask || NTModal.mask}/>
    }
}

NTModal.mask = Type !== 1;  //如果显示端是安装版，蒙层不显示

export default NTModal;
