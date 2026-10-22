# PySim in one image: the API, the built front end, and the Python that grades
# answers.
#
# The Python is the whole reason this file is not optional. Answers are decided
# by running real Python against real test cases (docs/adr/0001), so the runtime
# has to carry an interpreter and the libraries the problems import. That rules
# out the ordinary Node hosts, and it means "which host" stops being a question
# about Node versions and becomes "anywhere that runs a container" - which is
# every host, and therefore a decision that can wait.
#
#   docker build -t pysim .
#   docker run -p 3001:3001 --env-file server/.env.production.local pysim
#
# Or, with the local language model (Ollama) beside it,
#   docker compose --env-file server/.env.production.local up -d --build

# ---------------------------------------------------------------- build stage
# The front end is built here and only its output is copied forward, so none of
# the client's build tooling ends up in the shipped image.
FROM node:22-bookworm-slim AS client-build

WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
# shared/ is imported by the client bundle (arcadeConfig.json) through a
# relative path that climbs out of client/, so it has to exist at the same
# position it does in the repo.
COPY shared/ /build/shared/
# Vite's @shared alias intentionally points at the server copy so the browser
# and grader use the same Python error translator.
COPY server/pythonErrorMessages.mjs /build/server/pythonErrorMessages.mjs

# Left unset by default: the API serves this bundle from its own origin, so
# relative paths are correct and no address needs baking in. Set it only when
# the API really is on another host.
ARG VITE_API_BASE_URL=""
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
COPY server/runtime/environment.js /build/server/runtime/environment.js
COPY server/auth/productionSettings.js /build/server/auth/productionSettings.js
RUN node -e "require('/build/server/runtime/environment').validateClientBuildEnvironment(process.env)"
RUN npm run build

# -------------------------------------------------------------- runtime stage
FROM node:22-bookworm-slim AS runtime

# python3 is the grader's engine, not a convenience. The build toolchain is
# removed again in the same layer so it does not ride along in the image.
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip python3-venv ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# A virtualenv rather than --break-system-packages: Debian's Python is managed
# by apt, and installing into it is how a base image upgrade turns into a
# grading outage.
ENV VIRTUAL_ENV=/opt/pysim-venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY server/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# matplotlib must never try to open a window: a learner's answer that calls
# plt.show() would otherwise hang until the grader's timeout kills it, and be
# reported as a wrong answer.
ENV MPLBACKEND=Agg

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./
COPY shared/ /app/shared/
COPY --from=client-build /build/client/dist /app/client/dist

# The grader spawns `python`; Debian installs `python3` only.
RUN ln -sf $VIRTUAL_ENV/bin/python /usr/local/bin/python

# Outside the application directory on purpose, so a redeploy that replaces
# /app leaves uploaded files untouched. Mount a volume here.
ENV UPLOADS_DIR=/data/uploads
RUN mkdir -p /data/uploads
RUN chown node:node /data/uploads

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# The process needs write access only to the mounted upload directory. The
# release itself stays owned by root and read-only to the application user.
USER node

# Readiness includes the PostgreSQL connection and the required migration
# version. A process can be alive while its database is unavailable, so the
# deploy platform should route traffic only after this endpoint succeeds.
HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=6 \
    CMD node -e "fetch('http://127.0.0.1:3001/api/health/ready').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No CMD indirection: the API server is the process, and PID 1 should be the
# thing whose exit means the container is done.
CMD ["node", "server.js"]
