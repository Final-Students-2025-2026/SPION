import React from 'react'
import { motion } from 'framer-motion'
import {
  Crosshair,
  MapPin,
  Wifi,
  Radio,
  Navigation
} from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import Panel from '../components/Panel.jsx'
import StatusPill from '../components/StatusPill.jsx'

export default function Map() {
  const {
    deviceLocation,
    locationHistory,
    locating,
    locateDevice,
    locationEnabled,
    user
  } = useSpion()

  return (
    <div
      style={{
        padding: '18px 32px 24px',
        maxWidth: 1360,
        margin: '0 auto'
      }}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 21,
              fontWeight: 700
            }}
          >
            Map
          </h1>

          <p
            style={{
              color: 'var(--ink-mid)',
              fontSize: 13,
              marginTop: 3
            }}
          >
            {user.deviceName} · device location tracking
          </p>
        </div>

        <motion.button
          onClick={locateDevice}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          disabled={!locationEnabled || locating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,

            background:
              locationEnabled
                ? 'var(--signal)'
                : 'var(--bg-inset)',

            color:
              locationEnabled
                ? 'var(--ink-on-signal)'
                : 'var(--ink-low)',

            border:
              locationEnabled
                ? 'none'
                : '1px solid var(--hairline-strong)',

            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 700,

            cursor:
              locationEnabled
                ? 'pointer'
                : 'not-allowed'
          }}
        >
          <Crosshair
            size={15}
            className={locating ? 'spin' : ''}
          />

          {locating
            ? 'Locating…'
            : 'Locate Now'}
        </motion.button>
      </div>

      {/* ================================================= */}
      {/* LOCATION DISABLED */}
      {/* ================================================= */}

      {!locationEnabled && (
        <Panel
          style={{
            padding: '12px 16px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <StatusPill tone="warn">
            Location Tracking Off
          </StatusPill>

          <span
            style={{
              fontSize: 12.5,
              color: 'var(--ink-mid)'
            }}
          >
            Turn it on in Settings → Protection
            to see the device location.
          </span>
        </Panel>
      )}

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 16
        }}
      >
        {/* ================================================= */}
        {/* TACTICAL MAP */}
        {/* ================================================= */}

        <Panel
          style={{
            padding: 0,
            position: 'relative',
            overflow: 'hidden',
            height: 560
          }}
        >
          <TacticalMap
            locating={locating}
            muted={!locationEnabled}
            deviceLocation={deviceLocation}
            locationHistory={locationHistory}
          />

{/* ================================================= */}
{/* LOCATION CARD */}
{/* ================================================= */}

<div
  style={{
    position: 'absolute',
    left: 18,
    bottom: 18,

    background:
      'rgba(4,10,7,0.88)',

    backdropFilter:
      'blur(10px)',

    border:
      '1px solid rgba(51,226,143,0.25)',

    borderRadius: 8,

    padding: '12px 15px',

    minWidth: 280,
    maxWidth: 360,

    boxShadow:
      '0 12px 30px rgba(0,0,0,0.25)'
  }}
>
  {/* DEVICE LOCATION */}

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 0.7,
      color: 'var(--signal)'
    }}
  >
    <Radio size={12} />

    DEVICE LOCATION
  </div>


  {/* CITY / PLACE */}

  <div
    style={{
      fontSize: 14,
      fontWeight: 700,
      marginTop: 6
    }}
  >
    {deviceLocation?.city ||
      deviceLocation?.place ||
      'Location unavailable'}
  </div>


  {/* REGION / COUNTRY */}

  {(deviceLocation?.region ||
    deviceLocation?.country) && (
    <div
      style={{
        marginTop: 2,
        fontSize: 11,
        color: 'var(--ink-mid)'
      }}
    >
      {deviceLocation?.region || ''}
      {deviceLocation?.region &&
        deviceLocation?.country
        ? ', '
        : ''}
      {deviceLocation?.country === 'GH'
        ? 'Ghana'
        : deviceLocation?.country || ''}
    </div>
  )}


  {/* DIVIDER */}

  <div
    style={{
      marginTop: 9,
      paddingTop: 8,
      borderTop:
        '1px solid rgba(51,226,143,0.12)'
    }}
  >


    {/* COORDINATES */}

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 15,
        fontSize: 10.5
      }}
    >
      <span
        style={{
          color: 'var(--ink-low)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.5
        }}
      >
        COORDINATES
      </span>

      <span
        className="mono"
        style={{
          color: 'var(--signal)',
          fontWeight: 700
        }}
      >
        {deviceLocation?.lat != null &&
        deviceLocation?.lng != null
          ? `${Number(
              deviceLocation.lat
            ).toFixed(5)}°, ${Number(
              deviceLocation.lng
            ).toFixed(5)}°`
          : 'Unavailable'}
      </span>
    </div>


    {/* IP ADDRESS */}

    {deviceLocation?.ip && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 15,
          marginTop: 6,
          fontSize: 10.5
        }}
      >
        <span
          style={{
            color: 'var(--ink-low)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          IP ADDRESS
        </span>

        <span
          className="mono"
          style={{
            color: 'var(--ink-mid)',
            textAlign: 'right'
          }}
        >
          {deviceLocation.ip}
        </span>
      </div>
    )}


    {/* ISP */}

    {deviceLocation?.isp && (
      <div
        style={{
          marginTop: 7
        }}
      >
        <div
          style={{
            color: 'var(--ink-low)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          ISP
        </div>

        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            lineHeight: 1.35,
            color: 'var(--ink-mid)'
          }}
        >
          {deviceLocation.isp}
        </div>
      </div>
    )}


    {/* SOURCE */}

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 15,
        marginTop: 7,
        fontSize: 10.5
      }}
    >
      <span
        style={{
          color: 'var(--ink-low)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.5
        }}
      >
        SOURCE
      </span>

      <span
        className="mono"
        style={{
          color: 'var(--signal)',
          fontWeight: 700
        }}
      >
        {deviceLocation?.source
          ? String(
              deviceLocation.source
            ).toUpperCase()
          : 'UNKNOWN'}
      </span>
    </div>


    {/* ACCURACY */}

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 15,
        marginTop: 6,
        fontSize: 10.5
      }}
    >
      <span
        style={{
          color: 'var(--ink-low)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.5
        }}
      >
        ACCURACY
      </span>

      <span
        className="mono"
        style={{
          color:
            deviceLocation?.approximate
              ? 'var(--ink-mid)'
              : 'var(--signal)',
          fontWeight: 700
        }}
      >
        {deviceLocation?.approximate
          ? 'APPROXIMATE'
          : deviceLocation?.accuracy != null
            ? `±${Math.round(
                Number(
                  deviceLocation.accuracy
                )
              )} m`
            : 'UNKNOWN'}
      </span>
    </div>

  </div>
</div>

          {/* ================================================= */}
          {/* MAP SCALE */}
          {/* ================================================= */}

          <div
            className="mono"
            style={{
              position: 'absolute',
              bottom: 18,
              right: 18,
              fontSize: 9,
              color: 'var(--ink-low)',
              padding: '7px 9px',
              border:
                '1px solid var(--hairline)',
              background:
                'rgba(4,10,7,0.72)',
              borderRadius: 5
            }}
          >
            LIVE TRACKING
          </div>
        </Panel>

        {/* ================================================= */}
        {/* SIDE PANEL */}
        {/* ================================================= */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* DEVICE STATUS */}

          <Panel
            style={{
              padding: 16
            }}
          >
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 12
              }}
            >
              Tracking Status
            </div>

            <StatRow
              icon={Wifi}
              label="Connection"
              value={
                deviceLocation?.online
                  ? 'Online'
                  : 'Offline'
              }
              tone={
                deviceLocation?.online
                  ? 'signal'
                  : 'neutral'
              }
            />

            <StatRow
              icon={Radio}
              label="Source"
              value={
                deviceLocation?.source
                  ? String(
                      deviceLocation.source
                    ).toUpperCase()
                  : 'Unknown'
              }
            />

            <StatRow
              icon={Crosshair}
              label="Accuracy"
              value={
                deviceLocation?.accuracy
                  ? `±${Math.round(
                      Number(
                        deviceLocation.accuracy
                      )
                    )} m`
                  : deviceLocation?.approximate
                    ? 'Approximate'
                    : 'Unavailable'
              }
            />
          </Panel>

          {/* LOCATION HISTORY */}

          <Panel
            style={{
              padding: 16,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12
              }}
            >
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600
                }}
              >
                Location History
              </div>

              <span
                className="mono"
                style={{
                  fontSize: 9,
                  color: 'var(--ink-low)'
                }}
              >
                {locationHistory?.length || 0}
              </span>
            </div>

            <div
              className="scroll-region"
              style={{
                overflowY: 'auto'
              }}
            >
              {locationHistory?.length > 0 ? (
                locationHistory.map(
                  (entry, i) => (
                    <div
                      key={
                        entry.id ||
                        `location-${i}`
                      }
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 0',

                        borderBottom:
                          i ===
                          locationHistory.length - 1
                            ? 'none'
                            : '1px solid var(--hairline)'
                      }}
                    >
                      <div
                        style={{
                          marginTop: 2
                        }}
                      >
                        <MapPin
                          size={14}
                          color={
                            i === 0
                              ? 'var(--signal)'
                              : 'var(--ink-low)'
                          }
                        />
                      </div>

                      <div
                        style={{
                          minWidth: 0
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {entry.address ||
                            'Location recorded'}
                        </div>

                        <div
                          className="mono"
                          style={{
                            fontSize: 10,
                            color:
                              'var(--ink-low)',
                            marginTop: 3
                          }}
                        >
                          {entry.time ||
                            'Location update'}

                          {entry.accuracy != null &&
                            ` · ±${Math.round(
                              Number(
                                entry.accuracy
                              )
                            )} m`}
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 180,
                    textAlign: 'center',
                    color: 'var(--ink-low)'
                  }}
                >
                  <Navigation
                    size={24}
                    strokeWidth={1.4}
                  />

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12
                    }}
                  >
                    No location history
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10
                    }}
                  >
                    Use Locate Now to record
                    the first position.
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* ================================================= */}
      {/* LOCATION DISCLAIMER */}
      {/* ================================================= */}

      <div
        className="mono"
        style={{
          fontSize: 10.5,
          color: 'var(--ink-low)',
          marginTop: 14,
          textAlign: 'center'
        }}
      >
        Location provided by Wi-Fi/IP geolocation.
        IP-based locations are approximate and may
        represent the ISP or network location rather
        than the physical laptop.
      </div>
    </div>
  )
}


/* ===================================================== */
/* STAT ROW */
/* ===================================================== */

function StatRow({
  icon: Icon,
  label,
  value,
  tone = 'neutral'
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderTop:
          '1px solid var(--hairline)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <Icon
          size={14}
          color="var(--ink-low)"
        />

        <span
          style={{
            fontSize: 12,
            color: 'var(--ink-mid)'
          }}
        >
          {label}
        </span>
      </div>

      <span
        className="mono"
        style={{
          fontSize: 10,
          color:
            tone === 'signal'
              ? 'var(--signal)'
              : 'var(--ink-low)',
          fontWeight:
            tone === 'signal'
              ? 700
              : 500
        }}
      >
        {value}
      </span>
    </div>
  )
}


/* ===================================================== */
/* TACTICAL MAP */
/* ===================================================== */

function TacticalMap({
  locating,
  muted,
  deviceLocation,
  locationHistory
}) {
  const points = Array.isArray(
    locationHistory
  )
    ? locationHistory.filter(
        (entry) =>
          Number.isFinite(
            Number(entry.lat)
          ) &&
          Number.isFinite(
            Number(entry.lng)
          )
      )
    : []

  if (
    Number.isFinite(
      Number(deviceLocation?.lat)
    ) &&
    Number.isFinite(
      Number(deviceLocation?.lng)
    )
  ) {
    points.unshift({
      ...deviceLocation,
      current: true
    })
  }

  const uniquePoints = points.filter(
    (point, index, array) =>
      index ===
      array.findIndex(
        (other) =>
          Number(other.lat) ===
            Number(point.lat) &&
          Number(other.lng) ===
            Number(point.lng)
      )
  )

  let minLat
  let maxLat
  let minLng
  let maxLng

  if (uniquePoints.length > 0) {
    const lats = uniquePoints.map(
      (point) => Number(point.lat)
    )

    const lngs = uniquePoints.map(
      (point) => Number(point.lng)
    )

    minLat = Math.min(...lats)
    maxLat = Math.max(...lats)
    minLng = Math.min(...lngs)
    maxLng = Math.max(...lngs)
  } else {
    minLat = 6.60
    maxLat = 6.78
    minLng = -1.72
    maxLng = -1.52
  }

  const latRange =
    Math.max(maxLat - minLat, 0.001)

  const lngRange =
    Math.max(maxLng - minLng, 0.001)

  const paddingLat =
    Math.max(latRange * 0.6, 0.025)

  const paddingLng =
    Math.max(lngRange * 0.6, 0.025)

  minLat -= paddingLat
  maxLat += paddingLat
  minLng -= paddingLng
  maxLng += paddingLng

  const getPosition = (
    lat,
    lng
  ) => {
    const x =
      ((Number(lng) - minLng) /
        (maxLng - minLng)) *
      100

    const y =
      100 -
      ((Number(lat) - minLat) /
        (maxLat - minLat)) *
        100

    return {
      x,
      y
    }
  }

  const currentPosition =
    deviceLocation?.lat != null &&
    deviceLocation?.lng != null
      ? getPosition(
          deviceLocation.lat,
          deviceLocation.lng
        )
      : {
          x: 50,
          y: 50
        }

  const routePoints =
    [...uniquePoints]
      .reverse()
      .map((point) => {
        const position =
          getPosition(
            point.lat,
            point.lng
          )

        return `${position.x},${position.y}`
      })

  const routePath =
    routePoints.length > 1
      ? routePoints.join(' ')
      : ''

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',

        background:
          'radial-gradient(circle at 50% 45%, #173425 0%, #0c1e14 32%, #06110b 65%, #020604 100%)',

        opacity: muted ? 0.45 : 1,

        transition:
          'opacity 0.3s ease'
      }}
    >

      {/* ================================================= */}
      {/* MAP GRID */}
      {/* ================================================= */}

      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0
        }}
      >
        <defs>
          <pattern
            id="tactical-small-grid"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="rgba(95,160,120,0.10)"
              strokeWidth="1"
            />
          </pattern>

          <pattern
            id="tactical-large-grid"
            width="144"
            height="144"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 144 0 L 0 0 0 144"
              fill="none"
              stroke="rgba(95,160,120,0.17)"
              strokeWidth="1"
            />
          </pattern>

          <radialGradient
            id="tactical-vignette"
          >
            <stop
              offset="0%"
              stopColor="transparent"
            />

            <stop
              offset="72%"
              stopColor="rgba(0,0,0,0.08)"
            />

            <stop
              offset="100%"
              stopColor="rgba(0,0,0,0.72)"
            />
          </radialGradient>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#tactical-small-grid)"
        />

        <rect
          width="100%"
          height="100%"
          fill="url(#tactical-large-grid)"
        />

        <rect
          width="100%"
          height="100%"
          fill="url(#tactical-vignette)"
        />
      </svg>


      {/* ================================================= */}
      {/* TERRAIN / TOPOGRAPHIC LINES */}
      {/* ================================================= */}

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 560"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.42,
          pointerEvents: 'none'
        }}
      >
        <path
          d="M-100 410 C80 300 180 470 340 355 S650 210 1100 335"
          fill="none"
          stroke="rgba(82,150,105,0.32)"
          strokeWidth="2"
        />

        <path
          d="M-100 440 C80 330 180 500 340 385 S650 240 1100 365"
          fill="none"
          stroke="rgba(82,150,105,0.20)"
          strokeWidth="1"
        />

        <path
          d="M-80 120 C130 215 260 80 420 165 S720 255 1100 120"
          fill="none"
          stroke="rgba(82,150,105,0.28)"
          strokeWidth="2"
        />

        <path
          d="M-80 150 C130 245 260 110 420 195 S720 285 1100 150"
          fill="none"
          stroke="rgba(82,150,105,0.16)"
          strokeWidth="1"
        />

        <path
          d="M100 560 C200 430 310 470 390 560"
          fill="none"
          stroke="rgba(82,150,105,0.15)"
          strokeWidth="2"
        />

        <path
          d="M700 0 C650 110 760 170 850 210 S950 340 900 560"
          fill="none"
          stroke="rgba(82,150,105,0.13)"
          strokeWidth="2"
        />
      </svg>


      {/* ================================================= */}
      {/* MAP SECTOR LINES */}
      {/* ================================================= */}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '10%',
            top: 0,
            bottom: 0,
            width: 1,
            background:
              'rgba(90,160,115,0.08)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '30%',
            top: 0,
            bottom: 0,
            width: 1,
            background:
              'rgba(90,160,115,0.08)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '70%',
            top: 0,
            bottom: 0,
            width: 1,
            background:
              'rgba(90,160,115,0.08)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '90%',
            top: 0,
            bottom: 0,
            width: 1,
            background:
              'rgba(90,160,115,0.08)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: 0,
            right: 0,
            height: 1,
            background:
              'rgba(90,160,115,0.08)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '75%',
            left: 0,
            right: 0,
            height: 1,
            background:
              'rgba(90,160,115,0.08)'
          }}
        />
      </div>


      {/* ================================================= */}
      {/* MAP COORDINATE LABELS */}
      {/* ================================================= */}

      <div
        className="mono"
        style={{
          position: 'absolute',
          top: 78,
          left: 18,
          fontSize: 8,
          color: 'var(--ink-low)',
          opacity: 0.65
        }}
      >
        06°42'N
      </div>

      <div
        className="mono"
        style={{
          position: 'absolute',
          top: 78,
          right: 18,
          fontSize: 8,
          color: 'var(--ink-low)',
          opacity: 0.65
        }}
      >
        001°37'W
      </div>


      {/* ================================================= */}
      {/* CROSSHAIR / TARGET GRID */}
      {/* ================================================= */}

      <div
        style={{
          position: 'absolute',
          left: `${currentPosition.x}%`,
          top: `${currentPosition.y}%`,
          width: 460,
          height: 460,
          transform:
            'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: 0.2
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background:
              'linear-gradient(transparent, var(--signal), transparent)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background:
              'linear-gradient(90deg, transparent, var(--signal), transparent)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 100,
            border:
              '1px dashed rgba(51,226,143,0.25)',
            borderRadius: '50%'
          }}
        />
      </div>


      {/* ================================================= */}
      {/* ROUTE */}
      {/* ================================================= */}

      {routePath && (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none'
          }}
        >
          <polyline
            points={routePath}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="0.55"
            strokeDasharray="2 1"
            vectorEffect="non-scaling-stroke"
            opacity="0.8"
          />
        </svg>
      )}


      {/* ================================================= */}
      {/* HISTORY POINTS */}
      {/* ================================================= */}

      {uniquePoints
        .slice(1)
        .map((point, index) => {
          const position =
            getPosition(
              point.lat,
              point.lng
            )

          return (
            <motion.div
              key={
                `history-${point.id || index}`
              }
              initial={{
                opacity: 0,
                scale: 0
              }}
              animate={{
                opacity: 0.65,
                scale: 1
              }}
              style={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  'var(--signal)',
                boxShadow:
                  '0 0 12px var(--signal)',
                transform:
                  'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}
            />
          )
        })}


      {/* ================================================= */}
      {/* LARGE TRACKING AREA */}
      {/* ================================================= */}

      <div
        style={{
          position: 'absolute',
          left: `${currentPosition.x}%`,
          top: `${currentPosition.y}%`,
          width: 280,
          height: 280,
          transform:
            'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >

        {/* outer rings */}

        {[0, 1, 2].map(
          (ring) => (
            <motion.div
              key={ring}
              animate={{
                scale: [0.3, 1.5],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                delay: ring * 1.25,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width:
                  70 +
                  ring * 35,
                height:
                  70 +
                  ring * 35,
                transform:
                  'translate(-50%, -50%)',
                border:
                  '1px solid var(--signal)',
                borderRadius: '50%'
              }}
            />
          )
        )}


        {/* fixed radar circles */}

        <div
          style={{
            position: 'absolute',
            inset: 35,
            border:
              '1px solid rgba(51,226,143,0.28)',
            borderRadius: '50%'
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 75,
            border:
              '1px dashed rgba(51,226,143,0.18)',
            borderRadius: '50%'
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 115,
            border:
              '1px solid rgba(51,226,143,0.12)',
            borderRadius: '50%'
          }}
        />


        {/* radar scan */}

        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 120,
            height: 120,
            transformOrigin:
              '0 0',
            background:
              'conic-gradient(from 0deg, rgba(51,226,143,0.28), transparent 35deg, transparent 360deg)',
            clipPath:
              'polygon(0 0, 100% 0, 100% 100%)',
            opacity: 0.45
          }}
        />


        {/* scan line */}

        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 1,
            height: 130,
            transformOrigin:
              '0 0',
            background:
              'linear-gradient(var(--signal), transparent)',
            opacity: 0.85
          }}
        />


        {/* target brackets */}

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 54,
            height: 54,
            transform:
              'translate(-50%, -50%)',
            border:
              '1px solid var(--signal)',
            boxShadow:
              '0 0 18px rgba(51,226,143,0.18)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 26,
            height: 26,
            transform:
              'translate(-50%, -50%)',
            border:
              '1px solid var(--signal)',
            borderRadius: '50%'
          }}
        />


        {/* center */}

        <motion.div
          animate={{
            scale: [0.9, 1.12, 0.9]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 14,
            height: 14,
            transform:
              'translate(-50%, -50%)',
            borderRadius: '50%',
            background:
              'var(--signal)',
            boxShadow:
              '0 0 0 7px var(--signal-wash), 0 0 35px var(--signal-glow)'
          }}
        />
      </div>


      {/* ================================================= */}
      {/* LOCATION ACCURACY */}
      {/* ================================================= */}

      {deviceLocation?.accuracy && (
        <motion.div
          animate={{
            opacity: [
              0.08,
              0.16,
              0.08
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
          style={{
            position: 'absolute',
            left: `${currentPosition.x}%`,
            top: `${currentPosition.y}%`,

            width: Math.min(
              Math.max(
                Number(
                  deviceLocation.accuracy
                ) / 4,
                90
              ),
              380
            ),

            height: Math.min(
              Math.max(
                Number(
                  deviceLocation.accuracy
                ) / 4,
                90
              ),
              380
            ),

            transform:
              'translate(-50%, -50%)',

            borderRadius: '50%',

            background:
              'var(--signal-wash)',

            border:
              '1px solid rgba(51,226,143,0.25)',

            pointerEvents:
              'none'
          }}
        />
      )}


      {/* ================================================= */}
      {/* LIVE STATUS HUD */}
      {/* ================================================= */}

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,

          display: 'flex',
          alignItems: 'center',
          gap: 8,

          padding:
            '8px 12px',

          borderRadius: 999,

          background:
            'rgba(4,12,8,0.82)',

          border:
            '1px solid rgba(51,226,143,0.25)',

          backdropFilter:
            'blur(10px)',

          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.7,

          color:
            'var(--signal)'
        }}
      >
        <motion.span
          animate={{
            opacity: [1, 0.3, 1]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity
          }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background:
              'var(--signal)',
            boxShadow:
              '0 0 10px var(--signal)'
          }}
        />

        {locating
          ? 'SCANNING LOCATION'
          : deviceLocation?.online
            ? 'LIVE LOCATION'
            : 'LOCATION OFFLINE'}
      </div>


      {/* ================================================= */}
      {/* COORDINATE HUD */}
      {/* ================================================= */}

      {deviceLocation?.lat != null &&
        deviceLocation?.lng != null && (
          <div
            className="mono"
            style={{
              position: 'absolute',
              right: 16,
              top: 16,

              padding:
                '9px 12px',

              borderRadius: 6,

              background:
                'rgba(4,12,8,0.82)',

              border:
                '1px solid var(--hairline-strong)',

              backdropFilter:
                'blur(10px)',

              fontSize: 9.5,
              color:
                'var(--ink-mid)',

              lineHeight: 1.6,

              textAlign: 'right'
            }}
          >
            <div
              style={{
                color:
                  'var(--signal)',
                fontWeight: 800,
                letterSpacing: 0.5
              }}
            >
              TRACKING COORDINATES
            </div>

            <div>
              {Number(
                deviceLocation.lat
              ).toFixed(5)}
              °,&nbsp;
              {Number(
                deviceLocation.lng
              ).toFixed(5)}
              °
            </div>
          </div>
        )}


      {/* ================================================= */}
      {/* TARGET LABEL */}
      {/* ================================================= */}

      {deviceLocation?.lat != null && (
        <motion.div
          initial={{
            opacity: 0,
            y: 5
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          style={{
            position: 'absolute',

            left:
              `${currentPosition.x}%`,

            top:
              `${currentPosition.y}%`,

            transform:
              'translate(38px, -50%)',

            background:
              'rgba(4,12,8,0.9)',

            border:
              '1px solid rgba(51,226,143,0.35)',

            borderRadius: 6,

            padding:
              '8px 11px',

            backdropFilter:
              'blur(10px)',

            pointerEvents:
              'none',

            minWidth: 155,

            boxShadow:
              '0 10px 25px rgba(0,0,0,0.25)'
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color:
                'var(--signal)',
              letterSpacing: 0.7
            }}
          >
            TRACKING TARGET
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11.5,
              fontWeight: 600
            }}
          >
            {deviceLocation.address ||
              'Current device'}
          </div>

          <div
            className="mono"
            style={{
              marginTop: 3,
              fontSize: 8.5,
              color:
                'var(--ink-low)'
            }}
          >
            {deviceLocation.approximate
              ? 'APPROXIMATE POSITION'
              : 'WI-FI POSITION'}
          </div>
        </motion.div>
      )}


      {/* ================================================= */}
      {/* CORNER HUD */}
      {/* ================================================= */}

      <div
        className="mono"
        style={{
          position: 'absolute',
          bottom: 14,
          left: 16,

          fontSize: 8.5,
          color:
            'var(--ink-low)',

          letterSpacing: 0.7
        }}
      >
        SPION / TACTICAL TRACKING
      </div>

      <div
        className="mono"
        style={{
          position: 'absolute',
          bottom: 14,
          right: 16,

          fontSize: 8.5,
          color:
            'var(--ink-low)',

          letterSpacing: 0.7
        }}
      >
        {deviceLocation?.source
          ? `SOURCE: ${String(
              deviceLocation.source
            ).toUpperCase()}`
          : 'SOURCE: UNKNOWN'}
      </div>
    </div>
  )
}