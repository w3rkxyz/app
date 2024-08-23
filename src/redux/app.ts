import { createSlice } from "@reduxjs/toolkit";
import { Profile } from "@lens-protocol/react-web";

const initialState = {
  loginModal: false,
  user: undefined,
};

interface Display {
  payload: {
    display: boolean;
  };
}

interface SetProfile {
  payload: {
    profile: Profile;
  };
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    displayLoginModal: (state: any, action: Display) => {
      state.loginModal = action.payload.display;
    },
    setLensProfile: (state: any, action: SetProfile) => {
      state.user = action.payload.profile;
    },
  },
});

// Action creators are generated for each case reducer function
export const { displayLoginModal, setLensProfile } = appSlice.actions;

export default appSlice.reducer;
