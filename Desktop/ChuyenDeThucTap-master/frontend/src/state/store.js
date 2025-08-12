import { configureStore } from "@reduxjs/toolkit";
import Reducer from "./../store/Reducer";

export default configureStore({
  reducer: {
    Reducer,
  },
});
