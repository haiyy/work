class RecordFormatType
{
    static STRING = 1;
    /**
     * 百分比
     * 需要将小数转换为百分比
     * */
    static PERCENT = 2;
    /**
     * 整型
     * 当值为-1时，显示为“会话进行中”
     * */
    static INT = 3;
    static ARRAY = 4;
    static TIME = 5;
    static DATE = 6;
    static LINK = 7;
    static ACTION = 8;
    static PHONETYPE = 9;
    static AUDIO = 10;

}

export default RecordFormatType;
