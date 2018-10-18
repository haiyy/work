import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getAccountGroup, getlListData } from './accountAction/sessionLabel';
import AccountGroup from './AccountGroup';
import AccountGroupReadOnly from './AccountGroupReadOnly';
import AccountList from './AccountList';
import AccountListReadOnly from './AccountListReadOnly';
import './style/platform.scss';

class AccountReadOnly extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			display: true,
            pageNum: null,
			hasError:false
		};
        this.selectGroupId = "";
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
	}

	componentDidMount()
	{
		this.props.getAccountGroup();
		this.props.getlListData();
	}

    //收起左侧列表
	changeClick()
	{
		this.setState({
			display: !this.state.display
		})
	}

    //set
    getCurrentGroup(groupId)
    {
        this.selectGroupId = groupId;
    }

    resetListPage(pageNum)
    {
        this.setState({pageNum})
    }

	render()
	{
		if(this.state.hasError)
			return null;

		const {getAccountList = [], accountListCount = 0, height, data} = this.props;

        let groupDatas = data || [],
            groupWidth = this.state.display ? {width: '1.95rem'} : {width: '0.05rem'},
            listStyle = this.state.display ? { height: '100%', padding: '0 0 0 2.03rem' } : {height: '100%', padding: '0 0 0 0.13rem'};

		return (
			<div className="platform">
				<div className="accountLeft"
				     style={ groupWidth }>
					{
						this.state.display ?
                            <AccountGroupReadOnly
                                getCurrentGroup={this.getCurrentGroup.bind(this)}
                                getListData={this.props.getlListData}
                                currentId={this.selectGroupId}
                                resetListPage={this.resetListPage.bind(this)}
                                data={ groupDatas }
                            />
                            : null
					}
                    {
                        this.state.display ?
                        <img src={require("./image/accountGroupClose.png")} className="account-button" onClick={this.changeClick.bind(this)}/>
                            :
                        <img src={require("./image/accountGroupOpen.png")} className="account-button account-button-open" onClick={this.changeClick.bind(this)}/>
                    }
				</div>

				<div className="accountRight"
				     style={ listStyle }>
                    <AccountListReadOnly currentId={this.selectGroupId} getAccountList={ getAccountList }
                        getCurrentGroup={this.getCurrentGroup.bind(this)}
                        pageNum={this.state.pageNum}
                        resetListPage={this.resetListPage.bind(this)}
                        getlListData={this.props.getlListData.bind(this)}/>

				</div>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	return {
		data: state.accountReducer.data,
        groupProgress: state.accountReducer.progress,
		getAccountList: state.getAccountList.data,
        accountListCount: state.getAccountList.count,
        progress: state.getAccountList.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAccountGroup, getlListData}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountReadOnly);
