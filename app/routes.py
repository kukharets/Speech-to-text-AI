from app import app
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import deepl
auth_key = "fbc4dedc-09ee-4207-97f9-21c25806943e:fx"  # Replace with your key
translator = deepl.Translator(auth_key)

@app.route("/login", methods = ['GET'])
@cross_origin(origin='*')
def login():
    text = request.args.get('text')
    lang = request.args.get('lang')
    return jsonify({'success': translator.translate_text(text, target_lang=lang).text})