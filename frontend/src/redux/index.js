import { combineReducers } from 'redux';
import { ArtistsReducer } from './artist/Artists.reducer';
import { userReducer } from './user/user.reducer';
import { walletReducer } from '../components/Wallet/Wallet.reducer';
import { errorReducer } from './error/error.reducer';
import { ingredientReducer } from './Ingredients/Ingredient.reducer';
import { caveReducer } from './cave/cave.reducer';
import { faqsReducer } from '../pages/faq/Faq.reducer';
import { settingReducer } from './Settings/Setting.reducer';

export default combineReducers({
    artist: ArtistsReducer,
    user: userReducer,
    error: errorReducer,
    wallet: walletReducer,
    ingredient: ingredientReducer,
    cave: caveReducer,
    faq: faqsReducer,
    setting: settingReducer
})
