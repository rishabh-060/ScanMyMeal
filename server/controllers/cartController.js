const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');

const addToCartController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        if(!userId){
            return res.status(400).json({
                message: 'Login Required',
                success: false,
                error: true
            })
        }

        if (!productId) {
            return res.status(400).json({
                message: 'Product Not Found',
                success: false,
                error: true
            });
        }
        const product = await cartModel.findOne({ userId: userId, product: productId });

        if (product) {
            return res.status(400).json({
                message: 'Product already in cart',
                success: false,
                error: true
            });
        }

        const cartItem = new cartModel({
            quantity: 1,
            userId: userId,
            product: productId
        });

        const save = await cartItem.save();

        if(save){
            const updateCartUser = await userModel.updateOne(
                { _id: userId },
                {
                    $push: {
                        shopping_cart: productId
                    }
                }
            );
    
            return res.status(200).json({
                data: save,
                message: "Item added successfully",
                success: true,
                error: false
            });
        }
        return res.status(400).json({
            message: 'Failed to add item to cart',
            success: false,
            error: true
        });
    } catch (error) {
        return res.status(500).json({   // <-- fixed this line
            message: error.message || error,
            success: false,
            error: true
        });
    }
};

const getCartController = async (req, res) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(400).json({
                message: 'Login Required',
                success: false,
                error: true
            })
        }
        
        const cartItems = await cartModel.find({ userId: userId }).populate('product');

        if (!cartItems) {
            return res.status(400).json({
                message: 'No items in cart',
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            data: cartItems,
            message: "Cart items fetched successfully",
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
};

const updateCartItemQtyController = async (req, res) => {
    try {
        const userId = req.userId
        const { _id, qty } = req.body

        if(!userId){
            return res.status(400).json({
                message: 'Login Required',
                success: false,
                error: true
            })
        }

        if(!_id || !qty) {
            return res.status(400).json({
                message : "Provide both Id & Quantity",
                error : true,
                success : false
            })
        }

        const updateCartItem = await cartModel.updateOne({
            _id : _id,
        },{
            quantity : qty,
        })

        return res.status(200).json({
            message : "Item Updated Successfully",
            error : false,
            success : true,
            data : updateCartItem
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
};

const removeFromCartController = async (req, res) => {
    try {
        const userId = req.userId;
        const { _id } = req.body;

        if(!userId){
            return res.status(400).json({
                message: 'Login Required',
                success: false,
                error: true
            })
        }

        if (!_id) {
            return res.status(400).json({
                message: 'Product Not Found',
                success: false,
                error: true
            });
        }

        const cartItem = await cartModel.deleteOne({ _id : _id, userId: userId });

        if (cartItem.deletedCount === 0) {
            return res.status(400).json({
                message: 'Product not found in cart',
                success: false,
                error: true
            });
        }

        const updateCartUser = await userModel.updateOne(
            { _id: userId },
            {
                $pull: {
                    shopping_cart: _id
                }
            }
        );

        return res.status(200).json({
            data: cartItem,
            message: "Item removed successfully",
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
};

module.exports = { addToCartController, getCartController, removeFromCartController, updateCartItemQtyController };