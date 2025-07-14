"use client";
import fetchUserDetails from "@/public/utils/fetchUserDetails";
import React, { useEffect, useState } from "react";
import { setUserDetails } from "@/public/store/userSlice";
import { useDispatch } from "react-redux";
import useMobile from "@/hooks/useMobile";
import { setAllCategory, setAllSubCategory, setLoadingCategory, setProduct } from "@/public/store/productSlice";
import Axios from "@/public/utils/Axios";
import summaryApi from "@/public/common/summaryApi";
import { toast } from "react-toastify";
import Home from "@/Components/Home";
import { GlobalProvider } from "@/provider/GlobalProvider";

const page = () => {
  const dispatch = useDispatch();
  const [isMobile] = useMobile();

  const fetchUser = async () => {
    const userData = await fetchUserDetails();

    dispatch(setUserDetails(userData?.data));
  };

  const fetchCategory = async () => {
    setLoadingCategory(true)
    try {
      const response = await Axios({
        ...summaryApi.getCategory,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAllCategory(responseData.data));
      }
    } catch (error) {

    } finally {
      setLoadingCategory(false)
    }
  };

  const fetchSubCategory = async () => {
    try {
      const response = await Axios({
        ...summaryApi.getSubcategory,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAllSubCategory(responseData.data));
      }
    } catch (error) {
    } finally {
    }
  };

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...summaryApi.getProduct,
        data: {
          page: page,
          limit: 15,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setProduct(responseData.data));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategory();
    fetchSubCategory();
    fetchProducts();
  }, []);

  return (
    <main className="min-h-[75vh] flex flex-col items-center pt-4 px-4 lg:py-6 lg:px-0 bg-amber-50">
      <Home />
    </main>
  );
};

export default page;