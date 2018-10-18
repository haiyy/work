//0或者空选择所有； 1待分配；2未开始；3进行中；4已完成；5已过期；6滞后完成；7暂停

class PhoneTaskStatus{
	
	static TO_BE_ASSIGN = 1; //待分配
	static NOT_BEGINNING = 2; //未开始
	static WORKING = 3;  //进行中
	static COMPLETE = 4;  //已完成
	static EXPIRED = 5;  //已过期
	static COMPLETE_LAG = 6;  //滞后完成
	static STOP = 7;  //暂停
}

export default PhoneTaskStatus;