FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        python3 \
        python3-pip \
        python3-venv \
        xvfb \
        libosmesa6 \
        libgl1-mesa-glx \
        mesa-utils \
        libxcursor1 \
        libxi6 \
        libxrandr2 \
        libxinerama1 \
        libxxf86vm1 \
        tini \
    && ARCH="$(dpkg --print-architecture)" \
    && export ARCH \
    && curl -fsSL \
        "https://api.github.com/repos/unlimitedbacon/stl-thumb/releases/latest" \
        -o /tmp/stl-thumb-release.json \
    && DEB_URL="$(python3 -c 'import json, os; j=json.load(open("/tmp/stl-thumb-release.json")); a=os.environ["ARCH"]; u=[x["browser_download_url"] for x in j.get("assets",[]) if x["name"].endswith("_"+a+".deb")]; assert u, "No stl-thumb .deb for "+a; print(u[0])')" \
    && curl -fsSL "$DEB_URL" -o /tmp/stl-thumb.deb \
    && apt-get install -y --no-install-recommends /tmp/stl-thumb.deb \
    && rm -rf /tmp/stl-thumb.deb /tmp/stl-thumb-release.json /var/lib/apt/lists/*

ENV MESA_GL_VERSION_OVERRIDE=2.1

RUN useradd --create-home --uid 1000 --shell /bin/bash stlrender \
    && mkdir -p /opt/thumb \
    && chown stlrender:stlrender /opt/thumb

COPY requirements.txt /opt/thumb/requirements.txt
RUN python3 -m venv /opt/thumb/venv \
    && /opt/thumb/venv/bin/pip install --no-cache-dir -r /opt/thumb/requirements.txt \
    && chown -R stlrender:stlrender /opt/thumb/venv

COPY --chown=stlrender:stlrender render.sh /usr/local/bin/render
COPY --chown=stlrender:stlrender api.py /opt/thumb/api.py
RUN chmod 0755 /usr/local/bin/render

USER stlrender
WORKDIR /opt/thumb

EXPOSE 8887

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/opt/thumb/venv/bin/python", "-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8887"]
