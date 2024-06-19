#!/bin/bash

pushd $PWD/../

# remove the old materials
sudo rm -fr /organizations/ordererOrganizations/*
sudo rm -fr /organizations/peerOrganizations/*
sudo rm -fr /system-genesis-block/*


# deploy the CAs  
docker-compose -f compose/compose-ca.yaml -f compose/docker/docker-compose-ca.yaml up -d 



sleep 10

./organizations/fabric-ca/registerEnroll.sh

sleep 10

./organizations/ccp-generate.sh


# set the cfg path
export FABRIC_CFG_PATH=$PWD/configtx/

# create the genesis block
configtxgen -profile ChannelUsingRaft -channelID system-channel -outputBlock ./system-genesis-block/genesis.block 

popd