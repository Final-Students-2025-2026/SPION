import time
import requests
from collections import deque

BACKEND_URL = "http://127.0.0.1:8000"

FAILED_LOGIN_THRESHOLD = 3
USB_BLOCK_THRESHOLD = 3
PROCESS_THRESHOLD = 5

TIME_WINDOW = 20

failed_logins = deque()
usb_blocks = deque()
process_events = deque()

last_trigger_time = 0

# =====================================
# LOCK VAULT
# =====================================

def lock_vault():

    try:

        requests.post(
            f"{BACKEND_URL}/lock-vault"
        )

        print("[THREAT ENGINE] Vault locked")

    except Exception as e:

        print(e)

# =====================================
# LOCK SCREEN
# =====================================

def lock_screen():

    import subprocess

    try:

        subprocess.run([
            "loginctl",
            "lock-session"
        ])

        print("[THREAT ENGINE] Screen locked")

    except Exception as e:

        print(e)

# =====================================
# BLOCK ALL USB
# =====================================

def block_all_usb():

    try:

        events = requests.get(
            f"{BACKEND_URL}/usb-events"
        ).json()

        for event in events:

            requests.post(

                f"{BACKEND_URL}/approve-usb",

                data={

                    "usb_id": event["usb_id"],
                    "usb_name": event["usb_name"],
                    "status": "blocked"

                }

            )

        print("[THREAT ENGINE] All USBs blocked")

    except Exception as e:

        print(e)

# =====================================
# CRITICAL RESPONSE
# =====================================

def critical_response(reason):

    global last_trigger_time

    now = time.time()

    if now - last_trigger_time < 60:
        return

    last_trigger_time = now

    print(
        f"[CRITICAL RESPONSE] {reason}"
    )

    lock_vault()

    block_all_usb()

    lock_screen()

# =====================================
# CLEAN EVENTS
# =====================================

def clean_old(queue):

    now = time.time()

    while queue and now - queue[0] > TIME_WINDOW:

        queue.popleft()

# =====================================
# FAILED LOGIN
# =====================================

def record_failed_login():

    failed_logins.append(
        time.time()
    )

    clean_old(
        failed_logins
    )

    print(
        f"[THREAT] Failed logins: {len(failed_logins)}"
    )

    if len(failed_logins) >= FAILED_LOGIN_THRESHOLD:

        critical_response(
            "Too many failed logins"
        )

# =====================================
# BLOCKED USB
# =====================================

def record_blocked_usb():

    usb_blocks.append(
        time.time()
    )

    clean_old(
        usb_blocks
    )

    print(
        f"[THREAT] Blocked USB attempts: {len(usb_blocks)}"
    )

    if len(usb_blocks) >= USB_BLOCK_THRESHOLD:

        critical_response(
            "Repeated blocked USB attempts"
        )

# =====================================
# PROCESS EVENT
# =====================================

def record_process_event():

    process_events.append(
        time.time()
    )

    clean_old(
        process_events
    )

    print(
        f"[THREAT] Suspicious processes: {len(process_events)}"
    )

    if len(process_events) >= PROCESS_THRESHOLD:

        critical_response(
            "Suspicious process activity"
        )