import argparse
import base64
import io
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
import tensorflow as tf
from tensorflow.keras import layers, models


def decode_base64_image(data: str) -> bytes:
    if data.startswith('data:'):
        data = data.split(',', 1)[1]
    return base64.b64decode(data)


def preprocess_image_bytes(image_bytes: bytes, target_size=(28, 28)) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    image = ImageOps.invert(image)
    image = image.resize(target_size, Image.LANCZOS)
    array = np.array(image, dtype=np.float32) / 255.0
    array = array.reshape(target_size[0], target_size[1], 1)
    return array


def load_local_drawing_images(export_path: Path):
    if not export_path.exists():
        print(f'LocalStorage export file not found: {export_path}')
        return [], []

    with open(export_path, 'r', encoding='utf-8') as fh:
        data = json.load(fh)

    images = []
    labels = []
    for key, value in data.items():
        if key.startswith('tracing_last_drawing_'):
            label_part = key.replace('tracing_last_drawing_', '')
            if label_part.isdigit():
                label = int(label_part)
                try:
                    image_bytes = decode_base64_image(value)
                    image_array = preprocess_image_bytes(image_bytes)
                    images.append(image_array)
                    labels.append(label)
                except Exception as exc:
                    print(f'Failed to load {key}: {exc}')

    return images, labels


def build_model(input_shape=(28, 28, 1), num_classes=10):
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.Flatten(),
        layers.Dropout(0.4),
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dense(num_classes, activation='softmax'),
    ])

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy'],
    )
    return model


def load_mnist_data():
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
    x_train = x_train.astype('float32') / 255.0
    x_test = x_test.astype('float32') / 255.0
    x_train = np.expand_dims(x_train, axis=-1)
    x_test = np.expand_dims(x_test, axis=-1)
    return x_train, y_train, x_test, y_test


def main():
    parser = argparse.ArgumentParser(description='Train a CNN for digit tracing evaluation')
    parser.add_argument('--local-export', type=Path, default=None,
                        help='Path to a JSON export of localStorage containing tracing_last_drawing_{digit} values')
    parser.add_argument('--model-dir', type=Path, default=Path('saved_model'),
                        help='Directory where the model will be saved')
    parser.add_argument('--epochs', type=int, default=8, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=128, help='Training batch size')
    args = parser.parse_args()

    x_train, y_train, x_test, y_test = load_mnist_data()
    print('Loaded MNIST data:', x_train.shape, y_train.shape)

    if args.local_export is not None:
        local_images, local_labels = load_local_drawing_images(args.local_export)
        if local_images:
            local_images = np.stack(local_images, axis=0)
            local_labels = np.array(local_labels, dtype=np.int32)
            print(f'Loaded {len(local_labels)} local drawing images from {args.local_export}')
            x_train = np.concatenate([x_train, local_images], axis=0)
            y_train = np.concatenate([y_train, local_labels], axis=0)
        else:
            print('No local drawings loaded from export.')

    model = build_model()
    model.summary()

    model.fit(
        x_train,
        y_train,
        validation_data=(x_test, y_test),
        epochs=args.epochs,
        batch_size=args.batch_size,
        shuffle=True,
    )

    args.model_dir.mkdir(parents=True, exist_ok=True)
    model_path = args.model_dir / 'digit_tracing_model.h5'
    model.save(model_path)
    print(f'Model saved to {model_path}')


if __name__ == '__main__':
    main()
