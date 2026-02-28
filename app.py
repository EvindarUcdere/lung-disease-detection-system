from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
CORS(app)  # React'ın API'ye erişmesine izin verir

# ─── Model Yükleme ───────────────────────────────────────────────────────────
MODEL_PATH = "trained_lung_model.h5"  # Modelinizin yolunu buraya yazın

model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ Model başarıyla yüklendi.")
    else:
        print(f"⚠️  Model bulunamadı: {MODEL_PATH}")

# Sınıf isimleri (modelinizin eğitim sırasındaki sırayla aynı olmalı)
CLASS_NAMES = ["Akciğer Çökmesi", "Sağlıklı", "Verem", "Zatürre"]
CLASS_ICONS = ["🫁", "✅", "🦠", "🤒"]
CLASS_COLORS = ["#ef4444", "#22c55e", "#f59e0b", "#3b82f6"]

IMG_SIZE = (128, 128)

# ─── Görüntü Ön İşleme ───────────────────────────────────────────────────────
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# ─── API Rotaları ─────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "classes": CLASS_NAMES
    })

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model henüz yüklenmedi. model.h5 dosyasını kontrol edin."}), 503

    # Görüntüyü al
    if "image" not in request.files:
        return jsonify({"error": "Görüntü dosyası bulunamadı. 'image' alanı gerekli."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Dosya seçilmedi."}), 400

    try:
        image_bytes = file.read()
        img_array = preprocess_image(image_bytes)

        # Tahmin yap
        predictions = model.predict(img_array)[0]
        predicted_index = int(np.argmax(predictions))
        confidence = float(predictions[predicted_index]) * 100

        # Tüm sınıf olasılıklarını hazırla
        all_probs = [
            {
                "class": CLASS_NAMES[i],
                "icon": CLASS_ICONS[i],
                "color": CLASS_COLORS[i],
                "probability": round(float(predictions[i]) * 100, 2)
            }
            for i in range(len(CLASS_NAMES))
        ]
        all_probs.sort(key=lambda x: x["probability"], reverse=True)

        return jsonify({
            "prediction": CLASS_NAMES[predicted_index],
            "icon": CLASS_ICONS[predicted_index],
            "color": CLASS_COLORS[predicted_index],
            "confidence": round(confidence, 2),
            "all_probabilities": all_probs
        })

    except Exception as e:
        return jsonify({"error": f"İşlem sırasında hata: {str(e)}"}), 500

# ─── Başlat ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    load_model()
    app.run(host="0.0.0.0", port=5000, debug=True)