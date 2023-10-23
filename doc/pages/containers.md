@page containers Containers

[TOC]

The external libraries needed to build SimVascular rely on a large number of additional external packages. To facilitate reusability and making the maintaing process more straightforward, we developed some Docker containers based on different operating systems that are equipped with all the required dependencies. The containers that are currently available are based on the following operating systems:
1. Ubuntu 20
2. Ubuntu 22
3. MacOS 12 (Monterey)
4. MacOS 13 (Ventura)

# How to use the Docker containers to build the external libraries

1. ***Download the Docker client***: The Docker client can be simply downloaded from the [official Docker website](https://www.docker.com/get-started/).
2. ***Pull the image corresponding to the desired operating system***: The list of available images can be found on [DockerHub](https://hub.docker.com/u/simvascular). The following steps show how to pull and run the Docker image for Ubuntu 20, but images for other operating systems can be downloaded in a similar way:
    ```console
    docker pull simvascular/ubuntu20:svexternals
    docker run -it --platform linux/amd64 simvascular/ubuntu20:svexternals
    ```
    When dealing with Ubuntu images, this will open a terminal within the container. MacOS images, instead, will open a complete GUI running MacOS. In this case, the username and password are "ghrunner". Note that, on MacOS hosts running Apple Silicon, the `--platform` option enables the emulation of AMD64 instructions on Apple's proprietary chips. To get optimal performance on Apple Silicon, it is recommended to activate emulation using Rosetta 2 in the Docker client settings.
3. ***Clone the svExternals repository and run the scripts***: within a terminal in the container, run the following steps:
    ```console
    git clone https://github.com/SimVascular/svExternals.git
    cd svExternals
    bash build_all.sh
    ```
    These sequence of commands will build and create install files for all the required externals.

    ***Note***: our Docker images are configured to be used as GitHub runners. More information can be found in the "Use containers to run GitHub actions" section of this document.

## Tips on using containers
### Docker images vs Docker containers
Docker images are blueprints to create Docker containers. DockerHub is a service that allows users to host Docker images. By pulling a Docker image following step 2 in "How to use the Docker containers to build the external libraries", we can create new containers following the blueprint of the image.
### Useful commands (to be run on the host)
  1. The command `docker images` allows easily listing all the available images on a particular system. 
  2. When a container is created and running on a system, it is listed when launching `docker ps`. Note that, after exiting the container (for example, by typing `exit` within an Ubuntu terminal running in headless state, or closing the GUI of a MacOS docker container), the container is no longer visible using `docker ps`. It can instead be found using `docker ps -a`. 
  3. To attach a new terminal to a running container, one can use `docker exec -it {container.id} /bin/bash`, where `{container.id}` can be found by running `docker ps`.
  4. In order to restart a closed container, one can use `docker start -ai {container.id}`
### Creating an image out of a container and pushing to DockerHub
Containers can be used to create Docker images. To do so, run
```console
docker commit {container.id} {dockerhub.username}/"tag"
```
where `{container.id}` can be found by running `docker ps -a`, `{dockerhub.username}` should match the DockerHub account where the image will be pushed, and `tag` is a descriptor of the image. For SimVascular developers, this command could look something like this:
```console
docker commit {container.id} simvascular/ubuntu22:svexternals
```
Once the image is created, it can be pushed to DockerHub by running
```console
docker push {dockerhub.username}/"tag"
```

***Note***: To be able to push with a particular DockerHub account credentials, the user first needs to login by typing `docker login`.
## Use containers to run GitHub actions
  Our Docker image are configured to use GitHub actions. Each image contains a folder named `actions-runner` in the home directory. Running the `run.sh` script within that directory makes the container listen to triggers from GitHub runners to launch the build of individual external libraries. The workflows for different operating system are implemented [here](https://github.com/SimVascular/svExternals/tree/main/.github/workflows). These workflows can be initiated directly from GitHub, or scheduled to be run at a certain time every day/week/month. Note that, if no container is listening to jobs coming from GitHub, the actions will fail. More information can be found [here](https://docs.github.com/en/actions/using-workflows).

# Create new Docker images to build SimVascular externals
Creating new Docker images able to build the SimVascular external libraries can be a challenging process. Below are some sparse notes helpful to build Ubuntu and MacOS images. Hopefully, this could be used to create new Windows images in the future

## Notes on building Ubuntu images
Ubuntu images can be pulled from [here](https://hub.docker.com/_/ubuntu) by running, for example
  ```console
  docker pull ubuntu:20.04
  ```
Here are notes on (hopefully) installing everything needed to build the SimVascular externals:
1. Update package manager: `sudo apt-get update`
2. Install development tools and common utilities: 

  ```bash
  sudo apt-get install -y gcc make automake git gperf bison flex \
  byacc nodejs rsync file build-essential llvm libpcre3 \
  libpcre3-dev automake python-dev-is-python3
  ```

3. Install X and graphics-related packages:

  ```bash
  sudo apt-get install -y libfontconfig1-dev libfreetype6-dev \
  libx11-dev libx11-xcb-dev libxext-dev libxfixes-dev libxi-dev \
  libxrender-dev libxt-dev libgl1-mesa-dev libglu1-mesa-dev \
  libxcomposite-dev libxcursor-dev libxtst-dev libxkbcommon-dev \
  libxkbcommon-x11-dev libxcb1-dev libxcb-glx0-dev libxcb-keysyms1-dev \
  libxcb-image0-dev libxcb-shm0-dev libxcb-icccm4-dev libxcb-sync0-dev \
  libxcb-xfixes0-dev libxcb-shape0-dev libxcb-randr0-dev \
  libxcb-render-util0-dev libxcb-xinerama0-dev libxcb-xkb-dev \
  libxcb-util0-dev libdrm-dev libxdamage-dev libxrandr-dev
  ```

4. Other development libraries:
  ```console
  sudo apt-get install -y libtiff4-dev libatspi2.0-dev \
  libdbus-1-dev libnss3-dev libssl-dev
  ```
5. For Qt WebEngine Python2 is required:
  ```console
  sudo apt-get install -y python2
  sudo ln -s /bin/python2.7 /usr/bin/python
  ```

## Notes on building MacOS images
MacOS Docker images are available [here](https://hub.docker.com/r/sickcodes/docker-osx). Compared to Linux, creating MacOS Docker containers our of these images is more involved, as they include a GUI and they requires installing the operating system from scratch. Moreover, it is recommended that the container be optimized for memory and efficiency by following [this link](https://github.com/sickcodes/Docker-OSX/discussions/199#discussioncomment-510813) and [this link](https://christitus.com/docker-macos/). Once this is done, the SimVascular external libraries could be installed by following these directions:
1. [Install developer tools and Xcode](https://webkit.org/build-tools/). Note: in order to compile the current version of Qt (5.15), Xcode 13 is or an earlier version is required. Starting from Ventura, Xcode 13 is technically not supported anymore, but, once downloaded, it can still be selected as default by using `xcode-select`. In particular, one needs to manually move Xcode to the `Applications` folder, and then run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.
2. [Install brew](https://brew.sh)
3. Using brew, install `wget`, `git`, `automake`, `pcre`, `docbook-xsl`, `nodejs`, `rsync`, `openmp`.
4. Following [this link](https://stackoverflow.com/questions/19242275/re-error-illegal-byte-sequence-on-mac-os-x/19770395#19770395), add 
   ```console
   export LC_CTYPE=C 
   export LANG=C
   ```
   to avoid issues using `sed` in `build_python.sh`
5. Compilation of Qt on MacOS must be on 1 core [because of a race condition](https://doc.qt.io/qt-5/macos-building.html)

Additional steps may be required to build SimVascular in the container:
1. the compiler could complain that some system libraries (like `wchar.h`) cannot be  found. In this case, one needs to create a symlink like
   ```console
   sudo ln -s /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/* /usr/local/include/
   ```
2. Install `gcc` using brew.

Good luck!




