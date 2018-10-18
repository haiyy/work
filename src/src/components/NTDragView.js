import React from 'react';
import '../public/styles/nt/ntDragView.scss';
import GlobalEvtEmitter from "../lib/utils/GlobalEvtEmitter";
import KeyboardEvent from "../apps/event/KeyboardEvent";

class NTDragView extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            top: -1,
            left: -1
        };

        this.onMouseDown = this.onMouseDown.bind(this);

        this.onESC = this.onESC.bind(this);

        GlobalEvtEmitter.on(KeyboardEvent.ESC, this.onESC);
    }

    componentWillUnmount() {
        GlobalEvtEmitter.removeListener(KeyboardEvent.ESC, this.onESC);
    }

    onESC() {
        this.onClose();
    }

    componentDidMount() {
        let {enabledDrag} = this.props;

        if (!enabledDrag || !this.dragPanel)
            return;

        this.dragPanel.addEventListener("mousedown", this.onMouseDown, false);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        document.addEventListener("mousemove", this.onMouseMove, false);
        document.addEventListener("mouseup", this.onMouseUp, false);
    }

    componentWillUnmount() {
        document.removeEventListener("mousemove", this.onMouseMove, false);
        document.removeEventListener("mouseup", this.onMouseUp, false);

        if (this.dragPanel) {
            this.dragPanel.removeEventListener("mousedown", this.onMouseDown, false);
        }
    }

    onMouseMove(e) {
        let {enabledDrag} = this.props;

        if (!enabledDrag)
            return;

        if (e.buttons !== 1 || this.currentX < 0) {
            this.currentX = -1;
            this.currentY = -1;
            return;
        }

        var nowX = e.clientX, nowY = e.clientY;
        var disX = nowX - this.currentX,
            disY = nowY - this.currentY;

        this.setState({top: this.top + disY, left: this.left + disX});
    }

    onMouseDown(event) {
        this.wrapperHeight = event.currentTarget.clientHeight;
        this.wrapperWidth = event.currentTarget.clientWidth;

        this.currentX = event.clientX;
        this.currentY = event.clientY;
        this.top = this.state.top !== -1 ? this.state.top : this.getMidTop();
        this.left = this.state.left !== -1 ? this.state.left : this.getMidleft();
        event.currentTarget.focus();
    }

    onMouseUp(event) {
        this.currentX = -1;
        this.currentY = -1;
    }

    getMidTop() {
        let {wrapperProps} = this.props,
            height = typeof wrapperProps.height === "string" || !wrapperProps.height ? this.wrapperHeight : wrapperProps.height;

        if (this.clientHeight - height <= 0)
            return 0;

        return (this.clientHeight - height) / 2;
    }

    getMidleft() {
        let {wrapperProps} = this.props,
            width = typeof wrapperProps.width === "string" || !wrapperProps.width ? this.wrapperWidth : wrapperProps.width;

        if (this.clientWidth - width <= 0)
            return 0;

        return (this.clientWidth - width) / 2;
    }

    get clientWidth() {
        if (!document)
            return -1;

        return document.getElementById("app").clientWidth || -1;
    }

    get clientHeight() {
        if (!document)
            return -1;

        return document.getElementById("app").clientHeight || -1;
    }

    get dragPanel() {
        let headers = document.getElementsByClassName("ntDragViewWrapper");

        if (headers.length)
            return headers[0];

        return null;
    }

    onClose(e)
    {
    	e.stopPropagation();
    	
        let {_onClose} = this.props;

        let modal = document.getElementById('modal');

        if (modal) {
            modal.parentNode.removeChild(modal);
        }

        if (typeof _onClose === "function") {
            this.props._onClose();
        }
    }

    render() {
        let {top, left} = this.state,
            propsStyle, obj,
            {wrapperProps, enabledClose} = this.props;

        obj = {width: wrapperProps.width + 'px', height: wrapperProps.height + 'px'};

        if (top > -1 || left > -1) {
            propsStyle = {top, left}
        }
        else {
            propsStyle = {top: this.getMidTop(), left: this.getMidleft()}
        }

        Object.assign(propsStyle, obj);
        Object.assign(propsStyle, wrapperProps);

        return (
            <div id="dragWrapper" className="ntDragViewWrapper" style={propsStyle}>
                {
                    this.props.children
                }
                {
                    enabledClose ?
                        <i className="iconfont icon-009cuowu" onClick={this.onClose.bind(this)}/> : null
                }
            </div>
        );
    }

}

export default NTDragView;
