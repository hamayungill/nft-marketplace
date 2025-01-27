import { combineReducers } from 'redux'
import adminReducer from '../views/Admin/Admin.reducer'
import categoryReducer from '../views/Categories/Categories.reducer'
import ingredientReducer from '../views/Ingredient/Ingredients.reducer'
import userReducer from 'views/Users/Users.reducer'
import collectionReducer from '../views/Collection/Collection.reducer'
import errorReducer from './shared/error/error.reducer'
import nftsReducer from 'views/Nfts/nfts.reducer'
import auctionsReducer from '../views/LiveAuctions/liveAuctions.reducer'
import emailReducer from '../views/EmailTemplates/EmailTemplates.reducer'
import settingsReducer from '../views/Settings/settings.reducer'
import FaqReducer from 'views/Faq/Faq.reducer'
import PizzaReducer from 'views/Pizza/Pizzas.reducer'
import ArtistReducer from 'views/Artist/Artist.reducer'
import DashboardReducer from 'views/Dashboard/Dashboard.reducer'

export default combineReducers({
    admin: adminReducer,
    category: categoryReducer,
    faqs: FaqReducer,
    ingredient: ingredientReducer,
    user: userReducer,
    collection: collectionReducer,
    error: errorReducer,
    nfts: nftsReducer,
    auctions: auctionsReducer,
    email: emailReducer,
    settings: settingsReducer,
    pizza: PizzaReducer,
    artists: ArtistReducer,
    dashboard: DashboardReducer
})
