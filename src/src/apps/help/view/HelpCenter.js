import React, { Component } from 'react';
import './help.scss';
import { urlLoader } from "../../../lib/utils/cFetch";
import Settings from "../../../utils/Settings";
import { loginUserProxy } from '../../../utils/MyUtil'

export default class HelpCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: ''
    }
  }

  componentWillMount() {
    let { userId, siteId, ntoken } = loginUserProxy();
    let settingUrl = Settings.querySettingUrl("/helpcenter/", siteId);
    urlLoader(settingUrl)
      .then(({ jsonResult }) => {
        let { code, data: result, msg } = jsonResult;
        if (code === 200) {
          this.setState({
            data: result
          })
        }
      })
  }

  setData(data) {
    if (!data) return;
    const { kfLeader ,kfLogo,kfName,kfPhone,kfSignture,noticeInfo,siteName,suggestion,templateId } = data;
    const visitorPath = require("../../../public/images/help/visitor.png");
    const notice = noticeInfo.map((item,index)=>{
       return <a className='notice' key={item.title} href={item.url}>{item.title}</a>
    })
    return (
      <div className='help_box'>
        <div className='left_HelpCenter'>
          <p className='text'>亲爱的,</p>
          <p className='text'>我是{`${siteName}`}的专属客户经理,</p>
          <p className='changeText'>点击<span className='changeText colorText'>右侧售后</span>图标发起咨询,我和我的同事将竭诚为您服务!</p>
          <div className='account'>
            <img alt='' className='accountLogo' src={`${kfLogo}`} />
            <div className='accountInfo'>
              <p className='changeText'>客户经理</p>
              <li className='info'>在线客服:   {`${kfName}`}</li>
              <li className='info'>电话客服:   {`${kfPhone}`}</li>
              <li className='info'>客户经理:   {`${kfLeader}`}</li>
              <li className='info'>服务建议:   {`${suggestion}`}</li>
            </div>
          </div>
        </div>
        <div className='right_HelpCenter'>
          <div className='notice-board'>公告栏</div>
          <div className='noticeInfo'>
            {notice}
          </div>
        </div>
        <img alt='' className='visitorIcon' src={`${visitorPath}`} onClick={() => { NTKF.im_openInPageChat('kf_8006_template_16') }}></img>
      </div>
    )
  }

  render() {
    return (
      <div className='helpCenter'>
        {this.setData(this.state.data)}
      </div>
    );
  }
}

