'use client'
import BacktoHome from '@/Components/BacktoHome'
import ConfirmBox from '@/Components/ConfirmBox'
import Divider from '@/Components/Divider'
import EditSubCategory from '@/Components/EditSubCategory'
import MiniLoader from '@/Components/MiniLoader'
import NoData from '@/Components/NoData'
import ResponsiveWarning from '@/Components/ResponsiveWarning'
import RestrictUser from '@/Components/RestrictUser'
import UploadSubcategory from '@/Components/UploadSubcategory'
import ViewImage from '@/Components/ViewImage'
import useMobile from '@/hooks/useMobile'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'
import React, { useEffect, useState } from 'react'
import { FiEdit3 } from 'react-icons/fi'
import { MdDeleteForever } from 'react-icons/md'
import { TbCategoryPlus } from 'react-icons/tb'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const SubCategory = () => {
  const user = useSelector((state) => state.user)
  const [ isMobile ] = useMobile()

  const [openUploadSubCategory, setOpenUploadSubCategory] = useState(false)
  const [openEditSubCategory, setOpenEditSubCategory] = useState(false)
  const [editdata, setEditdata] = useState({
    _id : ""
  })
  const [deleteData, setDeleteData] = useState({
    _id : ""
  })
  const [openConfirmBox, setOpenConfirmBox] = useState(false)
  const [subCategoryData, setSubCategoryData] = useState([])
  const [openSubCatImg, setOpenSubCatImg] = useState("")
  const [loading, setLoading] = useState(false)

  // restrict normal users
  if(!isAdmin(user.role)){
    return <RestrictUser />
  }

  const fetchSubCategory = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...summaryApi.getSubcategory
      })
      const { data : responseData } = response

      if (responseData?.success) {
        setSubCategoryData(responseData.data)
      }
    } catch (error) {
      toast.error(error?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubCategory = async () => {
    try {
      const response = await Axios({
        ...summaryApi.deleteSubcategory,
        data : deleteData
      })

      const { data : responseData} = response

      if(responseData.success) {
        toast.success(responseData.message)
        fetchSubCategory()
        setOpenConfirmBox(false)
        setDeleteData({
          _id : ""
        })
      }
    } catch (error) {
      toast.error(error?.data?.data?.message)
    }
  }

  useEffect(() => {
    fetchSubCategory()
  }, [])

  return (
    <main className='px-2 lg:px-5'>
      {
        isMobile && <BacktoHome />
      }

      {
        isMobile && <ResponsiveWarning />
      }
      <h1 className='text-emerald-600 font-bold text-center my-2 lg:my-6 text-2xl'>Sub-Category</h1>

      <Divider />

      <div className='w-full my-5 flex flex-row-reverse'>
        <button onClick={() => setOpenUploadSubCategory(true)} className='mr-1 bg-emerald-700 hover:bg-emerald-600 text-neutral-200 text-sm font-medium rounded-sm px-5 py-1.5'>Add Sub-category <TbCategoryPlus size={18} className='text-neutral-200 inline font-bold'/></button>
      </div>

      {
        openUploadSubCategory && (
          <UploadSubcategory fetchData={() => fetchSubCategory()} close={() => setOpenUploadSubCategory(false)}/>
        )
      }

      <section className="relative bg-amber-400 rounded-lg w-full min-h-52 my-6 p-3 lg:p-5">
        {loading && <MiniLoader />}

        {!subCategoryData[0] && <NoData />}

        {
          subCategoryData[0] && <h1 className="text-2xl text-center font-bold text-amber-700 mb-6">Sub-Category List</h1>
        }

        <div className="relative w-full h-full bg-white/90 rounded-lg shadow-md overflow-hidden">        
          <div className="min-h-[450px] overflow-hidden">
            <table className="w-full rounded-lg border-collapse">
              {/* Table Head */}
              <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg z-10 shadow-md">
                <tr className="h-14">
                  <th className="px-5 py-3 border-b border-emerald-400 tracking-wide uppercase text-center rounded-tl-lg">Sr. no</th>
                  <th className="px-5 py-3 border-b border-emerald-400 tracking-wide uppercase">Sub-Category Name</th>
                  <th className="px-5 py-3 border-b border-emerald-400 tracking-wide uppercase">Image</th>
                  <th className="px-5 py-3 border-b border-emerald-400 tracking-wide uppercase">Category</th>
                  <th className="px-5 py-3 border-b border-emerald-400 tracking-wide uppercase rounded-tr-lg">Action</th>
                </tr>
              </thead>
              
              <tbody>
                {subCategoryData.map((subCategory, index) => (
                  <tr key={index} className="hover:bg-amber-200/50 transition duration-300 transform hover:scale-[1.02]">
                    <td className="px-5 py-3 border-b border-gray-300 text-center font-medium">{index + 1}</td>
                    <td className="px-5 py-3 border-b border-gray-300">{subCategory.name}</td>
                    <td className="px-5 py-3 border-b border-gray-300 flex justify-center">
                      <img 
                        src={subCategory.image} 
                        alt="Subcategory" 
                        width={50} 
                        height={50} 
                        className="rounded-lg object-cover shadow-md border border-gray-400 cursor-pointer"
                        onClick={() => setOpenSubCatImg(subCategory.image)}
                      />
                    </td>
                    <td className="px-5 py-3 border-b border-gray-300">
                      {
                        subCategory.category.map((cat, idx) => {
                          return (
                            <span 
                              key={idx} 
                              className="inline-block bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md mx-1 uppercase">
                              {cat.name}
                            </span>
                          )
                        })
                      }
                    </td>
                    <td className="px-5 py-3 border-b border-gray-300">
                      <div className=' flex justify-between items-center gap-3 w-full h-full'>
                        {/* edit button */}
                        <button 
                          className='flex-1 text-xs font-extrabold hover:text-emerald-700 bg-emerald-200 hover:bg-emerald-300 rounded-full p-1 text-neutral-500' 
                          onClick={() => {
                            setOpenEditSubCategory(true)
                            setEditdata(subCategory)
                          }}
                        >
                          <FiEdit3 size={13} className='inline text-emerald-700'/>
                        </button>

                        <button 
                          className='flex-1 text-xs font-extrabold hover:text-red-600 bg-red-200 hover:bg-red-300 rounded-full p-1 text-neutral-500'
                          onClick={() => {
                            setOpenConfirmBox(true)
                            setDeleteData(subCategory)
                          }}
                        >
                          <MdDeleteForever size={15} className='inline text-red-600'/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {
        openSubCatImg && <ViewImage url={openSubCatImg} close={() => setOpenSubCatImg("")}/>
      }

      {
        openEditSubCategory && <EditSubCategory editData={editdata} close={() => setOpenEditSubCategory(false)} fetchData={() => fetchSubCategory()}/>
      }

      {
        openConfirmBox && <ConfirmBox cancel={() => setOpenConfirmBox(false)} close={() => setOpenConfirmBox(false)} confirm={handleDeleteSubCategory}/>
      }
    </main>
  )
}

export default SubCategory