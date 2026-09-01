import requests

BACKEND_URL = "http://127.0.0.1:8000"


USER_ID = "17a35437-19a9-4d8e-8f0d-ba66fb98132f"
DEVICE_ID = "5a6413cf-a554-4f31-b651-d31bd4650cba"
DEVICE_NAME = "pop-os"


# =====================================
# SEND INTRUSION ALERT
# =====================================

def send_intrusion_alert(device_name, alert_type, image_path):

    try:

        with open(image_path, "rb") as image_file:

            files = {
                "image": image_file
            }

            data = {
                "user_id": USER_ID,
                "device_id": DEVICE_ID,
                "device_name": DEVICE_NAME,
                "alert_type": alert_type
            }

            response = requests.post(
                f"{BACKEND_URL}/intrusion",
                files=files,
                data=data,
                timeout=10
            )

            print("[INTRUSION]", response.status_code)
            print(response.text)

    except Exception as e:

        print("[ERROR] Failed to send intrusion alert")
        print(e)


# =====================================
# SEND USB EVENT
# =====================================

def send_usb_event(usb_id, usb_name, action):

    try:

        response = requests.post(
            f"{BACKEND_URL}/usb-event",
            data={
                "user_id": USER_ID,
                "device_id": DEVICE_ID,
                "usb_id": usb_id,
                "usb_name": usb_name,
                "action": action
            },
            timeout=10
        )

        print("[USB]", response.status_code)
        print(response.text)

    except Exception as e:

        print("[ERROR] Failed to send USB event")
        print(e)

# =====================================
# SEND HEARTBEAT
# =====================================

def send_heartbeat(device_name):

    try:

        response = requests.post(
            f"{BACKEND_URL}/heartbeat",
            data={
                "device_name": device_name,
                "os": "Linux"
            },
            timeout=5
        )

        print("[HEARTBEAT]", response.status_code)

    except Exception as e:

        print("[ERROR] Heartbeat failed")
        print(e)