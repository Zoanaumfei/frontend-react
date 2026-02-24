import {
  APQP_NOTIFICATIONS,
  APQP_PARTS_BY_VEHICLE,
  APQP_TEMPLATES,
  APQP_VEHICLES,
} from '../constants/apqpMockData'

const delay = (ms = 250) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const clone = value => JSON.parse(JSON.stringify(value))

export const getApqpVehicles = async () => {
  await delay()
  return clone(APQP_VEHICLES)
}

export const getApqpVehicle = async vehicleId => {
  await delay()
  const vehicle = APQP_VEHICLES.find(item => item.id === vehicleId)
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

