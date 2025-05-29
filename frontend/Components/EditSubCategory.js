'use client'
import SubCategory from '@/app/admin/sub-category/page';
import uploadImage from '@/public/utils/uploadImage';
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { IoCloseCircle, IoCloudUploadSharp } from 'react-icons/io5'
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RxCross2 } from "react-icons/rx";
import Axios from '@/public/utils/Axios';
import summaryApi from '@/public/common/summaryApi';

const EditSubcategory = ({editData, close, fetchData}) => {
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [data, setData] = useState({
      _id : editData._id,
      name: editData.name,
      image : editData.image,
      category : editData.category || []
  })

  const allCategory = useSelector(state => state.product.allCategory)

  const handleOnchange = (e) => {
    const { name, value } = e.target

    setData((prev) => {
        return {
            ...prev,
            [name] : value
        }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
        setLoading(true)
        const response = await Axios({
            ...summaryApi.updateSubcategory,
            data
        })

        const { data : responseData } = response

        if( responseData.success ) {
            toast.success(responseData.message)
            if(close){
                close()
                if(fetchData){
                    fetchData()
                }
            }
        }
    } catch (error) {
        toast.error(error?.data?.data?.message)
    } finally {
        setLoading(false)
    }
  }

  const handleUploadSubCategoryImage = async (e) => {
    const file = e.target.files[0]

    if(!file) {
        return
    }

    setLoadingImage(true)
    const response = await uploadImage(file)
    setLoadingImage(false)

    if(response.error){
        return toast.error(response?.message)
    }

    const { data : ImageResponse } = response

    if (!ImageResponse || !ImageResponse.data || !ImageResponse.data.url) {
        throw new Error("Image URL not found in response");
    }
    
    setData((prev) => {
        return {
            ...prev,
            image : ImageResponse.data.url
        }
    })
  }

  const handleRemoveSelectedCategory = (categoryId) => {
    const index = data.category.findIndex(el => el._id === categoryId)
    data.category.splice(index, 1)
    setData((prev) => {
        return {
            ...prev
        }
    })
  }

  const validValue = Object.values(data).every((el) => el);
    

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-300/60 w-full h-full z-40 flex flex-col items-center justify-center'>
        <div className='bg-neutral-50 w-full lg:w-128 flex flex-col items-center p-5 pb-8 rounded-lg gap-6'>
            <div className='flex items-center justify-between w-full'>
                <h1 className='text-lg lg:text-xl font-bold text-neutral-700'>Edit Sub-Category</h1>
                <button onClick={() => close()} className='text-neutral-700 font-bold block'>
                    <IoCloseCircle size={30} className='text-neutral-700 font-bold'/>
                </button>
            </div>

            <form className='my-3 grid gap-2.5 lg:my-5 w-full'>
                <div className='grid gap-1'>
                    <label id='' className='font-medium px-1 text-neutral-700'>Select Category</label>
                    <p className='text-xs text-neutral-400 px-2 font-medium'>You can also choose multiple categories</p>
                    <select className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                        onChange={(e) => {
                            const value = e.target.value
                            const categoryDetails = allCategory.find(el => el._id == value)

                            setData((prev) => {
                                return {
                                    ...prev,
                                    category : [...prev.category, categoryDetails]
                                }
                            })
                        }}
                    >
                        <option value={''}>Select Category</option>
                        {
                            allCategory.map((category, index) => {
                                return (
                                    <option className='font-medium' value={category?._id} key={index}>{category?.name}</option>
                                )
                            })
                        }
                    </select>

                    <div className='flex flex-wrap items-center gap-1 mt-1.5'>
                        {
                            data.category.map((cat, index) => {
                                return(
                                    <span key={index} className='bg-neutral-200 text-amber-600 font-medium w-fit px-4 py-0.5 rounded-full text-sm flex items-center justify-between gap-2'>
                                        {cat.name}
                                        <span
                                            className='cursor-pointer'
                                            onClick={() => handleRemoveSelectedCategory(cat._id)}
                                        >
                                            <RxCross2 size={16} className='font-bold text-neutral-600'/>
                                        </span>
                                    </span>
                                )
                            })
                        }
                    </div>
                </div>

                <div className='grid gap-1'>
                    <label id='sub-categoryName' className='font-medium px-1 text-neutral-700'>Sub-category name</label>
                    <input
                        className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                        autoFocus
                        id='sub-categoryName'
                        placeholder='Enter Sub-category Name'
                        name='name'
                        onChange={handleOnchange}
                        type='text'
                        value={data.name}
                    />
                </div>

                <div className='grid gap-1'>
                    <label className='font-medium px-1 text-neutral-700'>Sub-category Image</label>
                    <div className='flex justify-start items-center gap-10 w-full'>
                        <div className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600/50 text-base font-medium w-48 rounded h-36 flex flex-col items-center justify-center overflow-hidden'>
                            {
                                !data.image ? (
                                    <>
                                        <IoCloudUploadSharp size={70} className='text-amber-600/70'/>
                                        <p className='text-amber-600 font-medium text-center w-full'>No Image Found</p>
                                    </>
                                ):(
                                    <div className='m-auto'>
                                        <img
                                            src={data.image}
                                            height={30}
                                            width={30}
                                            className='h-36 w-36 rounded object-center object-scale-down mxx-auto'
                                            alt={data.image.name}
                                        />
                                    </div>
                                )
                            }
                        </div>

                        <label htmlFor='sub-categoryImage'>
                            <div className={`
                                ${
                                    !data.name ? "bg-neutral-200 cursor-not-allowed"
                                    : "bg-amber-500 hover:bg-amber-600 text-gray-500 cursor-pointer"
                                }
                                px-6 py-1.5 text-amber-50 font-medium rounded cursor-pointer`}>
                                {loadingImage ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> Uploading...
                                </>
                                ) : (
                                "Update Image"
                                )}
                            </div>
                        </label>    
                        
                        <input
                            disabled={!data.name}
                            className='hidden'
                            id='sub-categoryImage'
                            name='image'
                            onChange={handleUploadSubCategoryImage}
                            type='file'
                            accept='image/'
                        />
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleSubmit}
                        disabled={!validValue || loading}
                        className={`flex items-center justify-center w-full mx-auto rounded-full py-2 mt-3 lg:mt-5 text-gray-600 font-bold text-lg tracking-widest 
                        ${
                            validValue && !loading
                                ? "bg-amber-500 hover:bg-amber-600"
                                : "bg-neutral-200 cursor-not-allowed"
                        }`}
                    >
                        {loading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing...
                        </>
                        ) : (
                        "Edit Sub-Category"
                        )}
                    </button>
                </div>
            </form>
        </div>
    </section>
  )
}

export default EditSubcategory