import cv2
import time

IMAGE_NAME = "intruder.jpg"

def capture_intruder():

    print("[INFO] Opening webcam...")

    cap = cv2.VideoCapture(0)

    time.sleep(2)

    if not cap.isOpened():

        print("[ERROR] Webcam unavailable")

        return None

    ret, frame = cap.read()

    if not ret:

        print("[ERROR] Failed to capture image")

        return None

    cv2.imwrite(IMAGE_NAME, frame)

    cap.release()

    print("[INFO] Intruder image captured")

    return IMAGE_NAME