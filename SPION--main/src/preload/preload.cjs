const { contextBridge, ipcRenderer } = require('electron')

const api = {

  // =================================================
  // DEVICE
  // =================================================

  lockDevice: () =>
    ipcRenderer.invoke(
      'spion:lock-device'
    ),

  // =================================================
  // GEOLOCATION
  // =================================================

  getLocation: () =>
    ipcRenderer.invoke(
      'spion:get-location'
    ),

  // =================================================
  // SYSTEM
  // =================================================

  platform:
    process.platform,

  versions: {

    node:
      process.versions.node,

    chrome:
      process.versions.chrome,

    electron:
      process.versions.electron

  }

}

contextBridge.exposeInMainWorld(
  'spion',
  api
)