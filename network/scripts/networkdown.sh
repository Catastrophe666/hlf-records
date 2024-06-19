pushd $PWD/../

export DOCKER_SOCK=/var/run/docker.sock

docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml down
docker-compose -f compose/compose-ca.yaml -f compose/docker/docker-compose-ca.yaml down

docker system prune --volumes -f
docker network prune -f

popd