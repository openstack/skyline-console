SOURCES := src
ROOT_DIR ?= $(shell git rev-parse --show-toplevel)

# Color
no_color = \033[0m
black = \033[0;30m
red = \033[0;31m
green = \033[0;32m
yellow = \033[0;33m
blue = \033[0;34m
purple = \033[0;35m
cyan = \033[0;36m
white = \033[0;37m

# Params
MODE ?= prod
BUILD_ENGINE ?= docker

# Version
RELEASE_VERSION ?= $(shell git rev-parse --short HEAD)_$(shell date -u +%Y-%m-%dT%H:%M:%S%z)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT ?= $(shell git rev-parse --verify HEAD)


.PHONY: all
all: install fmt lint test package e2e


.PHONY: help
help:
	@echo "Skyline console development makefile"
	@echo
	@echo "Usage: make <TARGET>"
	@echo
	@echo "Target:"
	@echo "  git_config          Initialize git configuration."
	@echo "  install             Installs the project dependencies."
	@echo "  package             Build package from source code."
	@echo "  lint                Check JavaScript code."
	@echo "  test                Run unit tests."
	@echo "  e2e                 Run e2e tests."
	@echo


.PHONY: git_config
user_name = $(shell git config --get user.name)
user_email = $(shell git config --get user.email)
commit_template = $(shell git config --get commit.template)
git_config:
ifeq ($(user_name),)
	@printf "$(cyan)\n"
	@read -p "Set your git user name: " user_name; \
    git config --local user.name $$user_name; \
    printf "$(green)User name was set.\n$(cyan)"
endif
ifeq ($(user_email),)
	@printf "$(cyan)\n"
	@read -p "Set your git email address: " user_email; \
    git config --local user.email $$user_email; \
    printf "$(green)User email address was set.\n$(no_color)"
endif
ifeq ($(commit_template),)
	@git config --local commit.template $(ROOT_DIR)/tools/git_config/commit_message.txt
endif
	@printf "$(green)Project git config was successfully set.\n$(no_color)"
	@printf "${yellow}You may need to run 'pip install git-review' install git review tools.\n\n${no_color}"


.PHONY: install
install:
	yarn install


.PHONY: package
package: install
	rm -rf $(ROOT_DIR)/skyline_console/static
	yarn run build
	echo `git rev-parse --verify HEAD` > $(ROOT_DIR)/skyline_console/static/commit_id.txt
	python3 -m pip install sdist --break-system-packages || python3 -m pip install sdist
	python3 -m pip install build --break-system-packages || python3 -m pip install build
	python3 -m build


.PHONY: fmt
fmt:
	# yarn run lint-staged


.PHONY: lint
lint:
	# yarn run lint


.PHONY: test
test:
	# yarn run test:unit


.PHONY: clean
clean:
	rm -rf .venv node_modules dist .tox build skyline_console.egg-info AUTHORS ChangeLog RELEASENOTES.rst skyline_console/static


.PHONY: e2e
e2e: install
	rm -rf test/e2e/results/*; \
	rm -rf test/e2e/report; \
	mkdir test/e2e/report; \
	CODE=0; \
	yarn cypress run || CODE=1; \
	yarn mochawesome-merge test/e2e/results/*.json -o test/e2e/report/merge-report.json; \
	yarn marge test/e2e/report/merge-report.json -o test/e2e/report; \
	exit $$CODE
