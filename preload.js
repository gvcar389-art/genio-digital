// ============================
// PRELOAD - Segurança
// ============================

const { contextBridge, ipcRenderer } = require('electron');

// Expor funções seguras para o frontend
contextBridge.exposeInMainWorld('electronAPI', {
    // Funções que podem ser chamadas do frontend
    send: (channel, data) => {
        const validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        const validChannels = ['fromMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

console.log('🧞 Preload carregado!');