export const rolePermissions = {
  ADMIN: ['*'],
  MANAGER: ['dashboard.view', 'orders.view', 'orders.manage', 'products.view', 'products.manage', 'inventory.view', 'inventory.manage', 'customers.view', 'customers.manage', 'offers.view', 'offers.manage', 'notifications.view', 'notifications.manage', 'banners.manage', 'tables.manage'],
  KITCHEN: ['dashboard.view', 'orders.view', 'orders.manage', 'inventory.view', 'inventory.manage'],
  SUPPORT: ['dashboard.view', 'orders.view', 'customers.view', 'customers.manage', 'notifications.view'],
  MARKETING: ['dashboard.view', 'products.view', 'offers.view', 'offers.manage', 'notifications.view', 'notifications.manage', 'banners.manage'],
  USER: [],
}

export const isStaff = (role) => Boolean(rolePermissions[role]?.length)

export const hasPermission = (user, permission) => {
  const permissions = [...(rolePermissions[user?.role] || []), ...(user?.permissions || [])]
  return permissions.includes('*') || permissions.includes(permission)
}

const isAdmin = (role) => isStaff(role)

export default isAdmin
