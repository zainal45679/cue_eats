import Auth from './Auth'
import Settings from './Settings'
import Dashboard from './Dashboard'

const Controllers = {
    Auth: Object.assign(Auth, Auth),
    Settings: Object.assign(Settings, Settings),
    Dashboard: Object.assign(Dashboard, Dashboard),
}

export default Controllers