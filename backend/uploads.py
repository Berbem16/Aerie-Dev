from typing import List
from uuid import uuid4
from io import BytesIO
from pathlib import Path
import os

from fastapi import APIRouter, HTTPException, UploadFile, File
from PIL import Image

# --- paths ---
STATIC_DIR = Path("static")
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# --- config ---
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB
MAX_DIM = 4096

router = APIRouter()

def _save_image_strip_exif(file: UploadFile) -> str:
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    # Read and limit size
    data = file.file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 8 MB)")

    # Validate image + strip EXIF
    try:
        img = Image.open(BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    img_no_exif = Image.new(img.mode, img.size)
    img_no_exif.putdata(list(img.getdata()))

    # Soft resize if huge
    w, h = img_no_exif.size
    if max(w, h) > MAX_DIM:
        scale = MAX_DIM / float(max(w, h))
        img_no_exif = img_no_exif.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # Save with UUID name
    uid = uuid4().hex
    out_ext = ".jpg" if ext in {".jpg", ".jpeg"} else ext
    out_path = UPLOADS_DIR / f"{uid}{out_ext}"

    save_kwargs = {}
    if out_ext == ".jpg":
        save_kwargs.update({"quality": 88, "optimize": True})
    if out_ext == ".png":
        save_kwargs.update({"optimize": True})

    img_no_exif.save(out_path, **save_kwargs)

    # URL path to return
    return f"/static/uploads/{out_path.name}"

@router.post("/upload_images")
async def upload_images(files: List[UploadFile] = File(...)):
    urls: List[str] = []
    for f in files:
        f.file.seek(0)
        urls.append(_save_image_strip_exif(f))
    return {"image_urls": urls}