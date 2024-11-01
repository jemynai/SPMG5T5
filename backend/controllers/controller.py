# base_controller.py
from flask import Blueprint, jsonify

class Controller:
    def __init__(self, name, prefix=''):
        self.bp = Blueprint(name, __name__)
        self.prefix = prefix

    def register_route(self, rule, endpoint, view_func, methods=['GET']):
        self.bp.add_url_rule(rule, self.prefix + endpoint, view_func, methods=methods)