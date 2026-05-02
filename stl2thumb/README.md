# stl2thumb — Dockerized STL thumbnails (stl-thumb + xvfb)

Headless thumbnails from STL files using [stl-thumb](https://github.com/unlimitedbacon/stl-thumb) (Phong materials, FXAA) inside Ubuntu 22.04 with a virtual framebuffer.

The image uses [tini](https://github.com/krallin/tini) as PID 1 so `xvfb-run` can receive `SIGUSR1` from Xvfb when the display is ready. Without a minimal init, `docker run` with this entrypoint can hang on some hosts.

## Quick start (host wrapper)

From this directory:

```bash
./run.sh build
./run.sh path/to/model.stl path/to/thumb.png
```

`run.sh` builds the image, picks volume mounts from your STL/output paths, and forwards optional env vars (`MATERIAL_PRESET`, `THUMB_SIZE`, etc.). Override the image name with `STL2THUMB_IMAGE` if needed.

## Build

From this directory:

```bash
docker build -t stl2thumb .
```

The image resolves the latest `stl-thumb` `.deb` for your build architecture (`amd64`, `arm64`, …) from GitHub Releases at build time.

## Run

Mount a host folder that contains your STL (and where you want the image written). Example: current directory as `/data` in the container:

```bash
docker run --rm \
  -v "$(pwd):/data" \
  stl2thumb \
  /data/models/part.stl \
  /data/out/part-thumb.png
```

- **Input**: first argument — path to the STL inside the container (use paths under your mount, e.g. `/data/...`).
- **Output**: second argument — path for the image; format follows the extension (`png`, `jpg`, `jpeg`).

JPEG example:

```bash
docker run --rm -v "$(pwd):/data" stl2thumb /data/model.stl /data/model.jpg
```

### Volume mapping

Use `-v HOST_PATH:CONTAINER_PATH` so the container can read the STL and write the image:

| Host | Container | Role |
|------|-----------|------|
| e.g. `/home/you/stl-jobs` | `/data` | Shared workspace: put STLs here and write outputs to the same (or a sub) path |

Paths in `docker run` after the image name are **container** paths, so they must start with the mount prefix you chose (e.g. `/data/...`).

Read-only input (optional): mount inputs read-only and a separate writable mount for output, e.g. `-v ~/in:/in:ro -v ~/out:/out` then `/in/file.stl` and `/out/file.png`.

### Environment (optional)

| Variable | Description |
|----------|-------------|
| `MATERIAL_PRESET` | `grey` (default) or `blue` — Phong ambient / diffuse / specular hex tuned for a matte plastic look. |
| `THUMB_SIZE` | Square size in pixels (default `1024`, minimum `512`). |
| `STL_RECALC_NORMALS` | Set to `1` to add `--recalc-normals` for bad STLs. |

Example:

```bash
docker run --rm -e MATERIAL_PRESET=blue -e THUMB_SIZE=2048 \
  -v "$(pwd):/data" stl2thumb /data/a.stl /data/a.png
```

### Software GL (if rendering fails on some hosts)

Try:

```bash
docker run --rm -e LIBGL_ALWAYS_SOFTWARE=1 -v "$(pwd):/data" stl2thumb /data/a.stl /data/a.png
```

## Wrapper script

The container entrypoint is `/usr/local/bin/render`: it runs `stl-thumb` under `xvfb-run` with `--antialiasing fxaa`, `--material` from the preset, and `--size` from `THUMB_SIZE`.

## Security

The process runs as non-root user `stlrender` (UID 1000). `tini` is the container entrypoint wrapper only; the renderer still runs as `stlrender`.
