.PHONY: help install dev build test lint format clean docker-build docker-run docker-stop db-setup

help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development server"
	@echo "  build       - Build the application"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linter"
	@echo "  format      - Format code"
	@echo "  clean       - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run  - Run with Docker Compose"
	@echo "  docker-stop - Stop Docker Compose"
	@echo "  db-setup    - Setup database"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf dist node_modules coverage

docker-build:
	docker build -t scraping-guardrails .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

db-setup:
	npm run db:generate
	npm run db:push
	npm run db:setup

all: install db-setup dev