/**
 * 1.datd:input的value值;
 * 2.leng:控制input显示的长度
*/
//控制输入框显示字符串的长度
function checkLength(data,leng){
    //console.log(data);
    let REG_CHINESE = /[\u4e00-\u9fa5]/g, REG_NOT_CHINESE = /[a-zA-Z]/g, REG_SUM = /[0-9]/g, str="", newData = data.trim();
    if (newData) {
        const chineseLength = newData.match(REG_CHINESE) ? newData.match(REG_CHINESE).length : 0;
        const charLength = newData.match(REG_NOT_CHINESE) ? newData.match(REG_NOT_CHINESE).length : 0;
        const sumLength = newData.match(REG_SUM) ? newData.match(REG_SUM).length : 0;
        let total = chineseLength * 2 + charLength + sumLength ;
        if (total > leng) {
            let count = 0;
            let copyData = newData.slice(0);
            while (total > leng) {
                count ++;
                const isChinese = /[\u4e00-\u9fa5]/.test(copyData.charAt(copyData.length - 1));
                copyData = copyData.slice(0, -1);
                total = isChinese ? total - 2 : total - 1;
            }
           // console.log(newData.slice(0, - count));
            str = newData.slice(0, - count);
            
        }else{
            str = newData;
        }
    }
    //console.log(str)
    return str;
};

export default checkLength;