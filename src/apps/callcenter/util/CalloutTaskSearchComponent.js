import React from 'react';
import {Select,Input,Button} from 'antd';
const Search = Input.Search;
const Option = Select.Option;
import "../view/style/callOutTask.less"
class CalloutTaskSearchComponent extends React.Component {
    constructor(props)
    {
        super(props);
        let {taskselectValue,taskStatusselectValue,taskSearchVal} = this.props;
        this.state = {
            type:"",
            taskselectValue:"",
            taskStatusselectValue:"",
            taskSearchVal:"",
        }
    }

    ontaskSearchVal(){
        let {taskSearchVal} = this.state;

        this.props._ontaskSearchVal(taskSearchVal);

    }

    onTaskSearchChange(e){
        this.setState({
            taskSearchVal:e.target.value
        })
    }
    
    onTaskSelectValue(value,type)
    {
        
       if(type){
           if(type=='taskselectValue'){
               this.setState({
                   taskselectValue: value,
               });
               this.props._onSelect(value,type);
           }else{
               this.setState({
                   taskStatusselectValue: value,
               });
               this.props._onSelect(value,type);
           }}
    }

    render()
    {
        let { taskselectValue, taskStatusselectValue,taskSearchVal} = this.props;
        console.log("taskselectValue="+taskselectValue,"taskStatusselectValue="+taskStatusselectValue);
        return (
            <div className="CallOutTask-Search">
                    <div className="bindonSearch searchBox search">
                        <Select className="CallOutTask-Resoure" value={taskselectValue} onSelect={this.onTaskSelectValue.bind(this,"taskselectValue")}  getPopupContainer={()=>document.querySelector(".callCenterScrollArea")}>
                            <Option value={-1}>所有任务来源 </Option>
                            <Option value={1}> 客户导入 </Option>
                            <Option value={2}> 呼入未接 </Option>
                            <Option value={3}> 呼出未接</Option>
                        </Select>
                        <Select value={taskStatusselectValue}  onSelect={this.onTaskSelectValue.bind(this,"taskStatusselectValue")}  getPopupContainer={()=>document.querySelector(".callCenterScrollArea")}>
                            <Option value={-1}>所有状态 </Option>
                            <Option value={1}> 未开始 </Option>
                            <Option value={2}> 进行中 </Option>
                            <Option value={3}> 已完成 </Option>
                            <Option value={4}> 已过期 </Option>
                            <Option value={5}> 滞后完成 </Option>
                            <Option value={6}> 暂停</Option>
                        </Select>
                        <Input
                            placeholder="按任务名称模糊查询"
                            maxLength={50}
                            defaultValue={taskSearchVal}
                            onChange={this.onTaskSearchChange.bind(this)}
                        />
                        <Button className="searchBtn" type="primary" onClick={this.ontaskSearchVal.bind(this)}
                            icon="search"></Button>
                </div>
            </div>
        );
    }
}

export default CalloutTaskSearchComponent;
