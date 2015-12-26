# Entree.Server

## EC2

### Connect
```bash
ssh -i  <pem> ubuntu@<public-dns>
```

### Setup
```bash
# general env setup
sudo apt-get update
sudo apt-get install git
sudo apt-get -y install build-essential
echo "sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000" >> ~/.bashrc
echo "export PORT=3000" >> ~/.bashrc

# node via. nvm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.bashrc
nvm install stable

# node global
npm install pm2 -g
npm install grunt-cli -g

# sass engine
sudo apt-get -y install ruby
sudo gem install sass

# clone
git config --global credential.helper store
mkdir Github && cd Github
git clone https://github.com/siddharthgutta/Entree.Server && cd Entree.Server

# install app dependencies
npm install

# launch app with branch-off
./node_modules/branch-off/dist/cli
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