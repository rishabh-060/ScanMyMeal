const productModel = require('../models/productModel')
const cache = require('../services/cacheService')

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isMissingTextIndexError = (error) => (
    error?.code === 27 || /text index required/i.test(error?.message || '')
)

const queryProducts = async ({ baseQuery = {}, search = '', sort = { createdAt: -1 }, skip, limit }) => {
    const run = (query) => Promise.all([
        productModel.find(query).sort(sort).skip(skip).limit(limit).populate('category subCategory'),
        productModel.countDocuments(query)
    ])

    if (!search) return run(baseQuery)

    try {
        return await run({ ...baseQuery, $text: { $search: search } })
    } catch (error) {
        if (!isMissingTextIndexError(error)) throw error

        const pattern = escapeRegex(search)
        return run({
            ...baseQuery,
            $or: [
                { name: { $regex: pattern, $options: 'i' } },
                { description: { $regex: pattern, $options: 'i' } }
            ]
        })
    }
}

const createProductController = async (req, res) => {
    try {
        const { name, description, image, category, SubCategory, unit, stock, price, discount, more_details } = req.body

        if( !name || !description || !Array.isArray(image) || !image[0] || !Array.isArray(category) || !category[0] || !Array.isArray(SubCategory) || !SubCategory[0] || !unit || Number(stock) < 0 || Number(price) < 0 || Number(discount) < 0 || Number(discount) > 100 ) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "All Fields Required"
            })
        }

        let subCategory = SubCategory

        const product = new productModel({
            name, description, image, category, subCategory, unit, stock, price, discount, more_details,
            isAvailable: Number(stock) > 0
        })

        const saveProduct = await product.save()
        await cache.removeByPattern('menu:*')

        return res.status(200).json({
            success : true,
            error : false,
            message : "Product Added Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error.message || error
        })
    }
}

const getAllProductsController = async (req, res) => {
    try {
        let { page, limit, search } = req.body

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 25
        }
        page = Math.max(1, Number.parseInt(page, 10) || 1)
        limit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 25))

        const skip = (limit * (page - 1))
        search = String(search || '').trim()
        const [data, totalCount] = await queryProducts({ search, skip, limit })

        if(!data || data.length === 0) {
            return res.status(200).json({
                success : true,
                error : false,
                message : "No Product Found",
                data : []
            })
        }

        return res.status(200).json({
            success : true,
            error : false,
            totalCount : totalCount,
            totalNoPage : Math.ceil(totalCount / limit),
            data : data
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error?.message || error
        })
    }
}

const getProductByCategoryController = async (req, res) => {
    try {
        const { id } = req.body

        if(!id) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "Category Id Required"
            })
        }

        const cacheKey = `menu:default:category:${id}`
        const cached = await cache.getJson(cacheKey)
        if (cached) return res.status(200).json({ success: true, error: false, data: cached, cached: true })
        const product = await productModel.find({
            category : { $in : id },
            publish: true
        }).limit(15).lean()

        if(!product) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "No Product Found"
            })
        }

        await cache.setJson(cacheKey, product, 180)
        return res.status(200).json({
            success : true,
            error : false,
            data : product
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error?.message || error
        })
    }
}

const getProductbySubcategory = async (req, res) => {
    try {
        let { category, subCategory, page = 1, limit = 25 } = req.body

        if(!category || !subCategory) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "Category Id and SubCategory Id Required"
            })
        }

        const skip = (limit * (page - 1))

        const query = {
            category : { $in : category },
            subCategory : { $in : subCategory },
            publish: true
        }

        const [data, dataCount] = await Promise.all([
            productModel.find(query).sort({ createdAt : -1 }).skip(skip).limit(limit),
            productModel.countDocuments(query)
        ])

        if(!data || data.length === 0) {
            return res.status(200).json({
                message : "No Product Found",
                success : true,
                error : false,
                data : []
            })
        }

        return res.status(200).json({
            message : "Product Fetched Successfully",
            success : true,
            error : false,
            data : data,
            totalCount : dataCount,
            totalNoPage : Math.ceil(dataCount / limit),
            page : page,
        })
        
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error?.message || error
        })
    }
}

const getProductDetailsController = async (req, res) => {
    try {
        const { productId } = req.body

        const product = await productModel.findOne({ _id : productId, publish: true })

        if(!product) {
            return res.status(404).json({
                message : "Product not found",
                success : false,
                error : true
            })
        }

        return res.status(200).json({
            message : 'Product Details',
            error : false,
            success : true,
            data : product
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })        
    }
}

const updateProductController = async (req, res) => {
    try {
        const { _id } = req.body

        if( !_id ){
            return res.status(200).json({
                message : "Product not exist",
                success : false,
                error : true
            })
        }

        const allowed = ['name', 'description', 'image', 'category', 'subCategory', 'unit', 'stock', 'price', 'discount', 'more_details', 'publish', 'isAvailable']
        const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
        if (updates.stock !== undefined && updates.isAvailable === undefined) updates.isAvailable = Number(updates.stock) > 0
        const updateProduct = await productModel.updateOne({ _id : _id }, { $set: updates }, { runValidators: true })
        await cache.removeByPattern('menu:*')

        return res.json({
            message : "Product updated successfully",
            data : updateProduct,
            success : true,
            error : false
        })
    } catch (error) {
       return res.status(500).json({
        message : error.message || error,
        success : false,
        error : true
       }) 
    }
}

const deleteProductController = async (req, res) => {
    try {
        const { _id } = req.body

        if( !_id ){
            return res.status(400).json({
                message : "Product not exixt"
            })
        }

        const item = await productModel.findByIdAndDelete({ _id : _id })

        if( item ){
            await cache.removeByPattern('menu:*')
            return res.status(200).json({
                message : "Product Deleted Successfully",
                success : true,
                error : false,
                data : item
            })
        }

        return res.status(400).json({
            message : "Something went wrong ! Try Again",
            success : false,
            error : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

const searchProductController = async (req, res) => {
    try {
        let {search, page =1, limit=12 } = req.body
        page = Math.max(1, Number.parseInt(page, 10) || 1)
        limit = Math.min(48, Math.max(1, Number.parseInt(limit, 10) || 12))
        search = String(search || '').trim()

        const skip = (page - 1) * limit

        const [data, dataCount] = await queryProducts({
            baseQuery: { publish: true },
            search,
            skip,
            limit
        })

        if(!data || data.length === 0) {
            return res.status(200).json({
                message : "No Product Found",
                error : false,
                success : true,
                data : [],
                totalCount: 0,
                totalPage: 0,
                page,
                limit
            })
        }

        return res.status(200).json({
            message : "Product Data",
            error : false,
            success : true,
            data : data,
            totalCount : dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

module.exports = { createProductController, getAllProductsController, getProductByCategoryController, getProductbySubcategory, getProductDetailsController, updateProductController, deleteProductController, searchProductController }
