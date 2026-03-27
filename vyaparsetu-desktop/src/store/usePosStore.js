import { create } from 'zustand';

export const usePosStore = create((set, get) => ({
  // Core State
  cart: [],
  holdQueue: [],
  paymentMode: 'CASH',
  splitPayments: [],
  customerId: null,

  // --- CART MUTATIONS ---
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      return {
        cart: state.cart.map(item =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      };
    }
    
    // Map the strict SQLite product structure into a fluid Cart Item
    return {
      cart: [...state.cart, {
        productId: product.id,
        name: product.name,
        price: product.selling_price,
        qty: 1,
        discountPercent: 0,
        cgstPercent: product.tax_rate ? product.tax_rate / 2 : 2.5,
        sgstPercent: product.tax_rate ? product.tax_rate / 2 : 2.5,
        isTaxInclusive: false, // Core feature for Indian Kirana mapping
        hsn: product.hsn_code || "N/A"
      }]
    };
  }),

  updateItem: (productId, field, value) => set((state) => ({
    cart: state.cart.map(item =>
      item.productId === productId ? { ...item, [field]: value } : item
    )
  })),

  removeItem: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.productId !== productId)
  })),

  clearCart: () => set({ 
    cart: [], 
    customerId: null, 
    splitPayments: [], 
    paymentMode: 'CASH' 
  }),

  // --- CHECKOUT & CUSTOMER STATE ---
  setCustomer: (id) => set({ customerId: id }),
  setPaymentMode: (mode) => set({ paymentMode: mode }),
  
  addSplitPayment: (payment) => set((state) => ({ 
    splitPayments: [...state.splitPayments, payment] 
  })),
  
  removeSplitPayment: (index) => set((state) => ({ 
    splitPayments: state.splitPayments.filter((_, i) => i !== index) 
  })),

  // --- PARK/HOLD BILL LOGIC ---
  holdCurrentBill: () => set((state) => {
    if (state.cart.length === 0) return state;
    
    const newHold = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      cart: state.cart,
      customerId: state.customerId
    };
    
    return {
      holdQueue: [...state.holdQueue, newHold],
      cart: [],
      customerId: null,
      splitPayments: [],
      paymentMode: 'CASH'
    };
  }),

  resumeBill: (holdId) => set((state) => {
    const billToResume = state.holdQueue.find(b => b.id === holdId);
    if (!billToResume) return state;
    
    // If the cashier was currently ringing up a bill, park it automatically
    let newHoldQueue = state.holdQueue.filter(b => b.id !== holdId);
    if (state.cart.length > 0) {
      newHoldQueue.push({
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        cart: state.cart,
        customerId: state.customerId
      });
    }
    
    return {
      cart: billToResume.cart,
      customerId: billToResume.customerId,
      holdQueue: newHoldQueue,
      splitPayments: [],
      paymentMode: 'CASH'
    };
  }),

  // --- REAL-TIME FINANCIAL ENGINE ---
  getTotals: () => {
    const cart = get().cart;
    
    return cart.reduce((acc, item) => {
      const combinedTaxRate = item.cgstPercent + item.sgstPercent;
      const baseAmount = item.qty * item.price;
      const discountAmount = baseAmount * (item.discountPercent / 100.0);
      const amountAfterDiscount = baseAmount - discountAmount;

      let taxableValue, taxAmount;

      // Heavy Lifting: Handles Inclusive vs Exclusive GST natively on the frontend
      if (item.isTaxInclusive) {
        taxableValue = amountAfterDiscount / (1.0 + (combinedTaxRate / 100.0));
        taxAmount = amountAfterDiscount - taxableValue;
      } else {
        taxableValue = amountAfterDiscount;
        taxAmount = taxableValue * (combinedTaxRate / 100.0);
      }

      acc.subtotal += baseAmount;
      acc.totalDiscount += discountAmount;
      acc.totalTax += taxAmount;
      acc.grandTotal += (taxableValue + taxAmount);
      
      return acc;
    }, { subtotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0 });
  }
}));