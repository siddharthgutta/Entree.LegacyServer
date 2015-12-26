# Entree.Server

## EC2

### Connect
```bash
ssh -i  <pem> ubuntu@<public-dns>
```

### Setup
```bash
sudo apt-get install git
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.bashrc
nvm install stable
npm install pm2 -g
git config --global credential.helper store
mkdir Github && cd Github
git clone https://github.com/siddharthgutta/Entree.Server
cd Entree.Server
echo "sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000" >> ~/.bashrc
echo "export PORT=3000" >> ~/.bashrc
echo "export NODE_ENV=production" >> ~/.bashrc
npm install
```

