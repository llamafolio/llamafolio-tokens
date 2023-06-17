rm -rf *.tgz

cd ../../
rm -rf build

NODE_ENV='production' npm run build

npm pack --pack-destination test/app

cd test/app

npm install --no-save *.tgz
