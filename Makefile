.PHONY: lint test run \
	dev-up qa-up prod-up \
	dev-install qa-install prod-install install \
	dev-down qa-down prod-down down \
	dev-logs qa-logs prod-logs logs \
	dev-ps qa-ps prod-ps ps \
	dev-restart qa-restart prod-restart restart \
	bootstrap qa load-test soak-test exploit-all

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
	@echo ""
	@echo "VaporLab dev stack is up."
	@echo "Workspace:   http://localhost:15100/workspace/home"
	@echo "  Projects:  http://localhost:15100/workspace/projects"
	@echo "  Backlog:   http://localhost:15100/workspace/backlog"
	@echo "  Roadmap:   http://localhost:15100/workspace/roadmap"
	@echo "  Reports:   http://localhost:15100/workspace/reports"
	@echo "  Settings:  http://localhost:15100/workspace/settings"
	@echo "Operator:    http://localhost:15100/operator"
	@echo "Operator credentials:"
	@echo "  user=operator"
	@echo "  pass=vaporlab"
	@echo "  mfa=000000"
	@echo "Workspace credentials:"
	@echo "  user=userA  pass=vaporlab  tenant=tenant-a"
	@echo "  user=userB  pass=vaporlab  tenant=tenant-b"
	@echo "API Health:  http://localhost:18080/healthz"
	@echo "Operator API control: http://localhost:18080/operator/modules"
	@echo "Prometheus:  http://localhost:19090"
	@echo "Grafana:     http://localhost:13000"
	@echo "Jaeger:      http://localhost:16687"
	@echo ""
	@echo "Useful checks:"
	@echo "  make dev-logs"
	@echo "  curl -s http://localhost:18080/chain/run"

qa-up:
	$(COMPOSE) -f docker-compose.qa.yml up -d --build
	@echo ""
	@echo "VaporLab QA stack is up."
	@echo "Workspace:   http://localhost:25100/workspace"
	@echo "Operator:    http://localhost:25100/operator"
	@echo "Operator key: vaporlab-ops"
	@echo "API Health:  http://localhost:28080/healthz"
	@echo "Prometheus:  http://localhost:29090"
	@echo "Grafana:     http://localhost:23000"
	@echo "Jaeger:      http://localhost:26687"
	@echo ""
	@echo "Useful checks:"
	@echo "  make qa-logs"
	@echo "  curl -s http://localhost:28080/chain/run"

prod-up:
	$(COMPOSE) -f docker-compose.prod.yml up -d --build
	@echo ""
	@echo "VaporLab prod stack is up."
	@echo "Workspace:   http://localhost:35100/workspace"
	@echo "Operator:    http://localhost:35100/operator"
	@echo "Operator key: vaporlab-ops"
	@echo "API Health:  http://localhost:38080/healthz"
	@echo "Prometheus:  http://localhost:39090"
	@echo "Grafana:     http://localhost:33000"
	@echo "Jaeger:      http://localhost:36687"
	@echo ""
	@echo "Useful checks:"
	@echo "  make prod-logs"
	@echo "  curl -s http://localhost:38080/chain/run"

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

load-test:
	bash scripts/load_test.sh http://localhost:38080 500 25 /ai/query

soak-test:
	bash scripts/stability_soak.sh http://localhost:38080 60 30 /tmp/vaporlab_stability_soak.log

exploit-all:
	python3 scripts/exploit_all.py --base-url http://localhost:18080
