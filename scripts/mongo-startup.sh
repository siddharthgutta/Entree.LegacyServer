mkdir -p ~/mongodb
if [ "$(hostname)" == 'kfu-pc' ]
then
  mongod --dbpath ~/mongodb --smallfiles
else
  mongod --dbpath ~/mongodb
fi