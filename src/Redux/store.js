import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authentication/login'
import recommendationReducer from './Recommendation/cropRecommendation'
import supplierReducer from './supplier/supplier_slice'
import productReducer from './product/productSlice'
import userReducer  from './authentication/userSlice'
import orderReducer from './order/orderSlice'
import cartReducer  from './order/cartSlice'
import recommendReducer from './Recommendation/reviews'
import farmerReducer from './farmer/farmerSlice'
import usageReducer from './farmer/usageSlice'
import feedbackReducer from './farmer/feebackSlice'
const store= configureStore({

    reducer:{
auth:authReducer,
recommendation: recommendationReducer,
supplier: supplierReducer,
product:productReducer,
users: userReducer,
order:orderReducer,
cart: cartReducer,
recommend:recommendReducer,
farmer: farmerReducer,
usage: usageReducer,
feedback:feedbackReducer,

    },

});
export default store;