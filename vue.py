from flask import Flask

# hacks Flask to work with Vue by deconflicting templating
class VueFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        variable_start_string="[[",
        variable_end_string="]]",
    ))
