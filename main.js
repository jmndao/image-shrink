const { app, BrowserWindow, Menu, globalShortcut } = require("electron");

// Set env
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
// Check platform
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Image Shrink",
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white'
    });

    mainWindow.loadFile("./app/index.html");
};

const menu = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
        label: "File",
        submenu: [{
            label: "Quit",
            accelerator: "CmdOrCtrl+W",
            click: () => app.quit(),
        }, ],
    },
];

app.on("ready", () => {
    createMainWindow();

    // Setting up Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //Register global Shortcuts
    globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
    globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
        mainWindow.toggleDevTools()
    );

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