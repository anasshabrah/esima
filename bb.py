import os

# Get the root directory where this Python script is executed
root_directory = os.getcwd()
# The output file that will contain the consolidated content
output_file = os.path.join(root_directory, "consolidated.txt")

# List to store the content of all .ts and .tsx files
content_list = []

# Walk through all directories and subdirectories
for foldername, subfolders, filenames in os.walk(root_directory):
    # Skip the .next and node_modules folders
    if ".next" in foldername or "node_modules" in foldername:
        continue
    
    for filename in filenames:
        # Check if the file is a .ts or .tsx file
        if filename.endswith(('.ts', '.tsx')):
            # Full path to the file
            file_path = os.path.join(foldername, filename)
            try:
                # Read the file content and store it in the list
                with open(file_path, 'r', encoding='utf-8') as file:
                    content_list.append(f"--- {file_path} ---\n")  # Add the file path as a header
                    content_list.append(file.read())
                    content_list.append("\n\n")  # Add space between file contents
            except Exception as e:
                print(f"Could not read {file_path}: {e}")

# Write all collected content into the output file
try:
    with open(output_file, 'w', encoding='utf-8') as output:
        output.writelines(content_list)
    print(f"All content consolidated into {output_file}")
except Exception as e:
    print(f"Error writing to the consolidated file: {e}")
