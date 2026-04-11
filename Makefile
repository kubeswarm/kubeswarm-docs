.PHONY: help build serve start clean lint

##@ General

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

##@ Development

build: ## Build the docs site (catches broken links, missing pages, invalid markdown)
	npm run build

serve: build ## Serve the production build locally for review
	npm run serve

start: ## Start the dev server with hot reload
	npm run start

clean: ## Clear the Docusaurus cache
	npm run clear

lint: build ## Run all pre-push checks
