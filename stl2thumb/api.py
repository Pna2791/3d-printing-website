"""
STL thumbnail HTTP API — wraps `render.sh` (stl-thumb + xvfb-run).
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

logger = logging.getLogger(__name__)

RENDER_SCRIPT = os.environ.get("STL2THUMB_RENDER_PATH", "/usr/local/bin/render")
MAX_UPLOAD_BYTES = int(os.environ.get("STL2THUMB_MAX_UPLOAD_MB", "52")) * 1024 * 1024
RENDER_TIMEOUT_SEC = int(os.environ.get("STL2THUMB_RENDER_TIMEOUT_SEC", "120"))

MaterialPreset = Literal["grey", "blue", "emerald"]

# Mirrors `render.sh` — single place for API validation; render.sh applies Phong hex at runtime.
PRESET_ALIASES: dict[str, MaterialPreset] = {
    "grey": "grey",
    "gray": "grey",
    "blue": "blue",
    "emerald": "emerald",
}


def normalize_preset(raw: str) -> MaterialPreset:
    key = (raw or "emerald").strip().lower()
    if key in PRESET_ALIASES:
        return PRESET_ALIASES[key]
    raise HTTPException(
        status_code=400,
        detail=f"Unknown material_preset '{raw}'. Use grey, blue, or emerald.",
    )


app = FastAPI(title="stl2thumb", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate")
async def generate(
    file: UploadFile = File(..., description="Binary STL"),
    material_preset: str = Form("emerald", description="grey | blue | emerald"),
    thumb_size: int = Form(768, description="Square edge in px, min 512"),
    recalc_normals: str = Form("false", description="true to pass --recalc-normals"),
) -> Response:
    name = (file.filename or "").lower()
    if not name.endswith(".stl"):
        raise HTTPException(status_code=400, detail="Only .stl uploads are supported.")

    preset = normalize_preset(material_preset)

    if thumb_size < 512 or thumb_size > 4096:
        raise HTTPException(status_code=400, detail="thumb_size must be between 512 and 4096.")

    recalc = recalc_normals.strip().lower() in ("1", "true", "yes", "on")

    stl_bytes = await file.read()
    if len(stl_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(stl_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large.")

    job_dir = tempfile.mkdtemp(prefix="stl2thumb-job-")
    stl_path = Path(job_dir) / "input.stl"
    png_path = Path(job_dir) / "thumb.png"

    try:
        stl_path.write_bytes(stl_bytes)

        env = os.environ.copy()
        env["MATERIAL_PRESET"] = preset
        env["THUMB_SIZE"] = str(thumb_size)
        env.setdefault("MESA_GL_VERSION_OVERRIDE", "2.1")
        if recalc:
            env["STL_RECALC_NORMALS"] = "1"

        proc = subprocess.run(
            ["bash", RENDER_SCRIPT, str(stl_path), str(png_path)],
            env=env,
            capture_output=True,
            text=True,
            timeout=RENDER_TIMEOUT_SEC,
            check=False,
        )

        if proc.returncode != 0:
            tail = (proc.stderr or proc.stdout or "")[-800:]
            logger.warning("render failed rc=%s stderr=%s", proc.returncode, tail)
            raise HTTPException(
                status_code=500,
                detail="Render failed.",
            )

        if not png_path.is_file():
            raise HTTPException(status_code=500, detail="PNG output missing.")

        png_data = png_path.read_bytes()
        if len(png_data) < 48 or png_data[:8] != b"\x89PNG\r\n\x1a\n":
            raise HTTPException(status_code=500, detail="Invalid PNG output.")

        return Response(content=png_data, media_type="image/png")
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)
