"""
Seed and Demo Data Generator
Populates:
1. Standard Waste Categories
2. Comprehensive Searchable Disposal Guide (30+ items)
3. 600+ realistic waste prediction records across 15 households (HH-101 to HH-115)
   spanning the past 45 days.
All synthetic records are explicitly tagged with is_demo: True.
"""

import asyncio
import os
import random
import uuid
from datetime import datetime, timedelta

from backend.config import DEFAULT_CATEGORIES
from backend.database import db_manager, get_database
from ml.model import WASTE_CLASS_NAMES

# Rich disposal guide knowledge base
SEED_DISPOSAL_ITEMS = [
    # Organic / Wet Waste
    {
        "item_name": "Banana Peel",
        "category": "organic",
        "category_name": "Organic / Wet Waste",
        "recommended_bin": "Wet Waste Bin (Green)",
        "bin_color": "green",
        "instructions": ["Remove plastic sticker/label before disposal", "Place in green organic waste bin or home composter"],
        "recycling_tips": ["Decomposes in 2-4 weeks", "Rich in potassium and phosphorus for soil"],
        "hazard_warning": None,
        "keywords": ["banana", "peel", "fruit", "food", "wet", "organic"]
    },
    {
        "item_name": "Apple Core",
        "category": "organic",
        "category_name": "Organic / Wet Waste",
        "recommended_bin": "Wet Waste Bin (Green)",
        "bin_color": "green",
        "instructions": ["Dispose of in green wet bin", "Ideal for organic vermicomposting"],
        "recycling_tips": ["Composts rapidly within 3 weeks"],
        "hazard_warning": None,
        "keywords": ["apple", "core", "fruit", "organic", "wet"]
    },
    {
        "item_name": "Vegetable Scraps",
        "category": "organic",
        "category_name": "Organic / Wet Waste",
        "recommended_bin": "Wet Waste Bin (Green)",
        "bin_color": "green",
        "instructions": ["Drain excess liquid", "Do not wrap in polythene bags"],
        "recycling_tips": ["Standard feedstock for municipal aerobic compost plants"],
        "hazard_warning": None,
        "keywords": ["vegetable", "peel", "carrot", "potato", "onion", "greens"]
    },
    {
        "item_name": "Used Coffee Grounds & Filter",
        "category": "organic",
        "category_name": "Organic / Wet Waste",
        "recommended_bin": "Wet Waste Bin (Green)",
        "bin_color": "green",
        "instructions": ["Unbleached paper filters are 100% compostable with grounds"],
        "recycling_tips": ["Adds organic matter and acidity to garden soil"],
        "hazard_warning": None,
        "keywords": ["coffee", "grounds", "filter", "cafe"]
    },
    {
        "item_name": "Eggshells",
        "category": "organic",
        "category_name": "Organic / Wet Waste",
        "recommended_bin": "Wet Waste Bin (Green)",
        "bin_color": "green",
        "instructions": ["Crush slightly to accelerate decomposition", "Put into wet bin"],
        "recycling_tips": ["Adds vital calcium to compost blends"],
        "hazard_warning": None,
        "keywords": ["egg", "shell", "breakfast", "calcium"]
    },

    # Dry / Recyclable
    {
        "item_name": "Cardboard Delivery Box",
        "category": "dry_recyclable",
        "category_name": "Dry / Recyclable Waste",
        "recommended_bin": "Dry Recyclable Bin (Blue)",
        "bin_color": "blue",
        "instructions": ["Remove plastic shipping tape and labels", "Flatten box completely"],
        "recycling_tips": ["Corrugated cardboard can be recycled up to 7 times"],
        "hazard_warning": None,
        "keywords": ["cardboard", "box", "amazon", "packaging", "carton"]
    },
    {
        "item_name": "Newspaper / Magazine",
        "category": "dry_recyclable",
        "category_name": "Dry / Recyclable Waste",
        "recommended_bin": "Dry Recyclable Bin (Blue)",
        "bin_color": "blue",
        "instructions": ["Keep dry; wet paper cannot be processed by optical paper sorters", "Bundle together"],
        "recycling_tips": ["1 ton of recycled paper saves 17 trees and 7,000 gallons of water"],
        "hazard_warning": None,
        "keywords": ["paper", "newspaper", "magazine", "flyer", "reading"]
    },
    {
        "item_name": "Cereal Box / Paperboard",
        "category": "dry_recyclable",
        "category_name": "Dry / Recyclable Waste",
        "recommended_bin": "Dry Recyclable Bin (Blue)",
        "bin_color": "blue",
        "instructions": ["Remove inner plastic cereal bag and dispose in plastic stream", "Flatten box"],
        "recycling_tips": ["Easily recycled into paper tubes and egg cartons"],
        "hazard_warning": None,
        "keywords": ["cereal", "box", "paperboard", "carton"]
    },

    # Plastic
    {
        "item_name": "Plastic Water Bottle (PET #1)",
        "category": "plastic",
        "category_name": "Plastic",
        "recommended_bin": "Plastic Recyclables Bin (Yellow)",
        "bin_color": "yellow",
        "instructions": ["Empty all liquid", "Rinse quickly", "Crush bottle and replace cap"],
        "recycling_tips": ["#1 PET is the highest-value recycled polymer", "Spun into fleece fibers and polyester clothing"],
        "hazard_warning": None,
        "keywords": ["plastic", "water", "bottle", "pet", "beverage"]
    },
    {
        "item_name": "Milk Jug (HDPE #2)",
        "category": "plastic",
        "category_name": "Plastic",
        "recommended_bin": "Plastic Recyclables Bin (Yellow)",
        "bin_color": "yellow",
        "instructions": ["Rinse with warm water to remove milk fat residue", "Leave cap on"],
        "recycling_tips": ["#2 HDPE is remolded into picnic tables, detergent bottles, and recycling bins"],
        "hazard_warning": None,
        "keywords": ["milk", "jug", "hdpe", "dairy", "plastic"]
    },
    {
        "item_name": "Shampoo / Conditioner Bottle",
        "category": "plastic",
        "category_name": "Plastic",
        "recommended_bin": "Plastic Recyclables Bin (Yellow)",
        "bin_color": "yellow",
        "instructions": ["Pump out remaining product and rinse bottle", "Recycle bottle in yellow bin"],
        "recycling_tips": ["High-density polymer suitable for durable goods manufacturing"],
        "hazard_warning": None,
        "keywords": ["shampoo", "soap", "bathroom", "bottle"]
    },

    # Glass
    {
        "item_name": "Glass Beverage Bottle",
        "category": "glass",
        "category_name": "Glass",
        "recommended_bin": "Glass Recycling Bin (Teal)",
        "bin_color": "teal",
        "instructions": ["Rinse clean", "Separate metal cap", "Do not break bottle"],
        "recycling_tips": ["Infinitely recyclable without degradation in clarity or strength"],
        "hazard_warning": "Caution: Broken glass presents cut hazards. Wrap in paper if shattered.",
        "keywords": ["glass", "bottle", "beer", "wine", "soda"]
    },
    {
        "item_name": "Pickle / Jam Glass Jar",
        "category": "glass",
        "category_name": "Glass",
        "recommended_bin": "Glass Recycling Bin (Teal)",
        "bin_color": "teal",
        "instructions": ["Soak and rinse out sticky residue", "Metal lids can be recycled in metal bin"],
        "recycling_tips": ["Melts at 1500°C to blow new containers"],
        "hazard_warning": None,
        "keywords": ["jar", "jam", "pickle", "glass", "sauce"]
    },

    # Metal
    {
        "item_name": "Aluminum Beverage Can",
        "category": "metal",
        "category_name": "Metal",
        "recommended_bin": "Metal & Scrap Bin (Indigo)",
        "bin_color": "indigo",
        "instructions": ["Drain remaining liquid", "Crush can to save volume", "Toss in metal bin"],
        "recycling_tips": ["Recycling aluminum uses 95% less energy than mining raw bauxite ore"],
        "hazard_warning": None,
        "keywords": ["aluminum", "soda", "coke", "can", "beer", "metal"]
    },
    {
        "item_name": "Tin Food Can (Soup/Beans)",
        "category": "metal",
        "category_name": "Metal",
        "recommended_bin": "Metal & Scrap Bin (Indigo)",
        "bin_color": "indigo",
        "instructions": ["Rinse food remnants", "Push lid inside the can to avoid sharp edges"],
        "recycling_tips": ["Steel is magnetic and easily segregated at automated sorting plants"],
        "hazard_warning": "Warning: Can edges can be sharp.",
        "keywords": ["tin", "can", "steel", "soup", "beans", "food"]
    },
    {
        "item_name": "Aluminum Foil (Clean)",
        "category": "metal",
        "category_name": "Metal",
        "recommended_bin": "Metal & Scrap Bin (Indigo)",
        "bin_color": "indigo",
        "instructions": ["Wipe off visible grease", "Crumple into a ball at least 2 inches wide so it doesn't fall through sorting grates"],
        "recycling_tips": ["Pure aluminum easily remelted into ingots"],
        "hazard_warning": None,
        "keywords": ["foil", "wrap", "aluminum", "baking"]
    },

    # E-Waste
    {
        "item_name": "Old Smartphone",
        "category": "e_waste",
        "category_name": "E-Waste",
        "recommended_bin": "E-Waste Drop-off (Orange)",
        "bin_color": "orange",
        "instructions": ["Perform factory reset to clear personal data", "Take to certified electronics recycler"],
        "recycling_tips": ["1 million cell phones yield 35,000 lbs of copper and 772 lbs of silver"],
        "hazard_warning": "Do not puncture or crush internal lithium battery.",
        "keywords": ["phone", "mobile", "electronics", "smartphone", "iphone", "android"]
    },
    {
        "item_name": "Charging Cables & Wires",
        "category": "e_waste",
        "category_name": "E-Waste",
        "recommended_bin": "E-Waste Drop-off (Orange)",
        "bin_color": "orange",
        "instructions": ["Bundle together with a rubber band", "Drop off at e-waste collection bin"],
        "recycling_tips": ["High-purity copper core is stripped and granulated"],
        "hazard_warning": None,
        "keywords": ["cable", "charger", "usb", "wire", "cord"]
    },
    {
        "item_name": "Computer Mouse / Keyboard",
        "category": "e_waste",
        "category_name": "E-Waste",
        "recommended_bin": "E-Waste Drop-off (Orange)",
        "bin_color": "orange",
        "instructions": ["Remove external batteries if wireless", "Deliver to municipal e-waste center"],
        "recycling_tips": ["Separated into ABS plastic shells and printed wiring boards"],
        "hazard_warning": None,
        "keywords": ["mouse", "keyboard", "pc", "computer", "peripherals"]
    },

    # Hazardous Waste
    {
        "item_name": "AA / AAA Alkaline Batteries",
        "category": "hazardous",
        "category_name": "Hazardous Waste",
        "recommended_bin": "Hazardous Waste Depot (Red)",
        "bin_color": "red",
        "instructions": ["Tape positive terminal with clear tape to prevent short circuits", "Store in dry container until drop-off"],
        "recycling_tips": ["Processed in pyro-metallurgical furnaces to extract zinc and manganese"],
        "hazard_warning": "Danger: Corrosive electrolyte hazard. Never throw into domestic trash.",
        "keywords": ["battery", "batteries", "aa", "aaa", "alkaline"]
    },
    {
        "item_name": "Paint Can / Thinner",
        "category": "hazardous",
        "category_name": "Hazardous Waste",
        "recommended_bin": "Hazardous Waste Depot (Red)",
        "bin_color": "red",
        "instructions": ["Keep sealed tightly in original labeled container", "Take to Household Hazardous Waste (HHW) depot"],
        "recycling_tips": ["Unused latex paints are blended and re-sold; oil paints used as industrial fuel"],
        "hazard_warning": "Warning: Flammable and toxic VOC fumes.",
        "keywords": ["paint", "thinner", "chemical", "solvent", "varnish"]
    },
    {
        "item_name": "Fluorescent Light Tube / CFL",
        "category": "hazardous",
        "category_name": "Hazardous Waste",
        "recommended_bin": "Hazardous Waste Depot (Red)",
        "bin_color": "red",
        "instructions": ["Do not break", "Wrap carefully in bubble wrap or cardboard sleeve and bring to HHW center"],
        "recycling_tips": ["Special vacuum distillers capture toxic mercury vapor safely"],
        "hazard_warning": "High Hazard: Contains toxic mercury gas.",
        "keywords": ["bulb", "fluorescent", "cfl", "light", "mercury"]
    },

    # Non-Recyclable Waste
    {
        "item_name": "Multi-layer Snack / Chip Bag",
        "category": "non_recyclable",
        "category_name": "Non-Recyclable Waste",
        "recommended_bin": "Landfill / Residual Bin (Black)",
        "bin_color": "black",
        "instructions": ["Cannot be recycled due to fused aluminum-plastic film layers", "Dispose in black trash bin"],
        "recycling_tips": ["Look for terra-cycle collection drives or purchase compostable packaging"],
        "hazard_warning": None,
        "keywords": ["chips", "snack", "wrapper", "foil", "crisps"]
    },
    {
        "item_name": "Used Toothbrush",
        "category": "non_recyclable",
        "category_name": "Non-Recyclable Waste",
        "recommended_bin": "Landfill / Residual Bin (Black)",
        "bin_color": "black",
        "instructions": ["Composite nylon bristles and molded rubber handles cannot be separated", "Dispose in black bin"],
        "recycling_tips": ["Switch to biodegradable bamboo toothbrushes"],
        "hazard_warning": None,
        "keywords": ["toothbrush", "hygiene", "bathroom", "brush"]
    },
    {
        "item_name": "Broken Ceramic Coffee Mug",
        "category": "non_recyclable",
        "category_name": "Non-Recyclable Waste",
        "recommended_bin": "Landfill / Residual Bin (Black)",
        "bin_color": "black",
        "instructions": ["Wrap in paper to prevent injury to collectors", "Dispose in black bin"],
        "recycling_tips": ["Ceramics melt at temperatures far higher than container glass"],
        "hazard_warning": "Sharp shards caution.",
        "keywords": ["ceramic", "mug", "plate", "dish", "porcelain"]
    }
]

# Items pool for generating realistic synthetic prediction logs
ITEMS_POOL = {
    "organic": ["Banana Peel", "Apple Core", "Vegetable Scraps", "Used Coffee Grounds", "Egg Shells", "Stale Bread", "Orange Rind", "Tea Bags", "Melon Rind"],
    "dry_recyclable": ["Cardboard Box", "Newspaper", "Cereal Carton", "Office Paper", "Paper Bag", "Corrugated Shipping Packaging", "Magazine"],
    "plastic": ["Plastic Water Bottle (PET)", "Milk Jug (HDPE)", "Shampoo Bottle", "Plastic Food Container", "Detergent Bottle", "Plastic Soda Bottle"],
    "glass": ["Glass Beverage Bottle", "Pickle Jar", "Jam Jar", "Wine Bottle", "Glass Olive Oil Bottle"],
    "metal": ["Aluminum Soda Can", "Tin Food Can", "Aluminum Foil", "Empty Aerosol Can", "Metal Crown Cap"],
    "e_waste": ["Old Smartphone", "Charging Cable", "Computer Mouse", "USB Drive", "Laptop Battery", "Earphones"],
    "hazardous": ["AA Alkaline Battery", "AAA Alkaline Battery", "Paint Thinner Can", "Fluorescent Tube", "Pesticide Spray Can", "Lithium Button Cell"],
    "non_recyclable": ["Multi-layer Chip Bag", "Soiled Food Wrapper", "Used Toothbrush", "Broken Ceramic Mug", "Styrofoam Container", "Greasy Pizza Box Bottom"]
}

CATEGORY_WEIGHTS = {
    "organic": 0.32,
    "plastic": 0.22,
    "dry_recyclable": 0.18,
    "metal": 0.08,
    "glass": 0.07,
    "e_waste": 0.05,
    "hazardous": 0.04,
    "non_recyclable": 0.04
}

async def seed_database(total_predictions: int = 650):
    print("=" * 60)
    print("  Household Waste Sorting Advisor - Database Seeder")
    print("=" * 60)

    await db_manager.connect()
    db = get_database()

    # 1. Seed Categories
    print("[1/4] Seeding waste categories...")
    for cat in DEFAULT_CATEGORIES:
        await db.waste_categories.update_one(
            {"id": cat["id"]},
            {"$set": cat},
            upsert=True
        )
    print(f"      Seeded {len(DEFAULT_CATEGORIES)} waste categories.")

    # 2. Seed Disposal Guides
    print("[2/4] Seeding disposal guides...")
    for guide in SEED_DISPOSAL_ITEMS:
        guide_doc = dict(guide)
        guide_doc["_id"] = f"guide-{guide['item_name'].lower().replace(' ', '-')}"
        await db.disposal_guides.update_one(
            {"item_name": guide["item_name"]},
            {"$set": guide_doc},
            upsert=True
        )
    print(f"      Seeded {len(SEED_DISPOSAL_ITEMS)} detailed disposal guides.")

    # 3. Seed Households
    print("[3/4] Seeding household profiles...")
    households = [f"HH-1{i:02d}" for i in range(1, 16)]  # HH-101 to HH-115
    for hh in households:
        hh_doc = {
            "household_id": hh,
            "created_at": (datetime.now() - timedelta(days=50)).isoformat(),
            "region": "Sector-A Urban Ward",
            "is_demo": True
        }
        await db.households.update_one(
            {"household_id": hh},
            {"$set": hh_doc},
            upsert=True
        )
    print(f"      Seeded {len(households)} households.")

    # 4. Generate 600+ realistic waste prediction records
    print(f"[4/4] Generating {total_predictions} synthetic waste predictions...")
    categories_list = list(CATEGORY_WEIGHTS.keys())
    weights_list = [CATEGORY_WEIGHTS[c] for c in categories_list]

    now = datetime.now()
    records = []

    for i in range(total_predictions):
        cat = random.choices(categories_list, weights=weights_list)[0]
        item = random.choice(ITEMS_POOL[cat])
        hh = random.choice(households)

        # Distribute over last 40 days
        days_ago = random.randint(0, 40)
        hours_ago = random.randint(0, 23)
        mins_ago = random.randint(0, 59)
        record_time = now - timedelta(days=days_ago, hours=hours_ago, minutes=mins_ago)

        # Realistic confidence score: mostly high (0.85-0.98), 6% low confidence (<0.70)
        if random.random() < 0.06:
            confidence = round(random.uniform(0.51, 0.69), 3)
            is_low = True
            user_confirmed = cat if random.random() > 0.3 else None
        else:
            confidence = round(random.uniform(0.85, 0.98), 3)
            is_low = False
            user_confirmed = None

        doc = {
            "_id": f"pred-{uuid.uuid4().hex[:12]}",
            "item": item,
            "category": cat,
            "category_name": WASTE_CLASS_NAMES[cat],
            "confidence": confidence,
            "recommended_bin": f"{cat.replace('_', ' ').title()} Bin",
            "bin_color": "blue" if cat in ["dry_recyclable", "plastic"] else ("green" if cat == "organic" else "orange"),
            "instructions": ["Handle according to municipal segregation guidelines"],
            "recycling_tips": ["Helps reduce landfill waste"],
            "is_low_confidence": is_low,
            "warning": "Low confidence — please verify the category manually." if is_low else None,
            "timestamp": record_time.isoformat(),
            "image_url": f"/uploads/demo_{cat}.jpg",
            "household_id": hh,
            "user_confirmed_category": user_confirmed,
            "model_version": "mobilenetv2-waste-v1.0 (Demo)",
            "is_mock": True,
            "is_demo": True
        }
        records.append(doc)

    await db.waste_predictions.insert_many(records)
    print(f"      Successfully inserted {len(records)} realistic waste records.")

    # Run initial batch job so analytics are pre-computed
    print("\n[ANALYTICS] Pre-calculating initial batch analytics...")
    from analytics.service import analytics_service
    batch_res = await analytics_service.run_batch_job(db)
    print(f"            Batch Job ID: {batch_res['job_id']}")
    print(f"            Engine Used:  {batch_res['engine_used']}")
    print(f"            Records:      {batch_res['records_processed']}")
    print(f"            Execution:    {batch_res['execution_time_seconds']}s")

    print("\n[COMPLETE] Seed process finished successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
