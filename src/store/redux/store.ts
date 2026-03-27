import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { injectStore } from '../../lib/axiosInstance';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: true,
  }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Give the shared Axios instance access to the Redux store so its
// request interceptor can attach the auth token automatically.
injectStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
