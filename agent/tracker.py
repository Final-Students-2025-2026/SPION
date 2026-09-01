import time
import requests
import subprocess

BACKEND_URL = "http://127.0.0.1:8000"

TRACK_INTERVAL = 300


def check_track_now():

    try:

        response = requests.get(
            f"{BACKEND_URL}/track-now-status",
            timeout=5
        ).json()

        return response.get("track", False)

    except Exception:

        return False
    
def get_wifi_name():

    try:

        result = subprocess.run(
            [
                "nmcli",
                "-t",
                "-f",
                "active,ssid",
                "dev",
                "wifi"
            ],
            capture_output=True,
            text=True
        )

        for line in result.stdout.splitlines():

            if line.startswith("yes:"):

                return line.split(":", 1)[1]

    except Exception as e:

        print("[TRACKER] WiFi error:", e)

    return "Unknown"


def get_location():

    try:

        data = requests.get(
            "http://ip-api.com/json/",
            timeout=10
        ).json()

        return {

            "ip_address": data.get(
                "query",
                "Unknown"
            ),

            "city": data.get(
                "city",
                "Unknown"
            ),

            "region": data.get(
                "regionName",
                "Unknown"
            ),

            "country": data.get(
                "country",
                "Unknown"
            ),

            "isp": data.get(
                "isp",
                "Unknown"
            )

        }

    except Exception as e:

        print("[TRACKER] Location error:", e)

        return None


def send_location(data):

    try:

        response = requests.post(
            f"{BACKEND_URL}/location-report",
            data=data,
            timeout=10
        )

        print(response.status_code)
        print(response.text)

    except Exception as e:

        print("[TRACKER] Upload error:", e)
def monitor_location():

    print("[TRACKER] Started")

    last_upload = 0

    while True:

        now = time.time()

        if check_track_now() or (now - last_upload >= TRACK_INTERVAL):

            location = get_location()

            if location:

                location["wifi_name"] = get_wifi_name()

                send_location(location)

                print(
                    "[TRACKER]",
                    location["city"],
                    location["country"]
                )

                last_upload = now

        time.sleep(2)


if __name__ == "__main__":

    monitor_location()