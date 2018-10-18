import React from 'react';
import CustomTab from "./CustomTab";
import CustomTabReadOnly from "./CustomTabReadOnly";
import NewCustomTab from "./NewCustomTab";
class CustomTabCompReadOnly extends React.PureComponent {

    constructor(props)
    {
        super(props);
    }

    render()
    {
        let {isNew, editData} = this.props;
        if (isNew)
            return <NewCustomTab editData={editData} route={this.props.route.bind(this)}/>;

        return <CustomTabReadOnly route={this.props.route.bind(this)}/>
    }
}


export default CustomTabCompReadOnly;

