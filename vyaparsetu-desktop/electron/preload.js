const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the React frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Acts identically to Tauri's invoke command
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
});