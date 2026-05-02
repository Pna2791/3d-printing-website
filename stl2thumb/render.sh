#!/bin/bash
set -euo pipefail

usage() {
    cat >&2 <<'EOF'
Usage: render <input.stl> <output.png|jpg|jpeg>

Environment:
  MATERIAL_PRESET   grey | blue | emerald (default: grey; emerald = site zinc/emerald accent)
  THUMB_SIZE        Square edge length in pixels (default: 1024, min: 512)
  STL_RECALC_NORMALS  Set to 1 to pass --recalc-normals for malformed STLs
  MESA_GL_VERSION_OVERRIDE  Override if needed (default: 2.1)
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

if [[ $# -lt 2 ]]; then
    usage
    exit 1
fi

stl_path="$1"
out_path="$2"

if [[ ! -f "$stl_path" ]]; then
    echo "error: STL not found: $stl_path" >&2
    exit 1
fi

preset="${MATERIAL_PRESET:-grey}"
case "$preset" in
    grey)
        # Matte "printed" grey: soft ambient, neutral diffuse, restrained specular.
        ambient="3C4045"
        diffuse="7A8088"
        specular="A8ADB5"
        ;;
    blue)
        # Tech / PETG-blue: deep ambient, saturated diffuse, cool specular highlight.
        ambient="1E3A5F"
        diffuse="4A90D9"
        specular="9BC4E2"
        ;;
    emerald)
        # Zinc studio backdrop + emerald accent (Tailwind zinc-950 / emerald-500 family).
        ambient="18181B"
        diffuse="059669"
        specular="6EE7B7"
        ;;
    *)
        echo "error: unknown MATERIAL_PRESET='$preset' (use grey, blue, or emerald)" >&2
        exit 1
        ;;
esac

size="${THUMB_SIZE:-1024}"
if [[ "$size" =~ ^[0-9]+$ ]] && (( size < 512 )); then
    echo "error: THUMB_SIZE must be at least 512 (got $size)" >&2
    exit 1
fi

extra_args=()
if [[ "${STL_RECALC_NORMALS:-0}" == "1" ]]; then
    extra_args+=(--recalc-normals)
fi

export MESA_GL_VERSION_OVERRIDE="${MESA_GL_VERSION_OVERRIDE:-2.1}"

exec xvfb-run -a --server-args="-screen 0 1280x720x24" \
    stl-thumb \
    --size "$size" \
    --antialiasing fxaa \
    --material "$ambient" "$diffuse" "$specular" \
    "${extra_args[@]}" \
    "$stl_path" \
    "$out_path"
