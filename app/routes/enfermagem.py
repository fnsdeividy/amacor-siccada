from flask import Flask, Blueprint, render_template, request, session, redirect, url_for, send_file, flash
import requests
import os
from docx import Document
from datetime import datetime
"""import comtypes.client
import pypandoc
import  pythoncom"""
import psutil
from docx import Document
from reportlab.pdfgen import canvas
import subprocess
from PyPDF2 import PdfMerger
#print(os.environ['PATH'])
import pandas as pd
import re
import shutil

enfermagem_bp= Blueprint('enfermagem', __name__)

@enfermagem_bp.route('declaracao', methods= ["GET","POST"])
def declaracao():
    from ..models.database import get_titular_dependente
    cpf= request.args.get('cpf','')


    dados= get_titular_dependente(cpf=cpf)
    print (dados)
    return render_template('enfermagem/entrevista.html', dados=dados)

@enfermagem_bp.route('enviar_entrevista')
def receber_entrevista():
    pass