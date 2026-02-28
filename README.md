# lung-disease-detection-system
# 🫁 Akciğer Hastalığı Tespit Sistemi
### Lung Disease Detection System — MobileNetV2 + React + Flask

<img width="1609" height="876" alt="image" src="https://github.com/user-attachments/assets/11458e3b-997e-4204-bb51-1196568599fd" />


<img width="1482" height="871" alt="image" src="https://github.com/user-attachments/assets/6466c663-40bd-42c4-bba3-889279841bb2" />


<img width="1260" height="705" alt="image" src="https://github.com/user-attachments/assets/9c2dd0de-a697-457d-8d17-83abdb9681b0" />





Röntgen görüntülerinden derin öğrenme ile akciğer hastalığı tespit eden, React tabanlı modern web arayüzüne sahip tam kapsamlı bir yapay zeka projesi.

---

## 📸 Ekran Görüntüsü

> Röntgen görüntüsü yükle → Teşhis Et → Anlık sonuç ve olasılık grafikleri

---

## 🎯 Desteklenen Hastalıklar

| Sınıf | Görüntü Sayısı | Boyut |
|-------|---------------|-------|
| 🫁 Akciğer Çökmesi (Pneumothorax) | 10.047 | 1024×1024 |
| ✅ Sağlıklı (Normal) | 6.666 | Karışık |
| 🦠 Verem (Tuberculosis) | 3.369 | 200×256 |
| 🤒 Zatürre (Pneumonia) | 4.273 | Karışık |

---

## 🏗️ Proje Mimarisi

```
lung-disease-detection-system/
│
├── 📄 app.py                    # Flask REST API (Backend)
├── 📄 requirements.txt          # Python bağımlılıkları
├── 🧠 trained_lung_model.h5     # Eğitilmiş model (Git LFS ile)
├── 📓 train_model.ipynb         # Model eğitim notebook'u
│
└── frontend/
    └── src/
        └── App.jsx              # React Web Arayüzü
```

---

## 🧠 Model Mimarisi

- **Temel Model:** MobileNetV2 (ImageNet ağırlıkları ile transfer öğrenme)
- **Girdi Boyutu:** 128×128×3
- **Ek Katmanlar:**
  - GlobalAveragePooling2D
  - Dense(256, activation='relu')
  - Dropout(0.5)
  - Dense(4, activation='softmax')
- **Optimizer:** Adam (lr=0.0001)
- **Loss:** Categorical Crossentropy
- **Epoch:** 15
- **Veri Artırma:** Döndürme, kaydırma, zoom, yatay çevirme

---

## ⚙️ Kurulum

### Gereksinimler
- Python 3.10+
- Node.js 18+
- npm 9+

---

### 1️⃣ Repo'yu Klonlayın

```bash
git clone https://github.com/KULLANICI_ADINIZ/lung-disease-detection-system.git
cd lung-disease-detection-system
```

---

### 2️⃣ Backend Kurulumu

```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# API'yi başlat
python app.py
```

✅ Başarılı çıktı:
```
✅ Model başarıyla yüklendi.
 * Running on http://127.0.0.1:5000
```

---

### 3️⃣ Frontend Kurulumu

```bash
# Vite + React projesi oluştur
npm create vite@latest frontend -- --template react
cd frontend

# Bağımlılıkları yükle
npm install

# App.jsx'i src/ klasörüne kopyalayın

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda açın: **http://localhost:5173**

---

## 🔌 API Referansı

### `GET /health`
API ve model durumunu kontrol eder.

**Yanıt:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "classes": ["Akciğer Çökmesi", "Sağlıklı", "Verem", "Zatürre"]
}
```

---

### `POST /predict`
Röntgen görüntüsünü analiz eder.

**İstek:** `multipart/form-data`
| Alan | Tip | Açıklama |
|------|-----|---------|
| `image` | File | PNG, JPG, WEBP formatında görüntü |

**Yanıt:**
```json
{
  "prediction": "Akciğer Çökmesi",
  "icon": "🫁",
  "color": "#ef4444",
  "confidence": 94.1,
  "all_probabilities": [
    { "class": "Akciğer Çökmesi", "probability": 94.1 },
    { "class": "Zatürre", "probability": 5.8 },
    { "class": "Verem", "probability": 0.0 },
    { "class": "Sağlıklı", "probability": 0.0 }
  ]
}
```

---

## 🚀 Kullanım

1. **Backend** terminalinde `python app.py` çalıştırın
2. **Frontend** terminalinde `npm run dev` çalıştırın
3. **http://localhost:5173** adresini açın
4. Röntgen görüntüsünü sürükleyip bırakın veya seçin
5. **"Teşhis Et"** butonuna tıklayın
6. Sonucu ve olasılık dağılımını görüntüleyin

---

## 📦 Bağımlılıklar

### Python
```
flask==3.0.0
flask-cors==4.0.0
tensorflow==2.15.0
numpy==1.26.0
Pillow==10.2.0
```

### JavaScript
```
react 18
vite 7
```

---

## ⚠️ Önemli Notlar

- Bu proje **araştırma amaçlıdır**, tıbbi teşhis için kullanılamaz.
- Model tahminleri bir uzman hekim görüşünün yerini tutmaz.
- `app.py` içindeki `CLASS_NAMES` sırası, modelin eğitim sırasındaki `class_indices` ile birebir eşleşmelidir.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

## 🙏 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açmanız önerilir.

---

<div align="center">
  <sub>MobileNetV2 Transfer Öğrenme · Flask REST API · React Web Arayüzü</sub>
</div>
