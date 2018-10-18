import { expect } from 'chai';
import users from '../../reducers/usersMenu';
import initialState from '../../reducers/initialState';
import { USERSMENU_SUCCESS } from '../../model/vo/actionTypes';

const db = require('./../data/db.json');

describe('Users reducer',() => {
  it('should return the initialState', () => {
    expect(users(undefined, {})).to.deep.equal(initialState.users);
  });

  it('should handle USERSMENU_SUCCESS', () => {
    expect(
      users([], {
        type: USERSMENU_SUCCESS,
        users: db.chatlist
      })
    ).to.deep.equal({
      isFetching: false,
      errorMessage: '',
      data: db.chatlist
    });
  });
});
