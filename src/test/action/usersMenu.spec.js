import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { expect } from 'chai';
import {
  USERSMENU_QERUEST, USERSMENU_SUCCESS
} from '../../model/vo/actionTypes';
import { fetchUsers } from '../../actions/usersMenu';
import { API_CONFIG } from '../../data/api';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);
const db = require('./../data/db.json');

describe('Users actions', function() {
  afterEach(() => {
    nock.cleanAll();
  });
  it('should create USERSMENU_SUCCESS when fetching users has been done', () => {
    nock(API_CONFIG.host)
      .get((uri) => {
        return uri.indexOf(API_CONFIG.menu) >= 0;
      })
      .reply(200, db.chatlist);
    const expectedActions = [
      { type: USERSMENU_QERUEST, isFetching: true },
      { type: USERSMENU_SUCCESS, isFetching: false, users: db.chatlist }
    ];
    const store = mockStore();

    return store.dispatch(fetchUsers())
      .then(() => {
        expect(store.getActions()).to.deep.equal(expectedActions);
      });
  });
});
