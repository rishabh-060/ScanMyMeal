import React from 'react'

const CardLoading = () => {
  return (
        <div className="w-38 bg-white rounded-lg p-2.5 min-h-36 max-h-66 grid gap-1.5 hover:shadow-lg shrink-0 cursor-pointer animate-pulse transition-transform duration-150">
            <div className="bg-amber-100 rounded min-h-20"></div>
            <div className="bg-amber-100 rounded min-h-8"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-100 rounded h-8"></div>
                <div className="bg-amber-100 rounded h-8"></div>
            </div>
        </div>
  )
}

export default CardLoading