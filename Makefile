REPORTER = spec

build:
	@./node_modules/.bin/grunt

production:
	@./node_modules/.bin/grunt prod

watch:
	@./node_modules/.bin/grunt watch

hint:
	@./node_modules/.bin/grunt hint

locales:
	@./node_modules/.bin/grunt locales

test: hint
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--ui bdd \
		--watch

install:
	npm install
	./node_modules/.bin/bower install

.PHONY: build production watch test test-w hint locales install