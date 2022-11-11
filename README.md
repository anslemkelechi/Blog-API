# Blog-API

This is an api for a blog. Altschool Africa Nodejs second semester project

---

## Built with

- Nodejs
- Express.js
- Mongodb
- Javascript

---

### Links

- Solution URL: https://github.com/anslemkelechi/Blog-API
- Live Site URL: https://idealabs.cyclic.app

---

## Requirements

<details>
<summary>Project Requirements</summary>
1. Users should have a first_name, last_name, email, password, (you can add other attributes you want to store about the user)
2. A user should be able to sign up and sign in into the blog app
3. Use JWT as authentication strategy and expire the token after 1 hour
4. A blog can be in two states; draft and published
5. Logged in and not logged in users should be able to get a list of published blogs created
6. Logged in and not logged in users should be able to to get a published blog
7. Logged in users should be able to create a blog.
8. When a blog is created, it is in draft state
9. The owner of the blog should be able to update the state of the blog to published
10. The owner of a blog should be able to edit the blog in draft or published state
11. The owner of the blog should be able to delete the blog in draft or published state
12. The owner of the blog should be able to get a list of their blogs. 
  a. The endpoint should be paginated
  b. It should be filterable by state
13. Blogs created should have title, description, tags, author, timestamp, state, read_count, reading_time and body.
14. The list of blogs endpoint that can be accessed by both logged in and not logged in users should be paginated, 
  a. default it to 20 blogs per page. 
  b. It should also be searchable by author, title and tags.
  c. It should also be orderable by read_count, reading_time and timestamp
15. When a single blog is requested, the api should return the user information(the author) with the blog. The read_count of the blog too should be updated by 1
16. Come up with any algorithm for calculating the reading_time of the blog.
17. Write tests for all endpoints
</details>

---

## Setup

- Install NodeJS, mongodb
- pull this repo
- update config.env
- run `npm run dev`

---

## Base URL

- https://idealabs.cyclic.app

## Models

---

### User

| field           | data_type | constraints |
| --------------- | --------- | ----------- |
| id              | string    | required    |
| email           | string    | required    |
| first_name      | string    | required    |
| last_name       | string    | required    |
| username        | string    | required    |
| password        | string    | required    |
| passwordConfirm | string    | required    |

### Blog

| field        | data_type | constraints                                              |
| ------------ | --------- | -------------------------------------------------------- |
| title        | string    | required, unique                                         |
| description  | date      | optional                                                 |
| body         | string    | required                                                 |
| tags         | array     | optional                                                 |
| author       | ref User  | required                                                 |
| state        | string    | required, default: 'draft', enum: ['draft', 'published'] |
| read_count   | number    | required, default: 0                                     |
| reading_time | string    | required                                                 |

## APIs

---

### Signup User

- Route: /api/v1/users/signup
- Method: POST
- Body:

```
{
  "email": "example@mail.com",
  "first_name": "jon",
  "last_name": "doe",
  "username": "jondeo344"
  "password": "somePassword",
  "passwordConfirm: "somePassword"
}
```

- Responses

  - Success

```
{
    status: "success"
    message: 'Signup successful',
    "user": {
        "token": "eyJhbGciOiJIUzI1NiIs",
        "email": "example@mail.com",
        "first_name": "jon",
        "last_name": "doe",
        "id": "12345f678"
       }
    }
}
```

- error

```
{
    status: "error",
    message: 'error message',
}
```

---

### Login User

- Route: /api/v1/users/login
- Method: POST
- Body:

```
{
  "email": "example@mail.com",
  "password": "somePassword",
}
```

- Responses

  - Success

```
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "userId": "6366f7b0aa0dd83e768f7d3b",
    "email": "example@mail.com",
    "token": "eyJhbGciOiJIUzI1NiIs"
  }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

---

### Forget Password

- Route: /api/v1/users/forgetPassword
- Method: POST
- Body:

```
{
  "email": "example@mail.com",
}
```

- Responses

  - Success

```
{
  "status": "success",
  "message": "Please check your mail for reset link",
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

---

### Reset Password

- Route: /api/v1/users/resetpassword/{resettoken}
- Method: POST
--Note: To test email reset functionality, we use mailtrap.io, which handles email testing functionality, Create an account on mailtrap & grab API keys and add to config.env file.
- Body:

```
{
  "password":"newpassword",
  "passwordConfirm":"newpassword"
}
```

- Responses

  - Success

```
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "userId": "6366f7b0aa0dd83e768f7d3b",
    "email": "example@mail.com",
    "token": "eyJhbGciOiJIUzI1NiIs"
  }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

---

### Create blog (logged in user)

- Route: /api/v1/articles/
- Method: POST
- Header
  -Cookie: {token}
- Body:

```
{
  "title": "A blog post",
  "description": "about a blog post",
  "body": "This is a blog post ",
  "tags": [
    "post", "blog"
  ]
}
```

- Responses

  - Success

```
{
  "status": "success",
  "data": {
    "blog": {
      "title": "",
      "description": "",
      "body": " ",
      "tags": [

      ],
      "author": { first_name: 'jon', last_name: 'doe' },
      "state": "draft",
      "read_count": 0,
      "_id": "3245343",
      "createdAt": "2022-11-06T00:05:38.728Z",
      "updatedAt": "2022-11-06T00:05:38.728Z"
      "reading_time": "1min 2secs"
    }
  }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

---

### Update Blog State (logged in owner)

- Route: /api/v1/articles/update/blogId
- Method: PATCH
- Header
  -Cookie: {token}
- Body

```
{
  "state": "published"
}

```

- Responses
  - success

```
{
    state: "success",
    data: {
        "blog": {
      "_id": "someId",
      "title": "title",
      "tags": [tags],
      "author": {
        "first_name": "first_name",
        "last_name": "last_name",
        "id": "authorId"
      },
      "state": "published",
      "read_count": 0,
      "createdAt": "2022-11-05T23:56:33.095Z",
      "updatedAt": "2022-11-06T17:03:04.565Z",
      "reading_time": "1"
    }
    }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

---

### Update Blog content (logged in owner)

- Route: /api/v1/articles/update/blogId
- Method: PATCH
- Header
  -Cookie: {token}
- Body

```
{
  title: 'a new title',
  body: 'new Body',
  description: 'here's a description'
}

```

- Responses
  - success

```
{
    state: "success",
    data: {
        "blog": {
      "_id": "someId",
      "title": "new title",
      "tags": [ new tags],
      "author": {
        "first_name": "first_name",
        "last_name": "last_name",
        "id": "authorId"
      },
      "state": "draft",
      "read_count": 0,
      "createdAt": "2022-11-05T23:56:33.095Z",
      "updatedAt": "2022-11-06T17:03:04.565Z",
      "reading_time": "1"
    }
    }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

### Delete user blog post (logged in owner)

- Route: /api/v1/articles/delete/blogId
- Method: DELETE
- Header:

  -Cookie: {token}

- Responses
  - Success

```
{
    status: 'success',
    message: null
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

### Get Published Blogs (all users - logged in or out)

- Route: /api/v1/articles/
- Method: GET
- Query params:

  - page (default: 1) = /api/v1/articles?page=1&limit=20
  - per_page (default: 20) = /api/v1/articles?page=1&limit=20
  - state(only: 'published') = /api/v1/articles?state=published
  - created_at = /api/v1/articles?sort=createdAt
  - author = /api/v1/articles/author-name
  - title = /api/v1/articles?title=title-name
  - tags = /api/v1/articles?tags=javascript,css

- Responses
  - Success

```
{
    status: 'success',
    results: 20,
    data: {
        [{blogs}]
    }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

### Get A Published Blog (all users - logged in or out)

- Route: /api/v1/articles/blogId
- Method: GET

- Responses

  - Success

```
{
    status: 'success',
    data: {
        "blog": {
      "_id": "blogId",
      "title": "blog title",
      "tags": [blog tags],
      "author": {
        "first_name": "first_name",
        "last_name": "last_name",
        "id": "authorId"
      },
      "state": "published",
      "read_count": 0,
      "createdAt": "2022-11-05T23:56:33.095Z",
      "updatedAt": "2022-11-06T17:03:04.565Z",
      "reading_time": "1min 2 secs"
    }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

### Get owner blogs

- Route: /api/v1/articles/myblogs
- Method: GET
- Query params:

  - page (default: 1) = /api/v1/articles/myblogs?page=1&limit=20
  - per_page (default: 20) = /api/v1/articles/myblogs?page=1&limit=20
  - state(only: 'published') = /api/v1/articles/myblogs?state=published
  - created_at = /api/v1/articles/myblogs?sort=createdAt
  - title = /api/v1/articles/myblogs?title=title-name
  - tags = /api/v1/articles/myblogs?tags=javascript,css

- Responses

Success

```
{
    status: 'success',
    results: 20,
    data: {
        [{blogs}]
    }
}
```

- error

```
{
  "status": "error",
  "message": error message,
}

```

---

...

## Contributor

- Kelechi Okoronkwo(Blakcoder)
