import ProductController from './ProductController'
import CountryController from './CountryController'
import CurrencyTaxController from './CurrencyTaxController'
import BusinessLocationController from './BusinessLocationController'
import StorageLocationController from './StorageLocationController'
import UnitOfMeasureController from './UnitOfMeasureController'
import RoleController from './RoleController'
import UserController from './UserController'

const Dashboard = {
    ProductController: Object.assign(ProductController, ProductController),
    CountryController: Object.assign(CountryController, CountryController),
    CurrencyTaxController: Object.assign(CurrencyTaxController, CurrencyTaxController),
    BusinessLocationController: Object.assign(BusinessLocationController, BusinessLocationController),
    StorageLocationController: Object.assign(StorageLocationController, StorageLocationController),
    UnitOfMeasureController: Object.assign(UnitOfMeasureController, UnitOfMeasureController),
    RoleController: Object.assign(RoleController, RoleController),
    UserController: Object.assign(UserController, UserController),
}

export default Dashboard