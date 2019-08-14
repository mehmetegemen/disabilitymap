
# DisabilityMap Basic Ecosystem
## Setup
Steps to setup application:
- Enable your internet
- Don't forget to start your docker daemon
- (I also read that running below commands with `sudo` depends on starting daemon with `sudo` so if you run into a problem consider that)
- In root directory(directory of docker-compose.yml) run the command `sudo docker-compose build`
- After building run the command `sudo docker-compose up` to start the services.
- Go to `client` directory from root directory.
- Run `npm start` to open electron app.
- Use the app.

Didn't have time to write tests.

## Client

I didn't have time to implement React wasn't sure you know it so I used jQuery. Also had no time to refactor because of Dockerizing so its a bit sloppy.

Client consists of 3 pages:
- Sign Up
- Login
- Map

**Sign up**: It gets validation errors from mainService and prints. Uses OpenLayers map for geolocation setting.

**Map**: Gets all(limited to 12 if not specified in the query) user records and print them on the map as wheelchairs. Uses OpenLayers API. Shows username of the person when you click to wheelchairs.

**Login**: Both username and email works as id. Just enter one of them and password, you are good to go.

## Backend

I had more time to refactor backend and it uses Typescript so it's more organized than client.

API is REST and HATEOAS compliant. An example response to creating a user from mainservice:
```
{
    "_links": {
        "self": {
            "href": "/identities"
        },
        "authentication": {
            "href": "/identities/authentication",
            "method": "POST"
        }
    },
    "email": "mehmet@mehmet.com",
    "fullName": "Mehmet",
    "username": "fe",
    "geolocation": {
        "lat": 59.89161,
        "lon": 54.23223
    }
}
```

### Security
- Used bcrypt for password encryption. Encryption must be slower so algorithms like SHAx are a bad choice.
- Passport and JWT is used for authentication. When correct credentials provided server gives you JWT token and you use this token in every client action. This token is in `Authorization` header as `Bearer eJ1df1...` something.
- Main service connects to other services with API keys. In case of exposure of other services intruder still cannot access to functions without keys.
- Databases and services are only exposed to eachother, not outide world.
- User's identity and additonal infos are in separate databases so if additional info database get compromised, crucial identity info will be still secure.
- Used Joi for validating JSON requests. Could use JSON Schema but Joi was faster.
- Used a very simple email regex validation. Could use RFC 5322.
- Could add API rate limit, had no time.
- I let user to enter simple password to ease debugging.

I am sure there can be more(inputs are the entry points of hackers so there could be more check) just these were the most important in limited time.

|Service Name|Port|isPrivate|
|--|--|--|
|usersService|3004|true|
|identitiesService|3003|true|
|mainService|3005|false|
|usersDatabase|27018|true|
|identitiesDatabase|27019|true|

## Thank you
Thank you for your effort to read my code.