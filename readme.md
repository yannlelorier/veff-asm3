# Vefforritun - Assignment 3

## Boards Endpoints

- [x] Read All boards
- [x] Read an individual board
- [x] Create a new board
- [x] Update a board
- [x] Delete a board
- [x] Delete all boards

## Tasks Endpoints

- [x] Read all tasks + sort by id, taskName, dateCreated
- [x] Read individual task
- [x] Create new task
- [x] Delete a task
- [x] Partially update a task for a board

## Requirements

- [x] The frontend code (unmodified) works with backend
- [x] Adheres to REST constraints
- [x] Best Practices followed
    - [x] Plural nouns for resource collections
    - [x] Specific resources shall be addressed using their Id, as part of the resource URL
    - [x] Sub resources shall be used to show relations between tasks and boards
    - [x] JSON as request/response body format
    - [x] The HTTP verbs shall be used to describe CRUD actions. The safe (for GET) and idempotent (for DELETE and PUT) properties shall be adhered to
    - [x] Appropriate HTTP status codes shall be used for responses. 200 should be used for successful GET, DELETE and PUT requests, 201 for successful POST requests. In error situations, 400 shall be used if the request was not valid, 404 shall be used if a resource was requested that does not exist. 405 shall be used if a resource is requested with an unsupported HTTP verb (e.g., trying to delete all tasks), or if a non-existing endpoint is called
    - [x] You are NOT required to implement HATEOAS/Links
    - [x] The application/backend shall be served at http://localhost:3000/api/v1/ In case you have issues running your backend on port 3000, contact us - do not just change the port in the solution code
    - [x] The application shall be written as a Node.js application. A package.json file shall be part of the project, including also the required dependencies
    - [x] The application shall be started using the command node index.js
    - [x] The application is only permitted to use in-built modules of Node.js, as well as Express.js, body-parser, and cors 3
    - [x] The application shall additionally be deployed on Heroku. As a part of your hand-in, provide a text file that contains the URL of your deployed backend
    - [x] Persistence is not part of the assignment
    - [x] There are no restrictions on the ECMAScript (JavaScript) version

## Deploy link

The deploy link can be found here: [https://veff-assigment3.herokuapp.com/](https://veff-assigment3.herokuapp.com/)
