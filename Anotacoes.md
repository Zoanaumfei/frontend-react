Implemented.

What I changed

Added APQP entry on internal home (APQP button to vehicles): InternalHomePage.jsx
Added APQP route tree and wide content mode:
/apqp/vehicles
/apqp/vehicles/:vehicleId
/apqp/templates (admin)
/apqp/templates/:templateId (admin)
/apqp/notifications
/apqp/settings
File: App.jsx
Added APQP shell layout (left sidebar + top bar + content): ApqpLayout.jsx
Added APQP pages:
ApqpVehiclesPage.jsx
ApqpVehicleDetailPage.jsx
ApqpTemplatesPage.jsx
ApqpTemplateDetailPage.jsx
ApqpNotificationsPage.jsx
ApqpSettingsPage.jsx
Added mock APQP domain data + local service layer for loading/filters/interactions:
apqpMockData.js
apqpService.js
Added API path placeholders for APQP: apiPaths.js
Added full APQP styling and responsive behavior: app.css
Build check passed with npm run build.

Needed backend endpoints

GET /api/v1/apqp/vehicles
Purpose: vehicle list with search/filter/pagination (q,status,page,size).

POST /api/v1/apqp/vehicles
Purpose: create vehicle.

GET /api/v1/apqp/vehicles/{vehicleId}
Purpose: vehicle header/detail.

PATCH /api/v1/apqp/vehicles/{vehicleId}
Purpose: update vehicle metadata/status/template.

GET /api/v1/apqp/vehicles/{vehicleId}/parts
Purpose: BOM and Kanban data with filters (q,supplier,family,owner,stage,page,size).

POST /api/v1/apqp/vehicles/{vehicleId}/parts
Purpose: add part to vehicle BOM.

GET /api/v1/apqp/parts/{partId}
Purpose: part detail (header + stage + owner + due date).

PATCH /api/v1/apqp/parts/{partId}
Purpose: edit part fields (owner, due date, supplier, revision, etc).

PATCH /api/v1/apqp/parts/{partId}/stage
Purpose: move stage; server must validate WIP + required deliverables and return blocked reason.

GET /api/v1/apqp/parts/{partId}/history
Purpose: stage transition timeline.

PATCH /api/v1/apqp/parts/{partId}/deliverables/{deliverableId}
Purpose: update deliverable status/value.

POST /api/v1/apqp/parts/{partId}/deliverables/{deliverableId}/attachments/presign-upload
Purpose: file deliverable upload flow.

GET /api/v1/apqp/templates
Purpose: template list.

POST /api/v1/apqp/templates
Purpose: create template.

GET /api/v1/apqp/templates/{templateId}
Purpose: template detail (stages + deliverables).

PATCH /api/v1/apqp/templates/{templateId}
Purpose: update template metadata.

DELETE /api/v1/apqp/templates/{templateId}
Purpose: remove template.

POST /api/v1/apqp/templates/{templateId}/stages
Purpose: add stage.

PATCH /api/v1/apqp/templates/{templateId}/stages/reorder
Purpose: reorder stages.

PATCH /api/v1/apqp/stages/{stageId}
Purpose: edit stage (name/color/wip).

DELETE /api/v1/apqp/stages/{stageId}
Purpose: delete stage.

POST /api/v1/apqp/stages/{stageId}/deliverables
Purpose: add deliverable.

PATCH /api/v1/apqp/deliverables/{deliverableId}
Purpose: edit deliverable fields/type/required.

DELETE /api/v1/apqp/deliverables/{deliverableId}
Purpose: delete deliverable.

GET /api/v1/apqp/notifications
Purpose: events feed (unread,assignedToMe,type,page,size).

PATCH /api/v1/apqp/notifications/{notificationId}/read
Purpose: mark read/unread.

If you want, next step I can replace the mock apqpService calls with real API integration using these endpoints.