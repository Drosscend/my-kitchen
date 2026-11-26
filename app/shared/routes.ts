import router from '@adonisjs/core/services/router'

const HomeController = () => import('#app/shared/controllers/home_controller')
const HealthChecksController = () => import('#app/shared/controllers/health_checks_controller')
const LivenessController = () => import('#app/shared/controllers/liveness_controller')
const LegalController = () => import('#app/shared/controllers/legal_controller')
const RobotsController = () => import('#app/shared/controllers/robots_controller')
const SitemapController = () => import('#app/shared/controllers/sitemap_controller')

router.get('/', [HomeController, 'render']).as('home')
router.get('up', [LivenessController, 'execute']).as('up')
router.get('health', [HealthChecksController, 'execute']).as('health')
router.get('legal', [LegalController, 'render']).as('legal.show')
router.get('robots.txt', [RobotsController, 'execute']).as('robots')
router.get('sitemap.xml', [SitemapController, 'execute']).as('sitemap')
