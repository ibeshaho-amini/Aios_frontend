import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authentication/login'
import recommendationReducer from './Recommendation/cropRecommendation'


const store= configureStore({

    reducer:{
auth:authReducer,
recommendation: recommendationReducer,

    },

});
export default store;