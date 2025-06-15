.PHONY: build clean

clean:
	@rm -rf ./.task
	@rm -rf ./bin

build: clean
	@export PRODUCTION=true && \
	wails3 package
	@mv ./bin/inventa-chat.app ./bin/Inventa\ Chat.app