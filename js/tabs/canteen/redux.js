// @flow
'use strict';

import { canteenApiKey } from '../../../env.js';

import fetchCanteenData from './helpers';

// ACTIONS
// action that is dispatched whenever the dayplans will we fetched
const REQUEST_DAYPLANS = 'REQUEST_DAYPLANS';
export function requestDayPlans() {
  return { type: REQUEST_DAYPLANS };
}

// action that is dispatched whenever fetching the dayplans finished
const RECEIVE_DAYPLANS = 'RECEIVE_DAYPLANS';
export function receiveDayPlans(dayPlans) {
  return {
    type: RECEIVE_DAYPLANS,
    dayPlans: dayPlans,
    receivedAt: Date.now()
  }
}

// action that is dispatched whenever an error occurred while fetching the dayplans data
const ERROR_FETCHING_DAYPLANS = 'ERROR_FETCHING_DAYPLANS';
export function errorFetchingDayPlans() {
  return {
    type: ERROR_FETCHING_DAYPLANS,
    dayPlans: []
  }
}

export function fetchDayPlans() { // a function as actions (enabled by thunk)
  return async function (dispatch) {
    dispatch(requestDayPlans());
    try {
      const canteenUrl = `https://www.swfr.de/index.php?id=1400&type=98&&tx_swfrspeiseplan_pi1[apiKey]=${canteenApiKey}&tx_swfrspeiseplan_pi1[ort]=677`;
      const response = await fetch(canteenUrl);
      const responseBody = await response.text();
      const dayPlans = fetchCanteenData(responseBody);
      dispatch(receiveDayPlans(dayPlans));
    } catch(e) {
      dispatch(errorFetchingDayPlans());
    }
  }
}

// REDUCER
export function canteen(state = {
  isFetching: false,
  networkError: false,
  lastUpdated: null,
  dayPlans: []
}, action) {
  switch (action.type) {
    case REQUEST_DAYPLANS:
      return {...state,
        isFetching: true,
        networkError: false
      };
    case RECEIVE_DAYPLANS:
      return {...state,
        isFetching: false,
        dayPlans: action.dayPlans,
        networkError: false,
        lastUpdated: action.receivedAt
      };
    case ERROR_FETCHING_DAYPLANS:
      return {...state,
        isFetching: false,
        networkError: true,
      };
    default:
      return state;
  }
}
