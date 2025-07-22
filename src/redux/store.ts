import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app";
import alertsReducer from "./alerts";
import xmtpReducer from "./xmtp"; // Add any other slices

export const store = configureStore({
  reducer: {
    app: appReducer,
    alerts: alertsReducer,
    xmtp: xmtpReducer,
  },
});

// ✅ This is the RootState type used by useSelector
export type RootState = ReturnType<typeof store.getState>;

// ✅ This is the AppDispatch type used by useDispatch
export type AppDispatch = typeof store.dispatch;
