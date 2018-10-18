class MessageACK
{
    static NO_ACK = 0;
    static ACK = 1;
    static SUCCESS_ACK = 2;//发送失败成功会返回结果
}

Object.freeze(MessageACK);

export default MessageACK;

