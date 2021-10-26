import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './features/app/App'
import { rootReducer } from './store/index'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.REACT_APP_ENV === 'production'
    ? 'pk_live_51I9k79D9acIe7FmFpYGEXNjZ5QoWFNJ9SJFxbOSY6ahv6I6m9oxI9gwOr6T9gRHWGy6OeWGaN6rEC7MqAaIzQEMq00umgidMTg'
    : 'pk_test_51I9k79D9acIe7FmF9yWcuTEGUxjEeeumIVKEEkwtRWX6mqm19k7dXCXJ1nmK7Ghl0a5k1k93jBTyqq7eThYGL0M800iTljeq4R'
)

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
})

ReactDOM.render(
  <Provider store={store}>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </Provider>,
  document.querySelector('#root')
)

export type AppDispatch = typeof store.dispatch
