# Simple Web Store

This project is a simple web store application built with React, Express, and WebSockets.

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/simple-web-store.git
   cd simple-web-store
    ```
2. Install dependencies for both the client and server:

    ``` yarn install --cwd client ``` 

    ``` yarn install --cwd server ```

### Used a local mongo for POC 
    db name: eshop
    collections: 
        - products: List of availalble products initiated from mock_data/mock-products.ts
        - customer-orders: holding the data per customer

### installation and orientation
    - Mongodb install instructions: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
    - Starting mongo: ``` sudo systemctl start mongod ```
    - Check mongo status: ``` sudo systemctl status mongod ```
    - Restarting mongo: ```sudo systemctl restart mongod ```
    - Stop mongo: ``` sudo systemctl stop mongod ```

### Usfull commands: 
        - Find orders: ```db.orders.find().pretty()``` 
        - Find products: ```db.products.find().pretty()``` 
        - Get collections: ```db.getCollectionNames()``` 
        - Clear the DB: ```db.getSiblingDB('eshop').dropDatabase()``` 
        - See all detabases: ```db.adminCommand('listDatabases')``` 

    Data dir: /var/lib/mongodb
    Logs dir: /var/log/mongodb


### Running the Project

    yarn start

### Architecture and system design 

    - Main endpoint /api/products
        Returns a list of available products

    - Messages:
        - `buy`: Triggered when a customer clicks "Get it now". This message is sent from the client to the server and includes the quantity purchased.
        - `quantityChange`:  Followup from the server, sent to all clients logged in with the same user
        includes the quantity purchased. 

### Comments Limitations and TODOs

    ## Limitations:
    - The name selector in to top of the page is onl to symulate that other users will not recieve an update for every change, but changing the user does not currently open a new socket connection, so:
    There is no socket connection after changing user in the select user component. 
    - I did not currently handle the Session abandoned state - that happends when a session is not used for a long time. 


    Future developments:
    - Improve error handling in the backend
    - Add unit tests for the frontend components
    - Implement user authentication
    - Enhance the UI/UX design
