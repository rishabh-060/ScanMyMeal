const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  ORDERS_VIEW: 'orders.view',
  ORDERS_MANAGE: 'orders.manage',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_MANAGE: 'products.manage',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_MANAGE: 'customers.manage',
  ACCESS_MANAGE: 'access.manage',
  OFFERS_VIEW: 'offers.view',
  OFFERS_MANAGE: 'offers.manage',
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  BANNERS_MANAGE: 'banners.manage',
  TABLES_MANAGE: 'tables.manage',
})

const ROLE_PERMISSIONS = Object.freeze({
  ADMIN: ['*'],
  MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.OFFERS_VIEW,
    PERMISSIONS.OFFERS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.BANNERS_MANAGE,
    PERMISSIONS.TABLES_MANAGE,
  ],
  KITCHEN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
  ],
  SUPPORT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  MARKETING: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.OFFERS_VIEW,
    PERMISSIONS.OFFERS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.BANNERS_MANAGE,
  ],
  USER: [],
})

const STAFF_ROLES = Object.freeze(Object.keys(ROLE_PERMISSIONS).filter((role) => role !== 'USER'))
const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS))

const permissionsFor = (user) => {
  const defaults = ROLE_PERMISSIONS[user?.role] || []
  if (defaults.includes('*')) return ['*']
  return [...new Set([...defaults, ...(Array.isArray(user?.permissions) ? user.permissions : [])])]
}

const hasPermission = (user, permission) => {
  const permissions = permissionsFor(user)
  return permissions.includes('*') || permissions.includes(permission)
}

module.exports = { PERMISSIONS, ROLE_PERMISSIONS, STAFF_ROLES, ALL_PERMISSIONS, permissionsFor, hasPermission }
