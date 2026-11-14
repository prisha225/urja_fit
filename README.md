# URJA

Prototype foundation for a general-wellness fitness companion for adult women in India. It is not a medical device and remains **pending professional review**.

## Run

```powershell
npm install
python -m pip install -r apps/api/requirements.txt
npm run dev
python -m uvicorn app.main:app --app-dir apps/api
```

Visit `http://localhost:3000/kit` for the Phase 0 design kit.

## Verify

```powershell
npm run check
```

Fixture nutrient values are deliberately zero and labeled `TODO_VERIFY`; no unverified nutrition values are represented as facts.
