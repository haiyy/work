import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ShopGroup from './ShopGroup';
import ShopList from './ShopList';
import './style/shopManageComp.less';

class ShopManageComp extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			display: true,
            pageNum: null,
			hasError:false,
            selectGroupId: ""
		};
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
	}

	componentDidMount()
	{

	}

    //收起左侧列表
    isShowGroupList()
	{
		this.setState({
			display: !this.state.display
		})
	}

    //set
    getCurrentGroup(selectGroupId)
    {
        this.setState({selectGroupId})
    }

    resetListPage(pageNum)
    {
        this.setState({pageNum})
    }

	render()
	{
        let groupWidth = this.state.display ? {width: '1.95rem'} : {width: '0.05rem'},
            listStyle = this.state.display ? { height: '100%', padding: '0 0 0 2.03rem' } : {height: '100%', padding: '0 0 0 0.13rem'},
            {selectGroupId} = this.state;
		return (
			<div className="shopManageComp">
				<div className="shopAccountLeft" style={ groupWidth }>
					{
						this.state.display ?
                            <ShopGroup selectedGroupId={selectGroupId} getCurrentGroup={this.getCurrentGroup.bind(this)}/>
                            : null
                    }
                    {
                        this.state.display ?
                            <img src={require("./image/accountGroupClose.png")} className="account-button"
                                onClick={this.isShowGroupList.bind(this)}
                            />
                            :
                            <img src={require("./image/accountGroupOpen.png")} className="account-button account-button-open"
                                onClick={this.isShowGroupList.bind(this)}
                            />
                    }
                </div>

                <div className="shopAccountRight" style={ listStyle }>
                    <ShopList selectedGroupId={selectGroupId} getCurrentGroup={this.getCurrentGroup.bind(this)}/>
                </div>
            </div>
		);
	}
}

function mapStateToProps(state)
{
	return {
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopManageComp);
