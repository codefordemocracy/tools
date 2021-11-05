import json
import re
import utilities
import math
import requests
from urllib.parse import urlencode
from cryptography.fernet import Fernet
import datetime

from vue import VueFlask
from flask import render_template, request, Response, make_response, jsonify, redirect
from google.cloud import secretmanager
import google.auth.transport.requests
import google.oauth2.id_token
import pandas as pd
from pandas.api.types import is_string_dtype, is_numeric_dtype

secrets = secretmanager.SecretManagerServiceClient()
client_id = secrets.access_secret_version(request={"name": "projects/952416783871/secrets/api_tools_client_id/versions/1"}).payload.data.decode()
client_secret = secrets.access_secret_version(request={"name": "projects/952416783871/secrets/api_tools_client_secret/versions/1"}).payload.data.decode()
crypto_key = secrets.access_secret_version(request={"name": "projects/952416783871/secrets/tools_crypto_key/versions/1"}).payload.data.decode()
secret_key = secrets.access_secret_version(request={"name": "projects/952416783871/secrets/tools_secret_key/versions/1"}).payload.data.decode()
service_url = secrets.access_secret_version(request={"name": "projects/952416783871/secrets/tools_service_url/versions/1"}).payload.data.decode()

fernet = Fernet(crypto_key)
app = VueFlask(__name__)
app.secret_key = secret_key

@app.context_processor
def inject_now():
    return { "now": datetime.datetime.now() }

#########################################################
# front end helpers
#########################################################

def get_mode(request):
    if request.referrer is not None and ("codefordemocracy.org" in request.referrer or "127.0.0.1" in request.referrer):
        return "popup"
    return None

#########################################################
# serve front end
#########################################################

@app.route("/", methods=["GET"])
def route_home():
    return render_template("home.html.j2")

@app.route("/create/list/", methods=["GET"])
def route_create_list():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit List"
    elif action == "clone" and id is not None:
        workflow = "Clone List"
    else:
        action = "create"
        workflow = "Create a List"
    output = "list"
    templates = [{"step": 1, "slug": "type"}, {"step": 2, "slug": "include"}, {"step": 3, "slug": "exclude"}, {"step": 4, "slug": "review"}, {"step": 5, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/view/list/", methods=["GET"])
def route_view_list():
    return render_template("workflow/list/popup/view.html.j2", mode=get_mode(request))

@app.route("/create/query/", methods=["GET"])
def route_create_query():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit Query"
    elif action == "clone" and id is not None:
        workflow = "Clone Query"
    else:
        action = "create"
        workflow = "Create a Query"
    output = "query"
    templates = [{"step": 1, "slug": "recipe"}, {"step": 2, "slug": "lists"}, {"step": 3, "slug": "filters"}, {"step": 4, "slug": "results"}, {"step": 5, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/view/query/", methods=["GET"])
def route_view_query():
    return render_template("workflow/query/popup/view.html.j2", mode=get_mode(request))

@app.route("/create/visualization/", methods=["GET"])
def route_create_visualization():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit Visualization"
    elif action == "clone" and id is not None:
        workflow = "Clone Visualization"
    else:
        action = "create"
        workflow = "Create a Visualization"
    output = "visualization"
    templates = [{"step": 1, "slug": "output"}, {"step": 2, "slug": "query"}, {"step": 3, "slug": "transform"}, {"step": 4, "slug": "review"}, {"step": 5, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/view/visualization/", methods=["GET"])
def route_view_visualization():
    return render_template("workflow/visualization/popup/view.html.j2", mode=get_mode(request))

@app.route("/create/alert/", methods=["GET"])
def route_create_alert():
    action = "create"
    workflow = "Create an Alert"
    output = "alert"
    templates = [{"step": 1, "slug": "query"}, {"step": 2, "slug": "trigger"}, {"step": 3, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=None)

@app.route("/view/alert/", methods=["GET"])
def route_view_alert():
    return render_template("workflow/alert/popup/view.html.j2", mode=get_mode(request))

@app.route("/explore/lists/", methods=["GET"])
def route_explore_lists():
    return render_template("explore/lists/app.html.j2")

@app.route("/explore/relationships/", methods=["GET"])
@app.route("/explore/relationships/graph/", methods=["GET"])
def route_explore_relationships_graph():
    return render_template("explore/relationships/graph/main.html.j2")

@app.route("/explore/relationships/traverse/", methods=["GET"])
def route_explore_relationships_traverse():
    return render_template("explore/relationships/traverse/main.html.j2")

@app.route("/explore/documents/", methods=["GET"])
def route_explore_documents():
    return render_template("explore/documents/app.html.j2")

@app.route("/dashboard/", methods=["GET"])
def route_dashboard():
    return render_template("dashboard.html.j2")

@app.route("/user/<username>/", methods=["GET"])
def route_user(username):
    return render_template("user.html.j2", username=username, mode=get_mode(request))

#########################################################
# connect to api
#########################################################

def post(endpoint, body):
    url = "https://api.codefordemocracy.org"
    response = requests.post(url+endpoint, data=json.dumps(body), auth=(client_id, client_secret), headers={'User-Agent': 'tools'})
    if response.status_code == 200:
        return json.loads(response.text)
    return []

def action(payload):
    auth_req = google.auth.transport.requests.Request()
    id_token = google.oauth2.id_token.fetch_id_token(auth_req, service_url)
    response = requests.post(service_url, json=payload, headers={'Authorization': 'Bearer ' + id_token})
    if response.status_code == 200:
        return json.loads(response.text)
    return False

#########################################################
# formatting endpoints
#########################################################

@app.route("/api/format/flat/", methods=["POST"])
def route_api_format_flat():
    data = request.get_json()
    df = pd.json_normalize(data)
    return make_response(json.dumps(df.to_json(orient='records'), default=utilities.convert))

#########################################################
# share endpoints
#########################################################

@app.route("/api/generate/link/", methods=["POST"])
def route_api_generate_link():
    data = request.get_json()
    path = data.get("fullPath")
    if "id" in data.get("query"):
        path += "&string=" + fernet.encrypt(data["query"]["id"].encode("utf-8")).decode("utf-8")
    return jsonify(path)

#########################################################
# list endpoints
#########################################################

@app.route("/api/list/preview/", methods=["POST"])
def route_api_list_preview():
    data = request.get_json()
    preview = {
        "include": [],
        "exclude": []
    }
    body = {
        "pagination": {
            "skip": 0,
            "limit": 500
        }
    }
    if data.get("subtype") is not None:
        endpoint = "/data/preview/" + data["subtype"] + "/"
        if data["subtype"] != data["type"]:
            endpoint = "/data/preview/" + data["type"] + "/" + data["subtype"] + "/"
        if data.get("include") is not None:
            body["include"] = data["include"]
            preview["include"] = post(endpoint, body)
        if data.get("exclude") is not None:
            body["exclude"] = data["exclude"]
            preview["exclude"] = post(endpoint, body)
    return jsonify(preview)

@app.route("/api/list/review/table/", methods=["POST"])
def route_api_list_review_table():
    data = request.get_json()
    elements = []
    body = {
        "pagination": {
            "skip": 0,
            "limit": 500
        }
    }
    if data.get("pagination") is not None:
        if "skip" in data["pagination"]:
            body["pagination"]["skip"] = data["pagination"]["skip"]
        if "limit" in data["pagination"]:
            body["pagination"]["limit"] = data["pagination"]["limit"]
    if "list" in data:
        if data["list"].get("subtype") is not None:
            endpoint = "/data/preview/" + data["list"]["subtype"] + "/"
            if data["list"]["subtype"] != data["list"]["type"]:
                endpoint = "/data/preview/" + data["list"]["type"] + "/" + data["list"]["subtype"] + "/"
            if data["list"].get("include") is not None:
                body["include"] = data["list"]["include"]
            if data["list"].get("exclude") is not None:
                if data["list"]["exclude"].get("terms") is not None or data["list"]["exclude"].get("ids") is not None or data["list"]["exclude"].get("filters") is not None:
                    body["exclude"] = data["list"]["exclude"]
            elements = post(endpoint, body)
    return jsonify(elements)

@app.route("/api/list/review/count/", methods=["POST"])
def route_api_list_review_count():
    data = request.get_json()
    count = -1
    body = dict()
    if "list" in data:
        if data["list"].get("subtype") is not None:
            endpoint = "/data/preview/" + data["list"]["subtype"] + "/"
            if data["list"]["subtype"] != data["list"]["type"]:
                endpoint = "/data/preview/" + data["list"]["type"] + "/" + data["list"]["subtype"] + "/"
            if data["list"].get("include") is not None:
                body["include"] = data["list"]["include"]
            if data["list"].get("exclude") is not None:
                if data["list"]["exclude"].get("terms") is not None or data["list"]["exclude"].get("ids") is not None or data["list"]["exclude"].get("filters") is not None:
                    body["exclude"] = data["list"]["exclude"]
            body["count"] = True
            elements = post(endpoint, body)
            if "count" in elements[0]:
                count = elements[0]["count"]
    return jsonify(count)

#########################################################
# query endpoints
#########################################################

@app.route("/api/query/results/table/", methods=["POST"])
def route_api_query_results_table():
    data = request.get_json()
    body = dict()
    elements = []
    if data["query"].get("dates") is not None:
        body["dates"] = {
            "min": str(data["query"]["dates"]["min"])[:10]
        }
        if data["query"]["dates"].get("max") is not None:
            body["dates"]["max"] = str(data["query"]["dates"]["max"])[:10]
    if data["query"].get("filters") is not None:
        body["filters"] = data["query"]["filters"]
    if data["query"].get("freshness") is not None:
        body["freshness"] = data["query"]["freshness"]
    if data["query"].get("orderby") is not None and data["query"].get("orderdir") is not None:
        body["orderby"] = data["query"]["orderby"]
        body["orderdir"] = data["query"]["orderdir"]
    if data.get("pagination") is not None:
        body["pagination"] = dict()
        if "skip" in data["pagination"]:
            body["pagination"]["skip"] = data["pagination"]["skip"]
        if "limit" in data["pagination"]:
            body["pagination"]["limit"] = data["pagination"]["limit"]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            body["lists"] = list(data["query"]["lists"].values())
            body["template"] = data["query"]["template"]
            elements = post(endpoint, body)
    return jsonify(elements)

@app.route("/api/query/results/count/", methods=["POST"])
def route_api_query_results_count():
    data = request.get_json()
    body = dict()
    count = -1
    if data["query"].get("dates") is not None:
        body["dates"] = {
            "min": str(data["query"]["dates"]["min"])[:10]
        }
        if data["query"]["dates"].get("max") is not None:
            body["dates"]["max"] = str(data["query"]["dates"]["max"])[:10]
    if data["query"].get("filters") is not None:
        body["filters"] = data["query"]["filters"]
    if data["query"].get("freshness") is not None:
        body["freshness"] = data["query"]["freshness"]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            body["lists"] = list(data["query"]["lists"].values())
            body["template"] = data["query"]["template"]
            body["count"] = True
            elements = post(endpoint, body)
            if "count" in elements[0]:
                count = elements[0]["count"]
    return jsonify(count)

@app.route("/api/query/results/histogram/", methods=["POST"])
def route_api_query_results_histogram():
    data = request.get_json()
    body = dict()
    buckets = []
    if data["query"].get("dates") is not None:
        body["dates"] = {
            "min": str(data["query"]["dates"]["min"])[:10]
        }
        if data["query"]["dates"].get("max") is not None:
            body["dates"]["max"] = str(data["query"]["dates"]["max"])[:10]
    if data["query"].get("filters") is not None:
        body["filters"] = data["query"]["filters"]
    if data["query"].get("freshness") is not None:
        body["freshness"] = data["query"]["freshness"]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            body["lists"] = list(data["query"]["lists"].values())
            body["template"] = data["query"]["template"]
            body["histogram"] = True
            buckets = post(endpoint, body)
    return jsonify(buckets)

#########################################################
# visualization endpoints
#########################################################

@app.route("/api/visualization/aggregations/options/", methods=["POST"])
def route_api_visualization_aggregations_options():
    data = request.get_json()
    df = pd.json_normalize(data)
    options = dict()
    for col in df.columns:
        options[col] = ["average", "sum", "min", "max", "count", "distinct"]
        if is_string_dtype(df[col]):
            options[col] = ["count", "distinct"]
    return make_response(json.dumps(options, default=utilities.convert))

@app.route("/api/visualization/aggregations/results/", methods=["POST"])
def route_api_visualization_aggregations_results():
    data = request.get_json()
    # get the data
    body = dict()
    elements = []
    if data["query"].get("dates") is not None:
        body["dates"] = {
            "min": str(data["query"]["dates"]["min"])[:10]
        }
        if data["query"]["dates"].get("max") is not None:
            body["dates"]["max"] = str(data["query"]["dates"]["max"])[:10]
    if data["query"].get("filters") is not None:
        body["filters"] = data["query"]["filters"]
    if data["query"].get("orderby") is not None and data["query"].get("orderdir") is not None:
        body["orderby"] = data["query"]["orderby"]
        body["orderdir"] = data["query"]["orderdir"]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            body["lists"] = list(data["query"]["lists"].values())
            body["template"] = data["query"]["template"]
            body["pagination"] = {
                "skip": 0,
                "limit": 1000
            }
            results = post(endpoint, body)
            while len(results) == body["pagination"]["limit"] or body["pagination"]["skip"] == 0:
                elements.extend(results)
                body["pagination"]["skip"] = len(elements)
                results = post(endpoint, body)
    # calculate aggregations
    df = pd.json_normalize(elements)
    if len(data["aggregations"]["columns"]) > 0:
        aggs = {}
        rename = {}
        for col in df.columns:
            if col in data["aggregations"]["columns"]:
                if data["aggregations"]["apply"][col] == "average":
                    aggs[col] = "mean"
                    rename[col] = "average(" + col + ")"
                elif data["aggregations"]["apply"][col] == "sum":
                    aggs[col] = "sum"
                    rename[col] = "sum(" + col + ")"
                elif data["aggregations"]["apply"][col] == "min":
                    aggs[col] = "min"
                    rename[col] = "min(" + col + ")"
                elif data["aggregations"]["apply"][col] == "max":
                    aggs[col] = "max"
                    rename[col] = "max(" + col + ")"
                elif data["aggregations"]["apply"][col] == "count":
                    aggs[col] = "count"
                    rename[col] = "count(" + col + ")"
                elif data["aggregations"]["apply"][col] == "distinct":
                    aggs[col] = "nunique"
                    rename[col] = "count(distinct " + col + ")"
        df = df.groupby(data["aggregations"]["groupby"], as_index=False).agg(aggs).rename(columns=rename)
    pages = []
    pagesize = 20
    for i in range(math.ceil(len(df)/pagesize)):
        pages.append(df[i*pagesize:(i+1)*pagesize].to_dict('records'))
    obj = {
        "count": len(df.index),
        "pages": pages
    }
    return make_response(json.dumps(obj, default=utilities.convert))

#########################################################
# explore endpoints
#########################################################

# relationships

@app.route("/api/graph/", methods=["POST"])
def route_api_graph():
    data = request.get_json()
    body = dict()
    elements = []
    if "dates" in data:
        body["dates"] = {
            "min": str(data["dates"]["min"])[:10],
            "max": str(data["dates"]["max"])[:10]
        }
    if "pagination" in data:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
    if data["type"] == "ids":
        endpoint = "/graph/find/elements/uuid/"
        if "nodes" in data:
            body["nodes"] = data["nodes"]
        if "edges" in data:
            body["edges"] = data["edges"]
        elements = utilities.elements2cy(post(endpoint, body))
    if data["type"] == "search":
        body["attributes"] = dict()
        if "options" in data:
            body["context"] = data["options"]["context"]
        if data["flow"] == "candidates":
            endpoint = "/graph/search/candidates/"
            if len(data["parameters"]["cand_name"]) > 0:
                body["name"] = data["parameters"]["cand_name"]
            if data["parameters"]["cand_pty_affiliation"] is not None:
                body["attributes"]["cand_pty_affiliation"] = data["parameters"]["cand_pty_affiliation"]
            if data["parameters"]["cand_office"] is not None:
                body["attributes"]["cand_office"] = data["parameters"]["cand_office"]
            if data["parameters"]["cand_office_st"] is not None:
                body["attributes"]["cand_office_st"] = data["parameters"]["cand_office_st"]
            if data["parameters"]["cand_office_district"] is not None:
                body["attributes"]["cand_office_district"] = data["parameters"]["cand_office_district"]
            if data["parameters"]["cand_ici"] is not None:
                body["attributes"]["cand_ici"] = data["parameters"]["cand_ici"]
            if len(data["parameters"]["cand_election_yr"]) > 0:
                body["attributes"]["cand_election_yr"] = data["parameters"]["cand_election_yr"]
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "committees":
            endpoint = "/graph/search/committees/"
            if len(data["parameters"]["cmte_nm"]) > 0:
                body["name"] = data["parameters"]["cmte_nm"]
            if data["parameters"]["cmte_pty_affiliation"] is not None:
                body["attributes"]["cmte_pty_affiliation"] = data["parameters"]["cmte_pty_affiliation"]
            if data["parameters"]["cmte_dsgn"] is not None:
                body["attributes"]["cmte_dsgn"] = data["parameters"]["cmte_dsgn"]
            if data["parameters"]["cmte_tp"] is not None:
                body["attributes"]["cmte_tp"] = data["parameters"]["cmte_tp"]
            if data["parameters"]["org_tp"] is not None:
                body["attributes"]["org_tp"] = data["parameters"]["org_tp"]
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "donors":
            endpoint = "/graph/search/donors/"
            if len(data["parameters"]["name"]) > 0:
                body["name"] = data["parameters"]["name"]
            if len(data["parameters"]["employer"]) > 0:
                body["attributes"]["employer"] = data["parameters"]["employer"]
            if len(data["parameters"]["occupation"]) > 0:
                body["attributes"]["occupation"] = data["parameters"]["occupation"]
            if data["parameters"]["entity_tp"] is not None:
                body["attributes"]["entity_tp"] = data["parameters"]["entity_tp"]
            if data["parameters"]["state"] is not None:
                body["attributes"]["state"] = data["parameters"]["state"]
            if len(data["parameters"]["zip_code"]) > 0:
                body["attributes"]["zip_code"] = data["parameters"]["zip_code"]
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "payees":
            endpoint = "/graph/search/payees/"
            if len(data["parameters"]["name"]) > 0:
                body["name"] = data["parameters"]["name"]
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "sources":
            endpoint = "/graph/search/sources/"
            if len(data["parameters"]["domain"]) > 0:
                body["domain"] = data["parameters"]["domain"]
                body["domain"] = utilities.strip_url(body["domain"])
                body["domain"] = body["domain"].split("www.",1)[1] if body["domain"].startswith("www.") else body["domain"]
            bias_score = []
            if data["parameters"]["bias_score"]["liberal"]:
                bias_score.append(-3)
                bias_score.append(-2)
            if data["parameters"]["bias_score"]["left"]:
                bias_score.append(-1)
            if data["parameters"]["bias_score"]["moderate"]:
                bias_score.append(0)
            if data["parameters"]["bias_score"]["right"]:
                bias_score.append(1)
            if data["parameters"]["bias_score"]["conservative"]:
                bias_score.append(2)
                bias_score.append(3)
            if len(bias_score) > 0:
                body["attributes"]["bias_score"] = bias_score
            if data["parameters"]["factually_questionable_flag"]:
                body["attributes"]["factually_questionable_flag"] = 1
            if data["parameters"]["conspiracy_flag"]:
                body["attributes"]["conspiracy_flag"] = 1
            if data["parameters"]["hate_group_flag"]:
                body["attributes"]["hate_group_flag"] = 1
            if data["parameters"]["propaganda_flag"]:
                body["attributes"]["propaganda_flag"] = 1
            if data["parameters"]["satire_flag"]:
                body["attributes"]["satire_flag"] = 1
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "tweeters":
            endpoint = "/graph/search/tweeters/"
            if len(data["parameters"]["username"]) > 0:
                body["attributes"]["username"] = data["parameters"]["username"]
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "buyers":
            endpoint = "/graph/search/buyers/"
            if len(data["parameters"]["name"]) > 0:
                body["name"] = data["parameters"]["name"]
            elements = utilities.elements2cy(post(endpoint, body))
        elif data["flow"] == "pages":
            endpoint = "/graph/search/pages/"
            if len(data["parameters"]["name"]) > 0:
                body["name"] = data["parameters"]["name"]
            elements = utilities.elements2cy(post(endpoint, body))
    elif data["type"] == "expandnode":
        if len(data["labels"]) > 0:
            endpoint = "/graph/traverse/neighbors/"
            body["nodes"] = data["ids"]
            body["labels"] = data["labels"]
            elements = utilities.elements2cy(post(endpoint, body))
    elif data["type"] == "uncovercontributors":
        if len(data["ids"]) > 0:
            endpoint = "/graph/uncover/contributors/"
            body["nodes"] = data["ids"]
            body["labels"] = data["labels"]
            body["min_transaction_amt"] = data["min_transaction_amt"]
            elements = utilities.elements2cy(post(endpoint, body))
    return jsonify(elements)

@app.route("/api/traverse/find/", methods=["POST"])
def route_api_traverse_find():
    data = request.get_json()
    body = dict()
    elements = []
    body["dates"] = {
        "min": "2015-01-01"
    }
    if len(data["term"]) > 0:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
        terms = re.split(" OR ", data["term"], flags=re.IGNORECASE)
        for term in terms:
            bstring = body.copy()
            if data["entity"] == "candidate":
                endpoint = "/graph/search/candidates/"
                bstring["name"] = term
            elif data["entity"] == "committee":
                endpoint = "/graph/search/committees/"
                bstring["name"] = term
            elif data["entity"] == "donor":
                endpoint = "/graph/search/donors/"
                if term.startswith("EMPLOYER:"):
                    term = term.split("EMPLOYER:", 1)[1]
                    if "attributes" not in bstring:
                        bstring["attributes"] = dict()
                    bstring["attributes"]["employer"] = term
                elif term.startswith("OCCUPATION:"):
                    term = term.split("OCCUPATION:", 1)[1]
                    if "attributes" not in bstring:
                        bstring["attributes"] = dict()
                    bstring["attributes"]["occupation"] = term
                else:
                    bstring["name"] = term
            elif data["entity"] == "industry":
                endpoint = "/graph/search/industries/"
                bstring["name"] = term
            elif data["entity"] == "payee":
                endpoint = "/graph/search/payees/"
                bstring["name"] = term
            elif data["entity"] == "source":
                endpoint = "/graph/search/sources/"
                bstring["domain"] = term
                bstring["domain"] = utilities.strip_url(bstring["domain"])
                bstring["domain"] = bstring["domain"].split("www.",1)[1] if bstring["domain"].startswith("www.") else bstring["domain"]
            elif data["entity"] == "buyer":
                endpoint = "/graph/search/buyers/"
                bstring["name"] = term
            elif data["entity"] == "page":
                endpoint = "/graph/search/pages/"
                bstring["name"] = term
            elif data["entity"] == "tweeter":
                endpoint = "/graph/search/tweeters/"
                bstring["username"] = term
            elif data["entity"] == "topic":
                endpoint = "/graph/search/topics/"
                bstring["name"] = term
            elif data["entity"] == "tweeter":
                endpoint = "/graph/search/tweeters/"
                bstring["username"] = term
            elements.extend(post(endpoint, bstring))
    elements = [i for n, i in enumerate(elements) if i not in elements[n + 1:]]
    return jsonify(elements)

@app.route("/api/traverse/associations/", methods=["POST"])
def route_api_traverse_associations():
    data = request.get_json()
    body = dict()
    elements = []
    if "dates" in data:
        body["dates"] = {
            "min": str(data["dates"]["min"])[:10],
            "max": str(data["dates"]["max"])[:10]
        }
    else:
        body["dates"] = {
            "min": "2015-01-01"
        }
    if len(data["ids"]) > 0:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
        body["nodes"] = {
            "ids": data["ids"],
        }
        if "intermediaries" in data:
            body["intermediaries"] = {
                "type": data["intermediaries"]
            }
            if data["intermediaries"] == "contribution":
                if "direction" in data:
                    if data["direction"] is not None:
                        body["intermediaries"]["contributions"] = {
                            "direction": data["direction"]
                        }
            elif data["intermediaries"] == "expenditure":
                if "sup_opp" in data:
                    if data["sup_opp"] is not None:
                        body["intermediaries"]["expenditure"] = {
                            "sup_opp": data["sup_opp"]
                        }
        endpoint = "/graph/traverse/associations/" + data["entity"] + "/" + data["entity2"] + "/"
        elements = post(endpoint, body)
    return jsonify(elements)

@app.route("/api/traverse/intersection/", methods=["POST"])
def route_api_traverse_intersection():
    data = request.get_json()
    body = dict()
    elements = []
    if "dates" in data:
        body["dates"] = {
            "min": str(data["dates"]["min"])[:10],
            "max": str(data["dates"]["max"])[:10]
        }
    else:
        body["dates"] = {
            "min": "2015-01-01"
        }
    if len(data["ids"]) > 0 and len(data["ids2"]) > 0:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
        body["nodes"] = {
            "ids": data["ids"],
            "ids2": data["ids2"]
        }
        if "intermediaries" in data:
            body["intermediaries"] = {
                "type": data["intermediaries"]
            }
            if data["intermediaries"] == "contribution":
                if "direction" in data:
                    if data["direction"] is not None:
                        body["intermediaries"]["contributions"] = {
                            "direction": data["direction"]
                        }
            elif data["intermediaries"] == "expenditure":
                if "sup_opp" in data:
                    if data["sup_opp"] is not None:
                        body["intermediaries"]["expenditure"] = {
                            "sup_opp": data["sup_opp"]
                        }
        endpoint = "/graph/traverse/associations/" + data["entity"] + "/" + data["entity2"] + "/"
        elements = post(endpoint, body)
    return jsonify(elements)

@app.route("/api/traverse/intermediaries/", methods=["POST"])
def route_api_traverse_intermediaries():
    data = request.get_json()
    body = dict()
    elements = []
    body["dates"] = {
        "min": "2015-01-01"
    }
    if len(data["ids"]) > 0 and len(data["ids2"]) > 0:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
        body["nodes"] = {
            "ids": data["ids"],
            "ids2": data["ids2"]
        }
        if "intermediaries" in data:
            body["intermediaries"] = {
                "type": data["intermediaries"]
            }
            if data["intermediaries"] == "contribution":
                if "direction" in data:
                    if data["direction"] is not None:
                        body["intermediaries"]["contributions"] = {
                            "direction": data["direction"]
                        }
            elif data["intermediaries"] == "expenditure":
                if "sup_opp" in data:
                    if data["sup_opp"] is not None:
                        body["intermediaries"]["expenditure"] = {
                            "sup_opp": data["sup_opp"]
                        }
        endpoint = "/graph/traverse/intermediaries/" + data["entity"] + "/" + data["entity2"] + "/"
        elements = post(endpoint, body)
    return jsonify(elements)

@app.route("/api/traverse/contribution/contributor/", methods=["POST"])
def route_api_traverse_contribution_contributor():
    data = request.get_json()
    body = dict()
    elements = []
    body["dates"] = {
        "min": "2015-01-01"
    }
    if len(data["ids"]) > 0:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
        body["nodes"] = data["ids"]
        endpoint = "/graph/traverse/relationships/contribution/contributor/"
        elements = post(endpoint, body)
    return jsonify(elements)

@app.route("/api/traverse/contribution/recipient/", methods=["POST"])
def route_api_traverse_contribution_recipient():
    data = request.get_json()
    body = dict()
    elements = []
    body["dates"] = {
        "min": "2015-01-01"
    }
    if len(data["ids"]) > 0:
        body["pagination"] = {
            "skip": (int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]),
            "limit": int(data["pagination"]["limit"])
        }
        body["nodes"] = data["ids"]
        endpoint = "/graph/traverse/relationships/contribution/recipient/"
        elements = post(endpoint, body)
    return jsonify(elements)

# documents

@app.route("/api/browse/documents/", methods=["POST"])
def route_api_browse_documents():
    data = request.get_json()
    body = {
        "histogram": False
    }
    elements = []
    if "term" in data:
        if data["term"] is not None:
            if len(data["term"]) > 0:
                body["text"] = data["term"]
    if "skip" in data and "limit" in data:
        body["pagination"] = {
            "skip": data["skip"],
            "limit": data["limit"]
        }
    if "dates" in data:
        body["dates"] = {
            "min": str(data["dates"]["min"])[:10],
            "max": str(data["dates"]["max"])[:10]
        }
    if "documents" in data:
        if data["documents"] == "articles":
            endpoint = "/documents/browse/news/articles/source/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = post(endpoint, body)
                for doc in docs:
                    element = {}
                    if "extracted" in doc:
                        if "title" in doc["extracted"]:
                            element["title"] = doc["extracted"]["title"]
                        if "text" in doc["extracted"]:
                            element["text"] = doc["extracted"]["text"]
                        if "date" in doc["extracted"]:
                            element["date"] = doc["extracted"]["date"]
                        if "url" in doc["extracted"]:
                            element["url"] = doc["extracted"]["url"]
                    elements.append(element)
        elif data["documents"] == "tweets":
            endpoint = "/documents/browse/twitter/tweets/candidate/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = post(endpoint, body)
                for doc in docs:
                    element = {}
                    if "obj" in doc:
                        if "id" in doc["obj"].get("tweet", {}):
                            element["id"] = doc["obj"]["tweet"]["id"]
                            if "username" in doc["obj"].get("author", {}):
                                element["url"] = "https://twitter.com/" + doc["obj"]["author"]["username"] + "/status/" + doc["obj"]["tweet"]["id"]
                        if "created_at" in doc["obj"].get("tweet", {}):
                            element["created_at"] = doc["obj"]["tweet"]["created_at"]
                        if "entities" in doc["obj"].get("tweet", {}):
                            if "hashtags" in doc["obj"]["tweet"]["entities"]:
                                if len(doc["obj"]["tweet"]["entities"]["hashtags"]) > 0:
                                    element["hashtags"] = [x["tag"] for x in doc["obj"]["tweet"]["entities"]["hashtags"]]
                    if "user_id" in doc["obj"].get("author", {}):
                        element["user_id"] = doc["obj"]["author"]["user_id"]
                    if "username" in doc["obj"].get("author", {}):
                        element["username"] = doc["obj"]["author"]["username"]
                    elements.append(element)
        elif data["documents"] == "ads":
            endpoint = "/documents/browse/facebook/ads/"
            docs = post(endpoint, body)
            for doc in docs:
                element = {}
                if "obj" in doc:
                    if "id" in doc["obj"]:
                        element["id"] = doc["obj"]["id"]
                    if "page_id" in doc["obj"]:
                        element["page_id"] = doc["obj"]["page_id"]
                    if "page_name" in doc["obj"]:
                        element["page_name"] = doc["obj"]["page_name"]
                    if "funding_entity" in doc["obj"]:
                        element["funding_entity"] = doc["obj"]["funding_entity"]
                    if "permalink" in doc["obj"]:
                        element["url"] = doc["obj"]["permalink"]
                    if "ad_creation_time" in doc["obj"]:
                        element["created_on"] = doc["obj"]["ad_creation_time"]
                    if "created" in doc["obj"]:
                        element["created_on"] = doc["obj"]["created"]
                elements.append(element)
    return jsonify(elements)

@app.route("/api/browse/histogram/", methods=["POST"])
def route_api_browse_histogram():
    data = request.get_json()
    body = {
        "histogram": True
    }
    elements = []
    if "term" in data:
        if data["term"] is not None:
            if len(data["term"]) > 0:
                body["text"] = data["term"]
    if "dates" in data:
        body["dates"] = {
            "min": str(data["dates"]["min"])[:10],
            "max": str(data["dates"]["max"])[:10]
        }
    if "documents" in data:
        if data["documents"] == "articles":
            endpoint = "/documents/browse/news/articles/source/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = post(endpoint, body)
                elements.extend(docs)
        elif data["documents"] == "tweets":
            endpoint = "/documents/browse/twitter/tweets/candidate/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = post(endpoint, body)
                elements.extend(docs)
        elif data["documents"] == "ads":
            endpoint = "/documents/browse/facebook/ads/"
            docs = post(endpoint, body)
            elements.extend(docs)
    return jsonify(elements)

#########################################################
# user data and authenticated endpoints
#########################################################

# user

@app.route("/api/user/public/", methods=["POST"])
def route_api_user_public():
    data = request.get_json()
    user = {}
    if data.get("username") is not None:
        user = action({"task": "get_public_profile", "username": data["username"]})
    return jsonify(user)

@app.route("/api/user/active/", methods=["GET"])
def route_api_user_active():
    profile = action({"task": "get_active_user", "token": request.cookies.get('cfd')})
    return jsonify(profile)

# dashboard and workflow

@app.route("/api/user/active/lists/", methods=["GET"])
def route_api_user_active_lists():
    lists = action({"task": "get_active_user_lists", "token": request.cookies.get('cfd')})
    return jsonify(lists)

@app.route("/api/user/active/queries/", methods=["GET"])
def route_api_user_active_queries():
    queries = action({"task": "get_active_user_queries", "token": request.cookies.get('cfd')})
    return jsonify(queries)

@app.route("/api/user/active/visualizations/", methods=["GET"])
def route_api_user_active_visualizations():
    visualizations = action({"task": "get_active_user_visualizations", "token": request.cookies.get('cfd')})
    return jsonify(visualizations)

@app.route("/api/user/active/alerts/", methods=["GET"])
def route_api_user_active_alerts():
    alerts = action({"task": "get_active_user_alerts", "token": request.cookies.get('cfd')})
    return jsonify(alerts)

@app.route("/api/user/active/alerts/count/active/", methods=["GET"])
def route_api_user_active_alerts_count_active():
    count = action({"task": "count_active_user_alerts", "token": request.cookies.get('cfd')})
    return jsonify(count)

# list

@app.route("/api/lists/", methods=["POST"])
def route_api_lists():
    data = request.get_json()
    lists = action({"task": "get_lists", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(lists)

@app.route("/api/list/meta/", methods=["POST"])
def route_api_list_meta():
    data = request.get_json()
    list = action({"task": "get_list_meta", "token": request.cookies.get('cfd'), "id": data.get("id"), "string": data.get("string")})
    return jsonify(list)

@app.route("/api/list/create/", methods=["POST"])
def route_api_list_create():
    data = request.get_json()
    response = action({"task": "create_list", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/list/edit/", methods=["POST"])
def route_api_list_edit():
    data = request.get_json()
    response = action({"task": "edit_list", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/list/toggle/", methods=["POST"])
def route_api_list_toggle():
    data = request.get_json()
    response = action({"task": "toggle_list", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

@app.route("/api/list/delete/", methods=["POST"])
def route_api_list_delete():
    data = request.get_json()
    response = action({"task": "delete_list", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

# query

@app.route("/api/queries/", methods=["POST"])
def route_api_queries():
    data = request.get_json()
    queries = action({"task": "get_queries", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(queries)

@app.route("/api/query/meta/", methods=["POST"])
def route_api_query_meta():
    data = request.get_json()
    query = action({"task": "get_query_meta", "token": request.cookies.get('cfd'), "id": data.get("id"), "string": data.get("string")})
    return jsonify(query)

@app.route("/api/query/create/", methods=["POST"])
def route_api_query_create():
    data = request.get_json()
    response = action({"task": "create_query", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/query/edit/", methods=["POST"])
def route_api_query_edit():
    data = request.get_json()
    response = action({"task": "edit_query", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/query/toggle/", methods=["POST"])
def route_api_query_toggle():
    data = request.get_json()
    response = action({"task": "toggle_query", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

@app.route("/api/query/delete/", methods=["POST"])
def route_api_query_delete():
    data = request.get_json()
    response = action({"task": "delete_query", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

# visualization

@app.route("/api/visualization/meta/", methods=["POST"])
def route_api_visualization_meta():
    data = request.get_json()
    visualization = action({"task": "get_visualization_meta", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(visualization)

@app.route("/api/visualization/create/", methods=["POST"])
def route_api_visualization_create():
    data = request.get_json()
    response = action({"task": "create_visualization", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/visualization/edit/", methods=["POST"])
def route_api_visualization_edit():
    data = request.get_json()
    response = action({"task": "edit_visualization", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/visualization/delete/", methods=["POST"])
def route_api_visualization_delete():
    data = request.get_json()
    response = action({"task": "delete_visualization", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

# alert

@app.route("/api/alert/meta/", methods=["POST"])
def route_api_alert_meta():
    data = request.get_json()
    alert = action({"task": "get_alert_meta", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(alert)

@app.route("/api/alert/create/", methods=["POST"])
def route_api_alert_create():
    data = request.get_json()
    response = action({"task": "create_alert", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/alert/toggle/", methods=["POST"])
def route_api_alert_toggle():
    data = request.get_json()
    response = action({"task": "toggle_alert", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

@app.route("/api/alert/delete/", methods=["POST"])
def route_api_alert_delete():
    data = request.get_json()
    response = action({"task": "delete_alert", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
