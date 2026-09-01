import React from "react"
import { useSpion } from "../context/SpionContext.jsx"
import Panel from "../components/Panel.jsx"

const API = "http://127.0.0.1:8000"

export default function SecurityLogs() {

  const { alerts } = useSpion()

  return (
    <div
      style={{
        padding:"20px 32px",
        maxWidth:1360,
        margin:"auto"
      }}
    >

      <h1 style={{fontSize:22}}>
        Security Logs
      </h1>

      <p style={{
        color:"var(--ink-mid)",
        marginBottom:20
      }}>
        Complete intrusion history
      </p>


      {
        alerts.length === 0 ?

        (
          <Panel style={{padding:20}}>
            No security events found.
          </Panel>
        )

        :

        alerts.map((alert,index)=>(

          <Panel
            key={index}
            style={{
              padding:16,
              marginBottom:15
            }}
          >

            <div
              style={{
                display:"flex",
                gap:20
              }}
            >


              <img
                src={`${API}/${alert.image_path}`}
                alt="intruder"
                style={{
                  width:180,
                  height:120,
                  objectFit:"cover",
                  borderRadius:12
                }}
              />


              <div>

                <h3>
                  {alert.alert_type}
                </h3>


                <p>
                  Device:
                  {" "}
                  {alert.device_name}
                </p>


                <p>
                  Total Attempts:
                  {" "}
                  {alert.count}
                </p>


                <p>
                  Last Seen:
                  {" "}
                  {alert.last_seen}
                </p>


              </div>


            </div>


            <hr
              style={{
                margin:"15px 0",
                borderColor:"var(--hairline)"
              }}
            />


            <h4>
              Detection Timeline
            </h4>


            {
              alert.timestamps.map((time,i)=>(

                <div
                  key={i}
                  style={{
                    fontSize:13,
                    padding:"5px 0"
                  }}
                >
                  🕒 {time}
                </div>

              ))
            }


          </Panel>

        ))

      }

    </div>
  )
}