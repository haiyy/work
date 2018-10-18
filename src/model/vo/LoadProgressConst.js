class LoadProgressConst {
	static LOADING = 1;  //正在加载
	static LOAD_COMPLETE = 2;  //加载完成
	static LOAD_FAILED = 3;  //加载失败
	static SAVING = 4;  //正在保存
	static SAVING_SUCCESS = 5;  //保存成功
	static SAVING_FAILED = 6;  //保存失败
    static DUPLICATE = 7;  //数据重复
    static UNDELETED = 8;  //不可删除
    static ERROR_PASSWORD = 9;  //密码输入错误
    static DUPLICATE_NICKNAME = 10;  //账号中心内部名重复数据重复
    static LEVEL_EXCEED = 11;  //账号中心分组级数大于6
    static ACCOUNT_EXCEED = 12;  //账号超限
    static ROLE_LIMIT_EMPTY = 13;  //角色权限为空

}

export default LoadProgressConst;
