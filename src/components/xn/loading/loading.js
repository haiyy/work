/**
 * 1.style控制组件样式;
 */
import React, { Component } from 'react';
import { getLangTxt, omit } from "../../../utils/MyUtil.js";

class Loading extends Component{

    constructor(props)
	{
        super(props);
        this.state={

        };
    }

    render()
    {
        let tempProps = omit(this.props.style, ["position"]),
            styles = {...tempProps,position: this.props.position || ""};
        
        return(
            <div className="spin" style={ styles } >
				<div className="ant-spin ant-spin-spinning"  id="spinning">
                    <span className="ant-spin-dot ant-spin-dot-spin" >
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                    </span>
                </div>
            </div>
        )
    }
}

export default Loading