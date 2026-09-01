from threading import Thread
import requests
import time
import psutil
import time

from api import send_intrusion_alert, send_usb_event
from login_monitor import monitor_logins
from usb_monitor import monitor
from file_monitor import monitor_protected_files
from process_monitor import monitor_processes
from theft_monitor import monitor_theft_mode
from terminal_monitor import monitor_terminal
from tracker import monitor_location


BACKEND_URL = "http://127.0.0.1:8000"

def send_heartbeat():

    while True:

        try:

            requests.post(
                f"{BACKEND_URL}/heartbeat",
                data={
                    "device_name":"Wolf Laptop"
                },
                timeout=5
            )

        except Exception:
            pass

        time.sleep(10)

# ===============================
# PERIPHERAL SCANNER
# ===============================


def scan_devices():

    devices=[]


    for partition in psutil.disk_partitions():

        devices.append({

            "name": partition.device,

            "type": "storage",

            "status": "connected",

            "authorized": True

        })


    return devices



def send_peripherals():

    devices = scan_devices()

    print("====================")
    print("SCANNED DEVICES:")
    print(devices)
    print("====================")

    try:

        response = requests.post(
            "http://127.0.0.1:8000/peripherals",
            json=devices,
            timeout=5
        )

        print("BACKEND RESPONSE:")
        print(response.status_code)
        print(response.text)

    except Exception as e:

        print("PERIPHERAL ERROR:")
        print(e)

def heartbeat(name):

    while True:

        try:

            requests.post(

                f"{BACKEND_URL}/monitor-started",

                data={
                    "monitor": name
                },

                timeout=5

            )

        except Exception as e:

            print(f"[{name}] Offline")

        time.sleep(5)




def login_wrapper():

    Thread(
        target=heartbeat,
        args=("login_monitor",),
        daemon=True
    ).start()

    monitor_logins()


def peripheral_wrapper():

    Thread(
        target=heartbeat,
        args=("peripheral_monitor",),
        daemon=True
    ).start()


def peripheral_wrapper():

    while True:

        send_peripherals()

        time.sleep(5)
        

def usb_wrapper():

    Thread(
        target=heartbeat,
        args=("usb_monitor",),
        daemon=True
    ).start()

    monitor()
    
def peripheral_wrapper():

    while True:

        send_peripherals()

        time.sleep(5)

def tracker_wrapper():
    Thread(
        target=heartbeat,
        args=(" monitor_location",),
        daemon=True
    ).start()

def vault_wrapper():

    Thread(
        target=heartbeat,
        args=("vault_monitor",),
        daemon=True
    ).start()

    monitor_protected_files()



def process_wrapper():

    Thread(
        target=heartbeat,
        args=("process_monitor",),
        daemon=True
    ).start()

    monitor_processes()



def theft_wrapper():

    Thread(
        target=heartbeat,
        args=("theft_monitor",),
        daemon=True
    ).start()

    monitor_theft_mode()



def terminal_wrapper():

    Thread(
        target=heartbeat,
        args=("terminal_monitor",),
        daemon=True
    ).start()

    monitor_terminal()



if __name__ == "__main__":


    print(
        "[INFO] SPION Agent started..."
    )

threads = [

    Thread(target=send_heartbeat, daemon=True),

    Thread(target=login_wrapper, daemon=True),

    Thread(target=usb_wrapper, daemon=True),

    Thread(target=peripheral_wrapper, daemon=True),

    Thread(target=vault_wrapper, daemon=True),

    Thread(target=process_wrapper, daemon=True),

    Thread(target=theft_wrapper, daemon=True),

    Thread(target=tracker_wrapper, daemon=True),

    Thread(target=terminal_wrapper, daemon=True)
    
    

]

for t in threads:

    t.start()



for t in threads:

    t.join()