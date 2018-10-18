import React from 'react';
import NTTreeForSearch from "../../../components/NTTreeForSearch";
import Tags from "../public/Tags";
import SelectedTagsData from "../data/SelectedTagsData";
import { omit, shallowEqual } from "../../../utils/MyUtil";
import ScrollArea from 'react-scrollbar';
import NTModal from "../../../components/NTModal";

class ConsultSelectedComponent extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.selectedTagsData = new SelectedTagsData();
		this.selectedTagsData.add(props.tags);

		this.state = {
			checkedKeys: this.selectedTagsData.keys,
			tags: this.selectedTagsData.data
		};

		this.delSourceDataFn = this.delSourceDataFn.bind(this);
		this.searchFn = this.searchFn.bind(this);
		this.onCancel = this.onCancel.bind(this)
		this.onOk = this.onOk.bind(this)
	}

	get itemIdKey()
	{
		let {itemid} = this.props.itemInfo;

		return itemid || "itemid";
	}

	get itemNameKey()
	{
		let {itemname} = this.props.itemInfo;

		return itemname || "itemname";
	}

	/*访客来源 delDataFn*/
	delSourceDataFn(keys)
	{
		this.selectedTagsData.del(keys);

		this.setState({
			checkedKeys: this.selectedTagsData.keys,
			tags: [...this.selectedTagsData.data]
		});
	}

	searchFn(checkedKeys = [], treeCheckedData = [])
	{
		try
		{
			if(!treeCheckedData)
				return;

			// if(shallowEqual(this._treeCheckedData, treeCheckedData, true, 2))
			// 	return;

			this._treeCheckedData = treeCheckedData;

			this.selectedTagsData = new SelectedTagsData();

			treeCheckedData.forEach(data => {
				if(!data)
					return null;

				this.selectedTagsData.addTag(data[this.itemIdKey], data[this.itemNameKey], this.props.searchKey);
			});

			this.state.checkedKeysSource = this.selectedTagsData.keys;

			this.setState({
                checkedKeys: this.selectedTagsData.keys,
				tags: [...this.selectedTagsData.data]
			});
		}
		catch(e)
		{
			console.log("ConsultSelectedComponent e.stack = ", e.stack);
		}
	}

	onCancel()
	{
		let {modalProps = {}} = this.props;

		if(typeof modalProps.onCancel === "function")
		{
			modalProps.onCancel();
		}
	}

	onOk()
	{
		let {modalProps = {}} = this.props;
		if(typeof modalProps.onOk === "function")
		{
			modalProps.onOk(this.state.tags);
		}
	}

	render()
	{
		let {checkedKeys, tags} = this.state,
			{modalProps = {}} = this.props;

		return (
			<NTModal {...omit(modalProps, ["onCancel", "onOk"])} visible onCancel={this.onCancel} onOk={this.onOk}>
				<div className="consultSelectedContent">
					<div className="tagModalBox">
						<span className="selectedRegin">已选条件</span>
						<Tags tags={tags} delDataFn={this.delSourceDataFn} getWidth={this.props.getWidth.bind(this)}/>
					</div>
					<div className="regionModalBox">
						<ScrollArea speed={1} style={{height: '310px'}} horizontal={false} smoothScrolling>
							<NTTreeForSearch checkedKeys={checkedKeys}
							                 searchFn={this.searchFn}
							                 {...omit(this.props, ["tags", "searchFn", "checkedKeys", "modalProps"])} popupContainer="regionModalBox"/>
						</ScrollArea>
					</div>
				</div>
			</NTModal>
		);
    }
}

export default ConsultSelectedComponent;
