'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { setTableId } from '@/public/store/addressSlice'
import { Card } from '@/Components/ui'

const ResolveTablePage = () => {
  const { tableId } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const [error, setError] = useState('')

  useEffect(() => {
    Axios(summaryApi.resolveTable(tableId))
      .then((response) => {
        dispatch(setTableId(response.data.data.publicId))
        sessionStorage.setItem('tableContext', JSON.stringify(response.data.data))
        router.replace(`/?tableId=${encodeURIComponent(response.data.data.publicId)}`)
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'This table link is invalid.'))
  }, [dispatch, router, tableId])

  return (
    <main className="grid min-h-[65vh] place-items-center p-4">
      <Card className="max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-700">Scan My Meal</h1>
        <p className={`mt-3 ${error ? 'text-red-700' : 'text-neutral-600'}`}>{error || 'Validating your table and opening the menu...'}</p>
      </Card>
    </main>
  )
}

export default ResolveTablePage
