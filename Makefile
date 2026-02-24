.PHONY: lint test run \
	dev-up qa-up prod-up \
	dev-install qa-install prod-install install \
	dev-down qa-down prod-down down \
	dev-logs qa-logs prod-logs logs \
	dev-ps qa-ps prod-ps ps \
	dev-restart qa-restart prod-restart restart \
	bootstrap qa

COMPOSE ?= docker compose

lint:
	gofmt -w cmd pkg
	go vet ./...

test:
	go test ./...

run:
	go run ./cmd

dev-up:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build

qa-up:
	$(COMPOSE) -f docker-compose.qa.yml up -d --build

prod-up:
	$(COMPOSE) -f docker-compose.prod.yml up -d --build

dev-install: dev-up

qa-install: qa-up

prod-install: prod-up

install: dev-install

bootstrap:
	$(COMPOSE) -f docker-compose.dev.yml pull
	$(COMPOSE) -f docker-compose.qa.yml pull
	$(COMPOSE) -f docker-compose.prod.yml pull

dev-down:
	$(COMPOSE) -f docker-compose.dev.yml down || true

qa-down:
	$(COMPOSE) -f docker-compose.qa.yml down || true

prod-down:
	$(COMPOSE) -f docker-compose.prod.yml down || true

down:
	$(MAKE) dev-down
	$(MAKE) qa-down
	$(MAKE) prod-down

dev-logs:
	$(COMPOSE) -f docker-compose.dev.yml logs --tail=100 -f

qa-logs:
	$(COMPOSE) -f docker-compose.qa.yml logs --tail=100 -f

prod-logs:
	$(COMPOSE) -f docker-compose.prod.yml logs --tail=100 -f

logs: dev-logs

dev-ps:
	$(COMPOSE) -f docker-compose.dev.yml ps

qa-ps:
	$(COMPOSE) -f docker-compose.qa.yml ps

prod-ps:
	$(COMPOSE) -f docker-compose.prod.yml ps

ps: dev-ps

dev-restart: dev-down dev-up

qa-restart: qa-down qa-up

prod-restart: prod-down prod-up

restart: dev-restart

qa:
	bash scripts/qa_tests.sh
