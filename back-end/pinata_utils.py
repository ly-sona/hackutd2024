# insurewise_backend/pinata_utils.py

import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

PINATA_API_KEY = os.getenv('PINATA_API_KEY')
PINATA_SECRET_API_KEY = os.getenv('PINATA_SECRET_API_KEY')

def upload_file_to_pinata(file_path):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY
    }
    with open(file_path, 'rb') as f:
        files = {
            'file': (os.path.basename(file_path), f)
        }
        response = requests.post(url, files=files, headers=headers)
    if response.status_code == 200:
        return response.json()['IpfsHash']
    else:
        raise Exception(f"Failed to upload file to Pinata: {response.text}")
