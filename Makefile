.PHONY: lint test run dev-up qa-up prod-up down qa

lint:
	gofmt -w cmd pkg
	go vet ./...

test:
	go test ./...

run:
	go run ./cmd

dev-up:
	docker-compose -f docker-compose.dev.yml up -d --build

qa-up:
	docker-compose -f docker-compose.qa.yml up -d --build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d --build

down:
	docker-compose -f docker-compose.dev.yml down || true
	docker-compose -f docker-compose.qa.yml down || true
	docker-compose -f docker-compose.prod.yml down || true

qa:
	bash scripts/qa_tests.sh
