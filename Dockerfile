FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY cmd ./cmd
COPY pkg ./pkg
RUN go build -o vaporlab ./cmd

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/vaporlab /usr/local/bin/vaporlab
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/vaporlab"]
