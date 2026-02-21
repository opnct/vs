import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/index';
import Chatbot from './pages/chatbot/index';

// FEATURE IMPORTS
import FeatureAiStockPredictor from './pages/features/ai-stock-predictor';
import FeatureSmartShelfMapping from './pages/features/smart-shelf-mapping';
import FeatureVoiceBillingEngine from './pages/features/voice-billing-engine';
import FeatureWhatsappCatalogs from './pages/features/whatsapp-catalogs';
import FeatureDynamicPricingEngine from './pages/features/dynamic-pricing-engine';
import FeatureSupplierBiddingHub from './pages/features/supplier-bidding-hub';
import FeatureStaffFraudDetector from './pages/features/staff-fraud-detector';
import FeatureMicroLendingConnect from './pages/features/micro-lending-connect';
import FeatureCommunityGroupBuy from './pages/features/community-group-buy';
import FeatureExpiryLiquidationNetwork from './pages/features/expiry-liquidation-network';
import FeatureOcrInwardBilling from './pages/features/ocr-inward-billing';
import FeatureUpiReconciliationEngine from './pages/features/upi-reconciliation-engine';
import FeatureDigitalGoldChange from './pages/features/digital-gold-change';
import FeatureOfflineMeshSync from './pages/features/offline-mesh-sync';
import FeatureKiranaBrandMonetization from './pages/features/kirana-brand-monetization';
import FeatureOmnichannelQcomBridge from './pages/features/omnichannel-qcom-bridge';
import FeatureCashDenominationTracker from './pages/features/cash-denomination-tracker';
import FeatureLocalDeliveryPooling from './pages/features/local-delivery-pooling';
import FeatureKhataCreditScoring from './pages/features/khata-credit-scoring';
import FeatureAutoGstCategorization from './pages/features/auto-gst-categorization';
import FeatureLoyaltyGamificationWhatsapp from './pages/features/loyalty-gamification-whatsapp';
import FeatureMandiRateTracker from './pages/features/mandi-rate-tracker';
import FeatureFmcgSchemeTracker from './pages/features/fmcg-scheme-tracker';
import FeaturePowerOutageMode from './pages/features/power-outage-mode';
import FeatureLooseItemCataloging from './pages/features/loose-item-cataloging';
import FeatureStoreHealthDashboard from './pages/features/store-health-dashboard';
import FeatureMultiLingualReceipts from './pages/features/multi-lingual-receipts';
import FeatureAiCctvIntegration from './pages/features/ai-cctv-integration';
import FeatureCommunityPriceIndex from './pages/features/community-price-index';
import FeatureDirectToFarmerSourcing from './pages/features/direct-to-farmer-sourcing';
import FeatureStaffVernacularTraining from './pages/features/staff-vernacular-training';
import FeatureAutomatedLicenseRenewal from './pages/features/automated-license-renewal';
import FeatureHyperlocalAdsManager from './pages/features/hyperlocal-ads-manager';
import FeatureUdhaarBarterSystem from './pages/features/udhaar-barter-system';
import FeatureWhatsappChatbotOrdering from './pages/features/whatsapp-chatbot-ordering';
import FeatureSmartReturnManagement from './pages/features/smart-return-management';
import FeatureDailyWageChhotuManager from './pages/features/daily-wage-chhotu-manager';
import FeatureRegionalFestivalPromos from './pages/features/regional-festival-promos';
import FeatureCustomerFaceRecognition from './pages/features/customer-face-recognition';
import FeatureSmartWeighingIot from './pages/features/smart-weighing-iot';
import FeatureSupplierPaymentScheduler from './pages/features/supplier-payment-scheduler';
import FeatureCustomerDietaryAlerts from './pages/features/customer-dietary-alerts';
import FeaturePlasticWasteTracker from './pages/features/plastic-waste-tracker';
import FeatureHardwareRentalPortal from './pages/features/hardware-rental-portal';
import FeatureWholesaleSplitBilling from './pages/features/wholesale-split-billing';
import FeatureB2bTaxCreditOptimizer from './pages/features/b2b-tax-credit-optimizer';
import FeatureSeasonalDeadStockAlerts from './pages/features/seasonal-dead-stock-alerts';
import FeatureQrAudioBoxIntegration from './pages/features/qr-audio-box-integration';
import FeatureSmsMarketingEngine from './pages/features/sms-marketing-engine';
import FeatureShopActComplianceVault from './pages/features/shop-act-compliance-vault';
import FeatureDistributorRoutePlanner from './pages/features/distributor-route-planner';
import FeatureCounterQueueManager from './pages/features/counter-queue-manager';
import FeaturePackagingCostCalculator from './pages/features/packaging-cost-calculator';
import FeatureMicroInsurancePortal from './pages/features/micro-insurance-portal';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/features/ai-stock-predictor" element={<FeatureAiStockPredictor />} />
      <Route path="/features/smart-shelf-mapping" element={<FeatureSmartShelfMapping />} />
      <Route path="/features/voice-billing-engine" element={<FeatureVoiceBillingEngine />} />
      <Route path="/features/whatsapp-catalogs" element={<FeatureWhatsappCatalogs />} />
      <Route path="/features/dynamic-pricing-engine" element={<FeatureDynamicPricingEngine />} />
      <Route path="/features/supplier-bidding-hub" element={<FeatureSupplierBiddingHub />} />
      <Route path="/features/staff-fraud-detector" element={<FeatureStaffFraudDetector />} />
      <Route path="/features/micro-lending-connect" element={<FeatureMicroLendingConnect />} />
      <Route path="/features/community-group-buy" element={<FeatureCommunityGroupBuy />} />
      <Route path="/features/expiry-liquidation-network" element={<FeatureExpiryLiquidationNetwork />} />
      <Route path="/features/ocr-inward-billing" element={<FeatureOcrInwardBilling />} />
      <Route path="/features/upi-reconciliation-engine" element={<FeatureUpiReconciliationEngine />} />
      <Route path="/features/digital-gold-change" element={<FeatureDigitalGoldChange />} />
      <Route path="/features/offline-mesh-sync" element={<FeatureOfflineMeshSync />} />
      <Route path="/features/kirana-brand-monetization" element={<FeatureKiranaBrandMonetization />} />
      <Route path="/features/omnichannel-qcom-bridge" element={<FeatureOmnichannelQcomBridge />} />
      <Route path="/features/cash-denomination-tracker" element={<FeatureCashDenominationTracker />} />
      <Route path="/features/local-delivery-pooling" element={<FeatureLocalDeliveryPooling />} />
      <Route path="/features/khata-credit-scoring" element={<FeatureKhataCreditScoring />} />
      <Route path="/features/auto-gst-categorization" element={<FeatureAutoGstCategorization />} />
      <Route path="/features/loyalty-gamification-whatsapp" element={<FeatureLoyaltyGamificationWhatsapp />} />
      <Route path="/features/mandi-rate-tracker" element={<FeatureMandiRateTracker />} />
      <Route path="/features/fmcg-scheme-tracker" element={<FeatureFmcgSchemeTracker />} />
      <Route path="/features/power-outage-mode" element={<FeaturePowerOutageMode />} />
      <Route path="/features/loose-item-cataloging" element={<FeatureLooseItemCataloging />} />
      <Route path="/features/store-health-dashboard" element={<FeatureStoreHealthDashboard />} />
      <Route path="/features/multi-lingual-receipts" element={<FeatureMultiLingualReceipts />} />
      <Route path="/features/ai-cctv-integration" element={<FeatureAiCctvIntegration />} />
      <Route path="/features/community-price-index" element={<FeatureCommunityPriceIndex />} />
      <Route path="/features/direct-to-farmer-sourcing" element={<FeatureDirectToFarmerSourcing />} />
      <Route path="/features/staff-vernacular-training" element={<FeatureStaffVernacularTraining />} />
      <Route path="/features/automated-license-renewal" element={<FeatureAutomatedLicenseRenewal />} />
      <Route path="/features/hyperlocal-ads-manager" element={<FeatureHyperlocalAdsManager />} />
      <Route path="/features/udhaar-barter-system" element={<FeatureUdhaarBarterSystem />} />
      <Route path="/features/whatsapp-chatbot-ordering" element={<FeatureWhatsappChatbotOrdering />} />
      <Route path="/features/smart-return-management" element={<FeatureSmartReturnManagement />} />
      <Route path="/features/daily-wage-chhotu-manager" element={<FeatureDailyWageChhotuManager />} />
      <Route path="/features/regional-festival-promos" element={<FeatureRegionalFestivalPromos />} />
      <Route path="/features/customer-face-recognition" element={<FeatureCustomerFaceRecognition />} />
      <Route path="/features/smart-weighing-iot" element={<FeatureSmartWeighingIot />} />
      <Route path="/features/supplier-payment-scheduler" element={<FeatureSupplierPaymentScheduler />} />
      <Route path="/features/customer-dietary-alerts" element={<FeatureCustomerDietaryAlerts />} />
      <Route path="/features/plastic-waste-tracker" element={<FeaturePlasticWasteTracker />} />
      <Route path="/features/hardware-rental-portal" element={<FeatureHardwareRentalPortal />} />
      <Route path="/features/wholesale-split-billing" element={<FeatureWholesaleSplitBilling />} />
      <Route path="/features/b2b-tax-credit-optimizer" element={<FeatureB2bTaxCreditOptimizer />} />
      <Route path="/features/seasonal-dead-stock-alerts" element={<FeatureSeasonalDeadStockAlerts />} />
      <Route path="/features/qr-audio-box-integration" element={<FeatureQrAudioBoxIntegration />} />
      <Route path="/features/sms-marketing-engine" element={<FeatureSmsMarketingEngine />} />
      <Route path="/features/shop-act-compliance-vault" element={<FeatureShopActComplianceVault />} />
      <Route path="/features/distributor-route-planner" element={<FeatureDistributorRoutePlanner />} />
      <Route path="/features/counter-queue-manager" element={<FeatureCounterQueueManager />} />
      <Route path="/features/packaging-cost-calculator" element={<FeaturePackagingCostCalculator />} />
      <Route path="/features/micro-insurance-portal" element={<FeatureMicroInsurancePortal />} />
    </Routes>
  );
}
