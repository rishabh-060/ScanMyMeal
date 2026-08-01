import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from './storage'
import { combineReducers } from 'redux'

import userReducer from './userSlice'
import productReducer from './productSlice'
import cartReducer from './cartProduct'
import addressReducer from './addressSlice'
import orderStatusReducer from './orderStatusSlice'
import orderReducer from './orderSlice'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['cartItem', 'addresses', 'orders', 'orderStatus'],
}

const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  cartItem: cartReducer,
  addresses: addressReducer,
  orderStatus: orderStatusReducer,
  orders: orderReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
