import React from 'react';
import '../../../public/styles/record/HeadBtnComponent.scss';

class SearchComponent extends React.PureComponent
{
    constructor(props)
    {
        super(props);
    }

    /*点击筛选图标出现高级搜索列表*/
    advancedSearchFun()
    {
        this.props.advancedSearchFun();
    }

    render()
    {
        return (
            <i className="icon-sousuo iconfont" onClick={this.advancedSearchFun.bind(this)}/>
        );
    }
}

export default SearchComponent;
