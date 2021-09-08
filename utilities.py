from furl import furl
import numpy as np

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
