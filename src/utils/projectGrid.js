export const MAX_ALS_FIELDS = 8
export const WEEK_YEAR_PATTERN = '^(0[1-9]|[1-4][0-9]|5[0-3])\\/\\d{2}$'
export const ALS_LAYOUT_ROWS = [
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tbtVffZp5', label: 'TBT-VFF ZP5' },
      { key: 'tbtVffElet', label: 'TBT-VFF ELET' },
      { key: 'tbtVffZp7', label: 'TBT-VFF ZP7' },
      { key: 'vff', label: 'VFF' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tbtPvsZp5', label: 'TBT-PVS ZP5' },
      { key: 'tbtPvsElet', label: 'TBT-PVS ELET' },
      { key: 'tbtPvsZp7', label: 'TBT-PVS ZP7' },
      { key: 'pvs', label: 'PVS' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tbtS0Zp5', label: 'TBT-S0 ZP5' },
      { key: 'tbtS0Elet', label: 'TBT-S0 ELET' },
      { key: 'tbtS0Zp7', label: 'TBT-S0 ZP7' },
      { key: 's0', label: 'S0' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tppaZp5', label: 'TPPA ZP5' },
      { key: 'tppaElet', label: 'TPPA ELET' },
      { key: 'tppaZp7', label: 'TPPA ZP7' },
      { key: 'tppa', label: 'TPPA' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'sopZp5', label: 'SOP ZP5' },
      { key: 'sopElet', label: 'SOP ELET' },
      { key: 'sopZp7', label: 'SOP ZP7' },
      { key: 'sop', label: 'SOP' },
    ],
  },
]
export const ALS_OPTIONAL_FIELDS = ALS_LAYOUT_ROWS.flatMap(row => row.fields)
export const ALS_OPTIONAL_FIELD_KEYS = ALS_OPTIONAL_FIELDS.map(field => field.key)
export const ALS_FIELD_LABELS = Object.fromEntries(
  ALS_OPTIONAL_FIELDS.map(field => [field.key, field.label]),
)
export const GATES = ['ZP5', 'ELET', 'ZP7']
export const PHASES = ['VFF', 'PVS', 'SO', 'TPPA', 'SOP']

export const FIELD_BY_GATE_AND_PHASE = {
  ZP5: {
    VFF: 'tbtVffZp5',
    PVS: 'tbtPvsZp5',
    SO: 'tbtS0Zp5',
    TPPA: 'tppaZp5',
    SOP: 'sopZp5',
  },
  ELET: {
    VFF: 'tbtVffElet',
    PVS: 'tbtPvsElet',
    SO: 'tbtS0Elet',
    TPPA: 'tppaElet',
    SOP: 'sopElet',
  },
  ZP7: {
    VFF: 'tbtVffZp7',
    PVS: 'tbtPvsZp7',
    SO: 'tbtS0Zp7',
    TPPA: 'tppaZp7',
    SOP: 'sopZp7',
  },
}

export const DEFAULT_FIELD_BY_PHASE = {
  VFF: 'vff',
  PVS: 'pvs',
  SO: 's0',
  TPPA: 'tppa',
  SOP: 'sop',
}

export function createAlsEntry(index) {
  return ALS_OPTIONAL_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.key]: '' }),
    { als: `ALS${index}`, alsDescription: '' },
  )
}

export function getAlsKey(entry, index) {
  const match = entry.als?.match(/\d+$/)
  return match ? match[0] : String(index + 1)
}

export function buildGridDates(alsEntries) {
  return alsEntries.reduce((acc, entry, index) => {
    const alsKey = getAlsKey(entry, index)

    const byGate = GATES.reduce((gatesAcc, gate) => {
      const byPhase = PHASES.reduce((phasesAcc, phase) => {
        const gateFieldKey = FIELD_BY_GATE_AND_PHASE[gate]?.[phase]
        const defaultFieldKey = DEFAULT_FIELD_BY_PHASE[phase]
        const gateValue = gateFieldKey ? (entry[gateFieldKey] || '').trim() : ''
        const fallbackValue = defaultFieldKey ? (entry[defaultFieldKey] || '').trim() : ''

        const resolvedValue = gateValue || fallbackValue
        if (resolvedValue) {
          phasesAcc[phase] = resolvedValue
        }
        return phasesAcc
      }, {})

      if (Object.keys(byPhase).length > 0) {
        gatesAcc[gate] = byPhase
      }
      return gatesAcc
    }, {})

    if (Object.keys(byGate).length > 0) {
      acc[alsKey] = byGate
    }
    return acc
  }, {})
}

export function buildAlsDescriptions(alsEntries) {
  return alsEntries.reduce((acc, entry, index) => {
    const alsKey = getAlsKey(entry, index)
    const description = (entry.alsDescription || '').trim()
    if (description) {
      acc[alsKey] = description
    }
    return acc
  }, {})
}
