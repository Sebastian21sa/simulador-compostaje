"""
EDA del dataset real de compostaje (hafsa-kibria/Compost-Dataset).
"""
import pandas as pd
import numpy as np

df = pd.read_csv("/home/claude/ml-compost/data/compost_data.csv")

print("=== Shape ===")
print(df.shape)

print("\n=== Columnas y tipos ===")
print(df.dtypes)

print("\n=== Nulos por columna ===")
print(df.isnull().sum())

print("\n=== Describe ===")
pd.set_option("display.width", 160)
pd.set_option("display.max_columns", 20)
print(df.describe())

print("\n=== Correlación con Score ===")
corr = df.corr(numeric_only=True)["Score"].sort_values(ascending=False)
print(corr)

print("\n=== Distribución del Score (percentiles) ===")
print(df["Score"].describe())
for p in [10, 25, 50, 75, 90]:
    print(f"p{p}: {np.percentile(df['Score'], p):.2f}")
