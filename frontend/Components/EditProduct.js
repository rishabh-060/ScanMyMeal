'use client'
import AddMoreDetails from '@/Components/AddMoreDetails'
import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import MiniLoader from '@/Components/MiniLoader'
import ResponsiveWarning from '@/Components/ResponsiveWarning'
import RestrictUser from '@/Components/RestrictUser'
import ViewImage from '@/Components/ViewImage'
import useMobile from '@/hooks/useMobile'
import summaryApi from '@/public/common/summaryApi'
import AlertMessage from '@/public/utils/AlertMessage'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'
import uploadImage from '@/public/utils/uploadImage'
import { UploadCloudIcon } from 'lucide-react'
import React, { useState } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoCloseCircle } from 'react-icons/io5'

const EditProduct = ({ close, prData, fetchProducts }) => {
    const user = useSelector((state) => state.user)
    const [isMobile] = useMobile()
  
    const allCategory = useSelector(state => state.product.allCategory)
    const allSubCategory = useSelector(state => state.product.allSubCategory)
  
    const [loading, setLoading] = useState(false)
    const [loadingImage, setLoadingImage] = useState(false)
    const [data, setData] = useState({
      _id : prData._id,
      name : prData.name,
      image : prData.image || [],
      category : prData.category || [],
      subCategory : prData.subCategory || [],
      unit : prData.unit,
      stock : prData.stock,
      price : prData.price,
      discount : prData.discount,
      description : prData.description,
      more_details : prData.more_details || {},
    })
  
    const handleOnchange = (e) => {
      setData({ ...data, [e.target.name]: e.target.value })
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
  
    const handleRemoveSelectedSubCategory = (subCategoryId) => {
      const index = data.subCategory.findIndex(el => el._id === subCategoryId)
      data.subCategory.splice(index, 1)
      setData((prev) => {
        return {
          ...prev
        }
      })
    }
  
    const handleUploadImage = async (e) => {
      const file = e.target.files[0]
  
      if(!file) {
          return
      }
  
      setLoadingImage(true)
      const response = await uploadImage(file)
      if(response.error){
        return toast.error(response?.message)
      }
      
      const { data : ImageResponse } = response
      const imageUrl = ImageResponse?.data?.url
      
      setData((prev) => {
        return {
          ...prev,
          image: [...prev.image, imageUrl]
        }
      })
      setLoadingImage(false)
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const { name, image, category, subCategory, unit, stock, price, discount, description } = data;
      
      if ([name, image, category, subCategory, unit, stock, price, discount, description].some(value => value === undefined || value === null || value === "")) {
          toast.error("Please fill all fields.");
          return;
      }
  
      try {
          setLoading(true);
          
          const response = await Axios({
              ...summaryApi.updateProduct,
              data: data
          });
  
          const { data: responseData } = response;
  
          if (responseData.success) {
            AlertMessage('Successfully', 'Product Updated Successfully')
            
            close()
            fetchProducts()
            
            setData({name : "",
              image : [],
              category : [],
              subCategory : [],
              unit : "",
              stock : "",
              price : "",
              discount : "",
              description : "",
              more_details : {}
            })
          }
      } catch (error) {
          toast.error(error?.response?.data?.message || "Something went wrong!");
      } finally {
          setLoading(false);
      }
    };
  
  
    const handleRemoveImage = (img) => {
      const index = data.image.findIndex(el => el === img)
      data.image.splice(index, 1)
      setData((prev) => {
        return {
          ...prev
        }
      })
    }
  
    const [viewImage, setViewImage] = useState('')
    
    const [openAddMore, setOpenAddMore] = useState(false)
    const [feildName, setFeildName] = useState('')
  
    const handleAddFeild = () => {
      setData((prev) => {
        return {
          ...prev,
          more_details : {
            ...prev.more_details,
            [feildName] : ''
          }
        }
      })
      setFeildName('')
      setOpenAddMore(false)
    }
  
    const validValue = true
  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 pt-18 bg-neutral-300/80 w-full h-full z-40 flex flex-col items-center justify-center'>
        <div className='bg-neutral-50 w-full lg:w-172 flex flex-col items-center p-5 py-8 rounded-lg gap-6 overflow-y-auto h-full max-h-[90vh]'>
            <div className='flex items-center justify-between w-full'>
                <h1 className='text-lg lg:text-xl font-bold text-neutral-700'>Edit Menu-Item</h1>
                <button onClick={() => close()} className='text-neutral-700 font-bold block'>
                    <IoCloseCircle size={30} className='text-neutral-700 font-bold'/>
                </button>
            </div>

            <div className="relative w-full h-full bg-white/80 rounded-lg shadow-md overflow-y-auto no-scrollbar">
                <div className="min-h-[450px] overflow-hidden">
                    <form className='my-3 grid gap-2.5 lg:my-5 w-full px-8 lg:px-12' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label id='name' className='font-medium px-1 text-neutral-700'>Item name</label>
                        <input
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                            autoFocus
                            id='name'
                            placeholder='Enter Item Name'
                            name='name'
                            onChange={handleOnchange}
                            type='text'
                            value={data.name}
                        />
                    </div>

                    <div className='grid gap-1'>
                        <label id='description' className='font-medium px-1 text-neutral-700'>Item description</label>
                        <textarea
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded resize-none'
                            id='description'
                            rows={3}
                            placeholder='Enter Item Description'
                            name='description'
                            onChange={handleOnchange}
                            type='text'
                            value={data.description}
                        />
                    </div>

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
                        <option value={''} disabled>Select Category</option>
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
                        <label id='' className='font-medium px-1 text-neutral-700'>Select Sub-Category</label>
                        <p className='text-xs text-neutral-400 px-2 font-medium'>You can also choose multiple sub-categories</p>
                        <select className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                        onChange={(e) => {
                            const value = e.target.value
                            const subCategoryDetails = allSubCategory.find(el => el._id == value)

                            setData((prev) => {
                            return {
                                ...prev,
                                subCategory : [...prev.subCategory, subCategoryDetails]
                            }
                            })
                        }}
                        >
                        <option value={''} disabled>Select Sub-Category</option>
                        {
                            allSubCategory.map((subCategory, index) => {
                            return (
                                <option className='font-medium' value={subCategory?._id} key={index}>{subCategory?.name}</option>
                            )
                            })
                        }
                        </select>

                        <div className='flex flex-wrap items-center gap-1 mt-1.5'>
                        {
                            data.subCategory.map((subCat, index) => {
                            return(
                                <span key={index} className='bg-neutral-200 text-amber-600 font-medium w-fit px-4 py-0.5 rounded-full text-sm flex items-center justify-between gap-2'>
                                {subCat.name}
                                <span
                                    className='cursor-pointer'
                                    onClick={() => handleRemoveSelectedSubCategory(subCat._id)}
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
                        <label id='unit' className='font-medium px-1 text-neutral-700'>Unit</label>
                        <input
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                            id='unit'
                            placeholder='Enter Unit'
                            name='unit'
                            onChange={handleOnchange}
                            type='text'
                            value={data.unit}
                        />
                    </div>

                    <div className='grid gap-1'>
                        <label id='stock' className='font-medium px-1 text-neutral-700'>Stock</label>
                        <input
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                            id='stock'
                            placeholder='Enter Stock'
                            name='stock'
                            onChange={handleOnchange}
                            type='text'
                            value={data.stock}
                        />
                    </div>

                    <div className='grid gap-1'>
                        <label id='price' className='font-medium px-1 text-neutral-700'>Price</label>
                        <input
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                            id='price'
                            placeholder='Enter Price'
                            name='price'
                            onChange={handleOnchange}
                            type='text'
                            value={data.price}
                        />
                    </div>

                    <div className='grid gap-1'>
                        <label id='discount' className='font-medium px-1 text-neutral-700'>Discount</label>
                        <input
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                            id='discount'
                            placeholder='Enter Discount'
                            name='discount'
                            onChange={handleOnchange}
                            type='text'
                            value={data.discount}
                        /> 
                    </div>

                    <div className='grid gap-1'>
                        <p className='font-medium px-1 text-neutral-700'>Upload Image <UploadCloudIcon className='inline'/></p>
                        <div className='flex items-center gap-2'>
                        <label htmlFor='image' className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded '>Upload Image</label>
                        <input
                            className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded hidden'
                            id='image'
                            placeholder='Upload Image'
                            name='image'
                            onChange={handleUploadImage}
                            type='file'
                        />
                        {
                            loadingImage && <MiniLoader size={20} />
                        }
                        </div>

                        <div className='flex flex-wrap items-center gap-1 mt-1.5 w-full'>
                        {
                            data.image.map((img, idx) => {
                            return(
                                <div
                                    key={idx}
                                    className='relative w-20 h-20 rounded overflow-hidden cursor-pointer bg-neutral-200'
                                >
                                    <img
                                    src={img}
                                    alt={img}
                                    className='w-full h-full object-scale-down rounded-lg overflow-hidden'
                                    onClick={() => setViewImage(img)}
                                    />
                                    <div className='absolute top-0 right-1 inline text-neutral-800 p-1 rounded-full bg-amber-200 hover:text-neutral-500 font-bold hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer'
                                    onClick={() => handleRemoveImage(img)}
                                    >
                                    <RxCross2 size={14}/>
                                    </div>
                                </div>
                            )
                            })
                        }
                        </div>
                    </div>

                    {/* add more field */}
                    <div>
                        {
                        Object?.keys(data?.more_details)?.map((key, index) => {
                            return (
                            <div key={index} className='grid gap-1'>
                                <label id={key} className='font-medium px-1 text-neutral-700'>{key}</label>
                                <input
                                className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                                id={key}
                                placeholder={`Enter ${key}`}
                                name={key}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setData((prev) => {
                                    return {
                                        ...prev,
                                        more_details : {
                                        ...prev.more_details,
                                        [key] : value
                                        }
                                    }
                                    })

                                }}
                                type='text'
                                value={data.more_details[key]}
                                />
                            </div>
                            )
                        })
                        }
                    </div>

                    <div className='grid gap-1'>
                        <button id='more_details'
                        className='font-medium px-6 py-1.5 rounded text-neutral-700 bg-amber-50 border-amber-600 border-2 hover:bg-amber-600 hover:text-amber-100 w-fit'
                        onClick={(e) => {
                            e.preventDefault()
                            setOpenAddMore(true)
                        }}
                        >Add More Details</button>
                    </div>

                    <div className='grid gap-1'>
                        <button id='submit'
                        className={`
                            ${validValue ? "bg-amber-500 hover:bg-amber-600 text-gray-50 cursor-pointer" : "bg-neutral-200 cursor-not-allowed"}
                            px-6 py-1.5 text-amber-50 rounded font-medium`}
                        >Update Item</button>
                    </div>
                    </form>
                </div>
            </div>
            {
            viewImage && <ViewImage url={viewImage} close={() => setViewImage('')}/>
            }
            {
            openAddMore && <AddMoreDetails value={feildName} onChange={(e) => setFeildName(e.target.value)} handleSubmit={() => handleAddFeild()} close={() => setOpenAddMore(false)} />
            }
        </div>
    </section>
  )
}

export default EditProduct
