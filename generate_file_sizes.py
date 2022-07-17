import os
import csv

csv_columns = ['Name', 'Size']

folders = ['svprojects', 'svresults']
sizes_dict = []
for folder in folders:
    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith(".zip"):
                path = os.path.join(root, file)
                sizes_dict.append({'Name': path, 'Size': os.path.getsize(path)})

with open('dataset/file_sizes.csv', 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = csv_columns)
    writer.writeheader()
    writer.writerows(sizes_dict)

