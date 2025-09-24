from typing import List
from uuid import uuid4
from io import BytesIO
from pathlib import Path
import os
import re
import hashlib

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
MAX_FILES = 10  # Maximum number of files per upload

# Magic bytes for file type validation
MAGIC_BYTES = {
    b'\xff\xd8\xff': '.jpg',  # JPEG
    b'\x89PNG\r\n\x1a\n': '.png',  # PNG
    b'RIFF': '.webp',  # WebP (starts with RIFF)
}

# Additional WebP validation
WEBP_MAGIC = b'WEBP'

router = APIRouter()

def _sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal attacks."""
    if not filename:
        return "unnamed"
    
    # Remove path separators and dangerous characters
    filename = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', filename)
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Limit length
    if len(filename) > 100:
        name, ext = os.path.splitext(filename)
        filename = name[:100-len(ext)] + ext
    
    return filename or "unnamed"

def _validate_magic_bytes(data: bytes) -> str:
    """Validate file type using magic bytes."""
    if len(data) < 12:
        raise HTTPException(status_code=400, detail="File too small to be a valid image")
    
    # Check JPEG
    if data.startswith(b'\xff\xd8\xff'):
        return '.jpg'
    
    # Check PNG
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return '.png'
    
    # Check WebP (more complex validation)
    if data.startswith(b'RIFF') and len(data) >= 12:
        if data[8:12] == WEBP_MAGIC:
            return '.webp'
    
    raise HTTPException(status_code=400, detail="Invalid file type - not a supported image format")

def _validate_file_content(data: bytes) -> None:
    """Content validation for security - minimal checks only."""
    # For image files, we rely on:
    # 1. Magic byte validation (ensures it's actually an image)
    # 2. PIL image processing (safely handles any content)
    # 3. Metadata stripping (removes embedded data)
    # 4. Format enforcement (ensures clean output)
    
    # Only check for obvious non-image files that somehow passed magic byte validation
    # This is a safety net for edge cases
    if data.startswith(b'#!/') and len(data) < 10000:  # Small shell scripts
        raise HTTPException(status_code=400, detail="File appears to be a script, not an image")
    
    # No other content validation needed - PIL will safely process any image content

def _save_image_strip_exif(file: UploadFile) -> str:
    # Sanitize filename
    original_filename = _sanitize_filename(file.filename or "")
    
    # Validate extension
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    # Read and limit size
    data = file.file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 8 MB)")
    
    if len(data) < 100:  # Minimum file size check
        raise HTTPException(status_code=400, detail="File too small to be a valid image")

    # Validate magic bytes (actual file type)
    detected_ext = _validate_magic_bytes(data)
    if detected_ext != ext:
        raise HTTPException(status_code=400, detail=f"File extension {ext} does not match actual file type {detected_ext}")

    # Additional content validation
    _validate_file_content(data)

    # Validate image + strip EXIF
    try:
        img = Image.open(BytesIO(data))
        # Verify it's actually an image by attempting to load it
        img.verify()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # Reopen image for processing (verify() closes the image)
    img = Image.open(BytesIO(data))
    
    # Convert to RGB to remove any potential alpha channels and metadata
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    
    # Create new image without EXIF data
    img_no_exif = Image.new(img.mode, img.size)
    img_no_exif.putdata(list(img.getdata()))

    # Soft resize if huge
    w, h = img_no_exif.size
    if max(w, h) > MAX_DIM:
        scale = MAX_DIM / float(max(w, h))
        img_no_exif = img_no_exif.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # Generate secure filename with UUID and hash
    uid = uuid4().hex
    file_hash = hashlib.sha256(data).hexdigest()[:8]  # First 8 chars of hash
    out_ext = ".jpg" if detected_ext in {".jpg", ".jpeg"} else detected_ext
    out_path = UPLOADS_DIR / f"{uid}_{file_hash}{out_ext}"

    # Ensure the uploads directory exists and is secure
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save with security options
    save_kwargs = {}
    if out_ext == ".jpg":
        save_kwargs.update({"quality": 88, "optimize": True, "format": "JPEG"})
    elif out_ext == ".png":
        save_kwargs.update({"optimize": True, "format": "PNG"})
    elif out_ext == ".webp":
        save_kwargs.update({"quality": 88, "optimize": True, "format": "WEBP"})

    try:
        img_no_exif.save(out_path, **save_kwargs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    # URL path to return
    return f"/static/uploads/{out_path.name}"

@router.post("/upload_images")
async def upload_images(files: List[UploadFile] = File(...)):
    # Validate number of files
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Too many files. Maximum {MAX_FILES} files allowed per upload.")
    
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided.")
    
    urls: List[str] = []
    processed_files = set()  # Track processed files to prevent duplicates
    
    for f in files:
        # Reset file pointer
        f.file.seek(0)
        
        # Check for empty files
        if not f.filename:
            raise HTTPException(status_code=400, detail="One or more files have no filename.")
        
        # Check for duplicate files (by filename)
        if f.filename in processed_files:
            raise HTTPException(status_code=400, detail=f"Duplicate file detected: {f.filename}")
        processed_files.add(f.filename)
        
        try:
            urls.append(_save_image_strip_exif(f))
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            # Catch any unexpected errors
            raise HTTPException(status_code=500, detail=f"Unexpected error processing file {f.filename}: {str(e)}")
    
    return {"image_urls": urls}