FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY cmd ./cmd
COPY pkg ./pkg
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/vaporlab ./cmd

FROM alpine:3.20
WORKDIR /app
RUN addgroup -S vapor && adduser -S -G vapor vapor \
    && apk add --no-cache ca-certificates wget
COPY --from=builder /out/vaporlab /usr/local/bin/vaporlab
USER vapor
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD sh -c "wget -qO- http://127.0.0.1:8080/healthz >/dev/null && wget -qO- http://127.0.0.1:8080/readyz >/dev/null"
ENTRYPOINT ["/usr/local/bin/vaporlab"]
