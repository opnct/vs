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

// New Advanced India-Specific Feature Imports
import FeatureOCRInwardBilling from './pages/features/ocr-inward-billing';
import FeatureUPIReconciliation from './pages/features/upi-reconciliation-engine';
import FeatureDigitalGold from './pages/features/digital-gold-change';
import FeatureOfflineMeshSync from './pages/features/offline-mesh-sync';
import FeatureKiranaBrand from './pages/features/kirana-brand-monetization';
import FeatureOmnichannel from './pages/features/omnichannel-qcom-bridge';
import FeatureCashDenomination from './pages/features/cash-denomination-tracker';
import FeatureLocalDelivery from './pages/features/local-delivery-pooling';
import FeatureKhataCredit from './pages/features/khata-credit-scoring';
import FeatureAutoGST from './pages/features/auto-gst-categorization';
import FeatureLoyaltyGamification from './pages/features/loyalty-gamification-whatsapp';
import FeatureMandiRate from './pages/features/mandi-rate-tracker';
import FeatureFMCGScheme from './pages/features/fmcg-scheme-tracker';
import FeaturePowerOutage from './pages/features/power-outage-mode';
import FeatureLooseItem from './pages/features/loose-item-cataloging';
import FeatureStoreHealth from './pages/features/store-health-dashboard';
import FeatureMultiLingualReceipts from './pages/features/multi-lingual-receipts';
import FeatureAICCTV from './pages/features/ai-cctv-integration';
import FeatureCommunityPrice from './pages/features/community-price-index';
import FeatureDirectFarmer from './pages/features/direct-to-farmer-sourcing';
import FeatureStaffVernacular from './pages/features/staff-vernacular-training';
import FeatureAutoLicense from './pages/features/automated-license-renewal';
import FeatureHyperlocalAds from './pages/features/hyperlocal-ads-manager';
import FeatureUdhaarBarter from './pages/features/udhaar-barter-system';
import FeatureWhatsappChatbot from './pages/features/whatsapp-chatbot-ordering';
import FeatureSmartReturn from './pages/features/smart-return-management';
import FeatureDailyWage from './pages/features/daily-wage-chhotu-manager';
import FeatureRegionalFestival from './pages/features/regional-festival-promos';
import FeatureCustomerFace from './pages/features/customer-face-recognition';
import FeatureSmartWeighing from './pages/features/smart-weighing-iot';
import FeatureSupplierPayment from './pages/features/supplier-payment-scheduler';
import FeatureCustomerDietary from './pages/features/customer-dietary-alerts';
import FeaturePlasticWaste from './pages/features/plastic-waste-tracker';
import FeatureHardwareRental from './pages/features/hardware-rental-portal';
import FeatureWholesaleSplit from './pages/features/wholesale-split-billing';
import FeatureB2BTax from './pages/features/b2b-tax-credit-optimizer';
import FeatureSeasonalDeadStock from './pages/features/seasonal-dead-stock-alerts';
import FeatureQRAudio from './pages/features/qr-audio-box-integration';
import FeatureSMSMarketing from './pages/features/sms-marketing-engine';
import FeatureShopAct from './pages/features/shop-act-compliance-vault';
import FeatureDistributorRoute from './pages/features/distributor-route-planner';
import FeatureCounterQueue from './pages/features/counter-queue-manager';
import FeaturePackagingCost from './pages/features/packaging-cost-calculator';
import FeatureMicroInsurance from './pages/features/micro-insurance-portal';
import FeatureAIStockPredictor from './pages/features/ai-stock-predictor';
import FeatureSmartShelfMapping from './pages/features/smart-shelf-mapping';
import FeatureVoiceBillingEngine from './pages/features/voice-billing-engine';
import FeatureWhatsappCatalogs from './pages/features/whatsapp-catalogs';
import FeatureDynamicPricingEngine from './pages/features/dynamic-pricing-engine';
import FeatureSupplierBiddingHub from './pages/features/supplier-bidding-hub';
import FeatureStaffFraudDetector from './pages/features/staff-fraud-detector';
import FeatureMicroLendingConnect from './pages/features/micro-lending-connect';
import FeatureCommunityGroupBuy from './pages/features/community-group-buy';
import FeatureExpiryLiquidationNetwork from './pages/features/expiry-liquidation-network';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="contact" element={<Contact />} />
        
        {/* Core Features */}
        <Route path="features/smart-pos" element={<FeaturePOS />} />
        <Route path="features/inventory" element={<FeatureInventory />} />
        <Route path="features/udhaar-ledger" element={<FeatureUdhaar />} />
        <Route path="features/marketplace" element={<FeatureMarketplace />} />
        <Route path="features/suppliers" element={<FeatureSuppliers />} />
        <Route path="features/delivery" element={<FeatureDelivery />} />
        <Route path="features/analytics" element={<FeatureAnalytics />} />
        <Route path="features/community" element={<FeatureCommunity />} />
        <Route path="features/loyalty" element={<FeatureLoyalty />} />

        {/* New Advanced India-Specific Features */}
        <Route path="features/ocr-inward-billing" element={<FeatureOCRInwardBilling />} />
        <Route path="features/upi-reconciliation-engine" element={<FeatureUPIReconciliation />} />
        <Route path="features/digital-gold-change" element={<FeatureDigitalGold />} />
        <Route path="features/offline-mesh-sync" element={<FeatureOfflineMeshSync />} />
        <Route path="features/kirana-brand-monetization" element={<FeatureKiranaBrand />} />
        <Route path="features/omnichannel-qcom-bridge" element={<FeatureOmnichannel />} />
        <Route path="features/cash-denomination-tracker" element={<FeatureCashDenomination />} />
        <Route path="features/local-delivery-pooling" element={<FeatureLocalDelivery />} />
        <Route path="features/khata-credit-scoring" element={<FeatureKhataCredit />} />
        <Route path="features/auto-gst-categorization" element={<FeatureAutoGST />} />
        <Route path="features/loyalty-gamification-whatsapp" element={<FeatureLoyaltyGamification />} />
        <Route path="features/mandi-rate-tracker" element={<FeatureMandiRate />} />
        <Route path="features/fmcg-scheme-tracker" element={<FeatureFMCGScheme />} />
        <Route path="features/power-outage-mode" element={<FeaturePowerOutage />} />
        <Route path="features/loose-item-cataloging" element={<FeatureLooseItem />} />
        <Route path="features/store-health-dashboard" element={<FeatureStoreHealth />} />
        <Route path="features/multi-lingual-receipts" element={<FeatureMultiLingualReceipts />} />
        <Route path="features/ai-cctv-integration" element={<FeatureAICCTV />} />
        <Route path="features/community-price-index" element={<FeatureCommunityPrice />} />
        <Route path="features/direct-to-farmer-sourcing" element={<FeatureDirectFarmer />} />
        <Route path="features/staff-vernacular-training" element={<FeatureStaffVernacular />} />
        <Route path="features/automated-license-renewal" element={<FeatureAutoLicense />} />
        <Route path="features/hyperlocal-ads-manager" element={<FeatureHyperlocalAds />} />
        <Route path="features/udhaar-barter-system" element={<FeatureUdhaarBarter />} />
        <Route path="features/whatsapp-chatbot-ordering" element={<FeatureWhatsappChatbot />} />
        <Route path="features/smart-return-management" element={<FeatureSmartReturn />} />
        <Route path="features/daily-wage-chhotu-manager" element={<FeatureDailyWage />} />
        <Route path="features/regional-festival-promos" element={<FeatureRegionalFestival />} />
        <Route path="features/customer-face-recognition" element={<FeatureCustomerFace />} />
        <Route path="features/smart-weighing-iot" element={<FeatureSmartWeighing />} />
        <Route path="features/supplier-payment-scheduler" element={<FeatureSupplierPayment />} />
        <Route path="features/customer-dietary-alerts" element={<FeatureCustomerDietary />} />
        <Route path="features/plastic-waste-tracker" element={<FeaturePlasticWaste />} />
        <Route path="features/hardware-rental-portal" element={<FeatureHardwareRental />} />
        <Route path="features/wholesale-split-billing" element={<FeatureWholesaleSplit />} />
        <Route path="features/b2b-tax-credit-optimizer" element={<FeatureB2BTax />} />
        <Route path="features/seasonal-dead-stock-alerts" element={<FeatureSeasonalDeadStock />} />
        <Route path="features/qr-audio-box-integration" element={<FeatureQRAudio />} />
        <Route path="features/sms-marketing-engine" element={<FeatureSMSMarketing />} />
        <Route path="features/shop-act-compliance-vault" element={<FeatureShopAct />} />
        <Route path="features/distributor-route-planner" element={<FeatureDistributorRoute />} />
        <Route path="features/counter-queue-manager" element={<FeatureCounterQueue />} />
        <Route path="features/packaging-cost-calculator" element={<FeaturePackagingCost />} />
        <Route path="features/micro-insurance-portal" element={<FeatureMicroInsurance />} />
        <Route path="features/ai-stock-predictor" element={<FeatureAIStockPredictor />} />
        <Route path="features/smart-shelf-mapping" element={<FeatureSmartShelfMapping />} />
        <Route path="features/voice-billing-engine" element={<FeatureVoiceBillingEngine />} />
        <Route path="features/whatsapp-catalogs" element={<FeatureWhatsappCatalogs />} />
        <Route path="features/dynamic-pricing-engine" element={<FeatureDynamicPricingEngine />} />
        <Route path="features/supplier-bidding-hub" element={<FeatureSupplierBiddingHub />} />
        <Route path="features/staff-fraud-detector" element={<FeatureStaffFraudDetector />} />
        <Route path="features/micro-lending-connect" element={<FeatureMicroLendingConnect />} />
        <Route path="features/community-group-buy" element={<FeatureCommunityGroupBuy />} />
        <Route path="features/expiry-liquidation-network" element={<FeatureExpiryLiquidationNetwork />} />

        {/* Industries */}
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
        
        {/* Locations */}
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
        
        {/* Compare */}
        <Route path="compare/vyapar" element={<CompVyapar />} />
        <Route path="compare/khatabook" element={<CompKhatabook />} />
        <Route path="compare/tally" element={<CompTally />} />
        <Route path="compare/marg" element={<CompMarg />} />
        <Route path="compare/mybillbook" element={<CompMyBillBook />} />
        <Route path="compare/zohobooks" element={<CompZoho />} />
        
        {/* Company & Resources */}
        <Route path="about" element={<About />} />
        <Route path="resources/blog" element={<ResBlog />} />
        <Route path="resources/case-studies" element={<ResCaseStudies />} />
        <Route path="resources/help-center" element={<ResHelp />} />
        <Route path="resources/api" element={<ResAPI />} />
        <Route path="resources/hardware" element={<ResHardware />} />
        <Route path="resources/onboarding" element={<ResOnboarding />} />
        <Route path="resources/updates" element={<ResUpdates />} />
        <Route path="resources/webinars" element={<ResWebinars />} />
        
        {/* Legal */}
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