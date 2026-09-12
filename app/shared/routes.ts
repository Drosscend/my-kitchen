import router from '@adonisjs/core/services/router'

const HealthChecksController = () => import('#app/shared/controllers/health_checks_controller')

router.get('health', [HealthChecksController, 'execute']).as('health')
