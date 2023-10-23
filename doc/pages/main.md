@mainpage Getting started

[TOC]

This repository contains scripts to build the external libraries needed to compile the SimVascular GUI. SimVascular relies on the following external libraries:
1. [Tinyxml2](https://github.com/leethomason/tinyxml2)
2. [Qt5](https://www.qt.io)
3. [Freetype](https://freetype.org)
4. [GDCM](https://github.com/malaterre/GDCM/)
5. [HDF5](https://www.hdfgroup.org/solutions/hdf5/)
6. [MMG](https://github.com/MmgTools/mmg/)
7. [Python](https://www.python.org)
8. [Opencascade](https://www.opencascade.com)
9. [Swig](https://github.com/swig/swig)
10. [ITK](https://itk.org)
11. [VTK](https://vtk.org)
12. [MITK](https://github.com/MITK/MITK)

# Building the libraries

The `scripts` folder contains scripts to build each of the external libraries (e.g., `build_tinyxml2.sh`, `build_qt5.sh`, and so on). These scripts use environment variables defined in `env_variables.sh` and require the creation of two folders: one to save the source files (`SRC_DIR`, defined in `env_variables.sh`) and one to save the installed libraries (`INSTALL_DIR`, defined in `env_variables.sh`). The pipeline to build, for example, HDF5, looks as follows:
```console
source env_variables.sh
mkdir -p $SRC_DIR
mkdir -p $INSTALL_DIR
bash scripts/build_hdf5.sh
```
Note that libraries should be built in a specific order due to dependencies. The script `build_all.sh` runs all the scripts in the right sequence. We recommended consulting `build_all.sh` to understand if building a particular library requires the execution of multiple scripts. For example, MITK requires running `post-install-mitk.sh` to change the install folder structure (this script is necessary due to the organization that SimVascular expects for the MITK installation directory, and was already present in the previous build system).

## Patches
Library-specific patches are available in the `patches` folder. We found that these modifications to the original source files were necessary to compile the library itself or SimVascular. The patches are automatically applied to source files when executing the scripts containied in `scripts`.

# Supported operating systems
Using this repository, we were able to successfully build the external libraries on the following operating systems:
1. Ubuntu 20
2. Ubuntu 22
3. MacOS 12 (Monterey)
4. MacOS 13 (Ventura)

Windows systems have not been tested yet. We created some docker containers with the required dependencies to facilitate building the externals on different machines; see [this page](https://simvascular.github.io/svExternals/containers.html) for more details.

# Making built externals available for distribution
During compilation, SimVascular automatically downloads the external libraries from our server Tetralogy. The different library versions are located here
```console
/home/www-shared/html/downloads/public/simvascular/externals 
```
For example, the 2019.06 version of the external libraries for Ubuntu 20.04 are located here:
```console
/home/www-shared/html/downloads/public/simvascular/externals/2019.06/linux/ubuntu/20.04/gnu/7.5/x64/release/2021.06.10
```
The libraries names need to follow a specific convention to be found by SimVascular. For example:
```console
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.freetype.2.6.3.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.gdcm.2.6.3.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.hdf5.1.10.1.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.itk.4.13.2.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.mitk.2018.04.2.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.mmg.5.3.9.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.opencascade.7.3.0.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.python.3.5.5.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.qt.5.11.3.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.swig.3.0.12.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.tcltk.8.6.4.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.tinyxml2.6.2.0.tar.gz
ubuntu.20.04.gnu.7.5.x64.release.2021.06.10.vtk.8.1.1.tar.gz
```
When the libraries are built using GitHub actions (see [this page](https://simvascular.github.io/svExternals/containers.html) for more details), the externals can be downloaded automatically from GitHub and renamed using the right convention using this script:
```python
import os
import json

gh_token = # insert github token here. This must be generated using the SimVascular GitHub account
gh_repo = 'https://api.github.com/repos/simvascular/svExternals/actions/artifacts'

zip_prefix = 'ubuntu.20.04.gnu.7.5.x64.release.2022.10.13.' # this should be customized based on the location of the library on tetra

if __name__ == "__main__":
    command = 'curl -L -H "Accept: application/vnd.github+json" '
    command += '-H "Authorization: Bearer {:}" '.format(gh_token)
    command += '-H "X-GitHub-Api-Version: 2022-11-28" '
    command += '{:} > artifacts.json'.format(gh_repo)
    os.system(command)

    artinfo = json.load(open('artifacts.json'))
    
    art_dict = {}

    for ext in artinfo['artifacts']:
        if 'Ubuntu 20' in ext['name']: # Change Ubuntu 20 to the current OS
            if ext['name'] not in art_dict:
                art_dict[ext['name']] = ext
            else:
                # if the current artifact has been created after the stored one,
                # we updatels it
                if ext['updated_at'] > art_dict[ext['name']]['updated_at']:
                    art_dict[ext['name']] = ext

    os.system('rm artifacts.json')

    for art_name, art_value in art_dict.items():
        file_name = art_name.replace(' ','-').lower()
        command = 'curl -L -H "Accept: application/vnd.github+json" '
        command += '-H "Authorization: Bearer {:}" '.format(gh_token)
        command += '-H "X-GitHub-Api-Version: 2022-11-28" '
        command += '{:}/{:}/zip --output {:}.zip'.format(gh_repo, 
                                                         art_value['id'],
                                                         file_name)
        os.system(command)
        os.system('unzip {:}.zip'.format(file_name))
        for f in os.listdir('.'):
            if '.tar' in f:
                os.system('tar -xf {:}'.format(f))
                os.system('rm {:}'.format(f))
                break
        os.system('rm {:}.zip'.format(file_name))

    for lib in os.listdir('.'):
        if '.json' not in lib and '.py' not in lib:
            tar_name = zip_prefix + lib.replace('-','.') + '.tar.gz'
            os.system('tar -czvf {:} {:}'.format(tar_name, lib))
            os.system('rm -rf {:}'.format(lib))
```

