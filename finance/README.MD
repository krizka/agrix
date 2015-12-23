## install postgres
* sudo apt-add-repository ppa:pitti/postgresql  
* sudo apt-get update  
* sudo apt-get install postgresql-9.2  
* -u postgres psql  
* CREATE DATABASE finance;  
* CREATE USER finance WITH password 'qwerty';  
* GRANT ALL privileges ON DATABASE finance TO finance;  
* psql -h localhost finance finance 
 
# OR

## install mariadb
* https://downloads.mariadb.org/mariadb/repositories/#mirror=lund&distro=Debian  
* mysql -u root -p  
* CREATE DATABASE finance;  
* GRANT ALL ON finance.* TO finance@localhost IDENTIFIED BY 'qwerty';  
* mysql -u finance -p finance  

## deploy
1. copy DB settings file ```cp settings.json.dist settings.json```
2. fill in settings.json by DB params
3. run ```./finance.sh deploy```

## run
* run ```./finance.sh run```