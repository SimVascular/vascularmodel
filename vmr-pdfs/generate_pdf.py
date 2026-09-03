"""
Generating a detailed PDF document for each model in the Vascular Model Repository
"""

import os
import csv
import re
from datetime import date
from fpdf import FPDF


#GEMA ADDED THIS
def clean_text(text):
    """
    Replace common Unicode characters with ASCII equivalents.
    """
    replacements = {
        u'\u2013': '-',   # en dash to hyphen
        u'\u2022': '\u00B7',    # bullet point to asterisk
        u'\u223C': '~'    # tilde operator to tilde
    }
    # Fix the latin1 issue
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Convert literal backslash \n to actual newline
    text = text.replace('\\n', '\n')
    return text

def clean_model_data(model):
    """
    Clean all string values in a model dictionary.
    """
    cleaned = {}
    for key, value in model.items():
        if isinstance(value, str):
            cleaned[key] = clean_text(value)
        else:
            cleaned[key] = value
    return cleaned

#END OF WHAT I ADDED    

# Writing paths for all relevant files
# Change the BASE_FILE_PATH to the proper file path for your own computer
BASE_FILE_PATH = r"C:\Users\gemac\OneDrive - Stanford\NEW_MODELS\Add models"
print("")
print("Base file path \t\t\t\t", BASE_FILE_PATH)

IMAGE_FILE_PATH = r"vmr-images"
IMAGE_FILE_PATH = os.path.join(BASE_FILE_PATH, IMAGE_FILE_PATH)
print("Getting model images from \t\t", IMAGE_FILE_PATH)

DATASET_FILE_PATH = r"vmr-dataset\dataset-svprojects.csv"
DATASET_FILE_PATH = os.path.join(BASE_FILE_PATH, DATASET_FILE_PATH)
print("Getting model data from \t\t", DATASET_FILE_PATH)

CLINICAL_FILE_PATH = r"vmr-clinical_data"
CLINICAL_FILE_PATH = os.path.join(BASE_FILE_PATH, CLINICAL_FILE_PATH)
print("Getting clinical patient data from \t", CLINICAL_FILE_PATH)

ANATOMY_FILE_PATH = r"vmr-background\BackgroundAnatomy.csv"
ANATOMY_FILE_PATH = os.path.join(BASE_FILE_PATH, ANATOMY_FILE_PATH)
print("Getting anatomy background text from \t", ANATOMY_FILE_PATH)

DISEASE_FILE_PATH = r"vmr-background\BackgroundDisease.csv"
DISEASE_FILE_PATH = os.path.join(BASE_FILE_PATH, DISEASE_FILE_PATH)
print("Getting disease background text from \t", DISEASE_FILE_PATH)

PROCEDURE_FILE_PATH = r"vmr-background\BackgroundProcedure.csv"
PROCEDURE_FILE_PATH = os.path.join(BASE_FILE_PATH, PROCEDURE_FILE_PATH)
print("Getting procedure background text from \t", PROCEDURE_FILE_PATH)

PDF_FILE_PATH = r"vmr-pdfs"
PDF_FILE_PATH = os.path.join(BASE_FILE_PATH, PDF_FILE_PATH)
print("Storing model PDFs in \t\t\t", PDF_FILE_PATH)
print("")


# RGB values for text
HEADING_1_COLOR = (16, 122, 194)
HEADING_2_COLOR = (80, 142, 199)
BLACK_TEXT_COLOR = (15, 15, 15)
URL_COLOR = (0, 0, 255)


class PDF(FPDF):
    """ Class to generate the PDF associated with each vascular model """

    def footer(self):
        """ Page footer with page number and last updated date"""

        today = date.today()
        # Day, Month abbreviation, and year
        todays_date = today.strftime("%d %b %Y")

        self.set_y(5.5)
        self.set_font('Arial', style = 'I', size = 12)
        self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
        self.cell(0, 10, 'Last updated: ' + todays_date, 0, 0, 'L')
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'R')


    def title_text(self, model):
        """ Title page header with model name and when model was added to repository"""

        self.set_font('Arial', size = 37)
        self.set_y(0.7)
        self.multi_cell(w = 0, h = 0.75, txt = 'Vascular Model Repository\nSpecifications Document',
                        border = 0, align = 'C')
        self.set_y(5.95)
        self.set_font('Arial', size = 37)
        self.multi_cell(w = 0, h = 0.75, txt = model['name'], border = 0, align = 'C')
        self.set_y(6.7)
        self.set_font('Arial', size = 17)
        self.multi_cell(w = 0, h = 0.5, txt = 'Legacy Name: ' + model['lgcy_name'],
                        border = 0, align = 'C')
        self.set_y(7.1)
        self.multi_cell(w = 0, h = 0.5, txt = 'Model added: ' + model['date_added'],
                        border = 0, align = 'C')


    def title_image(self, model):
        """ Title page image of the model """

        self.image(os.path.join(IMAGE_FILE_PATH, '%s.png' % (model['name'])), x = 1, y = 2.2,
                   w = 6.5, h = 3.7)


    def title_table(self, model):
        """ Title page table with summary of species, anatomy, disease, and procedure """

        self.set_xy(1.25, 7.70)
        self.set_font('Arial', style = 'B', size = 20)
        self.cell(w = 2, h = 0.5, txt = ' Species', border = 1, ln = 0)
        self.set_font('Arial', size = 20)
        if model['species'] == 'Animal':
            self.cell(w = 4, h = 0.5, txt = ' %s' % (model['animal']), border = 1, ln = 1)
        else:
            self.cell(w = 4, h = 0.5, txt = ' %s' % (model['species']), border = 1, ln = 1)

        # Accounting formatting for multiple anatomies in the list
        (model_anatomy_list, a_qty) = re.subn('_', '\n ', model['anatomy'])
        # Finding the character length of the longest string anatomy
        longest_anatomy = len(max(model['anatomy'].split('_'), key=len))
        # Font size is either based on longest string length or how many anatomies are listed
        # We choose the smaller font that can incorpate both
        ana_font_size = min((20 - (3*a_qty)), (20 - (longest_anatomy/2 - 14)))
        self.set_x(1.25)
        ana_cell_height = 0.5 + (0.2*a_qty)
        self.set_font('Arial', style = 'B', size = 20)
        self.cell(w = 2, h = ana_cell_height, txt = ' Anatomy', border = 1, ln = 0)
        self.set_font('Arial', size = ana_font_size)
        self.multi_cell(w = 4, h = ana_cell_height / (a_qty + 1),
                        txt = ' %s' % (model_anatomy_list), border = 1)

        # Accounting formatting for multiple diseases in the list
        (model_disease_list, d_qty) = re.subn('_', '\n ', model['disease'])
        # Finding the character length of the longest string disease
        longest_disease = len(max(model['disease'].split('_'), key=len))
        # Font size is either based on longest string length or how many diseases are listed
        # We choose the smaller font that can incorpate both
        dis_font_size = min((20 - (3*d_qty)), (20 - (longest_disease/2 - 14)))
        self.set_x(1.25)
        dis_cell_height = 0.5 + (0.2*d_qty)
        self.set_font('Arial', style = 'B', size = 20)
        self.cell(w = 2, h = dis_cell_height, txt = ' Disease', border = 1, ln = 0)
        self.set_font('Arial', size = dis_font_size)
        self.multi_cell(w = 4, h = dis_cell_height / (d_qty + 1),
                        txt = ' %s' % (model_disease_list), border = 1)

        # Accounting formatting for multiple procedures in the list
        (model_procedure_list, p_qty) = re.subn('_', '\n ', model['procedure'])
        # Finding the character length of the longest string anatomy
        longest_procedure = len(max(model['procedure'].split('_'), key=len))
        # Font size is either based on longest string length or how many anatomies are listed
        # We choose the smaller font that can incorpate both
        pro_font_size = min((20 - (3*p_qty)), (20 - (longest_procedure/2 - 14)))
        self.set_x(1.25)
        pro_cell_height = 0.5 + (0.2*p_qty)
        self.set_font('Arial', style = 'B', size = 20)
        self.cell(w = 2, h = pro_cell_height, txt = ' Procedure', border = 1, ln = 0)
        self.set_font('Arial', size = pro_font_size)
        self.multi_cell(w = 4, h = pro_cell_height / (p_qty + 1),
                        txt = ' %s' % (model_procedure_list), border = 1)


    def clinical_significance(self, model):
        """ Background and clincial significance of anatomy, disease, and procedure
        if applicable """

        self.set_font('Arial', size = 20)
        self.set_text_color(HEADING_1_COLOR[0], HEADING_1_COLOR[1], HEADING_1_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'Clinical Significance and Background', border = 0, ln = 0)
        self.ln(h = 0.4)

        if model['anatomy'] != '-':
            anatomy_list = model['anatomy'].split('_')
            for anatomy in anatomy_list:
                anatomytxt = ''
                # Open a csv reader called DictReader
                with open(ANATOMY_FILE_PATH, encoding='utf-8-sig') as csvf:
                    csv_reader = csv.DictReader(csvf)
                    for rows in csv_reader:
                        if rows['Anatomy'] == anatomy:
                            anatomytxt = rows['Background']

                    if anatomytxt != '':
                        self.set_font('Arial', size = 13)
                        self.set_text_color(HEADING_2_COLOR[0], HEADING_2_COLOR[1],
                                            HEADING_2_COLOR[2])
                        self.cell(w = 2, h = 0.5, txt = anatomy, border = 0, ln = 1)

                        self.set_font('Arial', size = 12)
                        self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1],
                                            BLACK_TEXT_COLOR[2])
                        self.multi_cell(w = 0, h = 0.25, txt = anatomytxt, border = 0, align = 'L')


        if model['disease'] != 'Healthy':
            disease_list = model['disease'].split('_')
            for disease in disease_list:
                diseasetxt = ''
                # Open a csv reader called DictReader
                with open(DISEASE_FILE_PATH, encoding='utf-8-sig') as csvf:
                    csv_reader = csv.DictReader(csvf)
                    for rows in csv_reader:
                        if rows['Disease'] == disease:
                            diseasetxt = rows['Background']

                    if diseasetxt != '':
                        self.set_font('Arial', size = 13)
                        self.set_text_color(HEADING_2_COLOR[0], HEADING_2_COLOR[1],
                                            HEADING_2_COLOR[2])
                        self.cell(w = 2, h = 0.5, txt = disease, border = 0, ln = 1)

                        self.set_font('Arial', size = 12)
                        self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1],
                                            BLACK_TEXT_COLOR[2])
                        self.multi_cell(w = 0, h = 0.25, txt = diseasetxt, border = 0, align = 'L')


        if model['procedure'] != '-':
            procedure_list = model['procedure'].split('_')
            for procedure in procedure_list:
                proceduretxt = ''
                # Open a csv reader called DictReader
                with open(PROCEDURE_FILE_PATH, encoding='utf-8-sig') as csvf:
                    csv_reader = csv.DictReader(csvf)
                    for rows in csv_reader:
                        if rows['Procedure'] == procedure:
                            proceduretxt = rows['Background']

                    if proceduretxt != '':
                        self.set_font('Arial', size = 13)
                        self.set_text_color(HEADING_2_COLOR[0], HEADING_2_COLOR[1],
                                            HEADING_2_COLOR[2])
                        self.cell(w = 2, h = 0.5, txt = procedure, border = 0, ln = 1)
                        self.set_font('Arial', size = 12)
                        self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1],
                                            BLACK_TEXT_COLOR[2])
                        self.multi_cell(w = 0, h = 0.25, txt = proceduretxt, border = 0,
                                        align = 'L')

        self.ln(h = 0.1)


    def clinical_data(self, model):
        """ Generates clinical data associated with the model """

        self.set_font('Arial', size = 20)
        self.set_text_color(HEADING_1_COLOR[0], HEADING_1_COLOR[1], HEADING_1_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'Clinical Data', border = 0, ln = 0)
        self.ln(h = 0.4)

        self.set_font('Arial', size = 13)
        self.set_text_color(HEADING_2_COLOR[0], HEADING_2_COLOR[1], HEADING_2_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'General Patient Data', border = 0, ln = 1)

        # Open a csv reader called DictReader to read in Clinical Data csv file
        with open(os.path.join(CLINICAL_FILE_PATH, model['name'] + '_ClinicalData.csv'),
                  encoding='utf-8-sig') as csvf:
            csv_reader = csv.DictReader(csvf)
          
            for row in csv_reader:
                # Debug print: list out the keys in this row. csv_reader is an iterator so will get exhausted in one for loop, this is why I put the debuggin step here!
                # print("DEBUG: Row keys:", list(row.keys()))
                # print("DEBUG: Full row:", row)
                cleaned_row = {key: clean_text(value) for key, value in row.items()}

                self.set_font('Arial', size = 12)
                self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
                self.cell(w = 2, h = 0.25, txt = "Age (yrs)", border = 1, ln = 0)
                self.cell(w = 2, h = 0.25, txt = row['age'], border = 1, ln = 1)
                self.cell(w = 2, h = 0.25, txt = "Sex", border = 1, ln = 0)
                self.cell(w = 2, h = 0.25, txt = row['sex'], border = 1, ln = 1)

                self.set_font('Arial', size = 13)

                if len(cleaned_row.keys()) > 3:
                    self.set_text_color(HEADING_2_COLOR[0], HEADING_2_COLOR[1], HEADING_2_COLOR[2])
                    self.cell(w = 2, h = 0.5, txt = 'Specific Patient Data', border = 0, ln = 1)

                self.set_font('Arial', size = 12)
                self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])

                # Changes the cell width of columns if info is longer than 2 inches
                lcellwidth = 2
                rcellwidth = 2

                for key in cleaned_row.keys():
                    if key not in 'notes':
                        lcellwidth = max(lcellwidth, len(key)*0.1)
                        rcellwidth = max(rcellwidth, len(cleaned_row[key])*0.1)
                    if key == 'notes':
                        self.multi_cell(w = 0, h = 0.25, txt = cleaned_row[key], border = 0, align = 'L')
                        self.ln(h = 0.125)

                for key in cleaned_row.keys():
                    if key not in ('name', 'sex', 'age', 'notes'):
                        self.cell(w = lcellwidth, h = 0.25, txt = key, border = 1, ln = 0)
                        self.cell(w = rcellwidth, h = 0.25, txt = cleaned_row[key], border = 1, ln = 1)

        self.ln(h = 0.25)


    def notes(self, model):
        """ Generates notes associated with the model
        (image modality, description, boundary conditions) """

        self.set_font('Arial', size = 20)
        self.set_text_color(HEADING_1_COLOR[0], HEADING_1_COLOR[1], HEADING_1_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'Notes', border = 0, ln = 0)
        self.ln(h = 0.5)

        # Finds the chunk of string that starts with /url(...) and extracts it
        url_data = re.findall('\\\\url[(].*?[)]', model['notes'])

        # Creates a list that takes the URL string as well as the string for what to write
        # in place of the URL
        url_list = []
        for chunk in url_data:
            url_single = []
            for info in re.findall('".*?"', chunk):
                url_single.append(info.replace('"', ''))
            url_list.append(url_single)

        notes_txt = re.split('\\\\url[(].*?[)]', model['notes'])
        counter = 0
        for url in url_list:
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.set_font('Arial', size = 12)
            self.write(h = 0.25, txt = notes_txt[counter])
            counter += 1

            self.set_text_color(URL_COLOR[0], URL_COLOR[1], URL_COLOR[2])
            self.set_font('Arial', style = 'U', size = 12)
            self.write(h = 0.25, txt = url[1], link = url[0])

        self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
        self.set_font('Arial', size = 12)

        if model['notes'] != '-':
            self.write(h = 0.25, txt = notes_txt[-1])

        self.write(h = 0.25, txt = ' See below for information on the image data.')
        self.ln(h = 0.4)



        # Image modality of model
        if model['img_mod'] != '-':
            self.set_x(2.4)
            self.set_font('Arial', style = 'B', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.cell(w = 1, h = 0.25, txt = 'Image Modality: ', border = 0, align = 'R')
            self.set_x(3.5)
            self.set_font('Arial', size = 12)
            self.multi_cell(w = 0, h = 0.25, txt = model['img_mod'].replace("_","/"),
                            border = 0,  align = 'L')
            self.ln(h = 0.1)

        # Image type of model
        if model['img_type'] != '-':
            self.set_x(2.4)
            self.set_font('Arial', style = 'B', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.cell(w = 1, h = 0.25, txt = 'Image Type: ', border = 0, align = 'R')
            self.set_x(3.5)
            self.set_font('Arial', size = 12)
            self.multi_cell(w = 0, h = 0.25, txt = model['img_type'],
                            border = 0,  align = 'L')
            self.ln(h = 0.1)

        # Image source of model
        if model['img_src'] != '-':
            self.set_x(2.4)
            self.set_font('Arial', style = 'B', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.cell(w = 1, h = 0.25, txt = 'Image Source: ', border = 0, align = 'R')
            self.set_x(3.5)
            self.set_font('Arial', size = 12)
            self.multi_cell(w = 0, h = 0.25, txt = model['img_src'],
                            border = 0,  align = 'L')
            self.ln(h = 0.1)

        # Image manufacture of model
        if model['img_manu'] != '-':
            self.set_x(2.4)
            self.set_font('Arial', style = 'B', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.cell(w = 1, h = 0.25, txt = 'Image Manufacturer: ', border = 0, align = 'R')
            self.set_x(3.5)
            self.set_font('Arial', size = 12)
            self.multi_cell(w = 0, h = 0.25, txt = model['img_manu'],
                            border = 0,  align = 'L')
            self.ln(h = 0.1)


    def publications(self, model):
        """ Generates publications associated with the model """

        self.set_font('Arial', size = 20)
        self.set_text_color(HEADING_1_COLOR[0], HEADING_1_COLOR[1], HEADING_1_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'Publications', border = 0, ln = 0)
        self.ln(h = 0.25)

        if model['pubs'] != '-':
            self.set_font('Arial', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.multi_cell(w = 0, h = 0.75, txt = 'See the following publications which ' +
                            'include the featured model for more details:', border = 0, align = 'L')
            self.set_font('Arial', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.multi_cell(w = 0, h = 0.25, txt = model['pubs'], border = 0, align = 'L')
        else:
            self.set_font('Arial', size = 12)
            self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
            self.multi_cell(w = 0, h = 0.75, txt = 'There are no publications associated with ' +
                            'the featured model.', border = 0, align = 'L')


    def appendix(self):
        """ Generates appendix associated with model document if applicable """

        self.set_font('Arial', size = 20)
        self.set_text_color(HEADING_1_COLOR[0], HEADING_1_COLOR[1], HEADING_1_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'Appendix', border = 0, ln = 0)
        self.ln(h = 0.4)


    def license(self):
        """ Generates licensing information for the model """

        self.set_font('Arial', size = 20)
        self.set_text_color(HEADING_1_COLOR[0], HEADING_1_COLOR[1], HEADING_1_COLOR[2])
        self.cell(w = 2, h = 0.5, txt = 'License', border = 0, ln = 0)
        self.ln(h = 0.5)
        self.set_font('Arial', size = 10)
        self.set_text_color(BLACK_TEXT_COLOR[0], BLACK_TEXT_COLOR[1], BLACK_TEXT_COLOR[2])
        self.multi_cell(w = 0, h = 0.25, txt =
            'Copyright (c) Stanford University, the Regents of the University of California, ' +
            'Open Source Medical Software Corporation, and other parties.\n\n' +
            'All Rights Reserved.\n\n' +
            'Permission is hereby granted, free of charge, to any person obtaining a copy of ' +
            'this data to use the data for research and development purposes subject to the ' +
            'following conditions: \n\n' +
            'The above copyright notice and the README-COPYRIGHT file shall be ' +
            'included in all copies of any portion of this data. Whenever reasonable and ' +
            'possible in publications and presentations when this data is used in whole or ' +
            'part, please include an acknowledgement similar to the following: \n\n' +
            '"The data used herein was provided in whole or in part with ' +
            'Federal funds from the National Library of Medicine under Grant ' +
            'No. R01LM013120, and the National Heart, Lung, and Blood Institute, ' +
            'National Institutes of Health, Department of Health and Human Services, ' +
            'under Contract No. HHSN268201100035C"\n\n AND/OR \n\n' +
            'N.M. Wilson, A.K. Ortiz, and A.B. Johnson, "The Vascular Model Repository: ' +
            'A Public Resource of Medical Imaging Data and Blood Flow Simulation Results," ' +
            'J. Med. Devices 7(4), 040923 (Dec 05, 2013) doi:10.1115/1.4025983. \n\n ' +
            'AND/OR\n\nReference the official website for this data: www.vascularmodel.com\n\n' +
            'THE DATA IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS ' +
            'OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF ' +
            'MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. ' +
            'IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY ' +
            'CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, ' +
            'TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE ' +
            'DATA OR THE USE OR OTHER DEALINGS IN THE DATA.',
            border = 0, align = 'L')


    def print_doc(self, model):
        """ Generates the PDF document for a given model class """

        self.alias_nb_pages()
        self.add_page()
        self.title_text(model)
        self.title_image(model)
        self.title_table(model)
        self.add_page()
        self.clinical_significance(model)
        self.clinical_data(model)
        self.notes(model)
        self.publications(model)
        self.add_page()
        self.license()
        #self.appendix(model)

# Open a csv reader called DictReader
with open(DATASET_FILE_PATH, encoding='utf-8-sig') as csvf1:
    csv_reader1 = csv.DictReader(csvf1)

    val = input("Enter PDF Generation Option:\n" +
                "\t1 - regenerate all PDFs in the dataset\n" +
                "\t2 - only generate PDFs in the dataset that don't exist\n")

    for rows1 in csv_reader1:
        if val == '1':
            if rows1['Name']:
                model1 = {'name': rows1['Name'],
                        'lgcy_name': rows1['Legacy Name'],
                        'species': rows1['Species'],
                        'animal': rows1['Animal'],
                        'anatomy': rows1['Anatomy'],
                        'disease': rows1['Disease'],
                        'procedure': rows1['Procedure'],
                        'notes': rows1['Notes'],
                        'img_mod': rows1['Image Modality'],
                        'img_manu': rows1['Image Manufacturer'],
                        'img_type': rows1['Image Type'],
                        'img_src': rows1['Image Source'],
                        'pubs': rows1['Citation'],
                        'results': rows1['Results'],
                        'date_added': rows1['Date Added']}

                # save FPDF() class into a variable
                # Clean the text in model1 to avoid Unicode encoding issues
                model1 = clean_model_data(model1)
                pdf = PDF('P', 'in', 'Letter')
                pdf.set_margins(1, 1)
                pdf.print_doc(model1)
                pdf.output(os.path.join(PDF_FILE_PATH, rows1['Name'] + '.pdf'), 'F')
                print('Generating: ' + (rows1['Name']) + '.pdf')

        if val == '2':
            if rows1['Name'] and os.path.isfile(os.path.join(PDF_FILE_PATH, rows1['Name'] + '.pdf')) is False:
                model1 = {'name': rows1['Name'],
                        'lgcy_name': rows1['Legacy Name'],
                        'species': rows1['Species'],
                        'animal': rows1['Animal'],
                        'anatomy': rows1['Anatomy'],
                        'disease': rows1['Disease'],
                        'procedure': rows1['Procedure'],
                        'notes': rows1['Notes'],
                        'img_mod': rows1['Image Modality'],
                        'img_manu': rows1['Image Manufacturer'],
                        'img_type': rows1['Image Type'],
                        'img_src': rows1['Image Source'],
                        'pubs': rows1['Citation'],
                        'results': rows1['Results'],
                        'date_added': rows1['Date Added']}
                # save FPDF() class into a variable
                 # Clean the text in model1 to avoid Unicode encoding issues
                model1 = clean_model_data(model1)
                pdf = PDF('P', 'in', 'Letter')
                pdf.set_margins(1, 1)
                pdf.print_doc(model1)
                pdf.output(os.path.join(PDF_FILE_PATH, rows1['Name'] + '.pdf'), 'F')
                print('Generating: ' + (rows1['Name']) + '.pdf')



"""
# For testing one file at a time and for debugging
model1 = {'name': 'AS1_SU0308_prestent',
    'species': 'Animal',
    'animal': '14 W',
    'anatomy': 'Aortofemoral Peripheral Occlusive Diseasease',
    'disease': 'Aortofemoral Peripheral Occlusive Disease_W',
    'procedure': 'Awdvslkjsdfsfsd asbed',
    'notes': 'This is a test note',
    'img_mod': 'MRI Test',
    'img_type': 'DICOM',
    'img_src': 'LPCH',
    'img_manu': '-',
    'pubs': r'Menon, A., Wendell, D. C., Wang, H., Eddinger, T. J., Toth, J. M., ' +
            r'Dholakia, R. J., ... & LaDisa Jr, J. F. (2012). A coupled experimental ' +
            r'and computational approach to quantify deleterious hemodynamics, vascular ' +
            r'alterations, and mechanisms of long-term morbidity in response to aortic ' +
            r'coarctation. Journal of pharmacological and toxicological methods, 65(1), ' +
            r'18-28. ' + '\n' + r'http://www.doi.org/10.1016/j.vascn.2011.10.003',
    's': '1'}

# save FPDF() class into a variable
pdf = PDF('P', 'in', 'Letter')
pdf.set_margins(1, 1)
pdf.print_doc(model1)
pdf.output(os.path.join(PDF_FILE_PATH, model1['name'] + '.pdf'), 'F')
print('Generating: ' + (model1['name']) + '.pdf')

# save FPDF() class into a variable
pdf = PDF('P', 'in', 'Letter')
pdf.set_margins(1, 1)
pdf.print_doc(model1)
pdf.output(os.path.join(PDF_FILE_PATH, model1['name'] + '.pdf'), 'F')
"""
