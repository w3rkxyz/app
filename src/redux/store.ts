import { configureStore, combineReducers } from "@reduxjs/toolkit";
import appReducer from "./app";
import alertsReducer from "./alerts";

export const store = configureStore({
  reducer: {
    app: appReducer,
    alerts: alertsReducer,
  },
});
