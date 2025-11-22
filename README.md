# [Drawing](https://github.com/europanite/drawing "Drawing")

[![CI](https://github.com/europanite/drawing/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/drawing/actions/workflows/ci.yml)
[![docker](https://github.com/europanite/drawing/actions/workflows/docker.yml/badge.svg)](https://github.com/europanite/drawing/actions/workflows/docker.yml)
[![GitHub Pages](https://github.com/europanite/drawing/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/europanite/drawing/actions/workflows/deploy-pages.yml)

!["web_ui"](./assets/images/web_ui.png)

 [PlayGround](https://europanite.github.io/drawing/)

A browser-based drawing tool.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Docker Compose](https://docs.docker.com/compose/)

### 2. Build and start all services:

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up

```

### 3. Test:
```bash
docker compose \
-f docker-compose.test.yml up \
--build --exit-code-from \
frontend_test
```

---

# License
- Apache License 2.0