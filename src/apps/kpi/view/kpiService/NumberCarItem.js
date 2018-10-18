//NumberCar 数字卡片
import React, {Component, Fragment, createElement} from 'react';
import {Card, Popover} from 'antd';
import LogUtil from "../../../.././lib/utils/LogUtil";
import {truncateToPop} from "../../../.././utils/StringUtils";
import "../scss/NumberCar.scss";
import { cardData }  from "./cardData.js";

class NumberCarItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            float: false
        };
        this.IconCard = this.IconCard.bind(this);
        this.NumberHandle = this.NumberHandle.bind(this);
        this.TimeHandle = this.TimeHandle.bind(this);
    }

    IconCard(ind) {
        // console.log(ind);
        this.setState({
            float: !this.state.float
        })
    }

    render() {

        let {item = {}, i, dataType = {}} = this.props,

            card = document.getElementsByClassName("tipsGroupStyle")[0],
            cardWidth = card && card.clientWidth - 13,
            contentInfo = cardWidth && truncateToPop(this.changeValue(item, dataType), cardWidth, 28) || {};

        /*console.log("NumberCarItem contentInfo = " ,cardWidth, contentInfo, this.forceUpdate())*/

        return (
            <div className="warpCard"
                 key={i}
                 style={{
                     width: item.width == undefined ? `calc(20% - 10px)` : item.width,
                     height: item.height == undefined ? '122px' : item.height
                 }}
                 onClick={() => {
                     this.IconCard(i);
                 }}>
                <Card key={i} ref={(node) => {
                }}
                      className="card"
                      title={item.title}
                      hoverable
                >
                    {
                        contentInfo.show ?
                            <Popover content={<div style={{
                                maxWidth: "1.4rem", height: "auto", wordBreak: "break-word"
                            }}>{contentInfo.popString}</div>} placement="topLeft">
                                <div className="tipsGroupStyle">
                                    {
                                        contentInfo.popString
                                    }
                                </div>
                            </Popover>
                            :
                            <div className="tipsGroupStyle">
                                {
                                        contentInfo.popString
                                }
                            </div>
                    }
                </Card>
            </div>
        )
    }

    componentDidMount() {
        let card = document.getElementsByClassName("card"),
            warpCard = document.getElementsByClassName("warpCard")[0];
        [...card].map(item => {
            item.classList.remove("ant-card");
        })
    }
    changeValue(item, Type) {
        //console.log(Type);
       // console.log(item);
        let {value} = item;
        if(item.title === Type.title){
            if (Type.dataType == "Percent") {
                if (value == 0) {
                    return '0%';
                }else{
                    return value
                }
            }else if(Type.dataType == "Long"){
                if (value == 0) {
                    return '0';
                }else{
                    return this.NumberHandle(value);
                }
            }else{
                return this.TimeHandle(value);
            }
        }
    }
    //处理数字
    NumberHandle(value){
        if (typeof value === 'number' && value % 1 === 0) {
            let toStr = value.toString(),
                str = toStr.split("").reverse().join(""),
                rep = str.replace(/(.{3})/g, '$1 '),
                newNum = rep.split("").reverse().join("").trim();
            return newNum;
        }
    }
    //时间处理
    TimeHandle(value){
        if (value) {
            //时间字体大小处理
            let tempAry = [],
                ary = [];
            value.replace(/(\d+)([a-zA-Z])/g, (a, b, c) => {
                tempAry.push([b, c])
            });
            if (!tempAry.length) return value;
            tempAry.forEach(item => {
                ary.push(item[0]);
                ary.push(createElement(
                    'span',
                    {style: {fontSize: '18px'}},
                    item[1]
                ),);
            });
            return createElement('div', null, ...ary);
        } else {
            return <div>0<span style={{fontSize:'18px'}}>s</span></div>;
        }
    }
}

export default NumberCarItem



