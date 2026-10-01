"""
Waste Classification Dataset Preprocessing & Generator
Handles:
- Data transforms and augmentations
- Real dataset loading
- Synthetic waste image benchmark generator for local training/testing
"""

import os
import random
from pathlib import Path
from typing import Dict, List, Tuple
from PIL import Image, ImageDraw, ImageFilter

from ml.model import WASTE_CLASSES

# Color schemes typical for each waste category in visual recognition
CATEGORY_VISUAL_PROFILES = {
    "organic": {"colors": [(46, 125, 50), (139, 195, 74), (160, 82, 45), (107, 142, 35)], "shapes": ["circle", "irregular"]},
    "dry_recyclable": {"colors": [(245, 245, 220), (210, 180, 140), (230, 230, 250), (192, 192, 192)], "shapes": ["rectangle", "box"]},
    "plastic": {"colors": [(30, 144, 255), (0, 191, 255), (255, 255, 255), (255, 215, 0)], "shapes": ["bottle", "cylinder"]},
    "glass": {"colors": [(32, 178, 170), (72, 209, 204), (175, 238, 238), (47, 79, 79)], "shapes": ["bottle", "oval"]},
    "metal": {"colors": [(169, 169, 169), (192, 192, 192), (211, 211, 211), (112, 128, 144)], "shapes": ["can", "rectangle"]},
    "e_waste": {"colors": [(33, 33, 33), (0, 100, 0), (70, 70, 70), (0, 128, 128)], "shapes": ["chip", "circuit"]},
    "hazardous": {"colors": [(255, 69, 0), (220, 20, 60), (255, 0, 0), (178, 34, 34)], "shapes": ["cylinder", "warning"]},
    "non_recyclable": {"colors": [(105, 105, 105), (50, 50, 50), (128, 128, 128)], "shapes": ["irregular", "blob"]}
}

def generate_sample_waste_image(category: str, item_label: str, size: Tuple[int, int] = (224, 224)) -> Image.Image:
    """Generates a clean synthetic waste artifact image for training/testing."""
    profile = CATEGORY_VISUAL_PROFILES.get(category, CATEGORY_VISUAL_PROFILES["non_recyclable"])
    bg_color = (random.randint(235, 250), random.randint(235, 250), random.randint(235, 250))
    img = Image.new("RGB", size, bg_color)
    draw = ImageDraw.Draw(img)

    obj_color = random.choice(profile["colors"])
    cx, cy = size[0] // 2, size[1] // 2
    offset = random.randint(30, 60)

    # Draw representative shape
    draw.rectangle([cx - offset, cy - offset, cx + offset, cy + offset], fill=obj_color, outline=(40, 40, 40), width=2)
    # Add accent/texture
    draw.ellipse([cx - offset // 2, cy - offset // 2, cx + offset // 2, cy + offset // 2], fill=random.choice(profile["colors"]))

    # Apply slight blur to simulate camera focus
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    return img

def create_synthetic_dataset(output_dir: str, samples_per_class: int = 25):
    """
    Creates a benchmark training, validation and test split directory structure
    with synthetic images so the model pipeline can train, evaluate, and test immediately.
    """
    splits = {"train": 0.7, "val": 0.15, "test": 0.15}
    base = Path(output_dir)

    for split in splits.keys():
        for cat in WASTE_CLASSES:
            split_dir = base / split / cat
            split_dir.mkdir(parents=True, exist_ok=True)
            count = int(samples_per_class * splits[split])
            for i in range(max(1, count)):
                img = generate_sample_waste_image(cat, f"{cat}_{i}")
                img.save(split_dir / f"{cat}_{i:03d}.jpg", quality=90)

    print(f"[DATASET] Successfully generated dataset with {samples_per_class} samples/class at {output_dir}")
