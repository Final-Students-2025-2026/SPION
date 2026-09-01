import subprocess
import re
import os
import shutil

from datetime import datetime

from threat import (
    lock_vault,
    record_failed_login
)

from camera import capture_intruder
from api import send_intrusion_alert
from alert_state import ALERT_MODE

# =====================================
# CONFIG
# =====================================

DEVICE_NAME = "Linux-PC"

MAX_ATTEMPTS = 3

WARNING_ATTEMPT = 2

failed_attempts = 0

# =====================================
# IMAGE STORAGE
# =====================================

BASE_CAPTURE_FOLDER = "intrusion_captures"

os.makedirs(
    BASE_CAPTURE_FOLDER,
    exist_ok=True
)

# =====================================
# LOCK SCREEN
# =====================================

def lock_screen():

    print("[ALERT] Locking screen...")

    try:

        subprocess.run([
            "gnome-screensaver-command",
            "-l"
        ])

    except:

        try:

            subprocess.run([
                "loginctl",
                "lock-session"
            ])

        except Exception as e:

            print("[ERROR] Failed to lock screen")
            print(e)

# =====================================
# SAVE IMAGE
# =====================================

def save_intruder_image(image_path):

    try:

        date_folder = datetime.now().strftime(
            "%Y-%m-%d"
        )

        full_folder = os.path.join(
            BASE_CAPTURE_FOLDER,
            date_folder
        )

        os.makedirs(
            full_folder,
            exist_ok=True
        )

        timestamp = datetime.now().strftime(
            "%H-%M-%S"
        )

        filename = f"intruder_{timestamp}.jpg"

        destination = os.path.join(
            full_folder,
            filename
        )

        shutil.copy(
            image_path,
            destination
        )

        print(
            f"[INFO] Image saved: {destination}"
        )

        return destination

    except Exception as e:

        print("[ERROR] Failed saving image")
        print(e)

        return image_path

# =====================================
# HANDLE FAILED LOGIN
# =====================================

def handle_failed_attempt():

    global failed_attempts

    failed_attempts += 1

    record_failed_login()

    print(
        f"[WARNING] Failed login attempt {failed_attempts}"
    )

    # =================================
    # SECOND FAILED LOGIN
    # =================================

    if failed_attempts == WARNING_ATTEMPT:

        print(
            "[WARNING] Possible intrusion detected"
        )

        ALERT_MODE["enabled"] = True

        print(
            "[ALERT MODE ENABLED]"
        )

        lock_vault()

        image = capture_intruder()

        if image:

            saved_image = save_intruder_image(
                image
            )

            send_intrusion_alert(

                DEVICE_NAME,

                "Possible Intrusion Detected",

                saved_image

            )

    # =================================
    # THIRD FAILED LOGIN
    # =================================

    if failed_attempts >= MAX_ATTEMPTS:

        print(
            "[ALERT] Critical intrusion detected"
        )

        ALERT_MODE["enabled"] = True

        lock_vault()

        image = capture_intruder()

        if image:

            saved_image = save_intruder_image(
                image
            )

            send_intrusion_alert(

                DEVICE_NAME,

                "Critical Intrusion Detected",

                saved_image

            )

        lock_screen()

# =====================================
# MONITOR AUTH LOG
# =====================================

def monitor_logins():

    print(
        "[INFO] Monitoring auth.log..."
    )

    process = subprocess.Popen(

        ["tail", "-F", "/var/log/auth.log"],

        stdout=subprocess.PIPE,

        stderr=subprocess.PIPE,

        text=True

    )

    failed_pattern = re.compile(
        r"authentication failure"
    )

    for line in iter(
        process.stdout.readline,
        ""
    ):

        if failed_pattern.search(line):

            print(
                "[LOG] Failed authentication detected"
            )

            handle_failed_attempt()

# =====================================
# START
# =====================================

if __name__ == "__main__":

    monitor_logins()