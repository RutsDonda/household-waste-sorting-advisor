"""
MobileNetV2 Transfer Learning Architecture for Household Waste Classification
Supports 8 municipal household waste categories:
1. Organic / Wet Waste
2. Dry / Recyclable Waste
3. Plastic
4. Glass
5. Metal
6. E-Waste
7. Hazardous Waste
8. Non-Recyclable Waste
"""

import os
from typing import List

# List of target waste class labels
WASTE_CLASSES: List[str] = [
    "organic",
    "dry_recyclable",
    "plastic",
    "glass",
    "metal",
    "e_waste",
    "hazardous",
    "non_recyclable"
]

WASTE_CLASS_NAMES = {
    "organic": "Organic / Wet Waste",
    "dry_recyclable": "Dry / Recyclable Waste",
    "plastic": "Plastic",
    "glass": "Glass",
    "metal": "Metal",
    "e_waste": "E-Waste",
    "hazardous": "Hazardous Waste",
    "non_recyclable": "Non-Recyclable Waste"
}

NUM_CLASSES = len(WASTE_CLASSES)

def get_mobilenet_model(num_classes: int = NUM_CLASSES, pretrained: bool = True):
    """
    Returns a PyTorch MobileNetV2 model configured for waste classification.
    If PyTorch is installed, builds the transfer learning architecture.
    """
    try:
        import torch
        import torch.nn as nn
        from torchvision import models

        weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v2(weights=weights)

        # Freeze early feature extraction layers for transfer learning
        for param in model.features.parameters():
            param.requires_grad = False

        # Replace classification head
        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(256, num_classes)
        )
        return model
    except ImportError:
        return None
