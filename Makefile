REPORTER = spec

build:
	@./node_modules/.bin/grunt

watch:
	@./node_modules/.bin/grunt watch

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--ui bdd \
		--watch

.PHONY: build watch test test-w
