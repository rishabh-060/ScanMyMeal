const API_URL = process.env.NEXT_PUBLIC_API_URL
export const baseUrl = API_URL

const summaryApi =  {
    signup : {
        url : '/api/user/register',
        method : 'post'
    },
    verifyEmail : {
        url : '/api/user/verify-email',
        method : 'post'
    },
    login : {
        url : '/api/user/login',
        method : 'post'
    },
    resendVerificationMail : {
        url : '/api/user/send-verification-mail',
        method : 'post'
    },
    forgotPassword : {
        url : "/api/user/forgot-password",
        method : "put"
    },
    forgotPasswordOtpVerification : {
        url : "/api/user/verify-forgot-password-otp",
        method : "put"
    },
    resetPassword : {
        url : "/api/user/reset-password",
        method : "put"
    }, 
    refreshToken : {
        url : '/api/user/refresh-token',
        method : 'post'
    },
    getuser : {
        url : '/api/user/user-details',
        method : 'get'
    },
    logout : {
        url : "/api/user/logout",
        method : "get"
    },
    uploadAvatar : {
        url : "/api/user/upload-avatar",
        method : "put"
    },
    updateUser : {
        url : "/api/user/update-user",
        method : "put"
    },
    addCategory : {
        url : '/api/category/add-category',
        method : 'post'
    },
    uploadImage : {
        url : "/api/file/upload",
        method : 'post'
    },
    getCategory : {
        url : "/api/category/get-category",
        method : "get"
    },
    updateCategory : {
        url : "/api/category/update-category",
        method : "put"
    },
    deleteCategory : {
        url : "/api/category/delete-category",
        method : "delete"
    },
    addSubCategory : {
        url : "/api/sub-category/add-subcategory",
        method : "post"
    },
    getSubcategory : {
        url : "/api/sub-category/get-subcategory",
        method : "post"
    },
    updateSubcategory : {
        url : '/api/sub-category/edit-subcategory',
        method : 'put'
    },
    deleteSubcategory : {
        url : '/api/sub-category/delete-subcategory',
        method : 'delete'
    },
    addProduct : {
        url : '/api/product/add-product',
        method : 'post'
    },
    getProduct : {
        url : '/api/product/get-product',
        method : 'post'
    },
    getProductByCategory : {
        url : '/api/product/get-product-by-category',
        method : 'post'
    },
    getProductByCategorySubcategory : {
        url : '/api/product/get-product-by-category-subcategory',
        method : 'post'
    },
    getProductDetails : {
        url : '/api/product/get-product-details',
        method : 'post'
    },
    updateProduct : {
        url : '/api/product/update-product',
        method : 'put'
    },
    deleteProduct : {
        url : '/api/product/delete-product',
        method : 'delete'
    },
    searchProduct : {
        url : '/api/product/search-product',
        method : 'post'
    },
    addToCart : {
        url : '/api/cart/add-cart',
        method : 'post'
    },
    getCart : {
        url : '/api/cart/get-cart',
        method : 'get'
    },
    updateCart : {
        url : '/api/cart/update-cart',
        method : 'put'
    },
    deleteCart : {
        url : '/api/cart/delete-cart',
        method : 'delete'
    },
    addAddress : {
        url : '/api/address/add-address',
        method : 'post'
    },
    getAddress : {
        url : '/api/address/get-address',
        method : 'get'
    },
    updateAddress : {
        url : '/api/address/update-address',
        method : 'put'
    },
    deleteAddress : {
        url : '/api/address/delete-address',
        method : 'delete'
    },
    CodOrder : {
        url : '/api/order/COD-order',
        method : 'post'
    },
    paymentUrl : {
        url : '/api/order/PAID-order',
        method : 'post'
    },
    validateOffer : {
        url : '/api/order/validate-offer',
        method : 'post'
    },
    myOrders : {
        url : '/api/order/get-orders',
        method : 'get'
    },
    userNotifications : {
        url : '/api/user/notifications',
        method : 'get'
    },
    readUserNotification : (id) => ({
        url : `/api/user/notifications/${encodeURIComponent(id)}/read`,
        method : 'patch'
    }),
    readAllUserNotifications : {
        url : '/api/user/notifications/read-all',
        method : 'patch'
    },
    orderDetails : (orderId) => ({
        url : `/api/order/${encodeURIComponent(orderId)}`,
        method : 'get'
    }),
    resolveTable : (publicId) => ({
        url : `/api/tables/resolve/${encodeURIComponent(publicId)}`,
        method : 'get'
    }),
    activeBanners : {
        url : '/api/banners/active',
        method : 'get'
    },
    upcomingOrders : {
        url : '/api/admin/upcoming-orders',
        method : 'get'
    },
    adminOrderReports : {
        url : '/api/admin/order-reports',
        method : 'get'
    },
    getAllUsers : {
        url : '/api/admin/get-all-users',
        method : 'get'
    },
    makeAdmin : {
        url : '/api/admin/make-admin',
        method : 'post'
    },
    makeUser : {
        url : '/api/admin/make-user',
        method : 'post'
    },
    suspendUser : {
        url : '/api/admin/suspend-user',
        method : 'post'
    },
    activateUser : {
        url : '/api/admin/activate-user',
        method : 'post'
    },
    productLength : {
        url : '/api/admin/total-product',
        method : 'post'
    },
    manageOrder : {
        url : '/api/admin/manage-order',
        method : 'post'
    },
    adminTables : {
        url : '/api/admin/tables',
        method : 'get'
    },
    createTable : {
        url : '/api/admin/tables',
        method : 'post'
    },
    updateTable : (publicId) => ({
        url : `/api/admin/tables/${encodeURIComponent(publicId)}`,
        method : 'patch'
    }),
    deleteTable : (publicId) => ({
        url : `/api/admin/tables/${encodeURIComponent(publicId)}`,
        method : 'delete'
    }),
    adminBanners : {
        url : '/api/admin/banners',
        method : 'get'
    },
    createBanner : {
        url : '/api/admin/banners',
        method : 'post'
    },
    updateBanner : (id) => ({
        url : `/api/admin/banners/${encodeURIComponent(id)}`,
        method : 'patch'
    }),
    deleteBanner : (id) => ({
        url : `/api/admin/banners/${encodeURIComponent(id)}`,
        method : 'delete'
    }),
    reorderBanners : {
        url : '/api/admin/banners/reorder',
        method : 'patch'
    },
    setBannerStatus : (id) => ({
        url : `/api/admin/banners/${encodeURIComponent(id)}/status`,
        method : 'patch'
    }),
    adminInventory : {
        url : '/api/admin/inventory',
        method : 'get'
    },
    adjustInventory : (productId) => ({
        url : `/api/admin/inventory/${encodeURIComponent(productId)}/adjust`,
        method : 'post'
    }),
    adminAccess : {
        url : '/api/admin/access',
        method : 'get'
    },
    adminDashboardSummary : {
        url : '/api/admin/dashboard-summary',
        method : 'get'
    },
    updateAdminAccess : (userId) => ({
        url : `/api/admin/access/users/${encodeURIComponent(userId)}`,
        method : 'patch'
    }),
    adminOffers : {
        url : '/api/admin/offers',
        method : 'get'
    },
    createOffer : {
        url : '/api/admin/offers',
        method : 'post'
    },
    updateOffer : (id) => ({
        url : `/api/admin/offers/${encodeURIComponent(id)}`,
        method : 'patch'
    }),
    setOfferStatus : (id) => ({
        url : `/api/admin/offers/${encodeURIComponent(id)}/status`,
        method : 'patch'
    }),
    deleteOffer : (id) => ({
        url : `/api/admin/offers/${encodeURIComponent(id)}`,
        method : 'delete'
    }),
    adminNotifications : {
        url : '/api/admin/notifications',
        method : 'get'
    },
    createNotification : {
        url : '/api/admin/notifications',
        method : 'post'
    },
    markNotificationRead : (id) => ({
        url : `/api/admin/notifications/${encodeURIComponent(id)}/read`,
        method : 'patch'
    }),
    markAllNotificationsRead : {
        url : '/api/admin/notifications/read-all',
        method : 'patch'
    },
    deleteNotification : (id) => ({
        url : `/api/admin/notifications/${encodeURIComponent(id)}`,
        method : 'delete'
    })
}


export default summaryApi
