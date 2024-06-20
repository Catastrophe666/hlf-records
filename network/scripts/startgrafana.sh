#!/bin/bash

pushd $PWD/../prometheus-grafana
    docker-compose up -d
    sleep 5
		
popd