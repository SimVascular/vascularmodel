$folder = "c:\Users\19195\Documents\VMR_Project\vmr-data\vmr-clinical_data" #target folder containing files
$csv = "c:\Users\19195\Documents\VMR_Project\vmr-data\vmr-clinical_data\VMR_Rename_ClinicalData.csv" #path to CSV file

cd ($folder); import-csv ($csv)| foreach {rename-item -path $_.path -newname $_.newfilename}