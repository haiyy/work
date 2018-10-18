import React  from 'react'
import { Tabs } from 'antd'
import './style/showusers.scss'
import { getLangTxt } from "../../../utils/MyUtil";
const TabPane = Tabs.TabPane;

class ShowUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showOption: true
        }
    }

    returnDistribute() {
        this.props.returnDistribute()
    }

    callback(key) {
        
    }

    isOptionShow() {
        this.setState({showOption:!this.state.showOption})
    }

    _showOption(){
        return (
            <div className="showOption">
                <div className="optionBox">
                    <div className="singleOptionSame"></div>
                    <div className="singleOptionSame"></div>
                    <div className="singleOptionSame"></div>
                    <div className="singleOptionSame"></div>
                    <div className="singleOptionSame"></div>
                    <div className="singleOptionSame"></div>
                </div>
                <div className="customerServerDistribute">
                    <div className="customerServer"></div>
                </div>
                <div className="hideOption">
                    <div
                        style={{width: "1px",height: "30%", background: "#2b374d", position: "absolute", right: 0, top: 0}}></div>
                    <i onClick={this.isOptionShow.bind(this)}
                       className="icon iconfont icon-xiala1-xiangzuo hideOptionIcon"/>
                    <div
                        style={{width: "1px",height: "60%", background: "#2b374d", position: "absolute", right: 0, bottom: 0}}></div>
                </div>
            </div>
        )
    }

    _hideOption(){
        return(
            <div className="hideOption">
                <div
                    style={{width: "1px",height: "30%", background: "#2b374d", position: "absolute", right: 0, top: 0}}></div>
                <i onClick={this.isOptionShow.bind(this)}
                   className="icon iconfont icon-xiala1-xiangyou hideOptionIcon"/>
                <div
                    style={{width: "1px",height: "60%", background: "#2b374d", position: "absolute", right: 0, bottom: 0}}></div>
            </div>
        )
    }
    onPageChange(pageNumber) {
        
    }

    render() {
        const footer = (
            <div className='footer-list'>
                <span><i/>{getLangTxt("setting_distribution_load")}&ge;100%</span>
                <span><i/>{getLangTxt("setting_distribution_load")}80%-99%</span>
                <span><i/>{getLangTxt("setting_distribution_load")}50%-79%</span>
                <span><i/>{getLangTxt("setting_distribution_load")}&lt;50%</span>
            </div>
        );
        return (
            <div className='show-users' style={{ height: this.props.height + 20 }}>
                <div className='show-users-head'>
                    <span onClick={this.returnDistribute.bind(this)} className="return"><i
                        className="icon iconfont icon-xiala1-xiangzuo"/>{getLangTxt("back")}</span>
                    <Tabs defaultActiveKey="1" onChange={this.callback.bind(this)}>
                        <TabPane tab="实时显示数据" key="1">
                            <div className="TabPaneCody" style={{ height: this.props.height - 20 }}>
                                {/*<TreeMap />*/}
                                <div className="TabPaneCodyBody clearFix">
                                    <div className="allUserGroup">
                                        <div>70</div>
                                        <div>全部用户</div>
                                    </div>
                                    <div className="singleUserGroupBox">
                                        <div className="singleUserGroup">
                                            <div>30</div>
                                            <div>用户群1</div>
                                        </div>
                                    </div>
                                    <div className="consultBox">
                                        <div className="consultContent">
                                            <div>66</div>
                                            <div>咨询</div>
                                        </div>
                                        <div className="queuingContent">
                                            <div>10</div>
                                            <div>排队</div>
                                        </div>
                                        <div className="leaveMsgContent">
                                            <div>20</div>
                                            <div>留言</div>
                                        </div>
                                    </div>
                                    <div className="customerServiceBox">
                                        <div className="singleCustomerService">
                                            <div>30</div>
                                            <div>客服组1</div>
                                        </div>
                                    </div>
                                    { this.state.showOption ? this._showOption() : this._hideOption() }
                                </div>
                                {footer}
                            </div>
                        </TabPane>
                        <TabPane tab="截至当前" key="2">
                            <div className="TabPaneCody" style={{ height: this.props.height - 20 }}>
                                
                                {footer}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default ShowUsers;
