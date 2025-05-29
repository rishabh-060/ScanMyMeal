const { default: mongoose } = require('mongoose')
const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const { Stripe } = require('../config/stripe')

const CashOnDeliveryController = async (req, res) => {
    try {
        const userId = req.userId

        if(!userId) {
            return res.status(401).json({
                error : true,
                success : false,
                message : "Login required"
            })
        }

        const { list_item, totalAmt, addressId, subTOtalAmt } = req.body

        if(!list_item || !totalAmt || !addressId || !subTOtalAmt) {
            return res.status(400).json({
                error : true,
                success : false,
                message : "Something is missing"
            })
        }

        const payload = list_item.map(item => {
            return {
                userId : userId,
                orderId : `SMM-ORDDER-${Date.now()}-${new mongoose.Types.ObjectId()}`,
                productId : item.product._id,
                product_details : {
                    name : item.product.name,
                    image : item.product.image
                },
                paymentId : "",
                payment_status : "Cash On Delivery",
                delivery_address : addressId,
                subTotalAmt : subTOtalAmt,
                totalAmt : totalAmt,
            }
        })

        const orderData = await orderModel.insertMany(payload)

        // remove item from cart
        const removeItemFromCart = await cartModel.deleteMany({ userId : userId })
        const userData = await userModel.updateOne({ _id : userId }, { $set : { shopping_cart : [] } })

        return res.status(200).json({
            error : false,
            success : true,
            message : "Order placed successfully",
            data : {
                orderData : orderData,
                cartData : removeItemFromCart,
                userData : userData
            }
        })
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const DiscountedPrice = (price, discount=0) => {
    const priceNum = Number(price);
    const discountNum = Number(discount);

    if (isNaN(priceNum) || isNaN(discountNum)) return 0;

    const discountedAmt = (priceNum * discountNum) / 100;
    const actualPrice = priceNum - discountedAmt;

    return Math.ceil(actualPrice);
}

const CardPaymentController = async (req, res) => {
    try {
        const userId = req.userId

        if(!userId) {
            return res.status(401).json({
                error : true,
                success : false,
                message : "Login required"
            })
        }

        const user = await userModel.findById(userId)

        const { list_item, totalAmt, addressId, subTOtalAmt } = req.body

        if(!list_item || !totalAmt || !addressId || !subTOtalAmt) {
            return res.status(400).json({
                error : true,
                success : false,
                message : "Something is missing"
            })
        }
        const line_items = list_item.map(item => {
            return {
                price_data : {
                    currency: 'inr',
                    product_data: {
                        name: item.product.name,
                        images: item.product.image,
                        metadata: {
                            productId : item.product._id,
                            orderId : `SMM-ORDDER-${Date.now()}-${new mongoose.Types.ObjectId()}`,
                        }
                    },
                    unit_amount: DiscountedPrice(item.product.price, item.product.discount)*100,
                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1,
                },
                quantity: item.quantity,
            }
        })

        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            metadata: {
                userId: String(userId),
                addressId: addressId,
                subTotalAmt: String(subTOtalAmt),
                totalAmt: String(totalAmt),
            },
            line_items: line_items,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`, //?session_id={CHECKOUT_SESSION_ID}
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        }

        const session = await Stripe?.checkout?.sessions?.create(params);
        
        return res.status(200).json(session)
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const getOrderProductItems = async (lineItems, userId, session) => {
    const productList = []

    if (lineItems?.data?.length){
        for(const item of lineItems.data) {
            const product = await Stripe?.products.retrieve(item.price.product);
            
            const payload = {
                userId : userId,
                orderId : `SMM-ORDDER-${Date.now()}-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId,
                product_details : {
                    name : product.name,
                    image : [product.image],
                },
                paymentId : session.payment_intent,
                payment_status : session.payment_status,
                delivery_address : session.metadata.addressId,
                subTotalAmt : Number(session.amount_subtotal / 100),
                totalAmt : Number(session.amount_total / 100),
            }

            productList.push(payload)
        }
    }

    return productList
}

// http://localhost:8080/api/order/web-hook
const webHookStripe = async (req, res) => {
    try {
        const event = req.body
        const endPointSecret = process.env.Stripe_ENDPOINT_WEBHOOK_SECRET_KEY

        // Handle the event
        switch (event?.type) {
            case 'checkout.session.completed':
                const session = event.data.object
                const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
                const userId = session.metadata.userId

                const orderProduct = await getOrderProductItems(lineItems, userId, session)
                
                const order = await orderModel.insertMany(orderProduct)
                
                if(order) {
                    const removeCartItem = await userModel.findByIdAndUpdate({ _id : userId }, { shopping_cart : [] })
                    const removeCartProduct = await cartModel.deleteMany({ userId : userId })
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        console.log("Done with webhook")
        return res.json({received: true});
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const getOrderProductsController = async (req, res) => {
    try {
        const userId = req.userId

        if(!userId) {
            return res.status(401).json({
                error : true,
                success : false,
                message : "Login required"
            })
        }

        const orders = await orderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address', 'address_line city state country pincode mobile')

        return res.status(200).json({
            error : false,
            success : true,
            message : "Order fetched successfully",
            data : orders
        })
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

module.exports = { CashOnDeliveryController, CardPaymentController, webHookStripe, getOrderProductsController }