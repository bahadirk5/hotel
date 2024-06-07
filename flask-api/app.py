import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import requests
from requests.auth import HTTPBasicAuth

# Çevresel değişkenleri yükle
load_dotenv()

# Debug için çevresel değişkenleri yazdır
print("NEXTCLOUD_URL:", os.getenv("NEXTCLOUD_URL"))
print("NEXTCLOUD_USERNAME:", os.getenv("NEXTCLOUD_USERNAME"))
print("NEXTCLOUD_PASSWORD:", os.getenv("NEXTCLOUD_PASSWORD"))

app = Flask(__name__)

# Debug için değişkenleri manuel olarak kontrol et
nextcloud_url = os.getenv("NEXTCLOUD_URL")
username = os.getenv("NEXTCLOUD_USERNAME")
password = os.getenv("NEXTCLOUD_PASSWORD")

print("nextcloud_url:", nextcloud_url)
print("username:", username)
print("password:", password)

# NextCloud bağlantısını test et
response = requests.get(f"{nextcloud_url}/remote.php/webdav/", auth=HTTPBasicAuth(username, password))

print(f"Status Code: {response.status_code}")
print(f"Response Content: {response.content}")

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    file.save(file.filename)
    with open(file.filename, 'rb') as f:
        response = requests.put(f"{nextcloud_url}/remote.php/webdav/{file.filename}", data=f, auth=HTTPBasicAuth(username, password))
    return jsonify({"message": "File uploaded successfully", "status_code": response.status_code}), response.status_code

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    response = requests.get(f"{nextcloud_url}/remote.php/webdav/{filename}", auth=HTTPBasicAuth(username, password))
    return response.content, response.status_code, {
        'Content-Disposition': f'attachment; filename={filename}',
        'Content-Type': 'application/octet-stream'
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
