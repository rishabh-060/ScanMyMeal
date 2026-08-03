'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AddMoreDetails from './AddMoreDetails'
import ViewImage from './ViewImage'
import { Button, Modal } from './ui'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import uploadImage from '@/public/utils/uploadImage'

const fieldClass = 'min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-orange-100'

const normalizeItems = (items = [], choices = []) => items.filter(Boolean).map((item) => {
  if (typeof item !== 'string') return item
  return choices.find((choice) => choice._id === item) || { _id: item, name: 'Selected item' }
})

const SelectionChips = memo(({ items, onRemove }) => (
  <div className="mt-2 flex min-h-7 flex-wrap items-center gap-1.5">
    {items.map((item) => (
      <span key={item._id} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
        {item.name}
        <button type="button" onClick={() => onRemove(item._id)} aria-label={`Remove ${item.name}`} className="grid h-5 w-5 place-items-center rounded-full text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-error)]">
          <X size={13} />
        </button>
      </span>
    ))}
  </div>
))
SelectionChips.displayName = 'SelectionChips'

const ImageGallery = memo(({ images, onPreview, onRemove }) => (
  <div className="mt-3 flex min-h-20 flex-wrap items-center gap-2">
    {images.map((image) => (
      <div key={image} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]">
        <button type="button" onClick={() => onPreview(image)} className="h-full w-full" aria-label="Preview product image">
          <img src={image} alt="" className="h-full w-full object-cover" />
        </button>
        <button type="button" onClick={() => onRemove(image)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-[var(--color-error)] shadow" aria-label="Remove product image">
          <X size={13} />
        </button>
      </div>
    ))}
  </div>
))
ImageGallery.displayName = 'ImageGallery'

const EditProduct = ({ close, prData, fetchProducts }) => {
  const allCategory = useSelector((state) => state.product.allCategory)
  const allSubCategory = useSelector((state) => state.product.allSubCategory)
  const [data, setData] = useState(() => ({
    _id: prData._id,
    name: prData.name || '',
    image: prData.image || [],
    category: normalizeItems(prData.category, allCategory),
    subCategory: normalizeItems(prData.subCategory, allSubCategory),
    unit: prData.unit || '',
    stock: prData.stock ?? '',
    price: prData.price ?? '',
    discount: prData.discount ?? 0,
    description: prData.description || '',
    more_details: prData.more_details || {},
  }))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [viewImage, setViewImage] = useState('')
  const [openAddMore, setOpenAddMore] = useState(false)
  const [fieldName, setFieldName] = useState('')

  const selectedCategoryIds = useMemo(() => new Set(data.category.map((item) => item._id)), [data.category])
  const selectedSubCategoryIds = useMemo(() => new Set(data.subCategory.map((item) => item._id)), [data.subCategory])

  const updateField = useCallback((event) => {
    const { name, value } = event.target
    setData((current) => ({ ...current, [name]: value }))
  }, [])

  const removeCategory = useCallback((id) => {
    setData((current) => ({ ...current, category: current.category.filter((item) => item._id !== id) }))
  }, [])

  const removeSubCategory = useCallback((id) => {
    setData((current) => ({ ...current, subCategory: current.subCategory.filter((item) => item._id !== id) }))
  }, [])

  const addCategory = useCallback((event) => {
    const category = allCategory.find((item) => item._id === event.target.value)
    if (!category) return
    setData((current) => current.category.some((item) => item._id === category._id)
      ? current
      : { ...current, category: [...current.category, category] })
    event.target.value = ''
  }, [allCategory])

  const addSubCategory = useCallback((event) => {
    const subCategory = allSubCategory.find((item) => item._id === event.target.value)
    if (!subCategory) return
    setData((current) => current.subCategory.some((item) => item._id === subCategory._id)
      ? current
      : { ...current, subCategory: [...current.subCategory, subCategory] })
    event.target.value = ''
  }, [allSubCategory])

  const removeImage = useCallback((image) => {
    setData((current) => ({ ...current, image: current.image.filter((item) => item !== image) }))
  }, [])

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const response = await uploadImage(file)
      if (!response?.data?.success) throw new Error(response?.response?.data?.message || response?.message || 'Image upload failed')
      const imageUrl = response.data.data?.url
      if (!imageUrl) throw new Error('Image upload did not return a URL')
      setData((current) => ({ ...current, image: [...current.image, imageUrl] }))
    } catch (error) {
      toast.error(error.message || 'Unable to upload image')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const addDetailField = () => {
    const key = fieldName.trim()
    if (!key) return toast.error('Enter a field name')
    setData((current) => ({ ...current, more_details: { ...current.more_details, [key]: current.more_details[key] || '' } }))
    setFieldName('')
    setOpenAddMore(false)
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!data.name.trim() || !data.description.trim() || !data.unit.trim() || !data.image.length || !data.category.length || !data.subCategory.length) {
      return toast.error('Complete all required fields')
    }
    setSaving(true)
    try {
      const payload = {
        ...data,
        stock: Number(data.stock),
        price: Number(data.price),
        discount: Number(data.discount),
        category: data.category.map((item) => item._id),
        subCategory: data.subCategory.map((item) => item._id),
      }
      const response = await Axios({ ...summaryApi.updateProduct, data: payload })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to update item')
      toast.success('Menu item updated')
      close()
      await fetchProducts?.()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to update item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal title="Edit menu item" onClose={close}>
        <form onSubmit={submit} className="grid gap-5" data-testid="edit-product-form">
          <label className="grid gap-2 text-sm font-bold">Item name<input autoFocus name="name" value={data.name} onChange={updateField} className={fieldClass} /></label>
          <label className="grid gap-2 text-sm font-bold">Item description<textarea name="description" rows={3} value={data.description} onChange={updateField} className={`${fieldClass} min-h-24 resize-y py-3`} /></label>

          <div className="grid gap-2 text-sm font-bold">
            <label htmlFor="edit-category">Select category</label>
            <select id="edit-category" defaultValue="" onChange={addCategory} className={fieldClass}>
              <option value="" disabled>Add a category</option>
              {allCategory.map((category) => <option key={category._id} value={category._id} disabled={selectedCategoryIds.has(category._id)}>{category.name}</option>)}
            </select>
            <SelectionChips items={data.category} onRemove={removeCategory} />
          </div>

          <div className="grid gap-2 text-sm font-bold">
            <label htmlFor="edit-subcategory">Select sub-category</label>
            <select id="edit-subcategory" defaultValue="" onChange={addSubCategory} className={fieldClass}>
              <option value="" disabled>Add a sub-category</option>
              {allSubCategory.map((subCategory) => <option key={subCategory._id} value={subCategory._id} disabled={selectedSubCategoryIds.has(subCategory._id)}>{subCategory.name}</option>)}
            </select>
            <SelectionChips items={data.subCategory} onRemove={removeSubCategory} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">Unit<input name="unit" value={data.unit} onChange={updateField} className={fieldClass} /></label>
            <label className="grid gap-2 text-sm font-bold">Stock<input name="stock" type="number" min="0" value={data.stock} onChange={updateField} className={fieldClass} /></label>
            <label className="grid gap-2 text-sm font-bold">Price<input name="price" type="number" min="0" step="0.01" value={data.price} onChange={updateField} className={fieldClass} /></label>
            <label className="grid gap-2 text-sm font-bold">Discount (%)<input name="discount" type="number" min="0" max="100" value={data.discount} onChange={updateField} className={fieldClass} /></label>
          </div>

          <div>
            <p className="text-sm font-bold">Product images</p>
            <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-bold hover:border-[var(--color-primary)]">
              <ImagePlus size={17} /> {uploading ? 'Uploading…' : 'Add image'}
              <input type="file" accept="image/*" onChange={upload} disabled={uploading} className="hidden" />
            </label>
            <ImageGallery images={data.image} onPreview={setViewImage} onRemove={removeImage} />
          </div>

          {Object.keys(data.more_details).length > 0 && (
            <div className="grid gap-3 rounded-2xl bg-[var(--color-surface-soft)]/55 p-4">
              <p className="text-sm font-black">Additional details</p>
              {Object.keys(data.more_details).map((key) => (
                <label key={key} className="grid gap-2 text-sm font-bold">{key}<input value={data.more_details[key]} onChange={(event) => setData((current) => ({ ...current, more_details: { ...current.more_details, [key]: event.target.value } }))} className={fieldClass} /></label>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] pt-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setOpenAddMore(true)}>Add detail field</Button>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" loading={saving} disabled={uploading}>Save changes</Button></div>
          </div>
        </form>
      </Modal>
      {viewImage && <ViewImage url={viewImage} close={() => setViewImage('')} />}
      {openAddMore && <AddMoreDetails value={fieldName} onChange={(event) => setFieldName(event.target.value)} handleSubmit={addDetailField} close={() => setOpenAddMore(false)} />}
    </>
  )
}

export default memo(EditProduct)
