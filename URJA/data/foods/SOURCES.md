# Nutrition Data Sources & Methodology: Sakhi

## 1. Primary Source: Indian Food Composition Tables (IFCT) 2017
All baseline macronutrient and energy values in `foods.json` are referenced directly from:
- **Publication:** Indian Food Composition Tables (IFCT 2017)
- **Institution:** National Institute of Nutrition (ICMR-NIN), Hyderabad, India
- **Authors:** T. Longvah, R. Ananthan, K. Bhaskarachary, K. Venkaiah

Specific table citations:
- Cereals & Millets: Table 1 (Wheat flour/Atta, White rice, Brown rice, Poha, Oats)
- Grain Legumes (Pulses & Dals): Table 2 (Toor dal, Moong dal, Masoor dal, Chana dal, Rajma, Kabuli chana)
- Green Leafy Vegetables: Table 3 (Palak / Spinach, Methi / Fenugreek)
- Other Vegetables: Table 4 (Bhindi / Okra, Lauki / Bottle gourd, Baingan / Brinjal, Gobi / Cauliflower, Shimla mirch)
- Roots & Tubers: Table 5 (Aloo / Potato, Gajar / Carrot, Pyaaz / Onion)
- Milk & Milk Products: Table 8 (Cow milk, Dahi / Curd, Paneer)
- Egg & Poultry: Table 9 (Whole egg, Boiled egg, Chicken breast)
- Condiments & Spices: Table 10 (Jeera, Haldi, Mustard oil, Desi ghee)

## 2. Integrity Rules (§0.3)
1. Every food entry specifies its exact IFCT 2017 table reference.
2. Incomplete or derived items (e.g. prepared mixed poha vs dry poha flakes) are marked with `source: "IFCT 2017, Table 1 (prepared estimate)"`.
3. Any food with unverified micronutrient data is tagged `TODO_VERIFY` and the user interface explicitly tags the display with *"approx."*.
4. Zero invented nutrient numbers.
