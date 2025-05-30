'use client'
import summaryApi from '@/public/common/summaryApi';
import { handleAddAddress } from '@/public/store/addressSlice';
import { handleAddItemCart } from '@/public/store/cartProduct';
import Axios from '@/public/utils/Axios';
import { DiscountedPrice } from '@/public/utils/DiscountedPrice';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setOrders } from '@/public/store/orderSlice';

const GlobalContext = createContext(null);

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    const dispatch = useDispatch();
    const cartItem = useSelector(state => state.cartItem.cart)
    const [totalCartItem, setTotalCartItem] = useState(0)
    const [totalCartPrice, setTotalCartPrice] = useState(0)
    const [nonDiscPrice, setNonDiscPrice] = useState(0)
    const user = useSelector(state => state.user)

    const fetchCartItem = async () => {
        try {
          const response = await Axios({
            ...summaryApi.getCart,
          });
    
          const { data: responseData } = response;
    
          if (responseData.success) {
            dispatch(handleAddItemCart(responseData?.data));
          }
        } catch (error) {
          // toast.error('Failed to fetch cart items');
          toast.error(error?.response?.data?.message);
          console.log(error?.response?.data?.message);
        } 
    };

    const updateCartItem = async (id, qty) => {
        try {
          const response = await Axios({
            ...summaryApi.updateCart,
            data: {
              _id : id,
              qty : qty
            }
          });
    
          const { data: responseData } = response;
    
          if (responseData.success) {
            // toast.success(responseData.message);
            fetchCartItem();
            return responseData
          } 
        } catch (error) {
          // toast.error('Failed to add item to cart');
          toast.error(error?.response?.data?.message);
        console.log(error?.response?.data?.message);
        } 
    }

    const deleteCartItem = async (id) => {
        try {
          const response = await Axios({
            ...summaryApi.deleteCart,
            data: {
              _id : id
            }
          });
    
          const { data: responseData } = response;
    
          if (responseData.success) {
            toast.success(responseData.message);
            fetchCartItem();
          }
        } catch (error) {
          // toast.error(error?.response?.data?.message);
          toast.error('Failed to delete item from cart');
        } 
    }

    const handleLogout = () => {
      localStorage.clear()
      dispatch(handleAddItemCart([]))
    }

    const fetchAddress = async () => {
      try {
        const response = await Axios({
          ...summaryApi.getAddress
        })

        const { data : responseData } = response
        if(responseData.success) {
          dispatch(handleAddAddress(responseData.data))
        }
      } catch (error) {
        // toast.error('Failed to fetching address')
        toast.error(error?.response?.data?.message);
        console.log(error?.response?.data?.message);
      }
    }

    const fetchOrder = async () => {
      try {
        const response = await Axios({
          ...summaryApi.myOrders,
        })

        const { data: responseData } = response;
        if (responseData.success) {
          dispatch(setOrders(responseData.data));
        }
      } catch (error) {
        // toast.error('Failed to fetch orders');
        toast.error(error?.response?.data?.message);
        console.log(error?.response?.data?.message);
      }
    }

    // for quantity & price
    useEffect(() => {
      const item = cartItem.reduce((prev, curr) => {
        return prev + curr.quantity
      },0)
  
      const discPrice = cartItem.reduce((prev, curr) => {
        return prev + (DiscountedPrice(curr.product.price, curr.product.discount) * curr.quantity)
      },0)

      const nonDiscP = cartItem.reduce((prev, curr) => {
        return prev + (curr.product.price * curr.quantity)
      },0)
  
      setTotalCartItem(item)
      setTotalCartPrice(discPrice)
      setNonDiscPrice(nonDiscP)
    }
    , [cartItem])

    useEffect(() => {
      fetchCartItem();
      fetchAddress();
      fetchOrder();
  }, [user]);

  return (
    <GlobalContext.Provider value={
      {
        fetchCartItem,
        updateCartItem,
        deleteCartItem,
        fetchAddress,
        totalCartItem,
        totalCartPrice,
        nonDiscPrice,
        fetchOrder,
        cartItem,
      }
    }>
      {children}
    </GlobalContext.Provider>
  );
}