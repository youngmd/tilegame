#!/bin/sh

git pull origin master
iID=`basename "$PWD"`
contID=`docker inspect --format="{{.Id}}" ${iID}`
if [[ $contID ]]
then
    docker stop ${condID}
    docker rm ${condID}
fi

docker rmi ${iID}
docker build -t ${iID} .
