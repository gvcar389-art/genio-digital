// ============================
// GÊNIO DIGITAL - APP DESKTOP
// ============================

const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

// Criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        titleBarStyle: 'default',
        backgroundColor: '#0d1117',
        show: false
    });

    // Carregar o index.html
    mainWindow.loadFile('index.html');

    // Quando a janela estiver pronta
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Fechar aplicativo quando todas as janelas forem fechadas
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Menu personalizado
    const menu = Menu.buildFromTemplate([
        {
            label: 'Gênio Digital',
            submenu: [
                { label: 'Sobre', click: () => showAbout() },
                { type: 'separator' },
                { label: 'Sair', role: 'quit' }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Copiar', role: 'copy' },
                { label: 'Colar', role: 'paste' },
                { label: 'Selecionar Tudo', role: 'selectAll' }
            ]
        },
        {
            label: 'Exibir',
            submenu: [
                { label: 'Recarregar', role: 'reload' },
                { label: 'Ferramentas do Desenvolvedor', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Tela Cheia', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                { label: 'Comandos', click: () => showCommands() },
                { label: 'Site do Gênio', click: () => openWebsite() }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);

    // Criar ícone na bandeja (sistema)
    createTray();
}

// Criar ícone na bandeja
function createTray() {
    // Se já existir, remover
    if (tray) {
        tray.destroy();
        tray = null;
    }

    // Verificar se o ícone existe
    const iconPath = path.join(__dirname, 'icon.png');
    let icon = null;
    
    try {
        if (fs.existsSync(iconPath)) {
            icon = nativeImage.createFromPath(iconPath);
            icon = icon.resize({ width: 16, height: 16 });
        }
    } catch (error) {
        console.log('Ícone não encontrado, usando padrão');
    }

    // Se não tiver ícone, criar um simples
    if (!icon) {
        icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAm5JREFUOI2dU0toE1EY/ObN7r77zM+KRQRDoVsRlUKhVlDwoGcRoWAPHmrxoB70oB4FFRRUFKFYUFzRbqUKPigKipSIBS1EtZCmiG2JbWqSNs1mN2+92WT3I2mbUPCgk2GYYYBvGL7Dh3F8IUSIGLZt/0dM0zRzDMOQwzDEsCwbiqKKjY2kRirFsThW+EQECR5sLQNtGygMA+iz09A8L/YnQRBMpguFdCgEAfZ2dcFcXQHMsTtyI7LdUqafAK3r+sWWlpZbfDd7Nc/zQrFY/Kdp2lds23aT2+xeLpcPBoYGrwGpRAKkvR0A8Iel8MvmZiAI8A4EdCWuFQLiAsC2CCRMAyS5rphZqQ0GN3BMaWpG/dsy4YnuD6Y79iF6JZ7OUYDMCZdc9h90qkwXLS8EA00VvH/8hOv+9gAG11vw+uNF8ixxwN9QJ1YlRc5KsvLKp8ILVZYN3T5hP7rbghoZRX/3eMjMSczRIq+mmoHS+1H8/ZePbcMpACyAWBJBOvUEaJ2HrLfA+3VvYte/ODpl9+3B8NGRTE1N3t+9Z89rVeWgUEjP0jZ3PXp8h2U56+lL/0f39nH3iBHp8OYOvm9UIy8rCKMaGM7kRrw7mzkr4N7L6ziW2pWOhEB4eLhIJ7r3uD8AcuE05qoxDFTGAKwpQlTRBEAi6zL7Gz2P0+wUzBm2aSKIRd4a6q6U/qpJ/fYx3FAAEoX+4xDAs5g8A8MwIkkkklRgWN3Wr7Xr0Tc56aUlA+OGAcDmuJ6UZQFS21ZShCAIu2fA8CNJkjjDwGsib2KzuR34D3p8FrPT/El2AAAAAElFTkSuQmCC');
    }

    tray = new Tray(icon);
    tray.setToolTip('🧞 Gênio Digital');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir Gênio Digital', click: () => { mainWindow.show(); } },
        { type: 'separator' },
        { label: 'Sair', click: () => { app.quit(); } }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

// Funções auxiliares
function showAbout() {
    mainWindow.webContents.executeJavaScript(`
        addMessage('🧞 **Gênio Digital 2.0**\\n\\nVersão: 2.0\\nCriado com 💖\\nTecnologias: HTML, CSS, JavaScript, Electron', 'bot');
    `);
}

function showCommands() {
    mainWindow.webContents.executeJavaScript(`
        userInput.value = 'ajuda';
        sendBtn.click();
    `);
}

function openWebsite() {
    const { shell } = require('electron');
    shell.openExternal('https://github.com/seu-usuario/genio-digital');
}

// Iniciar o app
app.whenReady().then(() => {
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

// Prevenir múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

console.log('🧞 Gênio Digital 2.0 - App Desktop Iniciado!');