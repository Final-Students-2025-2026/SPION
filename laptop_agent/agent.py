import requests
import time
import socket
import platform
from threading import Thread




BACKEND_URL = "http://127.0.0.1:8000"



def heartbeat():

    while True:

        try:

            response = requests.post(

                f"{BACKEND_URL}/heartbeat",

                data={

                    "device_name": socket.gethostname(),

                    "os": platform.system()

                }

            )


            print(
                "[HEARTBEAT]",
                response.text
            )


        except Exception as e:

            print(
                "[HEARTBEAT ERROR]",
                e
            )


        time.sleep(10)




def send_status(name):

    try:

        requests.post(

            f"{BACKEND_URL}/monitor-started",

            data={

                "monitor": name

            }

        )


    except Exception as e:

        print(
            "[STATUS ERROR]",
            e
        )




def login_worker():

    send_status("login_monitor")

    monitor_logins()




def usb_worker():

    send_status("usb_monitor")

    monitor()




def vault_worker():

    send_status("vault_monitor")

    monitor_protected_files()




def process_worker():

    send_status("process_monitor")

    monitor_processes()




def theft_worker():

    send_status("theft_monitor")

    monitor_theft_mode()




def terminal_worker():

    send_status("terminal_monitor")

    monitor_terminal()




if __name__ == "__main__":


    print(
        "[INFO] SPION Agent Started"
    )


    threads = [


        Thread(
            target=heartbeat,
            daemon=True
        ),


        Thread(
            target=login_worker,
            daemon=True
        ),


        Thread(
            target=usb_worker,
            daemon=True
        ),


        Thread(
            target=vault_worker,
            daemon=True
        ),


        Thread(
            target=process_worker,
            daemon=True
        ),


        Thread(
            target=theft_worker,
            daemon=True
        ),


        Thread(
            target=terminal_worker,
            daemon=True
        )

    ]



    for t in threads:

        t.start()



    for t in threads:

        t.join()