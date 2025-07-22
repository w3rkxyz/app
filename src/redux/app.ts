import { createSlice } from "@reduxjs/toolkit";
import { AccountData } from "@/utils/getLensProfile";

interface AppState {
  loginModal: boolean;
  switchModal: boolean;
  user: AccountData | undefined;
}

const initialState: AppState = {
  loginModal: false,
  switchModal: false,
  user: undefined,
};

interface Display {
  payload: {
    display: boolean;
  };
}

interface SetProfile {
  payload: {
    profile: AccountData;
  };
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    displayLoginModal: (state: any, action: Display) => {
      state.loginModal = action.payload.display;
    },
    displaySwitchModal: (state: any, action: Display) => {
      state.switchModal = action.payload.display;
    },
    setLensProfile: (state: any, action: SetProfile) => {
      state.user = action.payload.profile;
    },
  },
});

// Action creators are generated for each case reducer function
export const { displayLoginModal, displaySwitchModal, setLensProfile } = appSlice.actions;

export default appSlice.reducer;
