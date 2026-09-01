
import {
  app,
  shell,
  BrowserWindow,
  ipcMain
} from 'electron'

import { join } from 'path'
import { fileURLToPath } from 'url'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const __dirname =
  fileURLToPath(
    new URL('.', import.meta.url)
  )

const isMac =
  process.platform === 'darwin'

let mainWindow = null
let tray = null

// =====================================================
// WIFI LOCATION
// =====================================================

async function getWifiAccessPoints() {
  try {
    const { stdout } =
      await execFileAsync(
        'nmcli',
        [
          '-t',
          '-f',
          'BSSID,SIGNAL',
          'device',
          'wifi',
          'list',
          '--rescan',
          'no'
        ],
        {
          timeout: 15000
        }
      )

    const accessPoints = []

    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue

      const separator =
        line.lastIndexOf(':')

      if (separator === -1) continue

      const rawBssid =
        line.slice(0, separator)

      const signal =
        Number(
          line.slice(separator + 1)
        )

      const macAddress =
        rawBssid
          .replace(/\*/g, ':')
          .trim()
          .toUpperCase()

      if (
        !/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/.test(
          macAddress
        )
      ) {
        continue
      }

      if (!Number.isFinite(signal)) {
        continue
      }

      accessPoints.push({
        macAddress,
        signalStrength:
          -Math.abs(signal)
      })
    }

    // Remove duplicate BSSIDs
    const unique = new Map()

    for (const ap of accessPoints) {
      unique.set(
        ap.macAddress,
        ap
      )
    }

    return [...unique.values()]

  } catch (error) {
    console.error(
      'WIFI SCAN ERROR:',
      error
    )

    throw new Error(
      error?.message ||
      'Unable to scan Wi-Fi networks'
    )
  }
}


// =====================================================
// BEACONDB WIFI GEOLOCATION
// =====================================================

async function getBeaconDBLocation(
  wifiAccessPoints
) {
  try {
    console.log(
      '================================'
    )

    console.log(
      'QUERYING BEACONDB...'
    )

    console.log(
      '================================'
    )

    const response =
      await fetch(
        'https://api.beacondb.net/v1/geolocate',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'Accept':
              'application/json'
          },

          body: JSON.stringify({
            wifiAccessPoints
          }),

          signal:
            AbortSignal.timeout(15000)
        }
      )

    console.log(
      'BEACONDB HTTP STATUS:',
      response.status
    )

    const rawResponse =
      await response.text()

    console.log(
      'BEACONDB RAW RESPONSE:',
      rawResponse
    )

    if (!response.ok) {
      throw new Error(
        `BeaconDB HTTP ${response.status}`
      )
    }

    let data

    try {
      data =
        JSON.parse(rawResponse)
    } catch {
      throw new Error(
        'BeaconDB returned invalid JSON'
      )
    }

    const latitude =
      Number(
        data?.location?.lat
      )

    const longitude =
      Number(
        data?.location?.lng
      )

    const accuracy =
      Number(
        data?.accuracy
      )

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error(
        'BeaconDB returned invalid coordinates'
      )
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        'BeaconDB returned impossible coordinates'
      )
    }

    // =================================================
    // BEACONDB IP FALLBACK
    // =================================================

    const isIPFallback =
      data?.fallback === 'ipf'

    if (isIPFallback) {
      console.warn(
        '================================'
      )

      console.warn(
        'BEACONDB WIFI LOCATION UNAVAILABLE'
      )

      console.warn(
        'BEACONDB ONLY PROVIDED IP FALLBACK'
      )

      console.warn(
        `Accuracy: ${
          Number.isFinite(accuracy)
            ? `${accuracy} meters`
            : 'unknown'
        }`
      )

      console.warn(
        'Treating BeaconDB IP fallback as FAILURE'
      )

      console.warn(
        '================================'
      )

      return {
        success: false,

        error:
          'BeaconDB did not provide Wi-Fi-based location',

        source:
          'beacondb-ip',

        approximate:
          true
      }
    }

    console.log(
      '================================'
    )

    console.log(
      'BEACONDB WIFI LOCATION FOUND'
    )

    console.log(
      'Latitude:',
      latitude
    )

    console.log(
      'Longitude:',
      longitude
    )

    console.log(
      'Accuracy:',
      Number.isFinite(accuracy)
        ? `${accuracy} meters`
        : 'unknown'
    )

    console.log(
      '================================'
    )

    return {
      success: true,

      latitude,
      longitude,

      accuracy:
        Number.isFinite(accuracy)
          ? accuracy
          : null,

      source:
        'wifi',

      database:
        'beacondb',

      approximate:
        false,

      fallback:
        null,

      warning:
        null
    }

  } catch (error) {
    console.warn(
      'BEACONDB LOCATION FAILED:',
      error?.message
    )

    return {
      success: false,

      error:
        error?.message ||
        'BeaconDB location failed'
    }
  }
}


// =====================================================
// REVERSE GEOCODING
// Converts latitude/longitude into a readable place
// =====================================================

async function reverseGeocode(
  latitude,
  longitude
) {
  try {
    console.log(
      '================================'
    )

    console.log(
      'REVERSE GEOCODING LOCATION'
    )

    console.log(
      'Latitude:',
      latitude
    )

    console.log(
      'Longitude:',
      longitude
    )

    console.log(
      '================================'
    )

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}` +
      `&zoom=18` +
      `&addressdetails=1`

    const response =
      await fetch(
        url,
        {
          method: 'GET',

          headers: {
            'Accept':
              'application/json',

            'User-Agent':
              'Spion/1.0'
          },

          signal:
            AbortSignal.timeout(10000)
        }
      )

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding HTTP ${response.status}`
      )
    }

    const data =
      await response.json()

    console.log(
      'REVERSE GEOCODING RESULT:',
      data
    )

    const address =
      data?.address || {}

    // Try to find the most useful
    // human-readable place.

    const place =
      address.road ||
      address.neighbourhood ||
      address.suburb ||
      address.quarter ||
      address.village ||
      address.town ||
      address.city ||
      address.municipality ||
      null

    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      null

    const region =
      address.state ||
      address.region ||
      null

    const country =
      address.country ||
      null

    return {
      success: true,

      address:
        data?.display_name ||
        place ||
        city ||
        'Location detected',

      place,

      city,

      region,

      country,

      postcode:
        address.postcode ||
        null,

      road:
        address.road ||
        null,

      neighbourhood:
        address.neighbourhood ||
        address.suburb ||
        null
    }

  } catch (error) {
    console.warn(
      'REVERSE GEOCODING FAILED:',
      error?.message
    )

    return {
      success: false,

      error:
        error?.message ||
        'Unable to determine place name'
    }
  }
}


// =====================================================
// FREE IP TOWN/CITY FALLBACK
// =====================================================

async function getIPLocation() {
  try {
    console.log(
      '================================'
    )

    console.log(
      'USING IPINFO GEOLOCATION FALLBACK'
    )

    console.log(
      '================================'
    )

    const response =
      await fetch(
        'https://ipinfo.io/json',
        {
          method: 'GET',

          headers: {
            'Accept':
              'application/json'
          },

          signal:
            AbortSignal.timeout(10000)
        }
      )

    console.log(
      'IPINFO HTTP STATUS:',
      response.status
    )

    if (!response.ok) {
      throw new Error(
        `IPInfo HTTP ${response.status}`
      )
    }

    const data =
      await response.json()

    console.log(
      'IPINFO RESPONSE:',
      data
    )

    // IPInfo returns coordinates as:
    //
    // loc: "latitude,longitude"

    const [
      latitudeString,
      longitudeString
    ] =
      String(
        data?.loc || ''
      ).split(',')

    const latitude =
      Number(latitudeString)

    const longitude =
      Number(longitudeString)

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error(
        'IPInfo returned invalid coordinates'
      )
    }

    const city =
      data?.city ||
      null

    const region =
      data?.region ||
      null

    const country =
      data?.country ||
      null

    const ip =
      data?.ip ||
      null

    const isp =
      data?.org ||
      null

    console.log(
      '================================'
    )

    console.log(
      'IP LOCATION FOUND'
    )

    console.log(
      'City:',
      city
    )

    console.log(
      'Region:',
      region
    )

    console.log(
      'Country:',
      country
    )

    console.log(
      'Latitude:',
      latitude
    )

    console.log(
      'Longitude:',
      longitude
    )

    console.log(
      'IP:',
      ip
    )

    console.log(
      'ISP:',
      isp
    )

    console.log(
      'SOURCE: IPINFO'
    )

    console.log(
      'ACCURACY: APPROXIMATE'
    )

    console.log(
      '================================'
    )

    return {
      success: true,

      latitude,
      longitude,

      accuracy:
        null,

      city,
      region,
      country,

      ip,
      isp,

      source:
        'ipinfo',

      approximate:
        true,

      warning:
        'IP location is approximate and may represent the ISP or population center rather than the physical laptop location.'
    }

  } catch (error) {
    console.warn(
      'IPINFO GEOLOCATION FAILED:',
      error?.message
    )

    return {
      success: false,

      error:
        error?.message ||
        'IPInfo geolocation failed'
    }
  }
}


// =====================================================
// MAIN WIFI LOCATION FUNCTION
// =====================================================

async function getWifiLocation() {
  try {
    console.log(
      '================================'
    )

    console.log(
      'SCANNING WIFI FOR LOCATION'
    )

    console.log(
      '================================'
    )

    // -------------------------------------------------
    // 1. Scan nearby Wi-Fi networks
    // -------------------------------------------------

    const wifiAccessPoints =
      await getWifiAccessPoints()

    console.log(
      'WIFI ACCESS POINTS FOUND:',
      wifiAccessPoints.length
    )

    console.log(
      'ACCESS POINTS:',
      wifiAccessPoints
    )

    if (
      wifiAccessPoints.length === 0
    ) {
      console.warn(
        'NO WIFI ACCESS POINTS FOUND'
      )

    } else {

      // -------------------------------------------------
      // 2. Try BeaconDB first
      // -------------------------------------------------

      const beaconResult =
        await getBeaconDBLocation(
          wifiAccessPoints
        )

      if (
        beaconResult.success
      ) {

        // -------------------------------------------------
        // 2A. Convert coordinates into a place name
        // -------------------------------------------------

        const placeResult =
          await reverseGeocode(
            beaconResult.latitude,
            beaconResult.longitude
          )

        return {
          ...beaconResult,

          address:
            placeResult.success
              ? placeResult.address
              : null,

          place:
            placeResult.success
              ? placeResult.place
              : null,

          city:
            placeResult.success
              ? placeResult.city
              : null,

          region:
            placeResult.success
              ? placeResult.region
              : null,

          country:
            placeResult.success
              ? placeResult.country
              : null,

          postcode:
            placeResult.success
              ? placeResult.postcode
              : null,

          road:
            placeResult.success
              ? placeResult.road
              : null,

          neighbourhood:
            placeResult.success
              ? placeResult.neighbourhood
              : null
        }
      }
    }


    // -------------------------------------------------
    // 3. BeaconDB failed
    //
    // Use free IP town/city fallback.
    // -------------------------------------------------

    console.warn(
      '================================'
    )

    console.warn(
      'BEACONDB DID NOT PROVIDE A VALID LOCATION'
    )

    console.warn(
      'TRYING FREE TOWN/CITY FALLBACK'
    )

    console.warn(
      '================================'
    )

    const ipResult =
      await getIPLocation()

    if (
      ipResult.success
    ) {

      // -------------------------------------------------
      // 3A. Reverse geocode IP coordinates
      // -------------------------------------------------

      const placeResult =
        await reverseGeocode(
          ipResult.latitude,
          ipResult.longitude
        )

      return {
        ...ipResult,

        address:
          placeResult.success
            ? placeResult.address
            : (
                ipResult.city ||
                'Location detected'
              ),

        place:
          placeResult.success
            ? placeResult.place
            : null,

        city:
          placeResult.success
            ? placeResult.city
            : ipResult.city || null,

        region:
          placeResult.success
            ? placeResult.region
            : ipResult.region || null,

        country:
          placeResult.success
            ? placeResult.country
            : ipResult.country || null,

        postcode:
          placeResult.success
            ? placeResult.postcode
            : null,

        road:
          placeResult.success
            ? placeResult.road
            : null,

        neighbourhood:
          placeResult.success
            ? placeResult.neighbourhood
            : null
      }
    }


    // -------------------------------------------------
    // 4. Everything failed
    // -------------------------------------------------

    console.error(
      '================================'
    )

    console.error(
      'NO LOCATION AVAILABLE'
    )

    console.error(
      '================================'
    )

    return {
      success: false,

      error:
        'Unable to determine device location',

      source:
        'unknown'
    }

  } catch (error) {

    console.error(
      '================================'
    )

    console.error(
      'WIFI LOCATION ERROR:',
      error
    )

    console.error(
      '================================'
    )

    return {
      success: false,

      error:
        error?.message ||
        'Unable to determine location',

      source:
        'unknown'
    }
  }
}


// =====================================================
// WINDOW
// =====================================================

function createWindow() {

  mainWindow =
    new BrowserWindow({

      width: 1440,

      height: 900,

      minWidth: 1080,

      minHeight: 680,

      show: false,

      autoHideMenuBar: true,

      backgroundColor:
        '#06110c',

      titleBarStyle:
        isMac
          ? 'hiddenInset'
          : 'default',

      webPreferences: {

        preload:
          join(
            __dirname,
            '../preload/preload.cjs'
          ),

        sandbox:
          false,

        contextIsolation:
          true,

        nodeIntegration:
          false
      }
    })


  mainWindow.on(
    'ready-to-show',
    () => {
      mainWindow.show()
    }
  )


  mainWindow.webContents
    .setWindowOpenHandler(
      (details) => {

        shell.openExternal(
          details.url
        )

        return {
          action: 'deny'
        }
      }
    )


  if (
    process.env
      .ELECTRON_RENDERER_URL
  ) {

    mainWindow.loadURL(
      process.env
        .ELECTRON_RENDERER_URL
    )

  } else {

    mainWindow.loadFile(
      join(
        __dirname,
        '../renderer/index.html'
      )
    )
  }
}


// =====================================================
// APP START
// =====================================================

app.whenReady().then(() => {

  createWindow()

  app.on(
    'activate',
    () => {

      if (
        BrowserWindow
          .getAllWindows()
          .length === 0
      ) {

        createWindow()
      }
    }
  )
})


// =====================================================
// DEVICE LOCK
// =====================================================

ipcMain.handle(
  'spion:lock-device',
  async () => {

    return {
      ok: true,
      timestamp: Date.now()
    }
  }
)


// =====================================================
// LOCATION IPC
// =====================================================

ipcMain.handle(
  'spion:get-location',
  async () => {

    return await getWifiLocation()
  }
)


// =====================================================
// WINDOW CLOSE
// =====================================================

app.on(
  'window-all-closed',
  () => {

    if (!isMac) {
      app.quit()
    }
  }
)

