const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER": {
      const user = action.payload;
      return user;
    }
    case "CLEAN_USER":
      return null;
    default:
      return state;
  }
};

export const setUser = (user) => ({ type: "SET_USER", payload: user });

export const cleanUser = () => ({ type: "CLEAN_USER" });

export default userReducer;
