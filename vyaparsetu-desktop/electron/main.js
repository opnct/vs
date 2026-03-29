import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSchema } from './db/schema.js';

// Import Command Modules
import * as inventoryCmd from './commands/inventoryCmd.js';
import * as khataCmd from './commands/khataCmd.js';
import * as billingCmd from './commands/billingCmd.js';
import * as dashboardCmd from './commands/dashboardCmd.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "VyaparSetu POS",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // In development, load from the Vite dev server. In production, load the built static files.
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Uncomment to debug
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Boot Sequence
app.whenReady().then(() => {
  // Initialize the SQLite Database Schema
  initSchema();

  // Register IPC Endpoints (The Bridge between React and SQLite)
  
  // --- INVENTORY ---
  ipcMain.handle('get_all_products', () => inventoryCmd.getAllProducts());
  ipcMain.handle('create_product', (_, args) => inventoryCmd.createProduct(args.p));
  
  // --- KHATA ---
  ipcMain.handle('get_all_customers', () => khataCmd.getAllCustomers());
  ipcMain.handle('create_customer', (_, args) => khataCmd.createCustomer(args.c));
  ipcMain.handle('get_customer_ledger', (_, args) => khataCmd.getCustomerLedger(args.customerId));
  ipcMain.handle('log_payment', (_, args) => khataCmd.logKhataPayment(args.p));

  // --- BILLING ---
  ipcMain.handle('cmd_process_checkout', (_, args) => billingCmd.processCheckout(args.payload));

  // --- DASHBOARD ---
  ipcMain.handle('get_daily_stats', () => dashboardCmd.getDailyStats());
  ipcMain.handle('get_recent_invoices', (_, args) => dashboardCmd.getRecentInvoices(args?.limit || 10));

  // --- SETTINGS / MISC (Stubs for future expansion) ---
  ipcMain.handle('start_cloud_sync', (_, args) => { console.log(`Sync started for ${args.uid}`); return true; });
  ipcMain.handle('verify_staff_pin', (_, args) => {
     // Basic hardcoded check for the moment. Wire to DB `users` table as needed.
     if(args.pin === '1234') return { id: 'master', username: 'Admin', role: 'OWNER', permissions: ['ALL'] };
     return null;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});