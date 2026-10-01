import sys
from fastapi.testclient import TestClient
from backend.main import app

def run_api_tests():
    print("=" * 60)
    print("  Household Waste Sorting Advisor - Full System API Verification")
    print("=" * 60)

    with TestClient(app) as client:
        # 1. Health
        res = client.get("/api/health")
        print(f"1. GET /api/health: {res.status_code} - {res.json()}")
        assert res.status_code == 200

        # 2. Categories
        res = client.get("/api/categories")
        categories = res.json()
        print(f"2. GET /api/categories: {res.status_code} - {len(categories)} categories")
        assert res.status_code == 200
        assert len(categories) >= 8

        # 3. Disposal Guides
        res = client.get("/api/disposal-guide")
        guides = res.json()
        print(f"3. GET /api/disposal-guide: {res.status_code} - {len(guides)} items")
        assert res.status_code == 200
        assert len(guides) > 0

        # 4. Analytics Summary
        res = client.get("/api/analytics/summary")
        summary = res.json()
        print(f"4. GET /api/analytics/summary: {res.status_code} - Total: {summary['total_predictions']}, Recycling: {summary['recycling_percentage']}%")
        assert res.status_code == 200
        assert summary['total_predictions'] > 0

        # 5. Analytics Categories Distribution
        res = client.get("/api/analytics/categories")
        cat_dist = res.json()
        print(f"5. GET /api/analytics/categories: {res.status_code} - {len(cat_dist)} stream distributions")
        assert res.status_code == 200

        # 6. Trends
        res = client.get("/api/analytics/trends?timeframe=daily")
        trends = res.json()
        print(f"6. GET /api/analytics/trends: {res.status_code} - {len(trends)} time points")
        assert res.status_code == 200

        # 7. Household Profiles
        res = client.get("/api/analytics/households")
        households = res.json()
        print(f"7. GET /api/analytics/households: {res.status_code} - {len(households)} households")
        assert res.status_code == 200
        assert len(households) > 0

        # 8. Admin Analytics
        res = client.get("/api/analytics/admin")
        admin = res.json()
        print(f"8. GET /api/analytics/admin: {res.status_code} - Predictions/day: {admin['predictions_per_day']}")
        assert res.status_code == 200

        # 9. AI Prediction with Built-in Test Sample
        res = client.post("/api/predict/sample-test", data={"item_sample": "plastic_bottle", "household_id": "HH-101"})
        prediction = res.json()
        print(f"9. POST /api/predict/sample-test: {res.status_code} - Item: '{prediction['item']}', Bin: '{prediction['recommended_bin']}', Conf: {prediction['confidence']}")
        assert res.status_code == 200
        assert "item" in prediction
        assert "recommended_bin" in prediction

        # 10. Manual Category Confirmation
        pred_id = prediction["id"]
        res = client.post("/api/predict/confirm", json={"prediction_id": pred_id, "confirmed_category": "plastic"})
        print(f"10. POST /api/predict/confirm: {res.status_code} - {res.json()['message']}")
        assert res.status_code == 200

        # 11. History Retrieval
        res = client.get("/api/history?limit=5")
        hist = res.json()
        print(f"11. GET /api/history: {res.status_code} - Retrieved {len(hist['items'])} items (Total: {hist['total']})")
        assert res.status_code == 200
        assert hist["total"] > 0

        # 12. Big Data Batch Job Trigger
        res = client.post("/api/analytics/run-batch-job")
        batch = res.json()
        print(f"12. POST /api/analytics/run-batch-job: {res.status_code} - Engine: {batch['engine_used']}, Records: {batch['records_processed']}, Latency: {batch['execution_time_seconds']}s")
        assert res.status_code == 200
        assert batch["status"] == "COMPLETED"

        print("\n" + "=" * 60)
        print("  ALL 12 SYSTEM API ENDPOINTS VERIFIED SUCCESSFULLY!")
        print("=" * 60)

if __name__ == "__main__":
    run_api_tests()
