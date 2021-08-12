const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const imagemin = require("imagemin");
const imageminMozJPEG = require("imagemin-mozjpeg");
const imageminPNGQuant = require("imagemin-pngquant");
const slash = require("slash")

// Set env
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
// Check platform
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Image Shrink",
        width: isDev ? 800 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile("./app/index.html");
};
const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        title: "About Image Shrink",
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false,
        backgroundColor: 'white'
    });

    aboutWindow.loadFile("./app/about.html");
};

const menu = [
    ...(isMac ? [{ label: app.name, submenu: [{ label: 'About', click: createAboutWindow }] }] : []),
    ...(!isMac ? [{ label: 'Help', submenu: [{ label: 'About', click: createAboutWindow }] }] : []),
    {
        role: 'fileMenu',
    },
    ...(isDev ? [{
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'separator' },
            { role: 'toggledevtools' },
        ]
    }] : []),
];

// Get the data
ipcMain.on('image:minimize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageshrink');
    shrinkImage(options);
});

// 
async function shrinkImage({ imgPath, quality, dest }) {
    try {
        const pngQuality = quality / 100;
        const files = await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imageminMozJPEG({ quality }),
                imageminPNGQuant({
                    quality: [pngQuality, pngQuality]
                })
            ]
        });

        shell.openPath(dest);

        mainWindow.webContents.send('image:done');

    } catch (err) {
        console.log(err);
    }
}

app.on("ready", () => {
    createMainWindow();

    // Setting up Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on("closed", () => (mainWindow = null));
});

app.on("window-all-closed", () => {
    if (!isMac) {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});