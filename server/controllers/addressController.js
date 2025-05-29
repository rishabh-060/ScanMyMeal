const addressModel = require('../models/addressModel')
const userModel = require('../models/userModel')

const addAddressController = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId){
            return res.status(400).json({
                message: 'Login Required',
                success: false,
                error: true
            })
        }

        const { address_line, mobile, city, state, pincode, country } = req.body

        if( !address_line || !mobile || !city || !state || !pincode || !country ) {
            return res.status(400).json({
                message: 'All fields required',
                success: false,
                error: true
            })
        }

        const newAddress = await addressModel({
            address_line, mobile, city, state, pincode, country, userId
        })
        const save = newAddress.save()

        const addUserAddressId = await userModel.findByIdAndUpdate(userId, {
            $push: { 
                address_details : save._id
             }
        })

        if(save) {
            return res.status(200).json({
                message: 'Address added successfully',
                success: true,
                error: false,
                data : save
            })
        }
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const getAddressController = async (req, res) => {
    try {
        const userId = req.userId

        const address = await addressModel.find({ userId : userId }).sort({ createdAt : -1 })

        if (!address) {
            return res.status(400).json({
                message: 'No address found',
                success: false,
                error: true
            })
        }
        return res.status(200).json({
            message: 'Address fetched successfully',
            success: true,
            error: false,
            data : address
        })
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const updateAddressController = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId){
            return res.status(400).json({
                message: 'Login Required',
                success: false,
                error: true
            })
        }

        const { _id, address_line, mobile, city, state, pincode, country } = req.body

        if( !_id || !address_line || !mobile || !city || !state || !pincode || !country ) {
            return res.status(400).json({
                message: 'All fields required',
                success: false,
                error: true
            })
        }

        const address = await addressModel.updateOne({ _id: _id, userId: userId }, {
            address_line, mobile, city, state, pincode, country
        })

        return res.status(200).json({
            message: 'Address updated successfully',
            success: true,
            error: false,
            data : address
        })
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const removeAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Login required',
        success: false,
        error: true,
      });
    }

    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: 'Address ID required',
        success: false,
        error: true,
      });
    }

    // Soft delete the address
    const result = await addressModel.updateOne(
      { _id, userId },
      { status: false }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: 'Address not found or already deleted',
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: 'Address removed successfully',
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};


module.exports = { addAddressController, getAddressController, updateAddressController, removeAddressController }