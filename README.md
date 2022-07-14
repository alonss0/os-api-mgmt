# os-api-mgmt
The purpose of this project is to interact with OpenSea API to retrieve assets and orders, saving data in mongodb and creating a service. 

### **.env** config

SOMNIUM="0x913ae503153d9A335398D0785Ba60A2d63dDB4e2"
SANDBOX="0x5CC5B05a8A13E3fBDB0BB9FcCd98D38e50F90c38"
DECENTRALAND="0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d"
X_API_KEY="64aa1996f0fa46fcaf35a21f24f2525a"
DBCONN="mongodb://localhost:27017/os-api"

> The database can be changed in DBCONN variable, in this case is `os-api`

### WARNING

Before creating database collections, the server should be up.

Each collection must be created using the service route

    /service/addCollection
    
This is a POST Request and it receives a param called `collection`, e.g:

    http://localhost:3003/service/addCollection/?collection=0x913ae503153d9A335398D0785Ba60A2d63dDB4e2

The above beacuse we need to be sure each collection has the contract address checksum version.

#### csv files

Use .csv files to load data into a mongodb collection (I used mongodb compass).

In this way we can create multiple documents in db, then iterate over collection documents in the database.

> e.g Somnium has 5000 tokens, all of those in one shot.

**Once the server detects collections in db it starts updating and adding the needed fields in each document after fetching data from OpenSea**

**NOTE** 

Then token_id documents for an existing collection can be created using the service route `/service/addTokens`

Each document in a collection represents a land, identified by token_id property

First time the server is up, it's going to take some time (unknown) to fetch all documents from each collection
