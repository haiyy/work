import { GET_SKILLTAG, NEW_SKILLTAG, DEL_SKILLTAG, GET_LISTINFO, EDITOR_SKILLTAG } from '../../../../model/vo/actionTypes';

let skilltag = [], tagsCount = 0;

export function skilltag(state={},action){

    let progress;

  switch(action.type){
      case GET_SKILLTAG:

          if (action.result&&action.result.code == 200){
              skilltag = action.result.data;
              tagsCount = parseInt(action.result.message);
          }

          progress = changeProgress(action);

          return {
	          data: skilltag,
              totalCount: tagsCount,
              progress
          };

      case NEW_SKILLTAG:
          if (action.result&&action.result.code == 200)
          {
              if (skilltag.length<10)
              {
                  let data = {
                      "tagid": action.result.data,
                      "tagname": action.result.tagname,
                      "usernumber" : 0
                  };

                  skilltag.push(data);
              }

              tagsCount += 1;
          }

          progress = changeProgress(action);

		  return {
			  data: [...skilltag],
              totalCount: tagsCount,
              progress
		  };

	  case EDITOR_SKILLTAG:

            if (action.success)
            {
                skilltag.map(item=>{
                    if(item.tagid == action.result.tagid){
                        item.tagname = action.result.tagname;
                    }
                });
            }

          progress = changeProgress(action);

		  return {
			  data: [...skilltag],
              totalCount: tagsCount,
              progress
		  };

	  case DEL_SKILLTAG:

          if (action.success)
          {
              skilltag.map((item, index)=>{
                  if(item.tagid == action.result){
                      skilltag.splice(index, 1);
                  }
              });
              tagsCount -= 1;
          }

          progress = changeProgress(action);

		  return {
			  data: [...skilltag],
              totalCount: tagsCount,
              progress
		  };

      default:
          return state;
  }
}

export function skilltagList(state={},action){

    let userData = [],userProgress;
	switch(action.type)
    {
		case GET_LISTINFO:
            if (action.result&&action.result.code == 200)
            {
                userData = action.result.data;
            }

            userProgress = changeProgress(action);

			return {
				list: userData,
                userProgress
			};

		default:
			return state;
	}
}

function changeProgress(action)
{
    console.log("changeProgress action = " + action.left + ", right = " + action.right);
    let progress;
    if(action.hasOwnProperty("left"))
    {
        progress = action.left;
    }

    return progress;
}
