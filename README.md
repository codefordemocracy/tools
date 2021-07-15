# Tools

This repository contains code for Code for Democracy's tools, which live at [https://tools.codefordemocracy.org](https://tools.codefordemocracy.org). This app is built using Flask and Vue, and it is set up to run on GCP App Engine using Python 3.7.

## Running Locally

```
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS="XXXXXXXXXXXXXXXXX.json"
export FLASK_ENV=development
flask run
```
