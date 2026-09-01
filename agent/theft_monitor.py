import time
import requests

from camera import capture_intruder
from api import send_intrusion_alert

BACKEND_URL = "http://127.0.0.1:8000"

CHECK_INTERVAL = 300  # 5 minutes


# =====================================
# GET THEFT STATUS
# =====================================

def get_theft_status():

    try:

        response = requests.get(
            f"{BACKEND_URL}/theft-status"
        )

        data = response.json()

        return data.get(
            "status",
            "disabled"
        )

    except Exception as e:

        print(
            "[THEFT] Status error:",
            e
        )

        return "disabled"


# =====================================
# SEND LOCATION
# =====================================

def send_location():

    try:

        response = requests.get(
            "http://ip-api.com/json/"
        )

        data = response.json()

        requests.post(

            f"{BACKEND_URL}/location-update",

            data={

                "country": data.get(
                    "country",
                    "Unknown"
                ),

                "city": data.get(
                    "city",
                    "Unknown"
                ),

                "lat": str(
                    data.get("lat", 0)
                ),

                "lon": str(
                    data.get("lon", 0)
                )

            }

        )

        print(
            "[THEFT] Location sent"
        )

    except Exception as e:

        print(
            "[THEFT] Location error:",
            e
        )


# =====================================
# CAPTURE PHOTO
# =====================================

def capture_theft_photo():

    try:

        image = capture_intruder()

        if image:

            send_intrusion_alert(

                "Linux-PC",

                "Theft Mode Capture",

                image

            )

            print(
                "[THEFT] Photo captured"
            )

    except Exception as e:

        print(
            "[THEFT] Camera error:",
            e
        )


# =====================================
# MONITOR
# =====================================

def monitor_theft_mode():

    print(
        "[THEFT] Monitor started"
    )

    while True:

        try:

            status = get_theft_status()

            if status == "enabled":

                capture_theft_photo()

                send_location()

        except Exception as e:

            print(
                "[THEFT] Error:",
                e
            )

        time.sleep(
            CHECK_INTERVAL
        )