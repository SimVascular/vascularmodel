"""
Moving each VMR clinical data csv into the corresponding svprojects folder
"""

import os
import shutil

PATH_OF_CSV = r"/var/www/vascularmodel/vmr-clinical_data"
PATH_OF_SVPROJ = r"/var/www/vascularmodel/svprojects"
EXT = '.csv'

print('')
print('Copying Clinical Data csv from ' + PATH_OF_CSV)
print('')

for files in os.listdir(PATH_OF_CSV):
    if files.endswith(EXT):
        model_name = files.replace('_ClinicalData.csv', '')
        shutil.copy(files, os.path.join(PATH_OF_SVPROJ, model_name))

        print('Copied ' + model_name)
    else:
        continue
