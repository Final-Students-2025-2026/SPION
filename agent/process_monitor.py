import psutil
import time
import requests

from threat import critical_response

BACKEND_URL = "http://127.0.0.1:8000"

CHECK_INTERVAL = 3

SUSPICIOUS_PROCESSES = {

    "scp",
    "sftp",
    "rsync",
    "rclone",
    "curl",
    "wget",
    "ftp",
    "zip",
    "tar",
    "7z"

}

seen_pids = set()

# =====================================
# SEND EVENT
# =====================================

def send_process_event(name, pid):

    try:

        requests.post(

            f"{BACKEND_URL}/process-event",

            data={

                "process_name": name,
                "pid": pid

            }

        )

    except Exception as e:

        print("Backend error:", e)

# =====================================
# MONITOR
# =====================================

def monitor_processes():

    print("[INFO] Process monitor started...")

    while True:

        try:

            for proc in psutil.process_iter(

                ["pid", "name"]

            ):

                try:

                    pid = proc.info["pid"]

                    name = proc.info["name"]

                    if not name:
                        continue

                    name = name.lower()

                    if pid in seen_pids:
                        continue

                    seen_pids.add(pid)

                    if name in SUSPICIOUS_PROCESSES:

                        print(
                            f"[ALERT] Suspicious process: {name}"
                        )

                        send_process_event(
                            name,
                            pid
                        )

                except:
                    pass

        except Exception as e:

            print(e)

        time.sleep(
            CHECK_INTERVAL
        )

# =====================================
# START
# =====================================

if __name__ == "__main__":

    monitor_processes()