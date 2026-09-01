import os
import time
import requests
import subprocess

BACKEND_URL = "http://127.0.0.1:8000"

HOME_DIR = os.path.expanduser("~")

VISIBLE_VAULT = "/home/wolf/Vault"
HIDDEN_VAULT = "/home/wolf/.spion_vault"

CHECK_INTERVAL = 2

os.makedirs(VISIBLE_VAULT, exist_ok=True)

# =========================================
# GET VAULT STATUS
# =========================================

def get_vault_status():

    try:

        response = requests.get(
            f"{BACKEND_URL}/vault-status"
        )

        return response.json()

    except Exception as e:

        print("Status error:", e)

        return {
            "status": "locked"
        }

# =========================================
# LOCK VAULT
# =========================================

def lock_vault():

    try:

        if os.path.exists(VISIBLE_VAULT):

            subprocess.run(
                [
                    "mv",
                    VISIBLE_VAULT,
                    HIDDEN_VAULT
                ],
                check=False
            )

        if os.path.exists(HIDDEN_VAULT):

            subprocess.run(
                [
                    "chmod",
                    "000",
                    HIDDEN_VAULT
                ],
                check=False
            )

        print("VAULT LOCKED")

    except Exception as e:

        print("Lock error:", e)

# =========================================
# UNLOCK VAULT
# =========================================

def unlock_vault():

    try:

        if os.path.exists(HIDDEN_VAULT):

            subprocess.run(
                [
                    "chmod",
                    "700",
                    HIDDEN_VAULT
                ],
                check=False
            )

        if os.path.exists(HIDDEN_VAULT):

            subprocess.run(
                [
                    "mv",
                    HIDDEN_VAULT,
                    VISIBLE_VAULT
                ],
                check=False
            )

        print("VAULT UNLOCKED")

    except Exception as e:

        print("Unlock error:", e)

# =========================================
# MONITOR LOOP
# =========================================

def monitor_protected_files():

    print("Protected vault monitor started...")

    previous_status = None

    while True:

        try:

            data = get_vault_status()

            status = data["status"]

            if status != previous_status:

                if status == "locked":

                    lock_vault()

                else:

                    unlock_vault()

                previous_status = status

        except Exception as e:

            print("Monitor error:", e)

        time.sleep(CHECK_INTERVAL)

# =========================================
# START
# =========================================

if __name__ == "__main__":

    monitor_protected_files()