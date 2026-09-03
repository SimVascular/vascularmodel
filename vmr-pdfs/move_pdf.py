"""
Moving each VMR PDF into the corresponding svprojects folder
"""

import os
import shutil

PATH_OF_PDFS = r"/var/www/vascularmodel/vmr-pdfs"
PATH_OF_SVPROJ = r"/var/www/vascularmodel/svprojects"
EXT = '.pdf'

print('')
print('Copying PDFs from ' + PATH_OF_PDFS)
print('')

for files in os.listdir(PATH_OF_PDFS):
    if files.endswith(EXT):
        model_name = files.replace(EXT, '')
        shutil.copy(files, os.path.join(PATH_OF_SVPROJ, model_name))

        print('Copied ' + model_name)
    else:
        continue
