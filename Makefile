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

bot:
	@/usr/bin/env node bot/bot.js

test-bot:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd \
		test/bot/*.js

.PHONY: build watch test test-w bot
