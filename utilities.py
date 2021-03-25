from furl import furl
import numpy as np
import datetime

# utility function to strip URLs of the schema, parameters, and www
def strip_url(url):
    url = furl(url).remove(args=True, fragment=True).url
    if "://www." in url:
        url = url.split("://www.",1)[1]
    elif "://" in url:
        url = url.split("://",1)[1]
    return url

# network conversion functions
def elements2cy(elements):
    cy = []
    for element in elements:
        if "labels" in element:
            element["label"] = element.pop("labels")[0]
        if "id" in element:
            element["id"] = str(element["id"])
        if "source" in element:
            element["source"] = str(element["source"])
        if "target" in element:
            element["target"] = str(element["target"])
        if "properties" in element:
            if "sub_id" in element["properties"]:
                element["properties"]["sub_id"] = int(element["properties"]["sub_id"])
            if "uuid" in element["properties"]:
                element["properties"]["uuid"] = element["properties"].pop("uuid")
        cy.append({
            "data": element
        })
    return cy

# convert numpy types to python
def convert(o):
    if isinstance(o, np.int64):
        return int(o)

# validate plot settings
def validate(data, tab):
    if "results" not in data:
        return False
    if "config" not in data:
        return False
    if tab == "table":
        if "cols" not in data["config"]:
            return False
        if "fcol" in data["config"] and "fvals" not in data["config"]:
            return False
        if "scol" in data["config"] and "sdir" not in data["config"]:
            return False
        if "pag" not in data["config"]:
            return False
        if "pag" in data["config"] and "rows" not in data["config"]:
            return False
        return True
    elif tab == "chart":
        if "type" not in data["config"]:
            return False
        if "x" not in data["config"]:
            return False
        if "y" not in data["config"] and data["config"]["type"] != "hist":
            return False
        if "fcol" in data["config"] and "fvals" not in data["config"]:
            return False
        return True
    elif tab == "map":
        if "unit" not in data["config"]:
            return False
        if data["config"]["unit"] == "zip" and "state" not in data["config"]:
            return False
        if "geo" not in data["config"]:
            return False
        if "col" not in data["config"]:
            return False
        return True
    return False
