# Landing Page

A simple landing page built with Express, Three.js, and Tailwind CSS.
The `prototyping` directory is not required - it holds the python scripts I used to try out the the simplex noise functions for the Three.js animation.

## Features

- **Express**: Serves the application.
- **simplex-noise**: Used for the 3D graphics noise generation.
- **Three.js**: Renders 3D graphics.
- **Tailwind CSS**: Provides utility-first CSS framework.
- **Bootstrap Icons**: For the vector icons used.
- **Webpack**: Bundles the application.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/metarapi/landing-page
    cd landing-page
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Usage

- **Development (for continous bundling with webpack)**: 
    ```sh
    npm run watch
    ```

- **Production**: 
    ```sh
    npm run build
    npm start
    ```

## Docker

Build and run the application using Docker:
```sh
docker build -t landing-page .
docker run -p 3000:3000 landing-page