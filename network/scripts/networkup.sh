#!/bin/bash

pushd $PWD/../
	export DOCKER_SOCK=/var/run/docker.sock
    docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml up -d
    sleep 5
    ./organizations/ccp-generate.sh
    docker ps
		
popd