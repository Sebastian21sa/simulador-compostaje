"""
Reorganiza el dataset de 38 clases de Johns Hopkins University (Roboflow
Universe, "Compost classification") en un problema binario:
compostable vs. contaminante.

Se conservan los splits train/valid/test originales de Roboflow (no se
mezclan) para no filtrar informacion entre entrenamiento y evaluacion.
"""
import shutil
from pathlib import Path

SOURCE_DIR = Path("/home/claude/ml-compost/vision/raw/extracted")
DEST_DIR = Path("/home/claude/ml-compost/vision/binary")

# Fundamentado en guias comunes de que se puede/no se puede compostar
# (ver docs/plan-evolucion-ml.md). "Compost straw" y "Compost take away
# container" son productos explicitamente compostables (bioplasticos).
COMPOSTABLE = {
    "Eggshells",
    "Compost straw",
    "Compost take away container",
    "Food waste",
    "Fruit waste",
    "Grass",
    "Leaves",
    "Tea bag",
    "Untreated wood chips",
    "Woods",
    "Shredded paper",
    "Paper",
    "Cardboard",
    "Notepad",
}

CONTAMINANTE = {
    "Aluminum",
    "Backpack",
    "Beauty Products",
    "Construction and Demolition Waste",
    "Forks",
    "Glass",
    "broken glass",
    "Metal Water Bottle",
    "Mug",
    "Paint related",
    "Picture Frame",
    "Plastic Bottles",
    "Recyclable Plastics",
    "Remote",
    "Scissors",
    "Sea Shell",
    "Thermal Paper",
    "Tupperware",
    "clingfilm",
    "crisp packet",
    "footwears",
    "polystyrene",
    "sanitary products",
    "textile",
}


def label_for(class_name: str) -> str | None:
    name = class_name.strip()
    if name in COMPOSTABLE:
        return "compostable"
    if name in CONTAMINANTE:
        return "contaminante"
    return None


def main() -> None:
    counts = {"train": {"compostable": 0, "contaminante": 0}, "valid": {"compostable": 0, "contaminante": 0}, "test": {"compostable": 0, "contaminante": 0}}
    unmapped = set()

    for split in ["train", "valid", "test"]:
        split_dir = SOURCE_DIR / split
        if not split_dir.exists():
            continue
        for class_dir in split_dir.iterdir():
            if not class_dir.is_dir():
                continue
            label = label_for(class_dir.name)
            if label is None:
                unmapped.add(class_dir.name)
                continue
            dest = DEST_DIR / split / label
            dest.mkdir(parents=True, exist_ok=True)
            for img_path in class_dir.iterdir():
                if img_path.is_file():
                    shutil.copy2(img_path, dest / f"{class_dir.name.replace(' ', '_')}__{img_path.name}")
                    counts[split][label] += 1

    print("Distribucion final:")
    for split, labels in counts.items():
        print(f"  {split}: {labels}")

    if unmapped:
        print("\nClases sin mapear (revisar):", unmapped)


if __name__ == "__main__":
    main()
