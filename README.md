# Entree.Server

[Suggested IDE](https://index.jetbrains.com/webstorm/)
[SQL Fiddle](http://sqlfiddle.com/#!9/921ef/1)

## Build Status
```
http://ec2-52-26-163-35.us-west-2.compute.amazonaws.com:3000/postreceive
```

## EC2

### Connect
```bash
ssh -i <pem> ubuntu@<public-dns>
ssh -i <path_to_pem_file_in_keys_directory> ubuntu@ec2-52-11-141-187.us-west-2.compute.amazonaws.com
```

#### Online-shell
http://ec2-52-11-141-187.us-west-2.compute.amazonaws.com:5000/

- Username: build
- Password: build

##### Useful Commands

```bash
pm2 list # see running apps
pm2 monit # watch deployment occur live
pm2 logs # live log viewer
pm2 restart <app_name>  # restart specific app/branch
pm2 restart all # restart all apps/branches
pm2 kill # never do this please! conflicts with branch-off atm

htop # activity monitor; press t for accessing sub-processes

cd ~/Github/Entree.Server # root repo directory
cd ~/Github/Entree.Server && npm install # reinstall the modules for the app
npm cache clear # if modules need to be downloaded again
```
 
### Setup
```bash
# general env setup
sudo apt-get update
sudo apt-get -y install git build-essential git ruby libpam0g-dev debconf-utils
sudo gem install sass
echo "sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000" >> ~/.bashrc

# node via. nvm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.bashrc
nvm install 5.5.0
echo "5.5.0" > ~/.nvmrc

# node global
npm install pm2 -g
npm install eslint -g
npm install eslint-config-airbnb npm install -g
npm install eslint-plugin-markdown -g 
npm install eslint-plugin-mocha -g
npm install eslint-plugin-react -g
npm install babel-eslint -g 
npm install mocha -g
npm install grunt-cli -g
npm install sequelize-cli -g

# pm2
pm2 conf branch-off:port 4000
pm2 conf pm2-webshell:port 5000
pm2 conf pm2-webshell:username build
pm2 conf pm2-webshell:password build
pm2 install branch-off
pm2 install pm2-webshell

# mongo
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
service mongod status

# mysql
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password 123456'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password 123456'
sudo apt-get install -y mysql-server

# clone
git config --global credential.helper store
mkdir Github && cd Github
git clone https://github.com/siddharthgutta/Entree.Server && cd Entree.Server

# install app dependencies
npm install

```

### Third Party Libraries/References:

[path](https://nodejs.org/api/path.html): Module for handling/transforming file paths  
[serve-favicon](https://github.com/expressjs/serve-favicon): Middleware for serving a favicon  
[morgan](https://github.com/expressjs/morgan): HTTP request logger middleware  
[cookie-parser](https://github.com/expressjs/cookie-parser): Cookie Parser  
[body-parser](https://github.com/expressjs/body-parser): Body Parser  
[underscore](http://underscorejs.org/): Functional Programming JS Helper Library  
[http](https://nodejs.org/api/http.html): HTTP Interfaces  
[socket-io](http://socket.io/docs/): WebSockets for Node.js  
[branch-off](https://github.com/bluejamesbond/BranchOff.js): Git Branch Auto-Deployment (Mathew's Tool)  
[bluebird](http://bluebirdjs.com/docs/api-reference.html): Promises  

### MySQL
Recommended to use MySQL Workbench
 - Create a new connection
    - Username: root
    - Password: 123456
 - Use the .pem file

![](http://i.imgur.com/MQ379m8.jpg)

### Tests
```bash
npm run tests
```

### Webhooks
[https://developer.github.com/webhooks/](https://developer.github.com/webhooks/)
[Securing Webhooks](https://developer.github.com/webhooks/securing/)
[3rd Party Webhook Tool](https://github.com/rvagg/github-webhook-handler)
