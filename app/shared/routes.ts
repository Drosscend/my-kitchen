import router from '@adonisjs/core/services/router'

const HealthChecksController = () => import('#app/shared/controllers/health_checks_controller')
const LivenessController = () => import('#app/shared/controllers/liveness_controller')
const LegalController = () => import('#app/shared/controllers/legal_controller')

router.get('up', [LivenessController, 'execute']).as('up')
router.get('health', [HealthChecksController, 'execute']).as('health')
router.get('legal', [LegalController, 'render']).as('legal.show')
