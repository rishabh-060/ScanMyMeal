'use client'
import AddToCartButton from '@/Components/AddToCartButton'
import Divider from '@/Components/Divider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { DiscountedPrice } from '@/public/utils/DiscountedPrice'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const page = () => {
  const params = useParams()
  const productId = params?.product_id.split('-')?.slice(-1)

  const [data, setData] = useState({
    name: '',
    image: [],
    unit: '',
    stock: 0,
    price: null,
    discount: null,
    description: '',
    more_details: {},
  })
  const [image, setImage] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchProductDetails = async () => {
    setLoading(true)
    try {
      const response = await Axios({
        ...summaryApi.getProductDetails,
        data: {
          productId,
        },
      })

      const { data: responseData } = response
      if (responseData.success) {
        setData(responseData.data)
      }
    } catch (error) {
      toast.error(error?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductDetails()
  }, [params])

  return (
    <section className="container w-full min-h-[65vh] lg:min-h-[68vh] py-5 mx-auto px-4">
      <div className="grid w-full h-full lg:grid-cols-3 gap-6">
        {/* Image Section */}
        <div className="col-span-2">
          <div className="rounded bg-white min-h-56 lg:min-h-[70vh] lg:max-h-[70vh] max-h-56 w-full h-full py-2 overflow-hidden group">
            <img
              src={data.image[image]}
              className="w-full h-full object-contain rounded transition-transform duration-500 ease-in-out group-hover:scale-105"
              alt={data.name}
            />
          </div>

          <div className="flex items-center justify-center gap-3 w-full bg-white h-fit p-3 rounded mt-2">
            {data.image.map((img, index) => (
              <button
                key={index + 'dot'}
                onClick={() => setImage(index)}
                className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
                  index === image
                    ? 'bg-amber-500 border-amber-600 scale-110'
                    : 'bg-amber-100 border-gray-300'
                }`}
              ></button>
            ))}
          </div>

          <div className="flex items-center justify-start gap-3 w-full h-fit p-3 rounded overflow-x-auto">
            {data.image.map((img, index) => (
              <div
                key={index + 'thumb'}
                onClick={() => setImage(index)}
                className="h-20 w-20 rounded-lg overflow-hidden shadow-md cursor-pointer border-2 hover:border-amber-400 transition-all duration-300 hover:scale-105"
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-4 lg:p-6 bg-white rounded h-fit w-full lg:shadow-sm">
          <p className="bg-green-300 w-fit px-3.5 text-xs text-emerald-900 py-1 font-medium rounded-full">
            15 min
          </p>
          <h2 className="text-lg font-medium md:text-xl lg:text-2xl lg:font-semibold text-amber-700 mt-2">
            {data.name}
          </h2>
          <p className="text-sm lg:text-base font-medium text-neutral-700">{data.unit}</p>

          <Divider />

          <div className="flex flex-wrap items-center gap-4 py-2">
            <p className="text-base lg:text-lg text-amber-900 font-semibold">Price:</p>

            <div className="bg-amber-200 px-5 py-1 rounded-full">
              <p className="text-base lg:text-lg text-amber-900 font-bold">
                ₹{DiscountedPrice(data.price, data.discount)}
              </p>
            </div>

            {data.discount > 0 && (
              <>
                <h2 className="text-sm lg:text-base text-neutral-500 font-medium line-through">
                  ₹{data.price}
                </h2>
                <span className="text-xs lg:text-sm text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full">
                  -{data.discount}%
                </span>
              </>
            )}
          </div>

            {/* // <button className="px-6 py-2 bg-amber-500 w-full text-white rounded-lg hover:bg-amber-700 hover:scale-105 transition-all">
            //   Add to Cart
            // </button> */}

          <div className="py-4">
            {data?.stock !== 0 ? (
              <AddToCartButton data={data}/>
            ) : (
              <p className="text-sm lg:text-base font-semibold text-red-600">Out of Stock</p>
            )}
          </div>

            {/* description */}
          <div className="my-2 lg:my-4">
            <p className="font-medium text-amber-800 text-sm lg:text-base my-2">Description</p>
            <p className="font-medium text-xs lg:text-sm text-neutral-600 ">{data.description}</p>
          </div>


          <h2 className="font-medium text-amber-800 text-sm lg:text-base my-3">Why order with us?</h2>
          <div className="grid gap-4">
            {[
              {
                img: 'https://c7.alamy.com/comp/HNPDH1/booking-ticket-online-reservation-icon-HNPDH1.jpg',
                title: 'Hassle-free Booking',
                desc: 'Don\'t wait in queue! Place your order earliest.',
              },
              {
                img: 'https://as1.ftcdn.net/v2/jpg/10/56/63/04/1000_F_1056630441_rFUQeTju3EfpVDS9bfn8f1he5cHsrCDi.jpg',
                title: 'Save Your Time',
                desc: 'Reduce time by placing order effortlessly.',
              },
              {
                img: 'https://static.vecteezy.com/system/resources/previews/014/435/767/non_2x/best-deal-badge-icon-best-deal-banners-badge-sticker-sign-tag-best-offer-modern-style-illustration-vector.jpg',
                title: 'Get best deals.',
                desc: 'Stay updated with current running offers.',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-4 hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={benefit.img}
                  alt={benefit.title}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-sm lg:text-base text-neutral-800">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 px-2">
        <h2 className="text-lg font-semibold text-amber-700 mb-4">More Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.more_details &&
            Object.entries(data.more_details).map(([key, value], index) => (
              <div
                key={index + 'more-detail'}
                className="bg-white border border-amber-200 rounded-xl shadow-sm p-4 hover:shadow-md transition duration-300"
              >
                <p className="text-base md:text-lg font-semibold text-amber-800 mb-1">{key}</p>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{value}</p>
              </div>
            ))}
        </div>
      </div>

    </section>
  )
}

export default page
