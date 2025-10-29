import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import ScanReceipt from "./ScanReceipt";

import Receipts from "./Receipts";

import Budget from "./Budget";

import Analytics from "./Analytics";

import Guide from "./Guide";

import Settings from "./Settings";

import Privacy from "./Privacy";

import Nutrition from "./Nutrition";

import ShoppingList from "./ShoppingList";

import About from "./About";

import Features from "./Features";

import LandingPage from "./LandingPage";

import AdminInsights from "./AdminInsights";

import Household from "./Household";

import JoinHousehold from "./JoinHousehold";

import OperationalInsights from "./OperationalInsights";

import TermsOfUse from "./TermsOfUse";

import CookiePolicy from "./CookiePolicy";

import Recipes from "./Recipes";

import MealPlan from "./MealPlan";

import OCRTestingDashboard from "./OCRTestingDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    ScanReceipt: ScanReceipt,
    
    Receipts: Receipts,
    
    Budget: Budget,
    
    Analytics: Analytics,
    
    Guide: Guide,
    
    Settings: Settings,
    
    Privacy: Privacy,
    
    Nutrition: Nutrition,
    
    ShoppingList: ShoppingList,
    
    About: About,
    
    Features: Features,
    
    LandingPage: LandingPage,
    
    AdminInsights: AdminInsights,
    
    Household: Household,
    
    JoinHousehold: JoinHousehold,
    
    Layout: Layout,
    
    OperationalInsights: OperationalInsights,
    
    TermsOfUse: TermsOfUse,
    
    CookiePolicy: CookiePolicy,
    
    Recipes: Recipes,
    
    MealPlan: MealPlan,
    
    OCRTestingDashboard: OCRTestingDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ScanReceipt" element={<ScanReceipt />} />
                
                <Route path="/Receipts" element={<Receipts />} />
                
                <Route path="/Budget" element={<Budget />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Guide" element={<Guide />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Nutrition" element={<Nutrition />} />
                
                <Route path="/ShoppingList" element={<ShoppingList />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Features" element={<Features />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/AdminInsights" element={<AdminInsights />} />
                
                <Route path="/Household" element={<Household />} />
                
                <Route path="/JoinHousehold" element={<JoinHousehold />} />
                
                <Route path="/Layout" element={<Layout />} />
                
                <Route path="/OperationalInsights" element={<OperationalInsights />} />
                
                <Route path="/TermsOfUse" element={<TermsOfUse />} />
                
                <Route path="/CookiePolicy" element={<CookiePolicy />} />
                
                <Route path="/Recipes" element={<Recipes />} />
                
                <Route path="/MealPlan" element={<MealPlan />} />
                
                <Route path="/OCRTestingDashboard" element={<OCRTestingDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}