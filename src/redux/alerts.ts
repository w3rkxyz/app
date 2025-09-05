import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  displayAlert: false,
  displaytransactionLoader: false,
  loaderText: "Approving Token use",
  alertData: {
    id: 1,
    variant: "Successful",
    classname: "text-black",
    title: "Submission Successful",
    tag1: "Transaction succesful",
    tag2: "View on etherscan",
  },
};

interface Alert {
  payload: {
    displayAlert: boolean;
    data: {
      id: number;
      variant: string;
      classname: string;
      title: string;
      tag1: string;
      tag2?: string;
      hash?: string;
    };
  };
}

interface TransactionLoader {
  payload: {
    displaytransactionLoader: boolean;
    text: string;
  };
}

export const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    // display the alert modal
    openAlert: (state: any, action: Alert) => {
      state.displaytransactionLoader = false;
      state.displayAlert = true;
      state.alertData = action.payload.data;
    },

    // closes the alert modal
    closeAlert: (state: any) => {
      state.displayAlert = false;
    },

    // Opens the loader modal
    openLoader: (state: any, action: TransactionLoader) => {
      state.displayAlert = false;
      state.displaytransactionLoader = true;
      state.loaderText = action.payload.text;
    },

    // Closes the loader modal
    closeLoader: (state: any) => {
      state.displaytransactionLoader = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { openAlert, closeAlert, openLoader, closeLoader } = alertsSlice.actions;

export default alertsSlice.reducer;
