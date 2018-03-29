// action
const SELECT_ROLE = 'SELECT_ROLE';

export function selectRole(role) {
  return {
    type: SELECT_ROLE,
    role
  };
}

// reducer
export function settings(state = { selectedRole: null }, action) {
  if (action.type === SELECT_ROLE) {
    return { ...state, selectedRole: action.role };
  }
  return state;
}
