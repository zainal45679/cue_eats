import Auth from './Auth'
import Dashboard from './Dashboard'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
Dashboard: Object.assign(Dashboard, Dashboard),
Settings: Object.assign(Settings, Settings),
}

export default Controllers