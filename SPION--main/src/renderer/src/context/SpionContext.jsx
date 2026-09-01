import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { supabase } from '../../../lib/supabase.js'

const API = 'http://127.0.0.1:8000'

const SpionContext = createContext(null)

const initialLocationHistory = []

const INITIAL_ACCOUNT = {
  username: '',
  fullName: '',
  email: '',
  phone: '',
  country: '',
  region: '',
  deviceName: '',
  plan: 'SPION Personal',
  memberSince: ''
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  )

  return `${(

    bytes / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function SpionProvider({ children }) {

  // =====================================================
  // GENERAL STATE
  // =====================================================

  const [protectionActive] = useState(true)
  const [cameraReady] = useState(true)

  const [alerts, setAlerts] = useState([])
  const [intruderPhotos, setIntruderPhotos] = useState([])
  const [timeline, setTimeline] = useState([])
  const [peripherals, setPeripherals] = useState([])

  const [deviceLocked, setDeviceLocked] = useState(false)
  const lockDevice = useCallback(async () => {
  setDeviceLocked(true)

  if (window.spion?.lockDevice) {
    try {
      await window.spion.lockDevice()
    } catch (error) {
      console.error(
        'Device lock failed:',
        error
      )
    }
  }

  setTimeout(() => {
    setDeviceLocked(false)
  }, 1600)
}, [])

  // =====================================================
  // VAULT STATE
  // =====================================================

  const [vaultLocked, setVaultLocked] = useState(true)
  const [vaultItems, setVaultItems] = useState([])
  const [vaultLoading, setVaultLoading] = useState(false)

  // =====================================================
  // AUTH
  // =====================================================

  const [account, setAccount] = useState(INITIAL_ACCOUNT)
  const [authUser, setAuthUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
  let mounted = true

  const loadSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Failed to load Supabase session:', error)
      return
    }

    if (!mounted) return

    const sessionUser = data.session?.user

   if (sessionUser) {
  setAuthUser(sessionUser)

  const metadata = sessionUser.user_metadata || {}

  // Load the user's actual profile from Supabase
  const {
    data: profile,
    error: profileError
  } = await supabase
    .from('profiles')
    .select(`
      username,
      name,
      email,
      location
    `)
    .eq('id', sessionUser.id)
    .maybeSingle()

  if (profileError) {
    console.error(
      'Failed to load user profile:',
      profileError
    )
  }

  setAccount({
    username:
      profile?.username ||
      metadata.username ||
      '',

    fullName:
      profile?.name ||
      metadata.fullName ||
      '',

    email:
      sessionUser.email ||
      profile?.email ||
      '',

    phone:
      metadata.phone ||
      '',

    country:
      metadata.country ||
      '',

    region:
      metadata.region ||
      '',

    deviceName:
      metadata.deviceName ||
      '',

    plan:
      metadata.plan ||
      'SPION Personal',

    memberSince:
      metadata.memberSince ||
      ''
  })

  setIsAuthenticated(true)
}
  }

  loadSession()

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return

    const sessionUser = session?.user

    if (sessionUser) {
  setAuthUser(sessionUser)

  const metadata = sessionUser.user_metadata || {}

      setAccount((prev) => ({
        ...prev,
        fullName: metadata.fullName || prev.fullName,
        username: metadata.username || prev.username,
        email: sessionUser.email || prev.email,
        country: metadata.country || prev.country,
        region: metadata.region || prev.region
      }))

      setIsAuthenticated(true)
    } else {
  setAuthUser(null)
  setIsAuthenticated(false)
}
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [])

  const user = useMemo(
    () => ({
      name:
        account.fullName?.split(' ')[0] ||
        account.username,

      fullName: account.fullName,
      email: account.email,

      phone:
        account.phone ||
        'Not provided',

      country: account.country,
      region: account.region,

      deviceName:
        account.deviceName ||
        'This laptop',

      plan:
        account.plan ||
        'SPION Personal',

      memberSince:
        account.memberSince ||
        'Just now'
    }),
    [account]
  )

const userName = account?.username || ''

  const signIn = useCallback(async (username, password) => {
  try {
    const cleanUsername = username.trim()

    if (!cleanUsername || !password) {
      console.error('Username and password are required')
      return false
    }

    console.log('==============================')
    console.log('LOGIN ATTEMPT')
    console.log('Username:', cleanUsername)

    // =================================================
    // STEP 1
    // Find the user's email using their username
    // =================================================

    const { data: email, error: emailError } =
      await supabase.rpc(
        'get_email_by_username',
        {
          p_username: cleanUsername
        }
      )

    if (emailError) {
      console.error(
        'Username lookup failed:',
        emailError
      )

      return false
    }

    if (!email) {
      console.error(
        'NO PROFILE FOUND FOR USERNAME:',
        cleanUsername
      )

      return false
    }

    console.log(
      'EMAIL FOUND FOR USERNAME:',
      email
    )

    // =================================================
    // STEP 2
    // Authenticate with Supabase Auth
    //
    // The user DOES NOT enter this email.
    // We use it internally because Supabase Auth
    // authenticates with email + password.
    // =================================================

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

    if (error) {
      console.error(
        'SUPABASE LOGIN ERROR:',
        error.message
      )

      return false
    }

    if (!data.user) {
      console.error(
        'NO AUTH USER RETURNED'
      )

      return false
    }

    // =================================================
    // STEP 3
    // Save authenticated user
    // =================================================

    console.log(
      'LOGIN SUCCESS:',
      data.user.id
    )

    setAuthUser(data.user)

    const metadata =
      data.user.user_metadata || {}

    setAccount((prev) => ({
      ...prev,

      fullName:
        metadata.fullName ||
        prev.fullName,

      username:
        metadata.username ||
        cleanUsername,

      email:
        data.user.email ||
        email ||
        prev.email,

      country:
        metadata.country ||
        prev.country,

      region:
        metadata.region ||
        prev.region
    }))

    setIsAuthenticated(true)

    console.log(
      'AUTHENTICATED AS:',
      metadata.username || cleanUsername
    )

    console.log('==============================')

    return true

  } catch (error) {

    console.error(
      'SIGN IN ERROR:',
      error
    )

    return false
  }

}, [])
const signUp = useCallback(async ({
  fullName,
  username,
  email,
  password,
  country,
  region
}) => {
  try {
    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    console.log('SIGN UP ATTEMPT')
    console.log('Username:', cleanUsername)
    console.log('Email:', cleanEmail)

    // ---------------------------------------------
    // 1. Check whether username already exists
    // ---------------------------------------------

    const { data: existingProfile, error: usernameCheckError } =
      await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', cleanUsername)
        .maybeSingle()

    if (usernameCheckError) {
      console.error(
        'Username check failed:',
        usernameCheckError
      )

      return {
        success: false,
        error: 'Unable to check username.'
      }
    }

    if (existingProfile) {
      return {
        success: false,
        error: 'That username is already taken.'
      }
    }

    // ---------------------------------------------
    // 2. Create Supabase Auth account
    // ---------------------------------------------

    const { data, error } =
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            fullName: fullName.trim(),
            country,
            region
          }
        }
      })

    if (error) {
      console.error(
        'Supabase sign-up error:',
        error
      )

      return {
        success: false,
        error: error.message
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Account could not be created.'
      }
    }

    console.log(
      'SUPABASE AUTH USER CREATED:',
      data.user.id
    )

    // ---------------------------------------------
    // 3. Create profile record
    // ---------------------------------------------

    const { error: profileError } =
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: fullName.trim(),
          email: cleanEmail,
          first_name: fullName.trim().split(' ')[0] || '',
          last_name: fullName.trim().split(' ').slice(1).join(' ') || '',
          username: cleanUsername,
          location: region
            ? `${region}, ${country}`
            : country
        })

    if (profileError) {
      console.error(
        'Profile creation failed:',
        profileError
      )

      return {
        success: false,
        error: profileError.message
      }
    }

    console.log(
      'PROFILE CREATED:',
      cleanUsername
    )

    // ---------------------------------------------
    // 4. Update local account state
    // ---------------------------------------------

    setAuthUser(data.user)

    setAccount((prev) => ({
      ...prev,

      fullName: fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      country,
      region
    }))

    // ---------------------------------------------
    // 5. Determine whether email confirmation
    //    is required
    // ---------------------------------------------

    const needsConfirmation =
      !data.session

    if (data.session) {
      setIsAuthenticated(true)
    }

    return {
      success: true,
      needsConfirmation
    }

  } catch (error) {
    console.error(
      'Sign-up error:',
      error
    )

    return {
      success: false,
      error: error.message || 'Unable to create account.'
    }
  }
}, [])

const logout = useCallback(async () => {
  setLoggingOut(true)

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Supabase logout error:', error)
  }

  setLoggingOut(false)
  setIsAuthenticated(false)
}, [])

  // =====================================================
  // SETTINGS
  // =====================================================

  const [theme, setTheme] = useState('dark')
  const [locationEnabled, setLocationEnabled] =
    useState(true)

  const [terminalLockEnabled, setTerminalLockEnabled] =
    useState(true)

  const [captureEnabled, setCaptureEnabled] =
    useState(true)

  useEffect(() => {

    document.body.setAttribute(
      'data-theme',
      theme
    )

  }, [theme])

  const toggleTheme = useCallback(() => {

    setTheme((current) =>
      current === 'dark'
        ? 'light'
        : 'dark'
    )

  }, [])

  
  // =====================================================
  // VAULT - LOAD FILES
  // =====================================================

  const loadVaultFiles =
    useCallback(async () => {

      try {

        setVaultLoading(true)

        const response =
          await fetch(
            `${API}/vault-files`
          )

        if (!response.ok) {
          throw new Error(
            `Vault request failed: ${response.status}`
          )
        }

        const data =
          await response.json()

        console.log(
          'VAULT FILES FROM BACKEND:',
          data
        )

        const formatted =
          Array.isArray(data)
            ? data.map(
                (file, index) => ({
                  id:
                    `vault-${index}-${file.name}`,

                  name:
                    file.name,

                  type:
                    'file',

                  size:
                    formatFileSize(
                      file.size
                    ),

                  updated:
                    'Stored in vault'
                })
              )
            : []

        setVaultItems(formatted)

        return formatted

      } catch (error) {

        console.error(
          'Failed to load vault files:',
          error
        )

        setVaultItems([])

        throw error

      } finally {

        setVaultLoading(false)

      }

    }, [])

  // =====================================================
  // VAULT - LOAD STATUS
  // =====================================================

  const loadVaultStatus =
    useCallback(async () => {

      try {

        const response =
          await fetch(
            `${API}/vault-status`
          )

        if (!response.ok) {
          throw new Error(
            `Vault status request failed: ${response.status}`
          )
        }

        const data =
          await response.json()

        console.log(
          'VAULT STATUS:',
          data
        )

        setVaultLocked(
          data.status !==
            'unlocked'
        )

        return data.status

      } catch (error) {

        console.error(
          'Failed to load vault status:',
          error
        )

        setVaultLocked(true)

        return 'locked'
      }

    }, [])

  // =====================================================
  // VAULT - REFRESH
  // =====================================================

  const refreshVault =
    useCallback(async () => {

      try {

        const status =
          await loadVaultStatus()

        if (
          status ===
          'unlocked'
        ) {
          await loadVaultFiles()
        }

      } catch (error) {

        console.error(
          'Failed to refresh vault:',
          error
        )

      }

    }, [
      loadVaultStatus,
      loadVaultFiles
    ])

  // =====================================================
  // VAULT - STARTUP
  // =====================================================

  useEffect(() => {

    loadVaultStatus()

  }, [loadVaultStatus])

  // =====================================================
  // VAULT - LOAD FILES WHEN UNLOCKED
  // =====================================================

  useEffect(() => {

    if (!vaultLocked) {
      loadVaultFiles()
    }

  }, [
    vaultLocked,
    loadVaultFiles
  ])

  // =====================================================
  // VAULT - UNLOCK
  // =====================================================

  const unlockVault = useCallback(async (passcode) => {

  if (!passcode || passcode.length < 4) {
    return false
  }

  try {

    const response = await fetch(
      `${API}/unlock-vault`,
      {
        method: 'POST'
      }
    )

    if (!response.ok) {
      throw new Error(
        `Unlock failed: ${response.status}`
      )
    }

    const data = await response.json()

    console.log(
      'VAULT UNLOCK RESPONSE:',
      data
    )

    if (data.success) {

      setVaultLocked(false)

      await loadVaultFiles()

      return true
    }

    return false

  } catch (error) {

    console.error(
      'Vault unlock error:',
      error
    )

    return false
  }

}, [loadVaultFiles])


const lockVault = useCallback(async () => {

  try {

    const response = await fetch(
      `${API}/lock-vault`,
      {
        method: 'POST'
      }
    )

    if (!response.ok) {
      throw new Error(
        `Lock failed: ${response.status}`
      )
    }

    const data = await response.json()

    console.log(
      'VAULT LOCK RESPONSE:',
      data
    )

    if (data.success) {

      // Immediately hide vault contents in the app
      setVaultItems([])

      // Show locked screen
      setVaultLocked(true)

    }

  } catch (error) {

    console.error(
      'Vault lock error:',
      error
    )

    alert(
      'Failed to lock vault'
    )
  }

}, [])
  // =====================================================
  // VAULT - ADD FILE
  // =====================================================

  const addToVault = useCallback(
  async (filePath) => {
    if (!filePath) {
      throw new Error('No file selected')
    }

    const formData = new FormData()

    formData.append('path', filePath)

    const response = await fetch(
      `${API}/add-to-vault`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error(
        `Add to vault failed: ${response.status}`
      )
    }

    const data = await response.json()

    console.log('ADD TO VAULT RESPONSE:', data)

    if (data.error) {
      throw new Error(data.error)
    }

    await loadVaultFiles()

    return data
  },
  [loadVaultFiles]
)

  // =====================================================
// INTRUSION ALERTS - SUPABASE
// =====================================================

useEffect(() => {
  let mounted = true

  async function fetchAlerts() {
    try {
      console.log('LOADING INTRUSION ALERTS FROM SUPABASE...')

      const {
        data,
        error
      } = await supabase
        .from('intrusion_alerts')
        .select(`
          id,
          user_id,
          device_id,
          device_name,
          alert_type,
          image_path,
          count,
          timestamps,
          last_seen
        `)
        .order('last_seen', {
          ascending: false
        })

      if (error) {
        console.error(
          'SUPABASE ALERT ERROR:',
          error
        )

        return
      }

      console.log(
        'SUPABASE INTRUSION ALERTS:',
        data
      )

      if (!mounted) {
        return
      }

      if (!Array.isArray(data)) {
        console.error(
          'Supabase intrusion_alerts did not return an array:',
          data
        )

        setAlerts([])
        setIntruderPhotos([])
        setTimeline([])

        return
      }

      // =================================================
      // SAVE ALERTS
      // =================================================

      setAlerts(data)

      // =================================================
      // INTRUDER PHOTOS
      // =================================================

      setIntruderPhotos(
        data.filter(
          (alert) =>
            alert?.image_path
        )
      )

      // =================================================
      // BUILD TIMELINE
      // =================================================

      const timelineData =
        data.flatMap((alert) => {

          let timestamps = []

          // Supabase may return this as:
          // JSON array
          // OR JSON string

          if (
            Array.isArray(
              alert?.timestamps
            )
          ) {
            timestamps =
              alert.timestamps
          } else if (
            typeof alert?.timestamps ===
            'string'
          ) {
            try {
              timestamps =
                JSON.parse(
                  alert.timestamps
                )
            } catch (error) {
              console.error(
                'Failed to parse alert timestamps:',
                error
              )

              timestamps = []
            }
          }

          return timestamps.map(
            (
              timestamp,
              index
            ) => {

              const parts =
                String(
                  timestamp
                ).split(' ')

              return {
                id:
                  `${alert?.id}-${index}`,

                date:
                  parts[0] ||
                  'Unknown date',

                time:
                  parts.slice(1).join(' ') ||
                  '',

                title:
                  alert?.alert_type ||
                  'Security Alert',

                detail:
                  `${alert?.device_name || 'Unknown device'} detected`,

                tag:
                  'Security',

                device_name:
                  alert?.device_name,

                alert_type:
                  alert?.alert_type,

                count:
                  Number(
                    alert?.count
                  ) || 0,

                image_path:
                  alert?.image_path
              }
            }
          )
        })

      setTimeline(
        timelineData
      )

    } catch (error) {

      console.error(
        'Failed to load Supabase alerts:',
        error
      )

    }
  }

  // Load immediately
  fetchAlerts()

  // Refresh every 5 seconds
  const interval =
    setInterval(
      fetchAlerts,
      5000
    )

  return () => {

    mounted = false

    clearInterval(
      interval
    )

  }

}, [])

// =====================================================
// PERIPHERALS - SUPABASE
// =====================================================

useEffect(() => {
  let mounted = true

  async function loadPeripherals() {
    try {
      console.log('LOADING PERIPHERALS FROM SUPABASE...')

      // Make sure we know which user is logged in
      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) {
        console.error(
          'SUPABASE USER ERROR:',
          userError
        )
        return
      }

      if (!currentUser) {
        console.log(
          'NO AUTHENTICATED USER - PERIPHERALS NOT LOADED'
        )

        if (mounted) {
          setPeripherals([])
        }

        return
      }

      // Load this user's peripherals
      const {
        data,
        error
      } = await supabase
        .from("registered_peripherals")
        .select(`
          id,
          user_id,
          name,
          kind,
          status,
          registered_at,
          last_connected
        `)
        .eq('user_id', currentUser.id)
        .order('last_connected', {
          ascending: false,
          nullsFirst: false
        })

      if (error) {
        console.error(
          'SUPABASE PERIPHERALS ERROR:',
          error
        )
        return
      }

      console.log(
        'SUPABASE PERIPHERALS:',
        data
      )

      if (!mounted) {
        return
      }

      // Convert Supabase format to the format
      // your Peripherals.jsx already expects
      const formatted = Array.isArray(data)
        ? data.map((device) => ({
            id: device.id,

            name: device.name,

            type:
              device.kind ||
              'storage',

            status:
              device.status ||
              'authorized',

            connected:
              Boolean(device.last_connected),

            registered_at:
              device.registered_at,

            last_connected:
              device.last_connected,

            user_id:
              device.user_id
          }))
        : []

      setPeripherals(formatted)

    } catch (error) {
      console.error(
        'FAILED TO LOAD SUPABASE PERIPHERALS:',
        error
      )
    }
  }

  // Load immediately
  loadPeripherals()

  // Refresh every 5 seconds
  const interval = setInterval(
    loadPeripherals,
    5000
  )

  return () => {
    mounted = false
    clearInterval(interval)
  }

}, [authUser])


// =====================================================
// LOCATION
// =====================================================

const [deviceLocation, setDeviceLocation] = useState({
  lat: null,
  lng: null,
  accuracy: null,
  source: null,
  approximate: false,
  online: false,
  address: null,
  city: null,
  region: null,
  country: null,
  ip: null,
  isp: null,
  lastSeen: null
})

const [locationHistory, setLocationHistory] = useState([])
const [locating, setLocating] = useState(false)


// =====================================================
// LOCATE DEVICE
// =====================================================

const locateDevice = useCallback(async () => {

  // Prevent two location requests at the same time
  if (locating) {
    return
  }

  setLocating(true)

  try {

    console.log('================================')
    console.log('📍 LOCATING LAPTOP...')
    console.log('================================')

    // -------------------------------------------------
    // Ask Electron for the laptop location
    // -------------------------------------------------

    if (!window.spion?.getLocation) {
      throw new Error(
        'Electron location API is unavailable'
      )
    }

    const result =
      await window.spion.getLocation()

    console.log(
      '📍 ELECTRON LOCATION RESULT:',
      result
    )

    if (!result?.success) {
      throw new Error(
        result?.error ||
        'Unable to determine location'
      )
    }

    // -------------------------------------------------
    // Build location object
    // -------------------------------------------------

    const latitude =
      Number(result.latitude)

    const longitude =
      Number(result.longitude)

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error(
        'Invalid latitude or longitude'
      )
    }

    const now =
      new Date().toISOString()

    const location = {

      id:
        crypto.randomUUID(),

      lat:
        latitude,

      lng:
        longitude,

      accuracy:
        Number.isFinite(
          Number(result.accuracy)
        )
          ? Number(result.accuracy)
          : null,

      source:
        result.source ||
        'unknown',

      approximate:
        Boolean(
          result.approximate
        ),

      address:
        result.address ||
        result.city ||
        'Location detected',

      city:
        result.city ||
        null,

      region:
        result.region ||
        null,

      country:
        result.country ||
        null,

      ip:
        result.ip ||
        null,

      isp:
        result.isp ||
        null,

      online:
        true,

      lastSeen:
        now,

      time:
        new Date().toLocaleTimeString()

    }

    console.log(
      '📍 FINAL LOCATION:',
      location
    )


    // =================================================
    // UPDATE THE MAP
    // =================================================

    setDeviceLocation(location)

    setLocationHistory(
      previous => [
        location,
        ...previous
      ].slice(0, 50)
    )


    // =================================================
    // SAVE LOCATION TO SUPABASE
    // =================================================

    const {
      data: {
        user: currentUser
      },
      error: userError
    } =
      await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!currentUser) {
      throw new Error(
        'No authenticated Supabase user'
      )
    }


    // -------------------------------------------------
    // Create address
    // -------------------------------------------------

    const address =
      location.address ||
      (
        location.city &&
        location.region &&
        location.country
          ? `${location.city}, ${location.region}, ${location.country}`
          : null
      )


    // -------------------------------------------------
// SAVE / UPDATE LOCATION REPORT
// -------------------------------------------------

const {
  data: savedLocation,
  error: locationError
} =
  await supabase
    .from('location_reports')
    .upsert(
      {
        user_id: currentUser.id,

        ip_address:
          location.ip,

        city:
          location.city,

        region:
          location.region,

        country:
          location.country,

        isp:
          location.isp,

        wifi_name:
          null,

        latitude:
          location.lat,

        longitude:
          location.lng,

        address:
          address,

        last_seen:
          now
      },
      {
        onConflict: 'user_id'
      }
    )
    .select()
    .single()
    
    if (locationError) {

      console.error(
        '❌ SUPABASE LOCATION ERROR:',
        locationError
      )

      throw locationError

    }


    console.log(
      '================================'
    )

    console.log(
      '✅ LOCATION SAVED TO SUPABASE'
    )

    console.log(
      'SUPABASE RECORD:',
      savedLocation
    )

    console.log(
      '================================'
    )


  } catch (error) {

    console.error(
      '❌ LOCATION ERROR:',
      error
    )

    setDeviceLocation(
      previous => ({
        ...previous,
        online: false
      })
    )

  } finally {

    setLocating(false)

  }

}, [locating])
  // =====================================================
  // INTRUDER COUNT
  // =====================================================

  const intrudersDetected =
    alerts.reduce(
      (total, alert) =>
        total +
        (Number(alert?.count) || 0),
      0
    )

  // =====================================================
  // OVERLAY PANELS
  // =====================================================

  const [
    settingsOpen,
    setSettingsOpen
  ] = useState(false)

  const [
    profileOpen,
    setProfileOpen
  ] = useState(false)

  const openSettings =
    useCallback(
      () =>
        setSettingsOpen(true),
      []
    )

  const closeSettings =
    useCallback(
      () =>
        setSettingsOpen(false),
      []
    )

  const openProfile =
    useCallback(
      () =>
        setProfileOpen(true),
      []
    )

  const closeProfile =
    useCallback(
      () =>
        setProfileOpen(false),
      []
    )

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = useMemo(
    () => ({

      // Auth
      userName,
      user,
      authUser,
      userId: authUser?.id || null,
      isAuthenticated,
      signIn,
      signUp,
      logout,
      loggingOut,

      // Protection
      protectionActive,
      cameraReady,

      // Alerts
      intruderPhotos,
      alerts,
      intrudersDetected,
      timeline,

      // Peripherals
      peripherals,

      // Vault
      vaultLocked,
      vaultItems,
      vaultLoading,
      unlockVault,
      lockVault,
      loadVaultFiles,
      refreshVault,
      addToVault,

      // Device
      deviceLocked,
      lockDevice,

      // Settings
      theme,
      toggleTheme,

      locationEnabled,
      setLocationEnabled,

      terminalLockEnabled,
      setTerminalLockEnabled,

      captureEnabled,
      setCaptureEnabled,

      // Panels
      settingsOpen,
      openSettings,
      closeSettings,

      profileOpen,
      openProfile,
      closeProfile,

      // Location
      deviceLocation,
      locationHistory,
      locating,
      locateDevice

    }),
    [
      userName,
      user,
      authUser,
      isAuthenticated,
      signIn,
      signUp,
      logout,
      loggingOut,

      protectionActive,
      cameraReady,

      intruderPhotos,
      alerts,
      intrudersDetected,
      timeline,

      peripherals,

      vaultLocked,
      vaultItems,
      vaultLoading,
      unlockVault,
      lockVault,
      loadVaultFiles,
      refreshVault,
      addToVault,

      deviceLocked,
      lockDevice,

      theme,
      toggleTheme,

      locationEnabled,
      terminalLockEnabled,
      captureEnabled,

      settingsOpen,
      openSettings,
      closeSettings,

      profileOpen,
      openProfile,
      closeProfile,

      deviceLocation,
      locationHistory,
      locating,
      locateDevice
    ]
  )

  return (
    <SpionContext.Provider
      value={value}
    >
      {children}
    </SpionContext.Provider>
  )
}

export function useSpion() {

  const ctx =
    useContext(
      SpionContext
    )

  if (!ctx) {
    throw new Error(
      'useSpion must be used within a SpionProvider'
    )
  }

  return ctx
}