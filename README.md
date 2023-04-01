# Opensong Web display
Program uses OpenSongs built-in web API to display lyrics and Bible verses into OBS (as browser source) or any web enabled device.

## Pre-requisites
* Opensong must be on the same network as the app is running
* Web server must be enabled on Opensong
* ```npm``` must be installed

## Get Started
1. Clone this repository or download code as a zip file
2. Run ```npm install``` to get all required packages
3. Update ```config/default.json``` to match your settings.
4. Run command ```npm run dev``` from terminal.

## Usage
1. On Opensong computer, start presentation.
2. Open ```localhost:8088/setup``` or ```your-remote-ip:8088/setup``` if you are connecting from remote computer.
3. Check the configuration in left plane and press the green "Start" button.
4. In seperate window/tab open ```localhost:8088/display``` or ```your-remote-ip:8088/display```
