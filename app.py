from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from pydantic import BaseModel

from transformers import T5Tokenizer, T5ForConditionalGeneration

import torch

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(title="AI Text Summarizer")

# ============================================
# STATIC FILES
# ============================================

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# ============================================
# DEVICE
# ============================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Using Device : {device}")

# ============================================
# LOAD MODEL
# ============================================

MODEL_PATH = "./saved_model"

tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH)

model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)

model.to(device)

model.eval()

print("Model Loaded Successfully!")

# ============================================
# REQUEST MODEL
# ============================================

class TextRequest(BaseModel):

    text: str

# ============================================
# HOME PAGE
# ============================================

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request,
        "index.html"
    )

# ============================================
# SUMMARIZE FUNCTION
# ============================================

def summarize_text(text):

    inputs = tokenizer(
        "summarize: " + text,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    summary_ids = model.generate(
    input_ids=inputs["input_ids"],
    attention_mask=inputs["attention_mask"],
    max_new_tokens=50,
    min_new_tokens=10,
    num_beams=6,
    length_penalty=2.0,
    no_repeat_ngram_size=3,
    early_stopping=True
)

    summary = tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )

    return summary

# ============================================
# API ENDPOINT
# ============================================

@app.post("/summarize")

async def summarize(data: TextRequest):

    summary = summarize_text(data.text)

    return {

        "summary": summary

    }

# ============================================
# RUN
# ============================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )