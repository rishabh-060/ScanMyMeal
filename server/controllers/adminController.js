const { default: mongoose } = require('mongoose')
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const sendMail = require('../helpers/tryMailer');
const accountSuspention = require('../templates/accountSuspention');

const getAllOrdersController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    // Fetch all upcoming orders (not delivered or cancelled)
    const upcomingOrders = await orderModel.find({
      payment_status: { $nin: ['Paid', 'Cancelled'] },
    })
      .populate('userId', 'name email') 
      .populate('productId', 'name price')
      .populate('delivery_address')
      .populate('table_num')
      .sort({ createdAt: -1 }); 

    if (!upcomingOrders || upcomingOrders.length === 0) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'No upcoming orders found.',
        data: [],
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Upcoming orders fetched successfully',
      data: upcomingOrders,
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    const users = await userModel.find({}).select('name avatar email mobile role status order_history').populate('order_history'); // Adjust the model name and fields as necessary

    if (!users || users.length === 0) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'No users found.',
        data: [],
      });
    }
    
    return res.status(200).json({
      error: false,
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

const getAllProductsLengthController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    const products = await productModel.find({});

    if (!products || products.length === 0) {
      return res.status(200).json({
        error: false,
        success: true,
        message: 'No products found.',
        data: 0,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: 'Products fetched successfully',
      data: products.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
}

const convertToAdminController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    const { userEmail } = req.body; 

    const admin = await userModel.updateOne({ email : userEmail }, { role: 'ADMIN' });
    

    return res.status(200).json({
      error: false,
      success: true,
      message: 'User role updated as ADMIN user',
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
}

const convertToUserController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    const { userEmail } = req.body; 

    const admin = await userModel.updateOne({ email : userEmail }, { role: 'USER' });

    return res.status(200).json({
      error: false,
      success: true,
      message: 'User role updated as Normal user',
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
}

const suspendUserController = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    const { userEmail } = req.body; 

    const admin = await userModel.updateOne({ email : userEmail }, { status: 'Suspended' });
    
    await sendMail(
      user.email,
      'Suspension Notice | Scan My Meal',
      'Your account has been suspended',
      accountSuspention(user.name, new Date().toLocaleDateString(), 'Violation of terms and conditions')
    )

    return res.status(200).json({
      error: false,
      success: true,
      message: 'User role updated as Normal user',
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
}

const activateUserController = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    const { userEmail } = req.body; 

    const admin = await userModel.updateOne({ email : userEmail }, { status: 'Active' });

    return res.status(200).json({
      error: false,
      success: true,
      message: 'User role updated as Normal user',
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
}

const manageUpcomingOrdersController = async (req, res) => {
  console.log("Manage Upcoming Orders Controller Called");
  try {
    const userId = req.userId;
    const { orderId, action } = req.body;

    // 1️⃣ Check admin privileges
    const user = await userModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Admin access required.',
      });
    }

    // 2️⃣ Validate input
    if (!orderId || !action) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Order ID and action are required.',
      });
    }

    // 3️⃣ Validate allowed actions (use Set for better performance)
    const validActions = new Set(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']);
    if (!validActions.has(action)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid action provided.',
      });
    }

    // 4️⃣ Find and update the order
    const updatedOrder = await orderModel.findOneAndUpdate(
      { orderId },
      { order_status: action },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Order not found.',
      });
    }

    // 5️⃣ Success response
    return res.status(200).json({
      error: false,
      success: true,
      message: `Order status updated to "${action}".`,
      data: updatedOrder,
    });

  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      error: true,
      success: false,
      message: 'Something went wrong.',
    });
  }
};

module.exports = {
  getAllOrdersController, getAllUsersController, convertToAdminController, convertToUserController, suspendUserController, activateUserController, getAllProductsLengthController, manageUpcomingOrdersController
};