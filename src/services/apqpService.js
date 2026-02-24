import {
  APQP_NOTIFICATIONS,
  APQP_PARTS_BY_VEHICLE,
  APQP_STATUS,
  APQP_TEMPLATES,
  APQP_VEHICLES,
} from '../constants/apqpMockData'
import { getProjects } from './projectService'

const delay = (ms = 250) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const clone = value => JSON.parse(JSON.stringify(value))

const normalizeProjectId = project =>
  project?.projectId || project?.projectID || project?.id || ''

const normalizeProjectName = project =>
  project?.projectName || project?.project_name || project?.name || ''

const normalizeStatus = (rawStatus, fallbackStatus = APQP_STATUS.ACTIVE) => {
  const validStatus = Object.values(APQP_STATUS)
  if (rawStatus && validStatus.includes(rawStatus)) return rawStatus
  return fallbackStatus
}

const buildVehicleIdFromProjectId = projectId => {
  const normalized = String(projectId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized ? `veh-${normalized}` : 'veh-project'
}

const mergeProjectIntoVehicle = project => {
  const projectId = normalizeProjectId(project)
  const projectName = normalizeProjectName(project) || projectId || 'Unnamed Project'

  const mockMatch = APQP_VEHICLES.find(vehicle => {
    const mockProjectId = vehicle.projectId || vehicle.id
    return mockProjectId === projectId
  })

  const resolvedId = mockMatch?.id || buildVehicleIdFromProjectId(projectId)

  return {
    id: resolvedId,
    projectId: projectId || mockMatch?.projectId || resolvedId,
    projectName,
    name: projectName,
    customer: mockMatch?.customer || 'TBD',
    platform: mockMatch?.platform || '--',
    sopDate: mockMatch?.sopDate || '',
    status: normalizeStatus(project?.status, mockMatch?.status),
    templateId: mockMatch?.templateId || APQP_TEMPLATES[0]?.id || '',
  }
}

const getLiveOrMockVehicles = async () => {
  try {
    const projects = await getProjects()
    if (Array.isArray(projects) && projects.length > 0) {
      return projects.map(mergeProjectIntoVehicle)
    }
  } catch {
    // keep APQP module available even if projects API is temporarily unavailable
  }

  return APQP_VEHICLES
}

export const getApqpVehicles = async () => {
  await delay()
  const vehicles = await getLiveOrMockVehicles()
  return clone(vehicles)
}

export const getApqpVehicle = async vehicleId => {
  await delay()
  const vehicles = await getLiveOrMockVehicles()
  const vehicle = vehicles.find(item => item.id === vehicleId)
  return vehicle ? clone(vehicle) : null
}

export const getApqpVehicleParts = async vehicleId => {
  await delay()
  return clone(APQP_PARTS_BY_VEHICLE[vehicleId] || [])
}

export const getApqpTemplates = async () => {
  await delay()
  return clone(APQP_TEMPLATES)
}

export const getApqpTemplate = async templateId => {
  await delay()
  const template = APQP_TEMPLATES.find(item => item.id === templateId)
  return template ? clone(template) : null
}

export const getApqpNotifications = async () => {
  await delay()
  return clone(APQP_NOTIFICATIONS)
}
