import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authentication/login'
import recommendationReducer from './Recommendation/cropRecommendation'
import supplierReducer from './supplier/supplier_slice'
import productReducer from './product/productSlice'
import userReducer  from './authentication/userSlice'

const store= configureStore({

    reducer:{
auth:authReducer,
recommendation: recommendationReducer,
supplier: supplierReducer,
product:productReducer,
users: userReducer,

    },

});
export default store;