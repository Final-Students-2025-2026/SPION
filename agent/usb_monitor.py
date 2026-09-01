import pyudev
import requests
import subprocess
import time

from threat import record_blocked_usb
from api import send_usb_event

BACKEND_URL = "http://127.0.0.1:8000"

context = pyudev.Context()


# =========================================
# BLOCK USB
# =========================================

def block_usb(device_node):

    try:

        result = subprocess.run(

            ["udisksctl", "unmount", "-b", device_node],

            capture_output=True,
            text=True

        )

        print(result.stdout)

        print("USB unmounted:", device_node)

    except Exception as e:

        print("Block error:", e)

# =========================================
# MOUNT USB
# =========================================

def mount_usb(device_node):

    try:

        result = subprocess.run(

            ["udisksctl", "mount", "-b", device_node],

            capture_output=True,
            text=True

        )

        print(result.stdout)

        print("USB mounted:", device_node)

    except Exception as e:

        print("Mount error:", e)

# =========================================
# GET USB STATUS
# =========================================

def get_usb_status(usb_id):

    try:

        response = requests.get(
            f"{BACKEND_URL}/usb-status/{usb_id}"
        )

        data = response.json()

        return data["status"]

    except Exception as e:

        print("Status error:", e)

        return "blocked"

# =========================================
# WAIT FOR ALLOW
# =========================================

def wait_for_allow(

    usb_id,
    usb_name,
    device_node

):

    print("Waiting for dashboard approval...")

    while True:

        status = get_usb_status(usb_id)

        if status == "allowed":

            print("USB approved from dashboard")

            mount_usb(device_node)

            send_usb_event(

                usb_id,
                usb_name,
                "Allowed"

            )

            break

        else:

            try:

                subprocess.run(

                    ["udisksctl", "unmount", "-b", device_node],

                    capture_output=True,
                    text=True

                )

            except:
                pass

        time.sleep(3)

# =========================================
# USB MONITOR
# =========================================

def monitor():

    monitor = pyudev.Monitor.from_netlink(context)

    monitor.filter_by(subsystem="block")

    print("USB monitoring started...")

    for device in iter(monitor.poll, None):

        if device.action != "add":
            continue

        if device.get("ID_BUS") != "usb":
            continue

        if device.get("DEVTYPE") != "partition":
            continue

        usb_id = device.get("ID_SERIAL")

        usb_name = device.get("ID_MODEL")

        device_node = device.device_node

        if not usb_id:
            continue

        print("USB detected:", usb_name)

        time.sleep(1)

        block_usb(device_node)

        record_blocked_usb()

        send_usb_event(
    usb_id,
    usb_name,
    "Blocked"
)

        wait_for_allow(

            usb_id,
            usb_name,
            device_node

        )

# =========================================
# START
# =========================================

if __name__ == "__main__":

    monitor()