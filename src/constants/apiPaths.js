const API_V1_PREFIX = '/api/v1'
const AUTH_PREFIX = '/auth'

export const API_PATHS = {
  auth: {
    login: `${AUTH_PREFIX}/login`,
  },
  users: '/api/users',
  projects: `${API_V1_PREFIX}/projects`,
  projectById: projectId =>
    `${API_V1_PREFIX}/projects/${encodeURIComponent(projectId)}`,
  dueByRange: `${API_V1_PREFIX}/due/range`,
  items: `${API_V1_PREFIX}/items`,
  itemsByStatus: status =>
    `${API_V1_PREFIX}/items/status/${encodeURIComponent(status)}`,
  itemByKey: (supplierID, partNumberVersion) =>
    `${API_V1_PREFIX}/items/${encodeURIComponent(supplierID)}/${encodeURIComponent(partNumberVersion)}`,
  birthdays: `${API_V1_PREFIX}/birthdays`,
  birthdayByMonthAndName: (month, name) =>
    `${API_V1_PREFIX}/birthdays/${encodeURIComponent(month)}/${encodeURIComponent(name)}`,
  initiatives: `${API_V1_PREFIX}/initiatives`,
  initiativeById: initiativeId =>
    `${API_V1_PREFIX}/initiatives/${encodeURIComponent(initiativeId)}`,
  files: {
    presignUpload: `${API_V1_PREFIX}/files/presign-upload`,
    presignDownload: `${API_V1_PREFIX}/files/presign-download`,
  },
}
