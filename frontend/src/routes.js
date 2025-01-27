//layouts
import Layout1 from "./Layouts/Layout_1";
//components
import Home from "./pages/home/home";
import PizzaCave from "./pages/pizzaCave/pizzaCave";
import MeetArtists from "./pages/meetArtists/meetArtists";
import RarityRewards from "./pages/rarityRewards/rarityRewards";
import MyWallet from "./pages/myWallet/myWallet";
import Faq from "./pages/faq/Faq";
const routes = [
    {
        path: "/",
        layout: Layout1,
        access: true,
        exact: true,
        component: Home
    },
    {
        path: "/pizza-cave",
        layout: Layout1,
        access: true,
        exact: true,
        component: PizzaCave
    },
    {
        path: "/meet-artists",
        layout: Layout1 ,
        access : true ,
        exact: true ,
        component: MeetArtists
    },
    {
        path: "/rarity-rewards",
        layout: Layout1 ,
        access : true ,
        exact: true ,
        component: RarityRewards
    },
    {
        path: "/my-wallet",
        layout: Layout1 ,
        access : true ,
        exact: true ,
        component: MyWallet
    },
    {
        path: "/faq",
        layout: Layout1 ,
        access : true ,
        exact: true ,
        component: Faq
    }
]

export default routes;