import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Auto-Generated Imports for 50+ Pages
import Home from './pages/home/index';
import Pricing from './pages/pricing/index';
import Contact from './pages/company/contact';
import FeaturePOS from './pages/features/smart-pos';
import FeatureInventory from './pages/features/inventory';
import FeatureUdhaar from './pages/features/udhaar-ledger';
import FeatureMarketplace from './pages/features/marketplace';
import FeatureSuppliers from './pages/features/suppliers';
import FeatureDelivery from './pages/features/delivery';
import FeatureAnalytics from './pages/features/analytics';
import FeatureCommunity from './pages/features/community';
import FeatureLoyalty from './pages/features/loyalty';
import IndGrocery from './pages/industries/grocery';
import IndElectronics from './pages/industries/electronics';
import IndApparel from './pages/industries/apparel';
import IndHardware from './pages/industries/hardware';
import IndPharmacy from './pages/industries/pharmacy';
import IndFootwear from './pages/industries/footwear';
import IndSupermarket from './pages/industries/supermarket';
import IndMobile from './pages/industries/mobile-accessories';
import IndFMCG from './pages/industries/fmcg-distributors';
import IndStationery from './pages/industries/stationery';
import LocPune from './pages/locations/pune';
import LocMumbai from './pages/locations/mumbai';
import LocDelhi from './pages/locations/delhi';
import LocBangalore from './pages/locations/bangalore';
import LocHyderabad from './pages/locations/hyderabad';
import LocAhmedabad from './pages/locations/ahmedabad';
import LocChennai from './pages/locations/chennai';
import LocKolkata from './pages/locations/kolkata';
import LocJaipur from './pages/locations/jaipur';
import LocIndore from './pages/locations/indore';
import CompVyapar from './pages/compare/vyapar';
import CompKhatabook from './pages/compare/khatabook';
import CompTally from './pages/compare/tally';
import CompMarg from './pages/compare/marg';
import CompMyBillBook from './pages/compare/mybillbook';
import CompZoho from './pages/compare/zohobooks';
import About from './pages/company/about';
import ResBlog from './pages/resources/blog';
import ResCaseStudies from './pages/resources/case-studies';
import ResHelp from './pages/resources/help-center';
import ResAPI from './pages/resources/api';
import ResHardware from './pages/resources/hardware';
import ResOnboarding from './pages/resources/onboarding';
import ResUpdates from './pages/resources/updates';
import ResWebinars from './pages/resources/webinars';
import LegalPrivacy from './pages/legal/privacy';
import LegalTerms from './pages/legal/terms';
import LegalRefunds from './pages/legal/refunds';
import LegalSecurity from './pages/legal/security';
import LegalGDPR from './pages/legal/gdpr';


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
