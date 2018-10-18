import React from 'react';
import { Button } from 'antd';
import { configProxy, token, downloadByATag, getLangTxt } from "../../../utils/MyUtil";

class ExportComponent extends React.PureComponent {
    constructor(props)
    {
        super(props);
    }

    handleExport()
    {
        // let {search = {}} = this.props,
        //     copySearch = {...search};
        //
        // if (!search)
        //     return;
        //
        // copySearch.page = 1;
        //
        // let valueStringfy = JSON.stringify(copySearch),
        //     tokenValue = token(),
        //     exportUrl = configProxy().nCrocodileServer + '/conversation/list/export?where=' + valueStringfy + '&token=' + tokenValue;
        //
        // downloadByATag(exportUrl);
        this.props.handleOpenExportPage(true);
    }

    render()
    {
        return (
            <Button type="primary" className="exportBtn" onClick={this.handleExport.bind(this)}>
	            {getLangTxt("export")}
            </Button>
        );
    }
}

export default ExportComponent;
