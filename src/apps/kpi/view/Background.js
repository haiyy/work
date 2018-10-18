import React, { Component } from 'react'
import {connect} from "react-redux";
import "../../../utils/css/kpi/background.less"

//报表库和我关注的数据详情页  周报月报 客服来往明细各种背景图片全适应
class  Background extends Component {
    constructor(props)
    {
        super(props)
    }
    render()
    {
        let {width,height} = this.props;
        return (
            <div className='backgroundBox' style={{width:width,height:height}}>
                {/*九宫格背景图（自适应）
                <div className='backgroundOne'></div>
                <div className='backgroundTwo' ></div>
                <div className='backgroundThree'></div>
                <div className='backgroundFour'></div>
                <div className='backgroundFive'></div>
                <div className='backgroundSix'></div>
                <div className='backgroundSeven'></div>
                <div className='backgroundEight'></div>
                <div className='backgroundNine'></div>*/}
            </div>
        )
    }
}
export default connect(null, null)(Background);
