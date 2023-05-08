rm -rf *.tgz

cd ../../
rm -rf build

npm run build

npm pack --pack-destination test/app

cd test/app

npm install --no-save *.tgz
