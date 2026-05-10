import base64
import io
import json
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageOps
from tensorflow.keras.models import load_model
import numpy as np

MODEL_PATH = Path(__file__).resolve().parent / 'saved_model' / 'digit_tracing_model.h5'

app = Flask(__name__)
CORS(app)

model = None


def load_digit_model():
    global model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f'Model file not found at {MODEL_PATH}')
    model = load_model(str(MODEL_PATH))
    print(f'Loaded model from {MODEL_PATH}')


def decode_base64_image(data: str) -> bytes:
    if data.startswith('data:'):
        data = data.split(',', 1)[1]
    return base64.b64decode(data)


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    image = ImageOps.invert(image)
    image = image.resize((28, 28), Image.LANCZOS)
    arr = np.array(image, dtype=np.float32) / 255.0
    arr = arr.reshape((1, 28, 28, 1))
    return arr


@app.route('/predict', methods=['POST'])
def predict():
    payload = request.get_json(force=True)
    if not payload or 'image' not in payload:
        return jsonify({'error': 'Request must include image field.'}), 400

    image_base64 = payload['image']
    expected_digit = payload.get('expected_digit')

    try:
        image_bytes = decode_base64_image(image_base64)
        image_array = preprocess_image(image_bytes)
    except Exception as exc:
        return jsonify({'error': f'Invalid image data: {exc}'}), 400

    predictions = model.predict(image_array)
    predicted_digit = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))

    result = {
        'success': True,
        'predicted_digit': predicted_digit,
        'confidence': confidence,
        'expected_digit': expected_digit,
        'is_match': predicted_digit == expected_digit if expected_digit is not None else None,
        'message': 'Correct' if expected_digit is not None and predicted_digit == expected_digit else 'Incorrect' if expected_digit is not None else 'Prediction generated',
    }
    return jsonify(result)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    load_digit_model()
    app.run(host='0.0.0.0', port=5000, debug=True)
