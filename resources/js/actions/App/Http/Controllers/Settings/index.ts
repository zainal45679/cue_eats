import ProfileController from './ProfileController'
import OrganizationController from './OrganizationController'
import PasswordController from './PasswordController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    OrganizationController: Object.assign(OrganizationController, OrganizationController),
    PasswordController: Object.assign(PasswordController, PasswordController),
}

export default Settings