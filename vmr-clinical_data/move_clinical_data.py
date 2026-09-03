"""
Move each clinical data csv into the corresponding svprojects folder
"""
import os
import shutil

PATH_OF_CSVS = r"/var/www/vascularmodel/vmr-clinical_data"
PATH_OF_SVPROJ = r"/var/www/vascularmodel/svprojects"
EXT = '.csv'
print('')
print('Copying CSVs from ' + PATH_OF_CSVS)
print('')

for files in os.listdir(PATH_OF_CSVS):
    if files.endswith(EXT):
        model_name = files.replace(EXT, '')
        shutil.copy(files, os.path.join(PATH_OF_SVPROJ, model_name[:-13]))
        print('Copied ' + model_name)
    else:
        continue
