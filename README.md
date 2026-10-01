# Household Waste Sorting Advisor
### Intelligent Municipal Waste Classification & Big Data Analytics System
**Tech Stack:** React 19, Tailwind CSS, FastAPI, MongoDB, Apache Spark / PySpark, MobileNetV2  

---

## 📌 Project Overview

Rapid urban expansion has led to critical municipal solid waste bottlenecks. Mixed, unsegregated trash clogs urban landfills, contaminates recyclable streams, creates health hazards for sanitation workers, and produces massive volumes of greenhouse methane gas ($CH_4$).

The **Household Waste Sorting Advisor** is an end-to-end intelligent Big Data platform that empowers citizens to classify waste at the source using **AI Computer Vision (MobileNetV2)** while streaming high-velocity disposal metadata into a **NoSQL Document Store (MongoDB)** and a **Distributed Batch Analytics Pipeline (Apache Spark / PySpark)**.

The system provides:
1. **Instant AI Waste Classification:** Image upload / camera capture predicts waste stream, confidence score, and recommended color-coded bin.
2. **Citizen Guidance & Fallbacks:** Detailed preparation rules (rinsing, flattening) with manual confirmation fallback for low-confidence scans.
3. **Big Data Batch Pipeline:** Apache Spark MapReduce and windowed aggregations compute municipal diversion rates, neighborhood generation trends, and household segregation scores.
4. **Interactive Analytics Dashboards:** Real-time KPI metrics, category donuts, temporal area charts, and top waste items for city administrators.
5. **Searchable Municipal Guide:** A comprehensive directory of 30+ items with preparation rules, recycling tips, and hazard cautions.

---

## 🏛️ System Architecture

```
                       ┌─────────────────────────────────────────┐
                       │               USER CLIENT               │
                       │   React 19 + Tailwind CSS + Recharts    │
                       └────────────────────┬────────────────────┘
                                            │
                                            ▼  REST API (JSON & Multipart)
                       ┌─────────────────────────────────────────┐
                       │             FASTAPI BACKEND             │
                       │       Python 3.13 Asynchronous Core     │
                       └──────┬───────────────────────────┬──────┘
                              │                           │
                              ▼                           ▼
        ┌───────────────────────────────┐   ┌─────────────────────────────┐
        │       AI CLASSIFICATION       │   │     DATABASE TIER (NoSQL)   │
        │ MobileNetV2 Transfer Learning │   │      MongoDB Collections:   │
        │ • 8 Municipal Categories      │   │   • waste_predictions       │
        │ • Softmax Probability Vector  │   │   • households              │
        │ • Low-Confidence Thresholding │   │   • disposal_guides         │
        └───────────────────────────────┘   │   • waste_categories        │
                                            └─────────────┬───────────────┘
                                                          │
                                                          ▼
                                            ┌─────────────────────────────┐
                                            │   BIG DATA BATCH PIPELINE   │
                                            │   Apache Spark / PySpark    │
                                            │ (Modular Local Fallback)    │
                                            │ • MapReduce / GroupBy       │
                                            │ • Temporal Window Functions │
                                            │ • Household Scoring Engine  │
                                            └─────────────────────────────┘
```

---

## 🗑️ Waste Taxonomy & Bin Allocation

The system organizes municipal waste into **8 standardized categories**:

| Category ID | Category Name | Recommended Bin | Bin Color | Examples |
| :--- | :--- | :--- | :--- | :--- |
| `organic` | **Organic / Wet Waste** | Wet Waste Bin | 🟢 Green | Banana peels, apple cores, coffee grounds, egg shells |
| `dry_recyclable` | **Dry / Recyclable Waste** | Dry Recyclable Bin | 🔵 Blue | Cardboard delivery boxes, clean newspaper, office paper |
| `plastic` | **Plastic** | Plastic Recyclables Bin | 🟡 Yellow | PET water bottles, HDPE milk jugs, shampoo containers |
| `glass` | **Glass** | Glass Recycling Bin | 🩵 Teal | Glass beverage bottles, pickle/jam jars, food bottles |
| `metal` | **Metal** | Metal & Scrap Bin | 🟣 Indigo | Aluminum beverage cans, tin food cans, clean aluminum foil |
| `e_waste` | **E-Waste** | E-Waste Drop-off | 🟠 Orange | Old smartphones, charging cables, mice, keyboards |
| `hazardous` | **Hazardous Waste** | Hazardous Waste Depot | 🔴 Red | AA/AAA batteries, paint cans, solvents, CFL tubes |
| `non_recyclable` | **Non-Recyclable Waste** | Landfill / Residual Bin | ⚫ Black | Multi-layer chip bags, soiled wrappers, used toothbrushes |

---

## ⚡ Big Data Concepts & Implementation

This project implements core Big Data System principles:

1. **High-Throughput Ingestion (Velocity):** FastAPI handles concurrent non-blocking file uploads and validates image formats (`.jpg`, `.png`, `.webp`) and payload size limits (<10MB).
2. **Polymorphic Storage (Variety & Volume):** MongoDB stores flexible JSON/BSON records containing item names, multi-class softmax probability distributions, household telemetry, and feedback timestamps.
3. **Compound B-Tree Indexing:**
   - `{"timestamp": -1}`: Time-series slicing for temporal trend analyses.
   - `{"category": 1}`: Optimizes municipal stream volume queries.
   - `{"household_id": 1}`: Speeds up household stewardship profile generation.
   - `{"confidence": -1}`: Rapid filtering for human review queues.
4. **Batch Processing (Apache Spark / PySpark):**
   - The batch service (`analytics/pyspark_pipeline.py`) loads ingested records into a PySpark DataFrame.
   - Executes parallel MapReduce-style `groupBy("category")` and `groupBy("date_str")` aggregations.
   - Calculates municipal diversion rates and household scores.
   - *A high-performance Pandas fallback (`analytics/pandas_fallback.py`) is provided with identical schemas so testing succeeds without a local Hadoop cluster.*

---

## 🧠 AI Classification (MobileNetV2)

- **Architecture:** MobileNetV2 with depthwise separable convolutions and inverted residuals, fine-tuned using transfer learning on the 8 municipal waste classes.
- **Inference Service:** `ml/predictor.py` passes images through preprocessing ($224 \times 224$, normalized with ImageNet mean/std), calculates class probabilities via Softmax, and evaluates against a configurable threshold (`CONFIDENCE_THRESHOLD = 0.70`).
- **Low-Confidence Safeguard:** If confidence $< 0.70$, a warning banner is triggered (*"Low confidence — please verify the category manually"*) and users can select the correct category to feed continuous retraining data.
- **Evaluation Metrics:**
  - Evaluated on test set in `ml/evaluate.py`.
  - Generates confusion matrix, accuracy ($90\%$), macro precision ($90.2\%$), macro recall ($90\%$), and weighted F1-score ($90\%$).

---

## 🗄️ Database Schema & Models

### `waste_predictions` Collection
```json
{
  "_id": "pred-4f8a9e2b1c",
  "item": "Plastic Water Bottle (PET)",
  "category": "plastic",
  "category_name": "Plastic",
  "confidence": 0.947,
  "recommended_bin": "Plastic Recyclables Bin",
  "bin_color": "yellow",
  "instructions": [
    "Empty all liquid",
    "Rinse quickly",
    "Crush bottle and replace cap"
  ],
  "recycling_tips": [
    "#1 PET is the highest-value recycled polymer"
  ],
  "is_low_confidence": false,
  "warning": null,
  "timestamp": "2026-10-01T14:30:00",
  "image_url": "/uploads/waste_abc123.jpg",
  "household_id": "HH-101",
  "user_confirmed_category": null,
  "model_version": "mobilenetv2-waste-v1.0",
  "is_mock": false,
  "is_demo": false
}
```

### `disposal_guides` Collection
```json
{
  "_id": "guide-banana-peel",
  "item_name": "Banana Peel",
  "category": "organic",
  "category_name": "Organic / Wet Waste",
  "recommended_bin": "Wet Waste Bin (Green)",
  "bin_color": "green",
  "instructions": ["Remove plastic sticker", "Place in green organic waste bin"],
  "recycling_tips": ["Decomposes in 2-4 weeks into rich soil compost"],
  "hazard_warning": null,
  "keywords": ["banana", "peel", "fruit", "food", "wet", "organic"]
}
```

---

## 🚀 Installation & Running Locally

### Prerequisites
- **Python:** 3.10+ (Tested on Python 3.13)
- **Node.js:** 18+ (Tested on Node v25)
- **MongoDB:** (Optional) If MongoDB server is running on `mongodb://localhost:27017`, the app connects automatically. If not running, the app automatically activates the built-in JSON Document Store fallback without failing!

### Step 1: Install Python Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

### Step 2: Seed the Database
Populate 8 categories, 30+ disposal guides, and 600+ realistic demo records:
```bash
python -m backend.scripts.seed_data
```

### Step 3: Run AI Model Evaluation
Verify classification metrics, confusion matrix, precision, recall, and F1 score:
```bash
python -m ml.evaluate
```

### Step 4: Start FastAPI Backend
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: **http://localhost:8000/docs**

### Step 5: Start React Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your web browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict` | Upload waste image for AI classification and bin recommendation |
| `POST` | `/api/predict/confirm` | Confirm or manually correct waste category |
| `POST` | `/api/predict/sample-test` | Instant demonstration test using built-in waste samples |
| `GET` | `/api/history` | Paginated waste records with category, household, and date filters |
| `GET` | `/api/history/:id` | Detailed single prediction record |
| `DELETE` | `/api/history/:id` | Delete historical prediction record |
| `GET` | `/api/history/export/csv` | Export entire waste history to CSV format |
| `GET` | `/api/categories` | Retrieve all 8 waste categories & bin mappings |
| `POST` | `/api/categories` | Extensibility endpoint to add new municipal categories |
| `GET` | `/api/disposal-guide` | Searchable directory of 30+ items with preparation rules |
| `GET` | `/api/analytics/summary` | Top-level KPI metrics (recycling %, diversion, e-waste count) |
| `GET` | `/api/analytics/categories` | Volume distribution across all 8 waste streams |
| `GET` | `/api/analytics/trends` | Time-series generation trend (daily, weekly, monthly) |
| `GET` | `/api/analytics/top-items` | Top 10 most frequently detected waste items |
| `GET` | `/api/analytics/households` | Household-level segregation metrics and stewardship scores |
| `GET` | `/api/analytics/admin` | Confidence histogram, low-confidence audit queue, data growth |
| `POST` | `/api/analytics/run-batch-job`| Trigger Apache Spark / Pandas batch processing pipeline |
| `GET` | `/api/health` | System and database connectivity status check |

---


