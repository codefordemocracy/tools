import json
import re
import utilities
import math
import requests
from urllib.parse import urlencode
from cryptography.fernet import Fernet
import datetime

from vue import VueFlask
from flask import render_template, request, Response, make_response, jsonify, session, redirect
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
app.permanent_session_lifetime = datetime.timedelta(hours=3)

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
        workflow = "Create a List"
    output = "list"
    templates = [{"step": 1, "slug": "type"}, {"step": 2, "slug": "include"}, {"step": 3, "slug": "review"}, {"step": 4, "slug": "exclude"}, {"step": 5, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/create/query/", methods=["GET"])
def route_create_query():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit Query"
    elif action == "clone" and id is not None:
        workflow = "Clone Query"
    else:
        workflow = "Create a Query"
    output = "query"
    templates = [{"step": 1, "slug": "recipes"}, {"step": 2, "slug": "lists"}, {"step": 3, "slug": "results"}, {"step": 4, "slug": "filters"}, {"step": 5, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/create/alert/", methods=["GET"])
def route_create_alert():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit Alert"
    elif action == "clone" and id is not None:
        workflow = "Clone Alert"
    else:
        workflow = "Create an Alert"
    output = "alert"
    templates = [{"step": 1, "slug": "query"}, {"step": 2, "slug": "trigger"}, {"step": 3, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/create/visualization/", methods=["GET"])
def route_create_visualization():
    action = request.args.get("action")
    id = request.args.get("id")
    if action == "edit" and id is not None:
        workflow = "Edit Visualization"
    elif action == "clone" and id is not None:
        workflow = "Clone Visualization"
    else:
        workflow = "Create a Visualization"
    output = "visualization"
    templates = [{"step": 1, "slug": "output"}, {"step": 2, "slug": "data"}, {"step": 3, "slug": "design"}, {"step": 4, "slug": "save"}]
    return render_template("workflow.html.j2", workflow=workflow, output=output, templates=templates, action=action, id=id)

@app.route("/create/visualization/plot/", methods=["GET"])
def route_create_visualization_plot():
    return render_template("visualization/plot.html.j2")

@app.route("/view/list/", methods=["GET"])
def route_view_list():
    mode = request.args.get("mode")
    return render_template("workflow/list/popup/view.html.j2", mode=mode)

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
# list workflow endpoints
#########################################################

@app.route("/api/list/preview/", methods=["POST"])
def route_api_list_preview():
    data = request.get_json()
    elements = []
    if data.get("subtype") is not None:
        endpoint = "/data/preview/" + data["subtype"] + "/"
        terms = ""
        ids = ""
        if data.get("include") is not None:
            if data["include"].get("terms") is not None:
                terms = make_api_string_from_comma_separated_text_input(data["include"]["terms"])
            if data["include"].get("ids") is not None:
                ids = make_api_string_from_comma_separated_text_input(data["include"]["ids"])
            if len(terms) > 0 and len(ids) > 0:
                elements = get(path(endpoint, {"terms": terms, "ids": ids, "skip": 0, "limit": 1000}))
            elif len(terms) > 0:
                elements = get(path(endpoint, {"terms": terms, "skip": 0, "limit": 1000}))
            elif len(ids) > 0:
                elements = get(path(endpoint, {"ids": ids, "skip": 0, "limit": 1000}))
    return jsonify(elements)

#########################################################
# query workflow endpoints
#########################################################

@app.route("/api/recipe/results/table/", methods=["POST"])
def route_api_recipe_table():
    data = request.get_json()
    qs = dict()
    elements = []
    if data.get("dates") is not None:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
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
    if data.get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["output"] + "/"
        if "config" in data:
            if "template" in data["config"] and "lists" in data["config"]:
                qs["lists"] = make_api_string_from_comma_separated_text_input(data["config"]["lists"])
                qs["template"] = data["config"]["template"]
                elements = get(path(endpoint, qs))
    return jsonify(elements)

@app.route("/api/recipe/results/count/", methods=["POST"])
def route_api_recipe_count():
    data = request.get_json()
    qs = dict()
    count = -1
    if data.get("dates") is not None:
        min_date = str(data["dates"]["min"])[:10]
        max_date = str(data["dates"]["max"])[:10]
        qs["min_year"] = min_date[:4]
        qs["max_year"] = max_date[:4]
        qs["min_month"] = min_date[5:7]
        qs["max_month"] = max_date[5:7]
        qs["min_day"] = min_date[8:10]
        qs["max_day"] = max_date[8:10]
    if data.get("output") is not None:
        endpoint = "/data/calculate/recipe/" + data["output"] + "/"
        if "config" in data:
            if "template" in data["config"] and "lists" in data["config"]:
                qs["lists"] = make_api_string_from_comma_separated_text_input(data["config"]["lists"])
                qs["template"] = data["config"]["template"]
                qs["count"] = True
                elements = get(path(endpoint, qs))
                if "count" in elements[0]:
                    count = elements[0]["count"]
    return jsonify(count)

#########################################################
# visualization workflow endpoints
#########################################################

# data

@app.route("/api/inspect/", methods=["POST"])
def route_api_inspect():
    data = request.get_json()
    qs = dict()
    elements = []
    if data["source"] == "uuid":
        endpoint = "/graph/find/elements/uuid/"
        if "nodes" in data:
            qs["nodes"] = data["nodes"]
        if "edges" in data:
            qs["edges"] = data["edges"]
        elements = get(path(endpoint, qs))
    elif data["source"] == "config":
        configs = data["string"].split(",")
        for config in configs:
            elements.extend(get(fernet.decrypt(config.encode()).decode()))
    elif data["source"] == "json":
        elements = json.loads(data["json"])
    return jsonify(elements)

# formatting

@app.route("/format/flat/", methods=["POST"])
def route_format_flat():
    data = request.get_json()
    df = pd.json_normalize(data)
    return make_response(json.dumps(df.to_json(orient='records', default=utilities.convert)))

# calculations

@app.route("/calc/columns/", methods=["POST"])
def route_calc_columns():
    data = request.get_json()
    df = pd.json_normalize(data)
    options = [{"label": i, "value": i} for i in df.columns if len(df[i].value_counts()) > 0]
    return make_response(json.dumps(options, default=utilities.convert))

@app.route("/calc/values/", methods=["POST"])
def route_calc_values():
    data = request.get_json()
    df = pd.json_normalize(data["results"])
    options = [{"label": i, "value": i} for i in df[data["column"]].unique() if i is not None]
    return make_response(json.dumps(options, default=utilities.convert))

@app.route("/calc/aggs/", methods=["POST"])
def route_calc_aggs():
    data = request.get_json()
    df = pd.json_normalize(data["results"])
    options = [
        {"label": "Average", "value": "average"},
        {"label": "Sum", "value": "sum"},
        {"label": "Min", "value": "min"},
        {"label": "Max", "value": "max"},
        {"label": "Count", "value": "count"},
        {"label": "Distinct", "value": "distinct"}
    ]
    if is_string_dtype(df[data["column"]]):
        options = [
            {"label": "Count", "value": "count"},
            {"label": "Distinct", "value": "distinct"}
        ]
    return make_response(json.dumps(options, default=utilities.convert))

# outputs

@app.route("/render/table/", methods=["POST"])
def route_render_table():
    data = request.get_json()
    obj = {}
    if utilities.validate(data, "table"):
        df = pd.json_normalize(data["results"])
        df = df[data["config"]["cols"]]
        # filter data
        if "fvals" in data["config"] and data["config"]["fvals"] != []:
            df = df.loc[df[data["config"]["fcol"]].isin(data["config"]["fvals"])]
        # sort data
        if "scol" in data["config"] and data["config"]["scol"] is not None:
            if data["config"]["sdir"] == "asc":
                df = df.sort_values(data["config"]["scol"], ascending=True)
            elif data["config"]["sdir"] == "desc":
                df = df.sort_values(data["config"]["scol"], ascending=False)
        # paginate
        if data["config"]["pag"] == "yes":
            records = []
            numpages = math.ceil(len(df)/data["config"]["rows"])
            for i in range(numpages):
                records.append(df[i*data["config"]["rows"]:(i+1)*data["config"]["rows"]].to_dict('records'))
        else:
            records = df.to_dict('records')
            numpages = 0
        # make table obj
        obj = {
            "columns": [i for i in df.columns],
            "data": records,
            "options": {
                "paginate": data["config"]["pag"],
                "numpages": numpages
            }
        }
    return make_response(json.dumps(obj, default=utilities.convert))

@app.route("/render/chart/", methods=["POST"])
def route_render_chart():
    data = request.get_json()
    obj = {}
    if utilities.validate(data, "chart"):
        df = pd.json_normalize(data["results"])
        # sort and filter data
        df = df.sort_values(data["config"]["x"], ascending=True)
        if "fcol" in data["config"] and "fvals" in data["config"]:
            if data["config"]["fvals"] is not None and data["config"]["fvals"] != []:
                df = df.loc[df[data["config"]["fcol"]].isin(data["config"]["fvals"])]
        # configure x axis
        xaxis = {
            "title": { "text": data["config"]["x"] },
            "automargin": True
        }
        if is_numeric_dtype(df[data["config"]["x"]]):
            if df[data["config"]["x"]].min() >= 0 and df[data["config"]["x"]].max() <= 3000:
                xaxis["tickformat"] = "d"
        # configure y axis and aggregation
        if "y" in data["config"]:
            y_title = data["config"]["y"]
            if "agg" in data["config"]:
                if data["config"]["agg"] == "average":
                    df = df.groupby(data["config"]["x"], as_index=False).agg({data["config"]["y"]: "mean"})
                    y_title = data["config"]["agg"] + " of " + data["config"]["y"]
                elif data["config"]["agg"] == "sum":
                    df = df.groupby(data["config"]["x"], as_index=False).agg({data["config"]["y"]: "sum"})
                    y_title = data["config"]["agg"] + " of " + data["config"]["y"]
                elif data["config"]["agg"] == "min":
                    df = df.groupby(data["config"]["x"], as_index=False).agg({data["config"]["y"]: "min"})
                    y_title = data["config"]["agg"] + " of " + data["config"]["y"]
                elif data["config"]["agg"] == "max":
                    df = df.groupby(data["config"]["x"], as_index=False).agg({data["config"]["y"]: "max"})
                    y_title = data["config"]["agg"] + " of " + data["config"]["y"]
                elif data["config"]["agg"] == "count":
                    df = df.groupby(data["config"]["x"], as_index=False).agg({data["config"]["y"]: "count"})
                    y_title = data["config"]["agg"] + " of " + data["config"]["y"]
                elif data["config"]["agg"] == "distinct":
                    df = df.groupby(data["config"]["x"], as_index=False).agg({data["config"]["y"]: "nunique"})
                    y_title = data["config"]["agg"] + " of " + data["config"]["y"]
            yaxis = {
                "title": { "text": y_title },
                "automargin": True
            }
            if is_numeric_dtype(df[data["config"]["y"]]):
                if df[data["config"]["y"]].min() >= 0 and df[data["config"]["y"]].max() <= 3000:
                    yaxis["tickformat"] = "d"
        # make chart obj
        obj = {
            "data": [{
                "x": df[data["config"]["x"]].values.tolist(),
                "marker": { "color": "#dadada" }
            }],
            "layout": {
                "xaxis": xaxis,
                "height": data["config"]["height"]
            },
            "config": {
                "displayModeBar": False,
                "responsive": True
            }
        }
        if data["config"]["type"] == "scatter":
            obj["data"][0]["y"] = df[data["config"]["y"]].values.tolist()
            obj["data"][0]["type"] = "scatter"
            obj["data"][0]["mode"] = "markers"
            obj["layout"]["y"] = yaxis
        elif data["config"]["type"] == "line":
            obj["data"][0]["y"] = df[data["config"]["y"]].values.tolist()
            obj["data"][0]["type"] = "scatter"
            obj["data"][0]["mode"] = "lines"
            obj["layout"]["y"] = yaxis
        elif data["config"]["type"] == "bar":
            obj["data"][0]["y"] = df[data["config"]["y"]].values.tolist()
            obj["data"][0]["type"] = "bar"
            obj["layout"]["y"] = yaxis
        elif data["config"]["type"] == "hist":
            obj["data"][0]["type"] = "histogram"
    return make_response(json.dumps(obj, default=utilities.convert))

@app.route("/render/map/", methods=["POST"])
def route_render_map():
    data = request.get_json()
    obj = {}
    if utilities.validate(data, "map"):
        df = pd.json_normalize(data["results"])
        # apply aggregation
        label = data["config"]["col"]
        if data["config"]["agg"] == "average":
            df = df.groupby(data["config"]["geo"], as_index=False).agg({data["config"]["col"]: "mean"})
            label = data["config"]["agg"] + " of " + data["config"]["col"]
        elif data["config"]["agg"] == "sum":
            df = df.groupby(data["config"]["geo"], as_index=False).agg({data["config"]["col"]: "sum"})
            label = data["config"]["agg"] + " of " + data["config"]["col"]
        elif data["config"]["agg"] == "min":
            df = df.groupby(data["config"]["geo"], as_index=False).agg({data["config"]["col"]: "min"})
            label = data["config"]["agg"] + " of " + data["config"]["col"]
        elif data["config"]["agg"] == "max":
            df = df.groupby(data["config"]["geo"], as_index=False).agg({data["config"]["col"]: "max"})
            label = data["config"]["agg"] + " of " + data["config"]["col"]
        elif data["config"]["agg"] == "count":
            df = df.groupby(data["config"]["geo"], as_index=False).agg({data["config"]["col"]: "count"})
            label = data["config"]["agg"] + " of " + data["config"]["col"]
        elif data["config"]["agg"] == "distinct":
            df = df.groupby(data["config"]["geo"], as_index=False).agg({data["config"]["col"]: "nunique"})
            label = data["config"]["agg"] + " of " + data["config"]["col"]
        # make map obj
        obj = {
            "data": [{
                "type": "choroplethmapbox",
                "locations": df[data["config"]["geo"]].values.tolist(),
                "z": df[data["config"]["col"]].values.tolist(),
                "text": label,
                "colorscale": "YIOrRd",
                "colorbar": { "thickness": 20 },
                "marker": {
                    "opacity": 0.7,
                    "line":{
                        "color": "rgb(255,255,255)",
                        "width": 1
                    }
                }
            }],
            "layout": {
                "mapbox": {
                    "style": "carto-positron",
                    "zoom": 3,
                    "center": { "lat": 37.0902, "lon": -95.7129 },
                },
                "margin": { "r": 0, "t": 0, "l": 0, "b": 0 },
                "height": data["config"]["height"]
            }
        }
        if data["config"]["unit"] == "state":
            f = requests.get("https://assets.codefordemocracy.org/geo/states.json").text
            states = json.loads(f)
            obj["data"][0]["geojson"] = states
        elif data["config"]["unit"] == "zip" and data["config"]["state"] is not None:
            filename = data["config"]["state"] + ".json"
            f = requests.get("https://assets.codefordemocracy.org/geo/" + filename).text
            zips = json.loads(f)
            obj["data"][0]["geojson"] = zips
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
            if len(data["parameters"]["screen_name"]) > 0:
                qs["screen_name"] = data["parameters"]["screen_name"]
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
                qstring["screen_name"] = term
            elif data["entity"] == "topic":
                endpoint = "/graph/search/topics/"
                qstring["name"] = term
            elif data["entity"] == "tweeter":
                endpoint = "/graph/search/tweeters/"
                qstring["screen_name"] = term
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
                        if "id" in doc["_source"]["obj"]:
                            element["id"] = doc["_source"]["obj"]["id"]
                            if "user_screen_name" in doc["_source"]:
                                element["url"] = "https://twitter.com/" + doc["_source"]["user_screen_name"] + "/status/" + doc["_source"]["obj"]["id"]
                        if "created_at" in doc["_source"]["obj"]:
                            element["created_at"] = doc["_source"]["obj"]["created_at"]
                        if "entities" in doc["_source"]["obj"]:
                            if "hashtags" in doc["_source"]["obj"]["entities"]:
                                if len(doc["_source"]["obj"]["entities"]["hashtags"]) > 0:
                                    element["hashtags"] = [x["text"] for x in doc["_source"]["obj"]["entities"]["hashtags"]]
                    if "user_id" in doc["_source"]:
                        element["user_id"] = doc["_source"]["user_id"]
                    if "user_screen_name" in doc["_source"]:
                        element["user_screen_name"] = doc["_source"]["user_screen_name"]
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

@app.route("/api/user/public/", methods=["POST"])
def route_api_user_public():
    data = request.get_json()
    user = {}
    if data.get("username") is not None:
        user = action({"task": "get_public_profile", "username": data["username"]})
    return jsonify(user)

@app.route("/api/user/active/", methods=["GET"])
def route_api_user_active():
    profile = action({"task": "get_active_user", "token": request.cookies.get('cfd'), "lists": session.get("lists")})
    if profile and "lists" in session:
        session.pop('lists', None)
    return jsonify(profile)

@app.route("/api/user/active/bookmarks/", methods=["GET"])
def route_api_user_active_bookmarks():
    bookmarks = action({"task": "get_active_user_bookmarks", "token": request.cookies.get('cfd')})
    return jsonify(bookmarks)

@app.route("/api/user/active/lists/", methods=["GET"])
def route_api_user_active_lists():
    lists = action({"task": "get_active_user_lists", "token": request.cookies.get('cfd')})
    return jsonify(lists)

@app.route("/api/lists/preloaded/", methods=["POST"])
def route_api_lists_preloaded():
    data = request.get_json()
    lists = action({"task": "get_preloaded_lists", "token": request.cookies.get('cfd')})
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


if __name__ == "__main__":
    app.run(debug=True)
