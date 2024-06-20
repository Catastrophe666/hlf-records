#!/bin/bash

pushd $PWD/../explorer
    docker-compose up -d
    sleep 5
		
popd