import pandas as pd

# Adjust display options to show all rows and columns (optional)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)

# Load the Excel file
file_path = r"C:\Users\Jeremias Argueta\OneDrive\Desktop\SeniorProject\Hood-Hockey\data\instat\Combined_Goalies.xlsx"
df = pd.read_excel(file_path, sheet_name="Sheet1")

# Print the current dataset
print("Current Dataset:")
print(df.to_string())

# Convert percentage columns to decimal format
# We convert "Saves, %", "Accurate passes, %", and "Scoring chance saves, %"
percentage_columns = ["Saves, %", "Accurate passes, %", "Scoring chance saves, %"]
for col in percentage_columns:
    df[col] = df[col].astype(str).replace('-', '0%').str.replace('%', '').astype(float) / 100

# Replace all remaining '-' and NaN values with 0
df.replace('-', 0, inplace=True)
df.fillna(0, inplace=True)

# Check if 'Time on ice' column exists before splitting
if 'Time on ice' in df.columns:
    # Split 'Time on ice' into 'Minutes' and 'Seconds'
    df[['Minutes', 'Seconds']] = df['Time on ice'].str.split(':', expand=True).astype(int)
    # Drop the original 'Time on ice' column
    df.drop(columns=['Time on ice'], inplace=True)

# Save the cleaned data to the same file
df.to_excel(file_path, index=False)

# Reload the updated Excel file to reflect changes
df_updated = pd.read_excel(file_path, sheet_name="Sheet1")

# Print the updated dataset
print("\nUpdated Dataset:")
print(df_updated.to_string())