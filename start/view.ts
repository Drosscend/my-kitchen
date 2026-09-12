import edge from 'edge.js'
import env from '#start/env'

edge.global('umamiScriptUrl', env.get('UMAMI_SCRIPT_URL'))
edge.global('umamiWebsiteId', env.get('UMAMI_WEBSITE_ID'))
