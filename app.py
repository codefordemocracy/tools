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
    mode = request.args.get("mode")
    return render_template("workflow/list/popup/view.html.j2", mode=mode)

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
    mode = request.args.get("mode")
    return render_template("workflow/query/popup/view.html.j2", mode=mode)

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
    mode = request.args.get("mode")
    return render_template("workflow/visualization/popup/view.html.j2", mode=mode)

@app.route("/create/alert/", methods=["GET"])
def route_create_alert():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit Alert"
    elif action == "clone" and id is not None:
        workflow = "Clone Alert"
    else:
        action = "create"
        workflow = "Create an Alert"
    output = "alert"
    templates = [{"step": 1, "slug": "query"}, {"step": 2, "slug": "trigger"}, {"step": 3, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/view/alert/", methods=["GET"])
def route_view_alert():
    mode = request.args.get("mode")
    return render_template("workflow/alert/popup/view.html.j2", mode=mode)

@app.route("/explore/lists/", methods=["GET"])
def route_explore_lists():
    mode = request.args.get("mode")
    return render_template("explore/lists/app.html.j2", mode=mode)

@app.route("/explore/relationships/", methods=["GET"])
@app.route("/explore/relationships/graph/", methods=["GET"])
def route_explore_relationships_graph():
    mode = request.args.get("mode")
    return render_template("explore/relationships/graph/main.html.j2", mode=mode)

@app.route("/explore/relationships/traverse/", methods=["GET"])
def route_explore_relationships_traverse():
    mode = request.args.get("mode")
    return render_template("explore/relationships/traverse/main.html.j2", mode=mode)

@app.route("/explore/documents/", methods=["GET"])
def route_explore_documents():
    mode = request.args.get("mode")
    return render_template("explore/documents/app.html.j2", mode=mode)

@app.route("/dashboard/", methods=["GET"])
def route_dashboard():
    return render_template("dashboard.html.j2")

@app.route("/user/<username>/", methods=["GET"])
def route_user(username):
    mode = request.args.get("mode")
    return render_template("user.html.j2", username=username, mode=mode)

#########################################################
# connect to api
#########################################################

def path(endpoint, qs):
    if len(qs) != 0:
        endpoint = endpoint + "?" + urlencode(qs)
    return endpoint

def get(path):
    url = "https://api.codefordemocracy.org"
    response = requests.get(url+path, auth=(client_id, client_secret), headers={'User-Agent': 'tools'})
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
# helper functions
#########################################################

def make_api_string_from_comma_separated_text_input(setting):
    setting = [s.strip() for s in setting if s.strip() != ""]
    setting = json.dumps(setting)
    setting = setting.replace("[\"", "")
    setting = setting.replace("\", \"", ",")
    setting = setting.replace("\"]", "")
    setting = setting.replace("[]", "")
    return setting

def make_api_string_from_comma_separated_numerical_input(setting):
    setting = json.dumps(setting)
    setting = setting.replace("[", "")
    setting = setting.replace("]", "")
    setting = setting.replace(" ", "")
    return setting

#########################################################
# formatting endpoints
#########################################################

@app.route("/api/format/flat/", methods=["POST"])
def route_api_format_flat():
    data = request.get_json()
    df = pd.json_normalize(data)
    return make_response(json.dumps(df.to_json(orient='records'), default=utilities.convert))

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
    qs = dict()
    qs["skip"] = 0
    qs["limit"] = 500
    if data.get("subtype") is not None:
        endpoint = "/data/preview/" + data["subtype"] + "/"
        if data["subtype"] != data["type"]:
            endpoint = "/data/preview/" + data["type"] + "/" + data["subtype"] + "/"
        if data.get("include") is not None:
            if data["include"].get("terms") is not None:
                qs["include_terms"] = make_api_string_from_comma_separated_text_input(data["include"]["terms"])
            if data["include"].get("ids") is not None:
                qs["include_ids"] = make_api_string_from_comma_separated_text_input(data["include"]["ids"])
            preview["include"] = get(path(endpoint, qs))
        if data.get("exclude") is not None:
            qs.pop("include_terms", None)
            qs.pop("include_ids", None)
            if data["exclude"].get("terms") is not None:
                qs["include_terms"] = make_api_string_from_comma_separated_text_input(data["exclude"]["terms"])
            if data["exclude"].get("ids") is not None:
                qs["include_ids"] = make_api_string_from_comma_separated_text_input(data["exclude"]["ids"])
            preview["exclude"] = get(path(endpoint, qs))
    return jsonify(preview)

@app.route("/api/list/review/table/", methods=["POST"])
def route_api_list_review_table():
    data = request.get_json()
    elements = []
    qs = dict()
    qs["skip"] = 0
    qs["limit"] = 500
    if data.get("pagination") is not None:
        if "skip" in data["pagination"]:
            qs["skip"] = data["pagination"]["skip"]
        if "limit" in data["pagination"]:
            qs["limit"] = data["pagination"]["limit"]
    if "list" in data:
        if data["list"].get("subtype") is not None:
            endpoint = "/data/preview/" + data["list"]["subtype"] + "/"
            if data["list"]["subtype"] != data["list"]["type"]:
                endpoint = "/data/preview/" + data["list"]["type"] + "/" + data["list"]["subtype"] + "/"
            if data["list"].get("include") is not None:
                if data["list"]["include"].get("terms") is not None:
                    qs["include_terms"] = make_api_string_from_comma_separated_text_input(data["list"]["include"]["terms"])
                if data["list"]["include"].get("ids") is not None:
                    qs["include_ids"] = make_api_string_from_comma_separated_text_input(data["list"]["include"]["ids"])
            if data["list"].get("exclude") is not None:
                if data["list"]["exclude"].get("terms") is not None:
                    qs["exclude_terms"] = make_api_string_from_comma_separated_text_input(data["list"]["exclude"]["terms"])
                if data["list"]["exclude"].get("ids") is not None:
                    qs["exclude_ids"] = make_api_string_from_comma_separated_text_input(data["list"]["exclude"]["ids"])
            elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/list/review/count/", methods=["POST"])
def route_api_list_review_count():
    data = request.get_json()
    count = -1
    qs = dict()
    if "list" in data:
        if data["list"].get("subtype") is not None:
            endpoint = "/data/preview/" + data["list"]["subtype"] + "/"
            if data["list"]["subtype"] != data["list"]["type"]:
                endpoint = "/data/preview/" + data["list"]["type"] + "/" + data["list"]["subtype"] + "/"
            if data["list"].get("include") is not None:
                if data["list"]["include"].get("terms") is not None:
                    qs["include_terms"] = make_api_string_from_comma_separated_text_input(data["list"]["include"]["terms"])
                if data["list"]["include"].get("ids") is not None:
                    qs["include_ids"] = make_api_string_from_comma_separated_text_input(data["list"]["include"]["ids"])
            if data["list"].get("exclude") is not None:
                if data["list"]["exclude"].get("terms") is not None:
                    qs["exclude_terms"] = make_api_string_from_comma_separated_text_input(data["list"]["exclude"]["terms"])
                if data["list"]["exclude"].get("ids") is not None:
                    qs["exclude_ids"] = make_api_string_from_comma_separated_text_input(data["list"]["exclude"]["ids"])
            qs["count"] = True
            elements = get(path(endpoint, qs))
            if "count" in elements[0]:
                count = elements[0]["count"]
    return jsonify(count)

#########################################################
# query endpoints
#########################################################

@app.route("/api/query/results/table/", methods=["POST"])
def route_api_query_results_table():
    data = request.get_json()
    qs = dict()
    elements = []
    if data["query"].get("dates") is not None:
        min_date = str(data["query"]["dates"]["min"])[:10]
        max_date = str(data["query"]["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if data.get("sort") is not None:
        if data["sort"]["orderby"] != "none":
            qs["orderby"] = data["sort"]["orderby"]
        qs["orderdir"] = data["sort"]["orderdir"]
    if data.get("pagination") is not None:
        if "skip" in data["pagination"]:
            qs["skip"] = data["pagination"]["skip"]
        if "limit" in data["pagination"]:
            qs["limit"] = data["pagination"]["limit"]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            qs["lists"] = make_api_string_from_comma_separated_text_input(data["query"]["lists"].values())
            qs["template"] = data["query"]["template"]
            elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/query/results/count/", methods=["POST"])
def route_api_query_results_count():
    data = request.get_json()
    qs = dict()
    count = -1
    if data["query"].get("dates") is not None:
        min_date = str(data["query"]["dates"]["min"])[:10]
        max_date = str(data["query"]["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            qs["lists"] = make_api_string_from_comma_separated_text_input(data["query"]["lists"].values())
            qs["template"] = data["query"]["template"]
            qs["count"] = True
            elements = get(path(endpoint, qs))
            if "count" in elements[0]:
                count = elements[0]["count"]
    return jsonify(count)

@app.route("/api/query/results/histogram/", methods=["POST"])
def route_api_query_results_histogram():
    data = request.get_json()
    qs = dict()
    buckets = []
    if data["query"].get("dates") is not None:
        min_date = str(data["query"]["dates"]["min"])[:10]
        max_date = str(data["query"]["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            qs["lists"] = make_api_string_from_comma_separated_text_input(data["query"]["lists"].values())
            qs["template"] = data["query"]["template"]
            qs["histogram"] = True
            buckets = get(path(endpoint, qs))
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
    qs = dict()
    elements = []
    if data["query"].get("dates") is not None:
        min_date = str(data["query"]["dates"]["min"])[:10]
        max_date = str(data["query"]["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if data["query"].get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["query"]["output"] + "/"
        if "template" in data["query"] and "lists" in data["query"]:
            qs["lists"] = make_api_string_from_comma_separated_text_input(data["query"]["lists"].values())
            qs["template"] = data["query"]["template"]
            qs["skip"] = 0
            qs["limit"] = 1000
            results = get(path(endpoint, qs))
            while len(results) == qs["limit"] or qs["skip"] == 0:
                elements.extend(results)
                qs["skip"] = len(elements)
                results = get(path(endpoint, qs))
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
    qs = dict()
    elements = []
    if "dates" in data:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if "pagination" in data:
        qs["skip"] = str((int(data["pagination"]["page"])-1)*int(data["pagination"]["limit"]))
        qs["limit"] = str(data["pagination"]["limit"])
    if data["type"] == "ids":
        endpoint = "/graph/find/elements/uuid/"
        if "nodes" in data:
            qs["nodes"] = data["nodes"]
        if "edges" in data:
            qs["edges"] = data["edges"]
        elements = utilities.elements2cy(get(path(endpoint, qs)))
    if data["type"] == "search":
        if "options" in data:
            qs["context"] = data["options"]["context"]
        if data["flow"] == "candidates":
            endpoint = "/graph/search/candidates/"
            if len(data["parameters"]["cand_name"]) > 0:
                qs["cand_name"] = data["parameters"]["cand_name"]
            if data["parameters"]["cand_pty_affiliation"] != "all":
                qs["cand_pty_affiliation"] = data["parameters"]["cand_pty_affiliation"]
            if data["parameters"]["cand_office"] != "all":
                qs["cand_office"] = data["parameters"]["cand_office"]
            if data["parameters"]["cand_office_st"] != "all":
                qs["cand_office_st"] = data["parameters"]["cand_office_st"]
            if data["parameters"]["cand_office_district"] != "all":
                qs["cand_office_district"] = data["parameters"]["cand_office_district"]
            if data["parameters"]["cand_election_yr"] != "all":
                qs["cand_election_yr"] = data["parameters"]["cand_election_yr"]
            if data["parameters"]["cand_ici"] != "all":
                qs["cand_ici"] = data["parameters"]["cand_ici"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "committees":
            endpoint = "/graph/search/committees/"
            if len(data["parameters"]["cmte_nm"]) > 0:
                qs["cmte_nm"] = data["parameters"]["cmte_nm"]
            if data["parameters"]["cmte_pty_affiliation"] != "all":
                qs["cmte_pty_affiliation"] = data["parameters"]["cmte_pty_affiliation"]
            if data["parameters"]["cmte_dsgn"] != "all":
                qs["cmte_dsgn"] = data["parameters"]["cmte_dsgn"]
            if data["parameters"]["cmte_tp"] != "all":
                qs["cmte_tp"] = data["parameters"]["cmte_tp"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "donors":
            endpoint = "/graph/search/donors/"
            if len(data["parameters"]["name"]) > 0:
                qs["name"] = data["parameters"]["name"]
            if len(data["parameters"]["employer"]) > 0:
                qs["employer"] = data["parameters"]["employer"]
            if len(data["parameters"]["occupation"]) > 0:
                qs["occupation"] = data["parameters"]["occupation"]
            if data["parameters"]["state"] != "all":
                qs["state"] = data["parameters"]["state"]
            if len(data["parameters"]["zip_code"]) > 0:
                qs["zip_code"] = data["parameters"]["zip_code"]
            if data["parameters"]["entity_tp"] != "all":
                qs["entity_tp"] = data["parameters"]["entity_tp"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "payees":
            endpoint = "/graph/search/payees/"
            if len(data["parameters"]["name"]) > 0:
                qs["name"] = data["parameters"]["name"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "sources":
            endpoint = "/graph/search/sources/"
            if len(data["parameters"]["domain"]) > 0:
                qs["domain"] = data["parameters"]["domain"]
                qs["domain"] = utilities.strip_url(qs["domain"])
                qs["domain"] = qs["domain"].split("www.",1)[1] if qs["domain"].startswith("www.") else qs["domain"]
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
                bias_score = make_api_string_from_comma_separated_numerical_input(bias_score)
                qs["bias_score"] = bias_score
            if data["parameters"]["factually_questionable_flag"]:
                qs["factually_questionable_flag"] = 1
            if data["parameters"]["conspiracy_flag"]:
                qs["conspiracy_flag"] = 1
            if data["parameters"]["hate_group_flag"]:
                qs["hate_group_flag"] = 1
            if data["parameters"]["propaganda_flag"]:
                qs["propaganda_flag"] = 1
            if data["parameters"]["satire_flag"]:
                qs["satire_flag"] = 1
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "tweeters":
            endpoint = "/graph/search/tweeters/"
            if len(data["parameters"]["username"]) > 0:
                qs["username"] = data["parameters"]["username"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "buyers":
            endpoint = "/graph/search/buyers/"
            if len(data["parameters"]["name"]) > 0:
                qs["name"] = data["parameters"]["name"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
        elif data["flow"] == "pages":
            endpoint = "/graph/search/pages/"
            if len(data["parameters"]["name"]) > 0:
                qs["name"] = data["parameters"]["name"]
            elements = utilities.elements2cy(get(path(endpoint, qs)))
    elif data["type"] == "expandnode":
        if len(data["labels"]) > 0:
            endpoint = "/graph/traverse/neighbors/"
            qs["ids"] = make_api_string_from_comma_separated_numerical_input(data["ids"])
            qs["labels"] = make_api_string_from_comma_separated_numerical_input(data["labels"])
            elements = utilities.elements2cy(get(path(endpoint, qs)))
    elif data["type"] == "uncoverdonors":
        if len(data["ids"]) > 0:
            endpoint = "/graph/uncover/donors/"
            qs["ids"] = make_api_string_from_comma_separated_numerical_input(data["ids"])
            qs["labels"] = make_api_string_from_comma_separated_text_input(data["labels"])
            for key in ["minTransactionAmt", "limit"]:
                qs[key] = json.dumps(int(data[key]))
            elements = utilities.elements2cy(get(path(endpoint, qs)))
    return jsonify(elements)

@app.route("/api/traverse/find/", methods=["POST"])
def route_api_traverse_find():
    data = request.get_json()
    qs = dict()
    elements = []
    min_date = "2015-01-01"
    qs["min_year"] = min_date[:4]
    qs["min_month"] = min_date[5:7]
    qs["min_day"] = min_date[8:10]
    if len(data["term"]) > 0:
        qs["skip"] = str((int(data["page"])-1)*int(data["limit"]))
        qs["limit"] = str(data["limit"])
        terms = re.split(" OR ", data["term"], flags=re.IGNORECASE)
        for term in terms:
            qstring = qs.copy()
            if data["entity"] == "candidate":
                endpoint = "/graph/search/candidates/"
                qstring["cand_name"] = term
            elif data["entity"] == "committee":
                endpoint = "/graph/search/committees/"
                qstring["cmte_nm"] = term
            elif data["entity"] == "donor":
                endpoint = "/graph/search/donors/"
                if term.startswith("EMPLOYER:"):
                    term = term.split("EMPLOYER:", 1)[1]
                    qstring["employer"] = term
                elif term.startswith("OCCUPATION:"):
                    term = term.split("OCCUPATION:", 1)[1]
                    qstring["occupation"] = term
                else:
                    qstring["name"] = term
            elif data["entity"] == "industry":
                endpoint = "/graph/search/industries/"
                qstring["name"] = term
            elif data["entity"] == "payee":
                endpoint = "/graph/search/payees/"
                qstring["name"] = term
            elif data["entity"] == "source":
                endpoint = "/graph/search/sources/"
                qstring["domain"] = term
                qstring["domain"] = utilities.strip_url(qstring["domain"])
                qstring["domain"] = qstring["domain"].split("www.",1)[1] if qstring["domain"].startswith("www.") else qstring["domain"]
            elif data["entity"] == "buyer":
                endpoint = "/graph/search/buyers/"
                qstring["name"] = term
            elif data["entity"] == "page":
                endpoint = "/graph/search/pages/"
                qstring["name"] = term
            elif data["entity"] == "tweeter":
                endpoint = "/graph/search/tweeters/"
                qstring["username"] = term
            elif data["entity"] == "topic":
                endpoint = "/graph/search/topics/"
                qstring["name"] = term
            elif data["entity"] == "tweeter":
                endpoint = "/graph/search/tweeters/"
                qstring["username"] = term
            if data.get("inspect") is True:
                elements.extend([{
                    "config": fernet.encrypt(path(endpoint, qstring).encode()).decode()
                }])
            else:
                elements.extend(get(path(endpoint, qstring)))
    elements = [i for n, i in enumerate(elements) if i not in elements[n + 1:]]
    return jsonify(elements)

@app.route("/api/traverse/associations/", methods=["POST"])
def route_api_traverse_associations():
    data = request.get_json()
    qs = dict()
    elements = []
    if "dates" in data:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    else:
        min_date = "2015-01-01"
        qs["min_year"] = min_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["min_day"] = min_date[8:10]
    if len(data["ids"]) > 0:
        qs["skip"] = str((int(data["page"])-1)*int(data["limit"]))
        qs["limit"] = str(data["limit"])
        qs["ids"] = make_api_string_from_comma_separated_numerical_input(data["ids"])
        if "intermediaries" in data:
            qs["intermediaries"] = data["intermediaries"]
            if data["intermediaries"] == "contribution":
                if "direction" in data:
                    if data["direction"] != "all":
                        qs["direction"] = data["direction"]
            elif data["intermediaries"] == "expenditure":
                if "sup_opp" in data:
                    if data["sup_opp"] != "all":
                        qs["sup_opp"] = data["sup_opp"]
        endpoint = "/graph/traverse/associations/" + data["entity"] + "/" + data["entity2"] + "/"
        if data.get("inspect") is True:
            elements.append({
                "config": fernet.encrypt(path(endpoint, qs).encode()).decode()
            })
        else:
            elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/traverse/intersection/", methods=["POST"])
def route_api_traverse_intersection():
    data = request.get_json()
    qs = dict()
    elements = []
    if "dates" in data:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    else:
        min_date = "2015-01-01"
        qs["min_year"] = min_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["min_day"] = min_date[8:10]
    if len(data["ids"]) > 0 and len(data["ids2"]) > 0:
        qs["skip"] = str((int(data["page"])-1)*int(data["limit"]))
        qs["limit"] = str(data["limit"])
        qs["ids"] = make_api_string_from_comma_separated_numerical_input(data["ids"])
        qs["ids2"] = make_api_string_from_comma_separated_numerical_input(data["ids2"])
        if "intermediaries" in data:
            qs["intermediaries"] = data["intermediaries"]
            if data["intermediaries"] == "contribution":
                if "direction" in data:
                    if data["direction"] != "all":
                        qs["direction"] = data["direction"]
            elif data["intermediaries"] == "expenditure":
                if "sup_opp" in data:
                    if data["sup_opp"] != "all":
                        qs["sup_opp"] = data["sup_opp"]
        endpoint = "/graph/traverse/associations/" + data["entity"] + "/" + data["entity2"] + "/"
        if data.get("inspect") is True:
            elements.append({
                "config": fernet.encrypt(path(endpoint, qs).encode()).decode()
            })
        else:
            elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/traverse/intermediaries/", methods=["POST"])
def route_api_traverse_intermediaries():
    data = request.get_json()
    qs = dict()
    elements = []
    min_date = "2015-01-01"
    qs["min_year"] = min_date[:4]
    qs["min_month"] = min_date[5:7]
    qs["min_day"] = min_date[8:10]
    if len(data["ids"]) > 0 and len(data["ids2"]) > 0:
        qs["skip"] = str((int(data["page"])-1)*int(data["limit"]))
        qs["limit"] = str(data["limit"])
        qs["ids"] = make_api_string_from_comma_separated_numerical_input(data["ids"])
        qs["ids2"] = make_api_string_from_comma_separated_numerical_input(data["ids2"])
        if "intermediaries" in data:
            qs["intermediaries"] = data["intermediaries"]
            if data["intermediaries"] == "contribution":
                if "direction" in data:
                    if data["direction"] != "all":
                        qs["direction"] = data["direction"]
            elif data["intermediaries"] == "expenditure":
                if "sup_opp" in data:
                    if data["sup_opp"] != "all":
                        qs["sup_opp"] = data["sup_opp"]
        endpoint = "/graph/traverse/intermediaries/" + data["entity"] + "/" + data["entity2"] + "/"
        if data.get("inspect") is True:
            elements.append({
                "config": fernet.encrypt(path(endpoint, qs).encode()).decode()
            })
        else:
            elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/traverse/contribution/contributor/", methods=["POST"])
def route_api_traverse_contribution_contributor():
    data = request.get_json()
    qs = dict()
    elements = []
    min_date = "2015-01-01"
    qs["min_year"] = min_date[:4]
    qs["min_month"] = min_date[5:7]
    qs["min_day"] = min_date[8:10]
    if len(data["ids"]) > 0:
        qs["skip"] = str((int(data["page"])-1)*int(data["limit"]))
        qs["limit"] = str(data["limit"])
        qs["ids"] = str(data["ids"][0])
        endpoint = "/graph/traverse/relationships/contribution/contributor/"
        if data.get("inspect") is True:
            elements.append({
                "config": fernet.encrypt(path(endpoint, qs).encode()).decode()
            })
        else:
            elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/traverse/contribution/recipient/", methods=["POST"])
def route_api_traverse_contribution_recipient():
    data = request.get_json()
    qs = dict()
    elements = []
    min_date = "2015-01-01"
    qs["min_year"] = min_date[:4]
    qs["min_month"] = min_date[5:7]
    qs["min_day"] = min_date[8:10]
    if len(data["ids"]) > 0:
        qs["skip"] = str((int(data["page"])-1)*int(data["limit"]))
        qs["limit"] = str(data["limit"])
        qs["ids"] = str(data["ids"][0])
        endpoint = "/graph/traverse/relationships/contribution/recipient/"
        if data.get("inspect") is True:
            elements.append({
                "config": fernet.encrypt(path(endpoint, qs).encode()).decode()
            })
        else:
            elements = get(path(endpoint, qs))
    return jsonify(elements)

# documents

@app.route("/api/browse/documents/", methods=["POST"])
def route_api_browse_documents():
    data = request.get_json()
    qs = {
        "histogram": False
    }
    elements = []
    if "term" in data:
        if data["term"] is not None:
            if len(data["term"]) > 0:
                qs["text"] = str(data["term"])
    if "skip" in data and "limit" in data:
        qs["skip"] = str(data["skip"])
        qs["limit"] = str(data["limit"])
    if "dates" in data:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if "documents" in data:
        if data["documents"] == "articles":
            endpoint = "/documents/browse/news/articles/source/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = get(path(endpoint, qs))
                for doc in docs:
                    element = {}
                    if "extracted" in doc["_source"]:
                        if "title" in doc["_source"]["extracted"]:
                            element["title"] = doc["_source"]["extracted"]["title"]
                        if "text" in doc["_source"]["extracted"]:
                            element["text"] = doc["_source"]["extracted"]["text"]
                        if "date" in doc["_source"]["extracted"]:
                            element["date"] = doc["_source"]["extracted"]["date"]
                        if "url" in doc["_source"]["extracted"]:
                            element["url"] = doc["_source"]["extracted"]["url"]
                    elements.append(element)
        elif data["documents"] == "tweets":
            endpoint = "/documents/browse/twitter/tweets/candidate/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = get(path(endpoint, qs))
                for doc in docs:
                    element = {}
                    if "obj" in doc["_source"]:
                        if "id" in doc["_source"]["obj"].get("tweet", {}):
                            element["id"] = doc["_source"]["obj"]["tweet"]["id"]
                            if "username" in doc["_source"]["obj"].get("author", {}):
                                element["url"] = "https://twitter.com/" + doc["_source"]["obj"]["author"]["username"] + "/status/" + doc["_source"]["obj"]["tweet"]["id"]
                        if "created_at" in doc["_source"]["obj"].get("tweet", {}):
                            element["created_at"] = doc["_source"]["obj"]["tweet"]["created_at"]
                        if "entities" in doc["_source"]["obj"].get("tweet", {}):
                            if "hashtags" in doc["_source"]["obj"]["tweet"]["entities"]:
                                if len(doc["_source"]["obj"]["tweet"]["entities"]["hashtags"]) > 0:
                                    element["hashtags"] = [x["tag"] for x in doc["_source"]["obj"]["tweet"]["entities"]["hashtags"]]
                    if "user_id" in doc["_source"]["obj"].get("author", {}):
                        element["user_id"] = doc["_source"]["obj"]["author"]["user_id"]
                    if "username" in doc["_source"]["obj"].get("author", {}):
                        element["username"] = doc["_source"]["obj"]["author"]["username"]
                    elements.append(element)
        elif data["documents"] == "ads":
            endpoint = "/documents/browse/facebook/ads/"
            docs = get(path(endpoint, qs))
            for doc in docs:
                element = {}
                if "obj" in doc["_source"]:
                    if "id" in doc["_source"]["obj"]:
                        element["id"] = doc["_source"]["obj"]["id"]
                    if "page_id" in doc["_source"]["obj"]:
                        element["page_id"] = doc["_source"]["obj"]["page_id"]
                    if "page_name" in doc["_source"]["obj"]:
                        element["page_name"] = doc["_source"]["obj"]["page_name"]
                    if "funding_entity" in doc["_source"]["obj"]:
                        element["funding_entity"] = doc["_source"]["obj"]["funding_entity"]
                    if "permalink" in doc["_source"]["obj"]:
                        element["url"] = doc["_source"]["obj"]["permalink"]
                    if "ad_creation_time" in doc["_source"]["obj"]:
                        element["created_on"] = doc["_source"]["obj"]["ad_creation_time"]
                    if "created" in doc["_source"]["obj"]:
                        element["created_on"] = doc["_source"]["obj"]["created"]
                elements.append(element)
    return jsonify(elements)

@app.route("/api/browse/histogram/", methods=["POST"])
def route_api_browse_histogram():
    data = request.get_json()
    qs = {
        "histogram": True
    }
    elements = []
    if "term" in data:
        if data["term"] is not None:
            if len(data["term"]) > 0:
                qs["text"] = str(data["term"])
    if "dates" in data:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if "documents" in data:
        if data["documents"] == "articles":
            endpoint = "/documents/browse/news/articles/source/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = get(path(endpoint, qs))
                elements.extend(docs)
        elif data["documents"] == "tweets":
            endpoint = "/documents/browse/twitter/tweets/candidate/"
            if "group" in data:
                endpoint = endpoint + data["group"] + "/"
                docs = get(path(endpoint, qs))
                elements.extend(docs)
        elif data["documents"] == "ads":
            endpoint = "/documents/browse/facebook/ads/"
            docs = get(path(endpoint, qs))
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

# dashboard

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

# list

@app.route("/api/lists/", methods=["POST"])
def route_api_lists():
    data = request.get_json()
    lists = action({"task": "get_lists", "token": request.cookies.get('cfd')})
    return jsonify(lists)

@app.route("/api/list/meta/", methods=["POST"])
def route_api_list_meta():
    data = request.get_json()
    list = action({"task": "get_list_meta", "token": request.cookies.get('cfd'), "id": data.get("id")})
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
    action({"task": "toggle_list", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return route_api_user_active_lists()

@app.route("/api/list/delete/", methods=["POST"])
def route_api_list_delete():
    data = request.get_json()
    action({"task": "delete_list", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return route_api_user_active_lists()

# query

@app.route("/api/queries/", methods=["POST"])
def route_api_queries():
    data = request.get_json()
    queries = action({"task": "get_queries", "token": request.cookies.get('cfd')})
    return jsonify(queries)

@app.route("/api/query/meta/", methods=["POST"])
def route_api_query_meta():
    data = request.get_json()
    query = action({"task": "get_query_meta", "token": request.cookies.get('cfd'), "id": data.get("id")})
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
    action({"task": "toggle_query", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return route_api_user_active_queries()

@app.route("/api/query/delete/", methods=["POST"])
def route_api_query_delete():
    data = request.get_json()
    action({"task": "delete_query", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return route_api_user_active_queries()

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
    action({"task": "delete_visualization", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return route_api_user_active_visualizations()

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

@app.route("/api/alert/edit/", methods=["POST"])
def route_api_alert_edit():
    data = request.get_json()
    response = action({"task": "edit_alert", "token": request.cookies.get('cfd'), "data": data})
    return jsonify(response)

@app.route("/api/alert/delete/", methods=["POST"])
def route_api_alert_delete():
    data = request.get_json()
    action({"task": "delete_alert", "token": request.cookies.get('cfd'), "id": data.get("id")})
    return route_api_user_active_alerts()

if __name__ == "__main__":
    app.run(debug=True)
