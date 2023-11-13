# Deployement of the website
The Vascular Model Repository website is hosted on Tetralogy, a server used by the Marsden lab at Stanford University. This can be accessed via 
```console
ssh <username>@simvascular.stanford.edu
```
where `username` is the user name of a user account on the server.

# Updating the website
The process of updating the website simply consists of pushing the latest changes to this repository and pulling the result on Tetralogy. Mores pecifically:
1. Clone the repository:
   ```console
   git clone git@github.com:SimVascular/vascularmodel.git
   ```

2. Apply desired changes to the website. For more information on how to do so, please visit the [getting started](https://github.com/SimVascular/vascularmodel/blob/main/doc/getting-started.md) part of this tutorial.

3. After modifying the website locally:
   ```console
   git add .
   git commit -m "meaningful comment"
   git push origin
   ```
   Please note that, in order to push the local changes to the GitHub repository, the GitHub account making such changes should be added as a contributor by one other lab member with sufficient privileges.

4. Access Tetralogy:
   ```console
   ssh <username>@simvascular.stanford.edu
   ```

5. Pull the latest changes in the directory that is served by Apache (for more information, see the "Apache server" section).

# Apache server
The server runs an [Apache server](https://httpd.apache.org) on the directory `/home/www/vascularmodel`, where `vascularmodel` is a clone of this repository. The configuration file for the Apache server is located at `/etc/apache2/sites-available/www.vascularmodel.com.conf`. Please note that this configuration file should rarely be modified. In order to restart the server after modifications to the configuration file, the following command should be used:
```console
systemctl restart apache2
```
Another useful command is
```console
sudo certbot --apache
systemctl restart apache2
```
This could be necessary in case the website appears to be "not-secure" in browsers (in which case the secure connection certificate has probably expired).