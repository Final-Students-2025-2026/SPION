import time
import psutil
import subprocess

from alert_state import ALERT_MODE
from camera import capture_intruder
from api import send_intrusion_alert

# =====================================
# CONFIG
# =====================================

DEVICE_NAME = "Linux-PC"

CHECK_INTERVAL = 2

TERMINALS = {

    "cosmic-term",

    "gnome-terminal",
    "gnome-terminal-server",

    "xterm",

    "konsole",

    "kitty",

    "tilix",

    "alacritty",

    "terminator",

    "xfce4-terminal",

    "ptyxis",

    "kgx",

    "gnome-console"
}

# =====================================
# LOCK SCREEN
# =====================================

def lock_screen():

    print(
        "[TERMINAL MONITOR] Locking screen..."
    )

    try:

        subprocess.run(
            [
                "loginctl",
                "lock-session"
            ]
        )

    except Exception as e:

        print(
            "[TERMINAL MONITOR] Lock error:",
            e
        )

# =====================================
# MONITOR TERMINALS
# =====================================

def monitor_terminal():

    print(
        "[TERMINAL MONITOR] Started"
    )

    # =================================
    # IGNORE CURRENT TERMINALS
    # =================================

    known_terminals = set()

    for proc in psutil.process_iter(
        ['pid', 'name']
    ):

        try:

            pid = proc.info['pid']

            name = (
                proc.info['name'] or ""
            ).lower()

            if name in TERMINALS:

                known_terminals.add(
                    pid
                )

        except:
            pass

    print(
        f"[TERMINAL MONITOR] Ignoring {len(known_terminals)} existing terminals"
    )

    # =================================
    # MAIN LOOP
    # =================================

    while True:

        try:

            # =========================
            # WAIT FOR ALERT MODE
            # =========================

            if not ALERT_MODE["enabled"]:

                time.sleep(
                    CHECK_INTERVAL
                )

                continue

            # =========================
            # ALERT MODE ACTIVE
            # =========================

            print(
                "[TERMINAL MONITOR] Alert mode active"
            )

            # =========================
            # SCAN PROCESSES
            # =========================

            for proc in psutil.process_iter(
                ['pid', 'name']
            ):

                try:

                    pid = proc.info['pid']

                    name = (
                        proc.info['name'] or ""
                    ).lower()

                    if name not in TERMINALS:

                        continue

                    # =================
                    # OLD TERMINAL
                    # =================

                    if pid in known_terminals:

                        continue

                    # =================
                    # NEW TERMINAL
                    # =================

                    known_terminals.add(
                        pid
                    )

                    print(
                        f"[TERMINAL DETECTED] {name}"
                    )

                    image = capture_intruder()

                    if image:

                        send_intrusion_alert(

                            DEVICE_NAME,

                            "Unauthorized Terminal Access",

                            image

                        )

                    lock_screen()

                except Exception as e:

                    print(
                        "[PROCESS ERROR]",
                        e
                    )

            time.sleep(
                CHECK_INTERVAL
            )

        except Exception as e:

            print(
                "[TERMINAL MONITOR ERROR]",
                e
            )

            time.sleep(
                CHECK_INTERVAL
            )

# =====================================
# START
# =====================================

if __name__ == "__main__":

    monitor_terminal()