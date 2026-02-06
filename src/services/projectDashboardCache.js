let dashboardCache = null

export const getProjectDashboardCache = () => dashboardCache

export const setProjectDashboardCache = payload => {
  dashboardCache = payload
}

export const clearProjectDashboardCache = () => {
  dashboardCache = null
}
