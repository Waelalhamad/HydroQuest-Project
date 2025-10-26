import cv2
import asyncio
import websockets
import base64
import json


# Function to read class names from a file
def load_class_names(file_path):
    with open(file_path, "rt") as file:
        return file.read().rstrip("\n").split("\n")


# Function to configure model with weights and settings
def setup_model_weights(config_path, weight_path):
    model = cv2.dnn_DetectionModel(weight_path, config_path)
    model.setInputSize(320, 230)
    model.setInputScale(1.0 / 127.5)
    model.setInputMean((127.5, 127.5, 127.5))
    model.setInputSwapRB(True)
    return model


# Function to identify objects in an image
def detect_objects(model, image, confidence_threshold=0.5):
    class_ids, confidences, bounding_boxes = model.detect(
        image, confThreshold=confidence_threshold
    )
    return class_ids, confidences, bounding_boxes


# Function to draw bounding boxes and labels on the image
def draw_objects(image, class_ids, class_names, bounding_boxes):
    for class_id, box in zip(class_ids.flatten(), bounding_boxes):
        class_name = class_names[class_id - 1]
        if class_name == "person":
            cv2.rectangle(image, box, color=(0, 255, 0), thickness=2)
            cv2.putText(
                image,
                class_name,
                (box[0] + 10, box[1] + 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                thickness=2,
            )


# Coroutine to send video frames to the WebSocket server
async def send_video(uri):
    async with websockets.connect(uri) as websocket:
        cam = cv2.VideoCapture(0)
        class_file = "coco.names"
        class_names = load_class_names(class_file)
        config_path = "config.pbtxt"
        weight_path = "weight.pb"
        model = setup_model_weights(config_path, weight_path)

        try:
            while True:
                success, img = cam.read()
                if not success:
                    print("Error reading camera frame. Stopping video stream.")
                    break

                class_ids, confidences, bounding_boxes = detect_objects(model, img)
                if len(class_ids) != 0:
                    draw_objects(img, class_ids, class_names, bounding_boxes)

                # Encode image to JPEG and then to base64
                _, buffer = cv2.imencode(".jpeg", img)
                frame_data = base64.b64encode(buffer).decode("utf-8")

                # Create a JSON object with the frame data
                message = json.dumps({"image": frame_data})

                # Send the JSON message over WebSocket
                await websocket.send(message)
                
        except KeyboardInterrupt:
            print("Video stream stopped by user.")
        finally:
            cam.release()
            cv2.destroyAllWindows()


# Start the asyncio event loop and send video frames
asyncio.run(send_video("ws://localhost:3000"))
