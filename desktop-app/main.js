const { app, BrowserWindow, Menu } = require("electron");

const APP_URL = "https://puc-v2.darshansathish341.workers.dev";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    icon: __dirname + "/icon.png",
    title: "CLICK — click, learn, practice",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  win.loadURL(APP_URL);

  // If the student has no internet on launch, show a friendly retry page
  // instead of Electron's default blank error screen.
  win.webContents.on("did-fail-load", () => {
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(`
        <html><body style="font-family:sans-serif;text-align:center;padding-top:15vh;background:#1a0e2e;color:#f3edff">
          <h2>Can't reach CLICK</h2>
          <p>Check your internet connection, then try again.</p>
          <button onclick="location.reload()" style="padding:10px 20px;font-size:14px;cursor:pointer">Retry</button>
        </body></html>
      `)
    );
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
