import React from 'react';
import CommonWordsProxy from "../../../../model/proxy/CommonWordsProxy";
import UsualTips from "../aside/UsualTips";
import {SMART_INPUT} from "../../../event/TabEvent";
import IndexScrollArea from "../../../../components/IndexScrollArea";
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";
import NTDragView from "../../../../components/NTDragView";
import "./scss/SmartInputView.scss";

class SmartInputView extends React.Component {

    static NULL = -1;  //
    static UP = 1;
    static DOWN = 2;
    static NO_CHANGE = -2;

    constructor(props) {
        super(props);

        this.commonWords = [];
        this.selectedIndex = 0;

        this.state = {selectedIndex: 0};
        this.bgColor = this.bgColor.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.preSearch = this.props.search;
    }

    down() {
        this.setIndex(1);
        this._selectedIndex();
    }

    up() {
        this.setIndex(-1);

        this._selectedIndex();
    }

    setIndex(value) {
        let {robotList} = this.props;

        if (robotList && this.selectedIndex === -1 && this.commonWords.length && this.commonWords.length > robotList.length) {
            this.selectedIndex = robotList.length;
        }
        else {
            this.selectedIndex += value;
        }
    }

    _selectedIndex() {
        let len = this.commonWords.length;

        if (len === 0)
            return;

        if (this.selectedIndex >= len) {
            this.selectedIndex = 0;
        }
        else if (this.selectedIndex < 0) {
            this.selectedIndex = len - 1;
        }

        this.publish(this.selectedIndex);
    }

    publish(selectedIndex, forceSend = false) {
        let word = this.commonWords[selectedIndex];

        if (forceSend) {
            word.forceSend = forceSend;
            this.commonWords = [];
        }

        GlobalEvtEmitter.emit(SMART_INPUT, word);
    }

    _onSelected(index, forceSend) {
        this.selectedIndex = index;
        this.publish(index, forceSend);
        this.commonWords = [];
    }

    _getWordComp(word, index) {
        let props = {key: index, onClick: this._onSelected.bind(this, index, null)},
            cls = '';

        if (this.selectedIndex === index) {
            props.style = {'background': '#eaf8fe'}
            cls = ' selected';
        }

        if (word.type === UsualTips.FILE_TYPE) //文件
        {
            props.onClick = this._onSelected.bind(this, index, true);
            let fileData = JSON.parse(word.response),
                imgPath = require("../../../../public/images/file.png");

            return <li className={"inputViewFile " + cls} {...props}>
                <svg>
                    <circle cx="3" cy="3" r="3"/>
                </svg>
                <div className="file">
                    <image src={imgPath}/>
                </div>
                {
                    fileData.fileName
                }
            </li>;
        }
        else if (word.type === UsualTips.IMG_TYPE)  //图片
        {
            let imgData = JSON.parse(word.response),
                imgPath = require("../../../../public/images/failedLoad.png");

            return (
                <li  {...props} className={"imgBox clearFix inputViewFile " + cls}>
                    <svg>
                        <circle cx="3" cy="3" r="3"/>
                    </svg>
                    <img className="imgCon" src={imgData.imgUrl} onError={() => {
						this.src = imgPath
					}}/> <span className="imgNameCon">{imgData.imgName}</span>
                </li>
            )
        }
        else {
            return (
                <li className={"inputViewFile " + cls} {...props}>
                    <svg>
                        <circle cx="3" cy="3" r="3"/>
                    </svg>
                    <p className="main">
                        {word.title ? <i style={{fontStyle: 'normal'}}>【{word.title}】</i> : null}
                        <span>{word.response}</span>
                    </p>
                </li>
            );
        }
    }

    getRobotQueComp(robotList, question) {
        if (robotList && robotList.length && question) {
            return <div className="smartInputTitle">{question}</div>;
        }

        return null;
    }

    //includeSearch(searchValue)
    //{
    //	let search = searchValue.length > 15 ? searchValue.substr(0, 15) : searchValue;
    //	let index = this.commonWords.findIndex(word =>
    //	{
    //		return (word.response && word.response.indexOf(search) > -1) ||
    //			(word.title && word.title.indexOf(search) > -1);
    //	});
    //
    //	return index > -1;
    //}

    render() {
        let {search = "", upDown, popupStyle, smartInputOn, robotList, question} = this.props,
            style = popupStyle || {};
        //this.bgColor()

        if (upDown === SmartInputView.UP) {
            this.up();
        }
        else if (upDown === SmartInputView.DOWN) {
            this.down();
        }
        else if (upDown === SmartInputView.NULL && !search) {
            this.commonWords = robotList || [];
            this.selectedIndex = -1;
        }
        else {
            if (search && (this.commonWords.length <= 0 || upDown === SmartInputView.NULL)) {
                if (search !== this.preSearch && smartInputOn) {
                    this.commonWords = CommonWordsProxy.searchCommonWords(search);

                    this.selectedIndex = -1;

                    robotList && this.commonWords.unshift(...robotList);
                }
            }

            if (!this.commonWords.length && robotList.length) {
                this.commonWords = robotList;
            }
        }

        if (this.commonWords.length === 0) {
            style = {display: 'none'};

            GlobalEvtEmitter.emit(SMART_INPUT, null);
        }
        //<NTDragView enabledDrag={true} enabledClose={false} wrapperProps={style}></NTDragView>
        return (
            <div className="smartInput" style={style}>
                {
                    this.getRobotQueComp(robotList, question)
                }
                <IndexScrollArea speed={1} className="area" contentClassName="are" horizontal={false} style={{maxHeight: '450px'}} totalNum={this.commonWords.length} currentIndex={this.selectedIndex} smoothScrolling>
                    <ul className="list">
                        {
                            this.commonWords.map((word, index) => {
                                return this._getWordComp(word, index);
                            })
                        }
                    </ul>
                </IndexScrollArea>
            </div>
        )
    }
    componentDidMount(){
        this.bgColor();
    }
    componentDidUpdate(){
        this.bgColor();
    }
    bgColor(){
        let list = document.getElementsByClassName("list")[0].getElementsByTagName("LI");
        for(let i = 0; i < list.length; i++){
                if(i%2==0){
                    list[i].classList.add("bgColor");
                }
        }
    }
}

export default SmartInputView;
