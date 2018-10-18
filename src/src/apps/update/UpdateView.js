import NTPureComponent from "../../components/NTPureComponent";
import React from 'react';
import { Button, Modal } from 'antd';
import CheckoutUpdate from "./CheckUpdate";
import { sendToMain } from "../../core/ipcRenderer";
import Channel from "../../model/vo/Channel";
import LogUtil from "../../lib/utils/LogUtil";
import "./style/updateModal.less";
import "../../public/styles/app/app.scss";
import { getLangTxt } from "../../utils/MyUtil";

class UpdateView extends NTPureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.onCheckUpdate = this.onCheckUpdate.bind(this);
		
		this.state = {updateType: 0, updating: false, isShowErrorModal: false};
		
		this.checkUpdate = new CheckoutUpdate();
		this.checkUpdate.on(CheckoutUpdate.UPDATE, this.onCheckUpdate);
		this.checkUpdate.getUpdateInfo();
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.siteId && nextProps.siteId != this.props.siteId)
		{
			this.checkUpdate && this.checkUpdate.getUpdateInfo(nextProps.siteId);
		}
	}
	
	componentWillUnmount()
	{
		if(this.checkUpdate)
		{
			this.checkUpdate.removeListener(CheckoutUpdate.UPDATE, this.onCheckUpdate);
		}
		
		this.checkUpdate = null;
	}
	
	onCheckUpdate(value)
	{
		if(value === CheckoutUpdate.NONEED_TO_UPDATE_TYPE)
		{
			this.onClose(false);
		}
		
		this.setState({updateType: value});
	}
	
	onUpdate()
	{
		try
		{
			if(!this.extension)
				return;
			
			//if(typeof Utils.downloadFile === "function")
			//{
			this.updatePath = window.common_electron.path.join(window.common_electron.systempath, "./update_" + this.checkUpdate.lastVersion + this.extension);
			
			let arch = window.common_electron.arch,
				url;
			if(arch === "win32_ia32")
			{
				url = this.checkUpdate.url;
			}
			else if(arch === "win32_x64")
			{
				url = this.checkUpdate.x64Url;
			}
			else
			{
				url = this.checkUpdate.macUrl;
			}
			
			window.common_electron.Utils.downloadFile(url, this.updatePath, this.onProgress.bind(this));
			
			this.setState({progress: 0, updating: true});
			//}
		}
		catch(e)
		{
			log("onUpdate e.stack = ", e.stack);
			
			this.setState({updateType: CheckoutUpdate.NONEED_TO_UPDATE_TYPE});
		}
	}
	
	get extension()
	{
		let isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows"),
			isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel"),
			extension = "";
		
		if(isWin)
		{
			extension = ".exe";
		}
		else if(isMac)
		{
			extension = ".pkg";
		}
		
		return extension;
	}
	
	onProgress(value, progress)
	{
		if(value === "progress")
		{
			this.setState({progress: progress.percent || 0});
		}
		else if(value === "end")
		{
			//关闭更新界面
			this.setState({progress: 100, updating: false});
			
			this.onClose(false);
			
			sendToMain(Channel.UPDATE, encodeURI("update_" + this.checkUpdate.lastVersion + this.extension));
		}
		else if(value === "close")
		{
			this.setState({updateType: CheckoutUpdate.NONEED_TO_UPDATE_TYPE});
		}
		else if(value === "error")
		{
			//下载文件失败
			this.setState({isShowErrorModal: true});
		}
	}
	
	onNoRemind(value)
	{
		if(this.checkUpdate && value)
		{
			this.checkUpdate.doNomoreRemind();
		}
		
		this.onClose(false);
	}
	
	getButtonsForUpdateType(value)
	{
		if(value === CheckoutUpdate.FORCEUPDATE_TYPE)
		{
			return [];
		}
		else if(value === CheckoutUpdate.UPDATE_TYPE)
		{
			return [
				<div key="ignoreUpdateBtn" className="ignoreUpdateBtn" onClick={this.onNoRemind.bind(this, true)}/>,
				<div key="updateLaterBtn" className="updateLaterBtn" onClick={this.onNoRemind.bind(this)}/>
			];
		}
		else if(value === CheckoutUpdate.MANUAL_UPDATE_TYPE)
		{
			return [
				<div key="manual" className="manualUpdate"
				     onClick={this.onManual.bind(this, true)}>{getLangTxt("update")}</div>,
			];
		}
	}
	
	onManual()
	{
		window.open(this.checkUpdate.url, "_blank");
	}
	
	handleCloseErrorModal()
	{
		this.setState({
			isShowErrorModal: false,
			updating: false,
			updateType: CheckoutUpdate.MANUAL_UPDATE_TYPE
		});
	}
	
	getUpdateErrorModal(isShowErrorModal)
	{
		if(isShowErrorModal)
		{
			Modal.confirm({
				title: getLangTxt("err_tip"),
				content: getLangTxt("down_failed"),
				iconType: 'exclamation-circle',
				className: 'errorTip updateErrorModal',
				okText: getLangTxt("sure"),
				onCancel: this.handleCloseErrorModal.bind(this),
				onOk: this.handleCloseErrorModal.bind(this)
			});
		}
	}
	
	getUpdateModal()
	{
		console.log("UpdateView getUpdateModal ....", this.state.updateType);
		
		let {updateType, updating, progress = 1, isShowErrorModal} = this.state;
		
		return (
			<div className="updateViewWrapper" id="updateViewWrapper">
				<div className="cancelUpdateBtn" onClick={this.onClose.bind(this)}></div>
				<div className="updateNowBtnHover"></div>
				{
					!updating ?
						[
							this.getButtonsForUpdateType(updateType),
							<div key="updateNowBtn" className="updateNowBtn" onClick={this.onUpdate.bind(this)}/>
						]
						:
						<div>
							<div className="loadingBar"/>
							<div className="updatingInfo clearFix">
								<div className="updatingTip">{getLangTxt("updating")}</div>
								{/*<div className="updatingPercent">{progress}%</div>*/}
							</div>
						</div>
				}
				{
					this.getUpdateErrorModal(isShowErrorModal)
				}
			</div>
		)
	};
	
	onClose(quit = true)
	{
		if(this.state.updateType === CheckoutUpdate.FORCEUPDATE_TYPE)
		{
			quit && sendToMain(Channel.OPERATE, Channel.QUIT);
		}
		
		let modal = document.getElementById('updateViewWrapper');
		
		if(modal)
			modal.parentNode.removeChild(modal);
		
		this.setState({isShowErrorModal: false});
		return null;
	}
	
	render()
	{
		if(this.state.updateType === CheckoutUpdate.NONEED_TO_UPDATE_TYPE)
			return null;
		
		return (
			<div>
				{
					this.getUpdateModal()
				}
			</div>
		)
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("UpdateView", info, log);
}

export default UpdateView;
