MTABook 05/01/2022
Exercice 2 in JS Course
Arnaud Maarek, 342615879, arnaudmaarek@hotmail.com
Shai Levi, 204124234, shailevi23@gmail.com

External Libraries:

- jsonwebtoken
We used jsonwebtoken in order to generate an encrypted token to each user when he logged in. The token is valid 10 minutes.  We save this token and use it in the header of each request of this specific user. For each request, we checked if the token is available or not.
Furthermore, we keep a dictionary of tokens to know if the token is valid. Indeed, when a user logged out, the token is no longer valid.

- bcrypt
We also used bcrypt in order to encrypt the password of the user by using hash and salt to prevent dictionary attacks.

Postman:

We build our tests that can be run multiple times. This is the reason why at the end of each run we delete the users (except the admin) that are registered in database (json files).

NOTE: At the first run, all the tests will be passed successfully, but if you run the tests more times the test "Delete Post Shai" will failed. The reason is that we do not delete the posts from the database, we only change his status. So, at the second run, the id of the post is correct but it is no longer available (because we deleted it at the first run of the tests). 

Database:

Our database is local json files.
We saved the admin user in the file "users.json". We never delete him from the file. When we run the application, we read the admin from the file.

NOTE: If you want to change the database files, do not delete "[]".




