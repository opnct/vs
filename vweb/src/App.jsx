import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Auto-Generated Imports for 50+ Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import FeaturePOS from './pages/FeaturePOS';
import FeatureInventory from './pages/FeatureInventory';
import FeatureUdhaar from './pages/FeatureUdhaar';
import FeatureMarketplace from './pages/FeatureMarketplace';
import FeatureSuppliers from './pages/FeatureSuppliers';
import FeatureDelivery from './pages/FeatureDelivery';
import FeatureAnalytics from './pages/FeatureAnalytics';
import FeatureCommunity from './pages/FeatureCommunity';
import FeatureLoyalty from './pages/FeatureLoyalty';
import IndGrocery from './pages/IndGrocery';
import IndElectronics from './pages/IndElectronics';
import IndApparel from './pages/IndApparel';
import IndHardware from './pages/IndHardware';
import IndPharmacy from './pages/IndPharmacy';
import IndFootwear from './pages/IndFootwear';
import IndSupermarket from './pages/IndSupermarket';
import IndMobile from './pages/IndMobile';
import IndFMCG from './pages/IndFMCG';
import IndStationery from './pages/IndStationery';
import LocPune from './pages/LocPune';
import LocMumbai from './pages/LocMumbai';
import LocDelhi from './pages/LocDelhi';
import LocBangalore from './pages/LocBangalore';
import LocHyderabad from './pages/LocHyderabad';
import LocAhmedabad from './pages/LocAhmedabad';
import LocChennai from './pages/LocChennai';
import LocKolkata from './pages/LocKolkata';
import LocJaipur from './pages/LocJaipur';
import LocIndore from './pages/LocIndore';
import CompVyapar from './pages/CompVyapar';
import CompKhatabook from './pages/CompKhatabook';
import CompTally from './pages/CompTally';
import CompMarg from './pages/CompMarg';
import CompMyBillBook from './pages/CompMyBillBook';
import CompZoho from './pages/CompZoho';
import About from './pages/About';
import ResBlog from './pages/ResBlog';
import ResCaseStudies from './pages/ResCaseStudies';
import ResHelp from './pages/ResHelp';
import ResAPI from './pages/ResAPI';
import ResHardware from './pages/ResHardware';
import ResOnboarding from './pages/ResOnboarding';
import ResUpdates from './pages/ResUpdates';
import ResWebinars from './pages/ResWebinars';
import LegalPrivacy from './pages/LegalPrivacy';
import LegalTerms from './pages/LegalTerms';
import LegalRefunds from './pages/LegalRefunds';
import LegalSecurity from './pages/LegalSecurity';
import LegalGDPR from './pages/LegalGDPR';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="contact" element={<Contact />} />
        <Route path="features/smart-pos" element={<FeaturePOS />} />
        <Route path="features/inventory" element={<FeatureInventory />} />
        <Route path="features/udhaar-ledger" element={<FeatureUdhaar />} />
        <Route path="features/marketplace" element={<FeatureMarketplace />} />
        <Route path="features/suppliers" element={<FeatureSuppliers />} />
        <Route path="features/delivery" element={<FeatureDelivery />} />
        <Route path="features/analytics" element={<FeatureAnalytics />} />
        <Route path="features/community" element={<FeatureCommunity />} />
        <Route path="features/loyalty" element={<FeatureLoyalty />} />
        <Route path="industries/grocery" element={<IndGrocery />} />
        <Route path="industries/electronics" element={<IndElectronics />} />
        <Route path="industries/apparel" element={<IndApparel />} />
        <Route path="industries/hardware" element={<IndHardware />} />
        <Route path="industries/pharmacy" element={<IndPharmacy />} />
        <Route path="industries/footwear" element={<IndFootwear />} />
        <Route path="industries/supermarket" element={<IndSupermarket />} />
        <Route path="industries/mobile-accessories" element={<IndMobile />} />
        <Route path="industries/fmcg-distributors" element={<IndFMCG />} />
        <Route path="industries/stationery" element={<IndStationery />} />
        <Route path="locations/pune" element={<LocPune />} />
        <Route path="locations/mumbai" element={<LocMumbai />} />
        <Route path="locations/delhi" element={<LocDelhi />} />
        <Route path="locations/bangalore" element={<LocBangalore />} />
        <Route path="locations/hyderabad" element={<LocHyderabad />} />
        <Route path="locations/ahmedabad" element={<LocAhmedabad />} />
        <Route path="locations/chennai" element={<LocChennai />} />
        <Route path="locations/kolkata" element={<LocKolkata />} />
        <Route path="locations/jaipur" element={<LocJaipur />} />
        <Route path="locations/indore" element={<LocIndore />} />
        <Route path="compare/vyapar" element={<CompVyapar />} />
        <Route path="compare/khatabook" element={<CompKhatabook />} />
        <Route path="compare/tally" element={<CompTally />} />
        <Route path="compare/marg" element={<CompMarg />} />
        <Route path="compare/mybillbook" element={<CompMyBillBook />} />
        <Route path="compare/zohobooks" element={<CompZoho />} />
        <Route path="about" element={<About />} />
        <Route path="resources/blog" element={<ResBlog />} />
        <Route path="resources/case-studies" element={<ResCaseStudies />} />
        <Route path="resources/help-center" element={<ResHelp />} />
        <Route path="resources/api" element={<ResAPI />} />
        <Route path="resources/hardware" element={<ResHardware />} />
        <Route path="resources/onboarding" element={<ResOnboarding />} />
        <Route path="resources/updates" element={<ResUpdates />} />
        <Route path="resources/webinars" element={<ResWebinars />} />
        <Route path="legal/privacy" element={<LegalPrivacy />} />
        <Route path="legal/terms" element={<LegalTerms />} />
        <Route path="legal/refunds" element={<LegalRefunds />} />
        <Route path="legal/security" element={<LegalSecurity />} />
        <Route path="legal/gdpr" element={<LegalGDPR />} />

        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="py-32 text-center bg-slate-50">
            <h1 className="text-6xl font-black text-gray-900 mb-6">404</h1>
            <p className="text-xl text-gray-500 font-medium">The page you are looking for does not exist.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}
