'use client'
import React, { useState } from 'react'
import { IoCloseCircle } from "react-icons/io5"
import { Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import QRCodeDisplay from 'react-qr-code'
import { toast } from 'react-toastify'

const QRGeneratorPopup = ({ close, setQrList }) => {

    const [tableId, setTableId] = useState("")
    const [qrImage, setQrImage] = useState("")
    const [qrData, setQrData] = useState("")
    const [loadingQR, setLoadingQR] = useState(false)

    const generateQR = async () => {
        if (!tableId.trim()) {
            return toast.error("Table ID required")
        }

        setLoadingQR(true)

        const qrValue = `scan-my-meal/Table-${tableId}`
        setQrData(qrValue)

        try {
            const qr = await QRCode.toDataURL(qrValue, {
                margin: 1,
                width: 400
            })
            setQrImage(qr)
        } catch (err) {
            toast.error("Failed to generate QR")
        }

        setLoadingQR(false)
    }

    const handleSave = () => {
        if (!qrImage) {
            return toast.error("Generate QR first")
        }

        setQrList(prev => [...prev, { tableId, image: qrImage }])
        close()
    }

    const downloadQR = () => {
        const a = document.createElement('a')
        a.href = qrImage
        a.download = `Table-${tableId}.png`
        a.click()
    }

    const validValue = tableId.trim().length > 0 && qrImage

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-300/60 w-full h-full flex flex-col z-40 items-center justify-center'>
            <div className='bg-neutral-50 w-full lg:w-128 flex flex-col items-center p-5 pb-8 rounded-xl shadow-xl gap-6 border border-neutral-200'>

                {/* HEADER */}
                <div className='flex items-center justify-between w-full'>
                    <h1 className='text-lg lg:text-xl font-bold text-neutral-700'>
                        Generate Table QR Code
                    </h1>

                    <button onClick={close} className='text-neutral-700 font-bold block'>
                        <IoCloseCircle size={34} className='text-neutral-700 hover:text-red-500 transition' />
                    </button>
                </div>

                {/* QR PREVIEW BOX */}
                {qrImage && (
                    <div className="w-48 h-48 bg-white rounded-xl shadow-md border border-neutral-300 flex items-center justify-center p-3">
                        <QRCodeDisplay value={qrData} size={160} />
                    </div>
                )}

                {/* FORM */}
                <form className='my-3 grid gap-2.5 lg:my-5 w-full'>

                    {/* Table Input */}
                    <div className='grid gap-1'>
                        <label className='font-medium px-1 text-neutral-700'>Table ID</label>

                        <input
                            className='bg-neutral-200 outline-none px-3 py-2 text-amber-700 text-base font-medium w-full rounded-lg'
                            placeholder='Enter Table Number'
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                            type='number'
                        />
                    </div>

                    {/* Generate QR Button */}
                    <div className='grid gap-1'>
                        <button
                            type="button"
                            onClick={generateQR}
                            className={`flex items-center justify-center w-full mx-auto rounded-full py-2 mt-3 lg:mt-5 text-gray-50 font-bold text-lg tracking-widest transition
                                ${tableId.trim()
                                    ? "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                                    : "bg-neutral-300 cursor-not-allowed"
                                }
                            `}
                            disabled={!tableId.trim()}
                        >
                            {loadingQR ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> Generating...
                                </>
                            ) : (
                                "Generate QR"
                            )}
                        </button>
                    </div>

                    {/* Save + Download Buttons */}
                    {qrImage && (
                        <div className='flex flex-col gap-3 mt-4'>

                            {/* Download */}
                            <button
                                type="button"
                                onClick={downloadQR}
                                className='w-full mx-auto rounded-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-widest transition'
                            >
                                Download QR
                            </button>

                            {/* Save */}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!validValue}
                                className={`w-full mx-auto rounded-full py-2 font-bold text-lg tracking-widest transition
                                    ${validValue
                                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                                        : "bg-neutral-300 cursor-not-allowed text-gray-600"}
                                `}
                            >
                                Save QR
                            </button>
                        </div>
                    )}

                </form>
            </div>
        </section>
    )
}

export default QRGeneratorPopup
