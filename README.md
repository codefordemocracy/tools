# Explore

This repository contains code for the Explore product, a Flask and Vue app that serves as an interactive front-end interface to the API and lives at [https://explore.codefordemocracy.org](https://explore.codefordemocracy.org). This app is set up to run on GCP App Engine using Python 3.6.

## Running Locally

```
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS="XXXXXXXXXXXXXXXXX.json"
export FLASK_ENV=development
flask run
```
