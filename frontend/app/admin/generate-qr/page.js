'use client'

import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import useMobile from '@/hooks/useMobile'
import isAdmin from '@/public/utils/isAdmin'
import RestrictUser from '@/Components/RestrictUser'
import MiniLoader from '@/Components/MiniLoader'
import NoData from '@/Components/NoData'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ScanQrCode } from "lucide-react"
import QRGeneratorPopup from '@/Components/QRGeneratorPopup'

const QRGenerator = () => {

    const user = useSelector(state => state.user)
    if(!isAdmin(user.role)){
        return <RestrictUser />
    }

    const [openGenerator, setOpenGenerator] = useState(false)
    const [isMobile] = useMobile()
    const [qrList, setQrList] = useState([]) 
    const [loading, setLoading] = useState(false)

    return (
      <main className="px-2 lg:px-5">
        {isMobile && <BacktoHome />}

        <h1 className="text-emerald-600 font-bold text-center my-2 lg:my-6 text-2xl">
          Generate Table QR Codes
        </h1>

        <Divider />

        <div className="w-full my-5 flex flex-row-reverse">
          <button 
            onClick={() => setOpenGenerator(true)} 
            className="mr-1 bg-emerald-700 hover:bg-emerald-600 text-neutral-200 text-sm font-medium rounded-sm px-5 py-1.5"
          >
            Generate QR <ScanQrCode size={18} className="inline ml-1"/>
          </button>
        </div>

        {openGenerator && (
            <QRGeneratorPopup 
              close={() => setOpenGenerator(false)} 
              setQrList={setQrList} 
            />
        )}

        <section className="relative bg-amber-400 rounded-lg w-full min-h-52 my-6 p-3 lg:p-5">
        
          {loading && <MiniLoader />}

          {!qrList.length && <NoData />}

          {qrList.length > 0 && (
            <h1 className="text-2xl text-center font-bold text-amber-700 mb-6">
              Generated QR Codes
            </h1>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-4">

            {qrList.map((qr, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 border border-amber-200 flex flex-col items-center"
              >

                {/* Header */}
                <p className="text-base font-extrabold tracking-widest text-amber-700 mb-2">
                  Scan My Meal
                </p>

                {/* QR Image */}
                <div className="w-full bg-amber-50 rounded-lg p-3 flex items-center justify-center shadow-inner">
                  <img 
                    src={qr.image}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Table Tag */}
                <h2 className="mt-3 text-center">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
                    TABLE {qr.tableId}
                  </span>
                </h2>

                {/* Footer Actions (optional – enable if you want later) */}
                <div className="flex gap-2 mt-3">
                  <button className="bg-amber-500 px-2 py-1 rounded text-white text-xs">Download</button>
                  <button className="bg-red-500 px-2 py-1 rounded text-white text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>


        </section>
      </main>
    )
}

export default QRGenerator
