
from dotenv import load_dotenv
import os
import urllib.request
import urllib.parse
import json
import subprocess

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

VAULT_USER_ID = "17a35437-19a9-4d8e-8f0d-ba66fb98132f"

print("Supabase URL loaded:", bool(SUPABASE_URL))
print("Supabase key loaded:", bool(SUPABASE_SERVICE_KEY))

from supabase import create_client, Client

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY
)

from fastapi import FastAPI, WebSocket, File, UploadFile, Form, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, File, UploadFile, Form, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
from fastapi.staticfiles import StaticFiles


import shutil
import os
import json
from datetime import datetime, timedelta
import socket
import platform
import hashlib
import hmac



# =====================================================
# DATABASE
# =====================================================

DATABASE_URL = "sqlite:///./security.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)


# =====================================================
# APP
# =====================================================

app = FastAPI()

Base = declarative_base()

# =====================================================
# MODELS
# =====================================================

class IntrusionAlert(Base):

    __tablename__ = "intrusion_alerts"

    id = Column(Integer, primary_key=True, index=True)

    device_name = Column(String)

    alert_type = Column(String)

    image_path = Column(String)

    count = Column(Integer, default=1)

    timestamps = Column(String)

    last_seen = Column(String)


class USBEvent(Base):

    __tablename__ = "usb_events"

    id = Column(Integer, primary_key=True, index=True)

    usb_id = Column(String)

    usb_name = Column(String)

    action = Column(String)

    count = Column(Integer, default=1)

    timestamps = Column(String)

    last_seen = Column(String)


class USBApproval(Base):

    __tablename__ = "usb_approvals"

    id = Column(Integer, primary_key=True, index=True)

    usb_id = Column(String)

    usb_name = Column(String)

    status = Column(String)


class VaultState(Base):

    __tablename__ = "vault_state"

    id = Column(Integer, primary_key=True, index=True)

    status = Column(String)
    
class LocationReport(Base):

    __tablename__ = "location_reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(String, index=True)

    ip_address = Column(String)

    city = Column(String)

    region = Column(String)

    country = Column(String)

    isp = Column(String)

    wifi_name = Column(String)

    latitude = Column(String)

    longitude = Column(String)

    address = Column(String)

    last_seen = Column(String)

## =====================================================
# REAL LOCATION TRACKER
# =====================================================

def get_wifi_name():
    """
    Get the currently connected Wi-Fi SSID on Linux.
    """

    try:
        result = subprocess.run(
            ["nmcli", "-t", "-f", "active,ssid", "dev", "wifi"],
            capture_output=True,
            text=True,
            timeout=5
        )

        for line in result.stdout.splitlines():

            if line.startswith("yes:"):
                return line.split(":", 1)[1].strip()

    except Exception as e:

        print("WIFI DETECTION ERROR:", e)

    return ""


def get_real_location():
    """
    Get approximate real-world location from the laptop's
    public IP address.

    Returns:
        ip
        city
        region
        country
        isp
        latitude
        longitude
        address
        wifi_name
    """

    try:

        # -------------------------------------------------
        # Get public IP + IP geolocation
        # -------------------------------------------------

        request = urllib.request.Request(
            "https://ipapi.co/json/",
            headers={
                "User-Agent": "SPION Security Application"
            }
        )

        with urllib.request.urlopen(
            request,
            timeout=10
        ) as response:

            raw_data = response.read().decode("utf-8")

        data = json.loads(raw_data)

        ip_address = data.get("ip", "")
        city = data.get("city", "")
        region = data.get("region", "")
        country = data.get("country_name", "")
        isp = data.get("org", "")

        latitude = data.get("latitude")
        longitude = data.get("longitude")

        wifi_name = get_wifi_name()

        # -------------------------------------------------
        # Reverse geocode coordinates
        # -------------------------------------------------

        address = ""

        if latitude is not None and longitude is not None:

            try:

                params = urllib.parse.urlencode({
                    "lat": latitude,
                    "lon": longitude,
                    "format": "json",
                    "zoom": 18
                })

                reverse_url = (
                    "https://nominatim.openstreetmap.org/reverse?"
                    + params
                )

                reverse_request = urllib.request.Request(
                    reverse_url,
                    headers={
                        "User-Agent":
                            "SPION Security Application"
                    }
                )

                with urllib.request.urlopen(
                    reverse_request,
                    timeout=10
                ) as reverse_response:

                    reverse_raw = (
                        reverse_response
                        .read()
                        .decode("utf-8")
                    )

                reverse_data = json.loads(
                    reverse_raw
                )

                address = (
                    reverse_data.get("display_name")
                    or ""
                )

            except Exception as e:

                print(
                    "REVERSE GEOCODING ERROR:",
                    e
                )

        return {

            "ip_address": ip_address,

            "city": city,

            "region": region,

            "country": country,

            "isp": isp,

            "wifi_name": wifi_name,

            "latitude": latitude,

            "longitude": longitude,

            "address": address,

            "last_seen":
                datetime.utcnow().isoformat()

        }

    except Exception as e:

        print(
            "REAL LOCATION ERROR:",
            e
        )

        return None


@app.post("/location/refresh")
def refresh_location():

    location = get_real_location()

    if not location:

        return {
            "success": False,
            "error": "Unable to determine laptop location"
        }

    db = SessionLocal()

    try:

        # -------------------------------------------------
        # Get authenticated user
        # -------------------------------------------------

        user_id = VAULT_USER_ID

        # -------------------------------------------------
        # Save locally
        # -------------------------------------------------

        report = (
            db.query(LocationReport)
            .filter(
                LocationReport.user_id == user_id
            )
            .first()
        )

        if report:

            report.ip_address = (
                location["ip_address"]
            )

            report.city = (
                location["city"]
            )

            report.region = (
                location["region"]
            )

            report.country = (
                location["country"]
            )

            report.isp = (
                location["isp"]
            )

            report.wifi_name = (
                location["wifi_name"]
            )

            report.latitude = (
                str(location["latitude"])
                if location["latitude"] is not None
                else ""
            )

            report.longitude = (
                str(location["longitude"])
                if location["longitude"] is not None
                else ""
            )

            report.address = (
                location["address"]
            )

            report.last_seen = (
                current_time()
            )

        else:

            report = LocationReport(

                user_id=user_id,

                ip_address=
                    location["ip_address"],

                city=
                    location["city"],

                region=
                    location["region"],

                country=
                    location["country"],

                isp=
                    location["isp"],

                wifi_name=
                    location["wifi_name"],

                latitude=
                    str(location["latitude"])
                    if location["latitude"] is not None
                    else "",

                longitude=
                    str(location["longitude"])
                    if location["longitude"] is not None
                    else "",

                address=
                    location["address"],

                last_seen=
                    current_time()
            )

            db.add(report)

        db.commit()

        # -------------------------------------------------
        # Save to Supabase
        # -------------------------------------------------

        supabase_data = {

            "user_id":
                user_id,

            "ip_address":
                location["ip_address"],

            "city":
                location["city"],

            "region":
                location["region"],

            "country":
                location["country"],

            "isp":
                location["isp"],

            "wifi_name":
                location["wifi_name"],

            "latitude":
                float(location["latitude"])
                if location["latitude"] is not None
                else None,

            "longitude":
                float(location["longitude"])
                if location["longitude"] is not None
                else None,

            "address":
                location["address"],

            "last_seen":
                datetime.utcnow().isoformat()
        }

        response = (
            supabase
            .table("location_reports")
            .upsert(
                supabase_data,
                on_conflict="user_id"
            )
            .execute()
        )

        print(
            "REAL LOCATION SAVED:",
            response.data
        )

        return {

            "success": True,

            "location": supabase_data

        }

    except Exception as e:

        db.rollback()

        print(
            "LOCATION SAVE ERROR:",
            e
        )

        return {

            "success": False,

            "error": str(e)

        }

    finally:

        db.close()


@app.get("/locations")
def get_location():

    db = SessionLocal()

    try:

        # Get the latest report

        report = (
            db.query(LocationReport)
            .filter(
                LocationReport.user_id ==
                VAULT_USER_ID
            )
            .first()
        )

        if not report:

            return {
                "success": False,
                "location": None
            }

        return {

            "success": True,

            "location": {

                "ip_address":
                    report.ip_address,

                "city":
                    report.city,

                "region":
                    report.region,

                "country":
                    report.country,

                "isp":
                    report.isp,

                "wifi_name":
                    report.wifi_name,

                "latitude":
                    float(report.latitude)
                    if report.latitude
                    else None,

                "longitude":
                    float(report.longitude)
                    if report.longitude
                    else None,

                "address":
                    report.address,

                "last_seen":
                    report.last_seen
            }

        }

    finally:

        db.close()
# =====================================================
# CREATE TABLES
# =====================================================

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===============================
# WEBSOCKET CONNECTIONS
# ===============================

@app.get("/test-supabase")
def test_supabase():

    response = supabase.table("intrusion_alerts").select("*").limit(5).execute()

    return {
        "success": True,
        "data": response.data
    }
    
active_connections = []

@app.post("/add-to-vault")
async def add_to_vault(file: UploadFile = File(...)):

    try:

        vault_folder = "vault"

        os.makedirs(
            vault_folder,
            exist_ok=True
        )

        file_path = os.path.join(
            vault_folder,
            file.filename
        )

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        return {
            "success": True,
            "message": "File added to vault",
            "name": file.filename,
            "path": file_path
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    active_connections.append(websocket)

    print("SPION dashboard connected")

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        active_connections.remove(websocket)

        print("SPION dashboard disconnected")



async def broadcast(data):

    for connection in active_connections:

        await connection.send_json(data)
clients = []

# =====================================================
# REALTIME WEBSOCKET
# =====================================================


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    clients.append(websocket)

    print("SPION dashboard connected")

    try:

        while True:

            # Keep connection alive and listen for messages
            await websocket.receive_text()

    except WebSocketDisconnect:

        if websocket in clients:
            clients.remove(websocket)

        print("SPION dashboard disconnected")

    except Exception as e:

        if websocket in clients:
            clients.remove(websocket)

        print("WebSocket error:", e)


async def broadcast(data):

    disconnected = []

    for client in clients:

        try:

            await client.send_json(data)

        except Exception:

            disconnected.append(client)

    for client in disconnected:

        if client in clients:
            clients.remove(client)

from fastapi import WebSocket

clients = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    clients.append(websocket)

    try:
        while True:
            await websocket.receive_text()

    except:
        clients.remove(websocket)
        
# =====================================================
# SPION MONITOR STATUS
# =====================================================

MONITOR_STATUS = {

    "login_monitor": "stopped",

    "terminal_monitor": "stopped",

    "usb_monitor": "stopped",

    "vault_monitor": "stopped",

    "process_monitor": "stopped",

    "theft_monitor": "stopped"

}


@app.get("/monitor-status")
def get_monitor_status():

    return MONITOR_STATUS



@app.post("/monitor-started")
def monitor_started(

    monitor: str = Form(...)

):

    if monitor in MONITOR_STATUS:

        MONITOR_STATUS[monitor] = "running"


    return {

        "message": "Monitor updated",

        "monitor": monitor

    }

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# ===============================
# PERIPHERAL MONITORING
# ===============================

current_devices = []


@app.get("/peripherals")
def get_peripherals():

    return current_devices



@app.post("/peripherals")
async def receive_peripherals(data:list):

    print("BACKEND RECEIVED:", data)

    global current_devices

    current_devices = data


    await broadcast({

        "type":"peripheral",

        "payload":data

    })


    return {
        "status":"received"
    }
# =====================================================
# HELPERS
# =====================================================

def current_time():

    return datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "SPION Security Backend Running"
    }
# =====================================================
# LAPTOP AGENT HEARTBEAT
# =====================================================

AGENT_STATUS = {

    "status": "offline",

    "last_seen": None

}


@app.post("/heartbeat")
def heartbeat():

    now = current_time()

    AGENT_STATUS["status"] = "online"

    AGENT_STATUS["last_seen"] = now


    return {

        "message": "Heartbeat received",

        "status": "online",

        "last_seen": now

    }


@app.get("/agent-status")
def agent_status():

    return AGENT_STATUS



# =====================================================
# INTRUSION ALERT
# =====================================================


@app.post("/intrusion")
async def intrusion_alert(
    user_id: str = Form(...),
    device_id: str = Form(None),
    device_name: str = Form(...),
    alert_type: str = Form(...),
    image: UploadFile = File(...)
):

    try:

        # =====================================
        # CLEAN FILE NAME
        # =====================================

        filename = os.path.basename(image.filename)

        # =====================================
        # READ IMAGE
        # =====================================

        image_bytes = await image.read()

        if not image_bytes:
            return {
                "success": False,
                "error": "Image is empty"
            }

        # =====================================
        # SUPABASE STORAGE PATH
        # =====================================

        storage_path = (
            f"{user_id}/{device_id}/{filename}"
        )

        # =====================================
        # UPLOAD IMAGE TO SUPABASE STORAGE
        # =====================================

        storage_response = (
            supabase
            .storage
            .from_("intrusion-images")
            .upload(
                storage_path,
                image_bytes,
                {
                    "content-type": image.content_type or "image/jpeg",
                    "upsert": "true"
                }
            )
        )

        print(
            "[SUPABASE STORAGE] Image uploaded:",
            storage_path
        )

        # =====================================
        # GET PUBLIC IMAGE URL
        # =====================================

        image_url = (
            supabase
            .storage
            .from_("intrusion-images")
            .get_public_url(storage_path)
        )

        print(
            "[SUPABASE STORAGE] Image URL:",
            image_url
        )

        # =====================================
        # TIME
        # =====================================

        now = datetime.utcnow().isoformat()

        # =====================================
        # CHECK EXISTING ALERT
        # =====================================

        existing_response = (
            supabase
            .table("intrusion_alerts")
            .select("*")
            .eq("user_id", user_id)
            .eq("device_id", device_id)
            .eq("alert_type", alert_type)
            .limit(1)
            .execute()
        )

        existing = (
            existing_response.data[0]
            if existing_response.data
            else None
        )

        # =====================================
        # UPDATE EXISTING ALERT
        # =====================================

        if existing:

            history = existing.get("timestamps") or []

            if not isinstance(history, list):
                history = []

            history.append(now)

            new_count = (
                int(existing.get("count") or 0) + 1
            )

            (
                supabase
                .table("intrusion_alerts")
                .update({
                    "device_name": device_name,
                    "count": new_count,
                    "timestamps": history,
                    "last_seen": now,
                    "image_path": image_url
                })
                .eq("id", existing["id"])
                .execute()
            )

            print(
                "[SUPABASE] Existing intrusion alert updated"
            )

        # =====================================
        # CREATE NEW ALERT
        # =====================================

        else:

            (
                supabase
                .table("intrusion_alerts")
                .insert({
                    "user_id": user_id,
                    "device_id": device_id,
                    "device_name": device_name,
                    "alert_type": alert_type,
                    "image_path": image_url,
                    "count": 1,
                    "timestamps": [now],
                    "last_seen": now
                })
                .execute()
            )

            print(
                "[SUPABASE] New intrusion alert created"
            )

        return {
            "success": True,
            "message": "Intrusion saved to Supabase",
            "image_url": image_url
        }

    except Exception as e:

        print(
            "[SUPABASE INTRUSION ERROR]",
            str(e)
        )

        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:

        print(
            "SUPABASE INTRUSION ERROR:",
            str(e)
        )

        return {
            "success": False,
            "error": str(e)
        }

# =====================================================
# USB EVENT
# =====================================================

@app.post("/usb-event")
async def usb_event(
    user_id: str = Form(...),
    device_id: str = Form(...),
    usb_id: str = Form(...),
    usb_name: str = Form(...),
    action: str = Form(...)
):

    try:

        print("========================================")
        print("USB EVENT RECEIVED")
        print("user_id:", user_id)
        print("device_id:", device_id)
        print("usb_id:", usb_id)
        print("usb_name:", usb_name)
        print("action:", action)
        print("========================================")

        # -------------------------------------------------
        # CHECK IF THIS USB ALREADY EXISTS
        # -------------------------------------------------

        existing = (
            supabase
            .table("registered_peripherals")
            .select("*")
            .eq("user_id", user_id)
            .eq("usb_id", usb_id)
            .limit(1)
            .execute()
        )

        now = datetime.now().isoformat()

        # -------------------------------------------------
        # USB CONNECTED / DETECTED
        # -------------------------------------------------

        if action.lower() == "blocked":

            if existing.data:

                peripheral_id = existing.data[0]["id"]

                response = (
                    supabase
                    .table("registered_peripherals")
                    .update({
                        "name": usb_name,
                        "kind": "usb",
                        "blocked": True,
                        "status": "blocked",
                        "connected": False,
                        "last_connected": now
                    })
                    .eq("id", peripheral_id)
                    .execute()
                )

                print("Existing USB updated:", response.data)

            else:

                response = (
                    supabase
                    .table("registered_peripherals")
                    .insert({
                        "user_id": user_id,
                        "usb_id": usb_id,
                        "name": usb_name,
                        "kind": "usb",
                        "blocked": True,
                        "status": "blocked",
                        "connected": False,
                        "registered_at": now,
                        "last_connected": now
                    })
                    .execute()
                )

                print("New USB registered:", response.data)

        # -------------------------------------------------
        # USB ALLOWED
        # -------------------------------------------------

        elif action.lower() == "allowed":

            if existing.data:

                peripheral_id = existing.data[0]["id"]

                response = (
                    supabase
                    .table("registered_peripherals")
                    .update({
                        "blocked": False,
                        "status": "authorized",
                        "connected": True,
                        "last_connected": now
                    })
                    .eq("id", peripheral_id)
                    .execute()
                )

                print("USB authorized:", response.data)

            else:

                response = (
                    supabase
                    .table("registered_peripherals")
                    .insert({
                        "user_id": user_id,
                        "usb_id": usb_id,
                        "name": usb_name,
                        "kind": "usb",
                        "blocked": False,
                        "status": "authorized",
                        "connected": True,
                        "registered_at": now,
                        "last_connected": now
                    })
                    .execute()
                )

                print("New authorized USB:", response.data)

        else:

            print("Unknown USB action:", action)

        return {
            "success": True,
            "message": "USB event saved to Supabase"
        }

    except Exception as e:

        print("========================================")
        print("SUPABASE USB ERROR")
        print(str(e))
        print("========================================")

        return {
            "success": False,
            "error": str(e)
        }
        
        # =====================================================
# APPROVE / BLOCK USB
# =====================================================

@app.post("/approve-usb")
async def approve_usb(
    usb_id: str = Form(...),
    usb_name: str = Form(...),
    status: str = Form(...)
):

    db = SessionLocal()

    try:

        status = status.lower().strip()

        if status not in ["allowed", "blocked"]:
            return {
                "success": False,
                "error": "Invalid USB status"
            }

        device = (
            db.query(USBApproval)
            .filter(
                USBApproval.usb_id == usb_id
            )
            .first()
        )

        if device:

            device.usb_name = usb_name
            device.status = status

        else:

            device = USBApproval(
                usb_id=usb_id,
                usb_name=usb_name,
                status=status
            )

            db.add(device)

        db.commit()

        print("========================================")
        print("USB APPROVAL UPDATED")
        print("usb_id:", usb_id)
        print("usb_name:", usb_name)
        print("status:", status)
        print("========================================")

        return {
            "success": True,
            "usb_id": usb_id,
            "status": status
        }

    except Exception as e:

        db.rollback()

        print("USB APPROVAL ERROR:", e)

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        db.close()
        
# =====================================================
# USB STATUS
# =====================================================

@app.get("/usb-status/{usb_id}")
def usb_status(usb_id: str):

    db = SessionLocal()

    device = db.query(
        USBApproval
    ).filter(
        USBApproval.usb_id == usb_id
    ).first()

    db.close()

    if not device:

        return {
            "status": "blocked"
        }

    return {
        "status": device.status
    }

# =====================================================
# SPION VAULT
# =====================================================

VAULT_FOLDER = "/home/wolf/SPION_Vault"
HIDDEN_VAULT_FOLDER = "/home/wolf/.SPION_Vault"

# =====================================================
# SYNC LAPTOP VAULT WITH SUPABASE
# =====================================================

def sync_vault_items():

    try:

        active_folder = get_active_vault_folder()

        if not os.path.exists(active_folder):
            return []

        files = []

        for filename in os.listdir(active_folder):

            path = os.path.join(
                active_folder,
                filename
            )

            if not os.path.isfile(path):
                continue

            size = os.path.getsize(path)

            if size < 1024:
                size_label = f"{size} B"

            elif size < 1024 * 1024:
                size_label = f"{size / 1024:.1f} KB"

            elif size < 1024 * 1024 * 1024:
                size_label = f"{size / (1024 * 1024):.1f} MB"

            else:
                size_label = f"{size / (1024 * 1024 * 1024):.1f} GB"

            item_type = "file"

            files.append({
                "user_id": VAULT_USER_ID,
                "name": filename,
                "type": item_type,
                "item_count": 1,
                "size_label": size_label
            })

        # ---------------------------------------------
        # Remove existing records for this user
        # ---------------------------------------------

        supabase \
            .table("vault_items") \
            .delete() \
            .eq("user_id", VAULT_USER_ID) \
            .execute()

        # ---------------------------------------------
        # Insert current vault contents
        # ---------------------------------------------

        if files:

            response = (
                supabase
                .table("vault_items")
                .insert(files)
                .execute()
            )

            print(
                "VAULT SYNC:",
                response.data
            )

        else:

            print(
                "VAULT SYNC: vault is empty"
            )

        return files

    except Exception as e:

        print(
            "VAULT SYNC ERROR:",
            str(e)
        )

        return []
    
    # =====================================================
# SYNC LOCATION WITH SUPABASE
# =====================================================

def sync_location_to_supabase(
    user_id,
    ip_address=None,
    city=None,
    region=None,
    country=None,
    isp=None,
    wifi_name=None,
    latitude=None,
    longitude=None,
    address=None
):

    try:

        location_data = {
            "user_id": user_id,
            "ip_address": ip_address,
            "city": city,
            "region": region,
            "country": country,
            "isp": isp,
            "wifi_name": wifi_name,
            "latitude": latitude,
            "longitude": longitude,
            "address": address,
            "last_seen": datetime.utcnow().isoformat()
        }

        response = (
            supabase
            .table("location_reports")
            .upsert(
                location_data,
                on_conflict="user_id"
            )
            .execute()
        )

        print(
            "LOCATION SYNC:",
            response.data
        )

        return response.data

    except Exception as e:

        print(
            "LOCATION SYNC ERROR:",
            str(e)
        )

        return []

def get_active_vault_folder():
    """
    Returns the current physical location of the vault.
    """

    if os.path.exists(HIDDEN_VAULT_FOLDER):
        return HIDDEN_VAULT_FOLDER

    return VAULT_FOLDER


# =====================================================
# VAULT STATUS
# =====================================================

@app.get("/vault-status")
def get_vault_status():

    db = SessionLocal()

    vault = db.query(VaultState).first()

    if not vault:
        vault = VaultState(status="locked")
        db.add(vault)
        db.commit()

    status = vault.status

    db.close()

    return {
        "status": status
    }


# =====================================================
# LOCK VAULT
# =====================================================

@app.post("/lock-vault")
def lock_vault():

    db = SessionLocal()

    vault = db.query(VaultState).first()

    if not vault:
        vault = VaultState(status="locked")
        db.add(vault)
    else:
        vault.status = "locked"

    db.commit()
    db.close()

    # -----------------------------------------
    # Physically hide the vault folder
    # -----------------------------------------

    if os.path.exists(VAULT_FOLDER):

        if not os.path.exists(HIDDEN_VAULT_FOLDER):

            os.rename(
                VAULT_FOLDER,
                HIDDEN_VAULT_FOLDER
            )

    return {
        "success": True,
        "message": "Vault locked and hidden"
    }


# =====================================================
# UNLOCK VAULT
# =====================================================

@app.post("/unlock-vault")
def unlock_vault():

    db = SessionLocal()

    vault = db.query(VaultState).first()

    if not vault:
        vault = VaultState(status="unlocked")
        db.add(vault)
    else:
        vault.status = "unlocked"

    db.commit()
    db.close()

    # -----------------------------------------
    # Restore the visible vault folder
    # -----------------------------------------

    if os.path.exists(HIDDEN_VAULT_FOLDER):

        if not os.path.exists(VAULT_FOLDER):

            os.rename(
                HIDDEN_VAULT_FOLDER,
                VAULT_FOLDER
            )

    # Make sure folder exists
    os.makedirs(
        VAULT_FOLDER,
        exist_ok=True
    )

    return {
        "success": True,
        "message": "Vault unlocked"
    }


# =====================================================
# ADD FILE TO VAULT
# =====================================================

@app.post("/add-to-vault")
async def add_to_vault(
    path: str = Form(...)
):

    os.makedirs(
        VAULT_FOLDER,
        exist_ok=True
    )

    if not os.path.exists(path):

        return {
            "error": "Path not found"
        }

    try:

        filename = os.path.basename(path)

        destination = os.path.join(
            VAULT_FOLDER,
            filename
        )

        shutil.move(
            path,
            destination
        )

        return {
            "success": True,
            "message": "Moved to vault",
            "name": filename
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =====================================================
# GET VAULT FILES
# =====================================================

@app.get("/vault-files")
def vault_files():

    db = SessionLocal()

    vault = db.query(
        VaultState
    ).first()

    if vault and vault.status != "unlocked":

        db.close()

        return []

    db.close()

    if not os.path.exists(VAULT_FOLDER):

        return []

    sync_vault_items()

    data = []

    for filename in os.listdir(
        VAULT_FOLDER
    ):

        path = os.path.join(
            VAULT_FOLDER,
            filename
        )

        if not os.path.isfile(path):
            continue

        data.append({

            "name": filename,

            "size": os.path.getsize(
                path
            )

        })

    return data

# =====================================================
# GET ALERTS
# =====================================================

@app.get("/alerts")
def get_alerts():

    db = SessionLocal()

    alerts = db.query(
        IntrusionAlert
    ).all()

    data = []

    for alert in alerts:

        data.append({

            "device_name": alert.device_name,

            "alert_type": alert.alert_type,

            "image_path": alert.image_path,

            "count": alert.count,

            "timestamps": json.loads(
                alert.timestamps
            ),

            "last_seen": alert.last_seen

        })

    db.close()

    return data

# =====================================================
# GET USB EVENTS
# =====================================================

@app.get("/usb-events")
def get_usb_events():

    db = SessionLocal()

    events = db.query(
        USBEvent
    ).all()

    data = []

    for event in events:

        data.append({

            "usb_id": event.usb_id,

            "usb_name": event.usb_name,

            "action": event.action,

            "count": event.count,

            "timestamps": json.loads(
                event.timestamps
            ),

            "last_seen": event.last_seen

        })

    db.close()

    return data



@app.get("/device-info")
def device_info():

    return {

        "device_name": socket.gethostname(),

        "operating_system": platform.system(),

        "system_version": platform.version(),

        "status": "online"

    }

@app.post("/heartbeat")
def heartbeat(
    device_name: str = Form(...),
    os: str = Form(...)
):

    return {
        "status": "online",
        "device": device_name,
        "system": os
    }

# =====================================================
# VAULT INFORMATION
# =====================================================

VAULT_FOLDER = "/home/wolf/SPION_Vault"


@app.get("/vault-info")
def vault_info():

    os.makedirs(
        VAULT_FOLDER,
        exist_ok=True
    )

    files = os.listdir(
        VAULT_FOLDER
    )


    return {

        "status": "protected",

        "file_count": len(files),

        "vault_path": VAULT_FOLDER

    }




# =====================================================
# LOCATION TRACKER
# =====================================================

@app.post("/location-report")
def location_report(

    ip_address: str = Form(...),
    city: str = Form(...),
    region: str = Form(...),
    country: str = Form(...),
    isp: str = Form(...),
    wifi_name: str = Form(...)

):
 

    db = SessionLocal()

    report = db.query(LocationReport).first()

    if report:

        report.ip_address = ip_address
        report.city = city
        report.region = region
        report.country = country
        report.isp = isp
        report.wifi_name = wifi_name
        report.last_seen = current_time()

    else:

        report = LocationReport(

            ip_address=ip_address,
            city=city,
            region=region,
            country=country,
            isp=isp,
            wifi_name=wifi_name,
            last_seen=current_time()

        )

        db.add(report)

    db.commit()
    db.close()

    return {"message": "Location updated"}



# =====================================================
# TRACKER CONTROL
# =====================================================

TRACKER_COMMAND = {
    "track_now": False
}


@app.post("/track-now")
def track_now():

    TRACKER_COMMAND["track_now"] = True

    return {
        "message": "Tracker activated"
    }



@app.get("/tracker-command")
def tracker_command():

    command = TRACKER_COMMAND["track_now"]

    TRACKER_COMMAND["track_now"] = False

    return {
        "track_now": command
    } 

# =====================================================
# DASHBOARD
# =====================================================

@app.get(
    "/dashboard",
    response_class=HTMLResponse
)
def dashboard():

    return """

<!DOCTYPE html>

<html>

<head>

<title>SPION Security Dashboard</title>

<style>

body{
    background:#111827;
    color:white;
    font-family:Arial;
    padding:20px;
}

.section{
    margin-top:40px;
}

.container{
    display:flex;
    flex-wrap:wrap;
    gap:20px;
}

.card{
    background:#1f2937;
    padding:20px;
    border-radius:12px;
    width:320px;
}

.card img{
    width:100%;
    max-height:220px;
    object-fit:cover;
    border-radius:10px;
}

button{
    padding:10px 15px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    margin-top:10px;
    margin-right:5px;
}

.allow-btn{
    background:green;
    color:white;
}

.block-btn{
    background:red;
    color:white;
}

.details-btn{
    background:#2563eb;
    color:white;
}

.details{
    display:none;
    margin-top:10px;
    background:#374151;
    padding:10px;
    border-radius:10px;
}

input{
    width:100%;
    padding:12px;
    border:none;
    border-radius:8px;
    margin-top:10px;
}

</style>

</head>

<body>

<h1>SPION Security Dashboard</h1>


<input
    type="text"
    id="vault-path"
    placeholder="/home/wolf/Documents/passwords.txt"
/>

<button
    class="allow-btn"
    onclick="addToVault()"
>
    Add To Vault
</button>

<button
    class="block-btn"
    onclick="lockVault()"
>
    Lock Vault
</button>

<button
    class="allow-btn"
    onclick="unlockVault()"
>
    Unlock Vault
</button>

</div>

<div class="section">

<div class="section">

<h2> Device Tracker</h2>

<div class="card">

<p><b>City:</b> <span id="city">Loading...</span></p>

<p><b>Region:</b> <span id="region">Loading...</span></p>

<p><b>Country:</b> <span id="country">Loading...</span></p>

<p><b>Wi-Fi:</b> <span id="wifi">Loading...</span></p>

<p><b>IP Address:</b> <span id="ip">Loading...</span></p>

<p><b>ISP:</b> <span id="isp">Loading...</span></p>

<p><b>Last Seen:</b> <span id="seen">Loading...</span></p>

<button
    class="allow-btn"
    onclick="trackNow()"
>
    Track Now
</button>

</div>

</div>


<h2>Intrusion Alerts</h2>

<div class="container" id="alerts"></div>

</div>

<div class="section">

<h2>USB Activity</h2>

<div class="container" id="usb-events"></div>

</div>

<script>

function toggleDetails(id){

    const box = document.getElementById(id);

    if(box.style.display === "block"){

        box.style.display = "none";

    }else{

        box.style.display = "block";
    }
}
async function loadAlerts(){

    const response = await fetch('/alerts');

    const alerts = await response.json();

    const container = document.getElementById('alerts');

    container.innerHTML = '';

    alerts.reverse().forEach((alert,index)=>{

        let times = '';

        alert.timestamps.forEach(time=>{

            times += `<p>${time}</p>`;

        });

        container.innerHTML += `

        <div class="card">

            <img src="/${alert.image_path}" />

            <h3>${alert.alert_type}</h3>

            <p>Detected ${alert.count} times</p>

            <p>Last Seen: ${alert.last_seen}</p>

            <button
                class="details-btn"
                onclick="toggleDetails('alert${index}')"
            >
                Details
            </button>

            <div class="details" id="alert${index}">

                ${times}

            </div>

        </div>

        `;
    });
}

async function loadUSBEvents(){

    const response = await fetch('/usb-events');

    const events = await response.json();

    const container = document.getElementById('usb-events');

    container.innerHTML = '';

    events.reverse().forEach((event,index)=>{

        let times = '';

        event.timestamps.forEach(time=>{

            times += `<p>${time}</p>`;

        });

        container.innerHTML += `

        <div class="card">

            <h3>${event.usb_name}</h3>

            <p>Status: ${event.action}</p>

            <p>Detected ${event.count} times</p>

            <p>Last Seen: ${event.last_seen}</p>

            <button
                class="allow-btn"
                onclick="approveUSB('${event.usb_id}','${event.usb_name}','allowed')"
            >
                Allow
            </button>

            <button
                class="block-btn"
                onclick="approveUSB('${event.usb_id}','${event.usb_name}','blocked')"
            >
                Block
            </button>

            <button
                class="details-btn"
                onclick="toggleDetails('usb${index}')"
            >
                Details
            </button>

            <div class="details" id="usb${index}">

                ${times}

            </div>

        </div>

        `;
    });
}

async function approveUSB(id,name,status){

    await fetch('/approve-usb',{

        method:'POST',

        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        },

        body:new URLSearchParams({

            usb_id:id,
            usb_name:name,
            status:status

        })

    });

    loadUSBEvents();
}

async function addToVault(){

    const path = document.getElementById(
        'vault-path'
    ).value;

    await fetch('/add-to-vault',{

        method:'POST',

        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        },

        body:new URLSearchParams({

            path:path

        })

    });

    alert("Moved to vault");
}

async function lockVault(){

    await fetch('/lock-vault',{

        method:'POST'
    });

    alert("Vault locked");
}

async function unlockVault(){

    await fetch('/unlock-vault',{

        method:'POST'
    });

    alert("Vault unlocked");
}

// =====================================================
// LOCATION TRACKER
// =====================================================

async function loadTracker(){
async function trackNow(){

    await fetch("/track-now",{

        method:"POST"

    });

    alert("Tracker activated.");

}

    const response = await fetch('/locations');

    const data = await response.json();

    document.getElementById("city").innerText =
        data.city || "-";

    document.getElementById("region").innerText =
        data.region || "-";

    document.getElementById("country").innerText =
        data.country || "-";

    document.getElementById("wifi").innerText =
        data.wifi_name || "-";

    document.getElementById("ip").innerText =
        data.ip_address || "-";

    document.getElementById("isp").innerText =
        data.isp || "-";

    document.getElementById("seen").innerText =
        data.last_seen || "-";

}

loadTracker();

loadAlerts();

loadUSBEvents();

setInterval(loadTracker,5000);

setInterval(loadAlerts,3000);

setInterval(loadUSBEvents,3000);

</script>

</body>

</html>

"""