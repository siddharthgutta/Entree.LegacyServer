# Entree.Server

## EC2

### Connect
```bash
ssh -i  <pem> ubuntu@<public-dns>
```

### Setup
```bash
sudo apt-get update
sudo apt-get install git
sudo apt-get -y install ruby
sudo gem install sass
sudo apt-get -y install build-essential

wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.bashrc
nvm install stable
npm install pm2 -g
npm install grunt-cli -g
git config --global credential.helper store
mkdir Github && cd Github
git clone https://github.com/siddharthgutta/Entree.Server
cd Entree.Server
echo "sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000" >> ~/.bashrc
echo "export PORT=3000" >> ~/.bashrc
npm install
grunt build

./node_modules/branch-off/dist/cli
```

