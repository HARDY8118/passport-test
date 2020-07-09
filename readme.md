Minimalist project to show passportjs authentication
====================================================

## Libraries used
+ express
> For developing rest api
+ passport
> Manage logins/signup
+ mongoose
> Mongodb driver
+ body-parser
> Process data passed in post requests
+ cookie-parser
> Process cookies
+ express-session
> Process session storage
+ dotenv
> Load .env file as environment variables

## Installation
Navigate to project folder and run `npm install` to install required dependencies.

## Test
Start server using `node index.js`. Then navigate to [http://localhost:5000](http://localhost:5000 "Address to localhost")

## Passport strategies covered 
* Local
* Google
* Facebook
* Twitter
* Github

## .env
The .env file is required for app to run properly   

The .env file containes 
* Mongodb connection URI
* App IDs and Secrets for each oAuth provider

> In order to use, you must have credentials of respective providers in **.env** file name prefixed provider name in uppercase. For example   
> ***GOOGLE_CLIENT_ID*** and ***GOOGLE_CLIENT_SECRET***   
> For simplification credential variables in the **.env** are termed *PROVIDER*_CLIENT_ID and *PROVIDER*_CLIENT_SECRET irrespective of what the provider has termed them in the documentation.   
> 
> *** You can always change the variables as your wish ***

> ## Note
> + Twitter strategy seems to be broken for [http://localhost:5000](http://localhost:5000) but works fine with [http://127.0.0.1:5000](http://127.0.0.1:5000)
> + Facebook strategy seems to be broken for [http://127.0.0.1:5000](http://127.0.0.1:5000) but works fine with [http://localhost:5000](http://localhost:5000)
> + Use both keeping these in mind