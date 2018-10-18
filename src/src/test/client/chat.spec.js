import {expect} from 'chai'
import {v1} from 'uuid'
import {fromJS,Map,List} from 'immutable'

describe("rooms",()=>{
    it("能够添加房间:addRoom",()=>{
        var firstRoom={id:v1(),name:"first room",owner:"xiaoneng"}

        const nextState=addRoom(undefined,firstRoom)
        const rooms=nextState.get("rooms")

        //expect(rooms).to.be.ok
        //expect(rooms.get(0) ).to.equal(Map(firstRoom))
        expect(nextState.getIn(["rooms",0,"name"])).to.equal(firstRoom.name)
        expect(nextState.getIn(["rooms",0,"id"])).to.equal(firstRoom.id)
        expect(nextState.getIn(["rooms",0,"owner"])).to.equal(firstRoom.owner)
        const nextNextState=addRoom(nextState,{
            name:"second room",owner:"xiaobing"
        })

        expect(nextNextState.getIn(["rooms",1,"name"])).to.equal("second room")

    })
    const mockState=fromJS({
        rooms:[{id:v1(),name:"first room",owner:"xiaoneng"}]
    })

    it("能被创建者删除",()=>{


       const state=removeRoom(mockState,{
           id:mockState.getIn(["rooms",0,"id"]),
           user:"xiaoneng"
       })
       expect(state.get("rooms").size).to.equal(0)
    })


    it("不能被其它人删除",()=>{
        const state=removeRoom(mockState,{
            id:mockState.getIn(["rooms",0,"id"]),
            user:"zhangsan"
        })
        expect(state.get("rooms").size).to.equal(1)
    })
})