import requests
import json
import random
import datetime

# The URL of the API endpoint in your Next.js application
# Make sure your Next.js app is running and accessible at this URL
# If you are running the Next.js app locally with `npm run dev`, it's likely on port 9002.
API_URL = "http://localhost:9002/api/data"

def generate_random_data_entry():
    """Generates a single random data entry."""
    device_num = random.randint(1, 5)
    unit_num = (device_num + 1) // 2
    
    # Generate a random timestamp within the last 90 days
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=90)
    random_date = start_date + (end_date - start_date) * random.random()
    
    data_entry = {
        "timestamp": random_date.isoformat(),
        "deviceId": f"DEV-{str(device_num).zfill(3)}",
        "sourceUnit": f"Unit-{chr(64 + unit_num)}",
        "animalId": f"ANI-{str(random.randint(1, 50)).zfill(4)}",
        "animalWeight": round(random.uniform(5.0, 200.0), 2)
    }
    return data_entry

def send_data_to_server(data_entry):
    """Sends the data entry to the server via a POST request."""
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(API_URL, data=json.dumps(data_entry), headers=headers)
        
        # Check if the request was successful
        if response.status_code == 201:
            print("Data sent successfully!")
            print("Response:", response.json())
        else:
            print(f"Failed to send data. Status code: {response.status_code}")
            print("Response:", response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending the request: {e}")

if __name__ == "__main__":
    print("Generating a random data record for testing...")
    test_data = generate_random_data_entry()
    print("\nGenerated Data:")
    print(json.dumps(test_data, indent=2))
    
    print(f"\nSending data to {API_URL}...")
    send_data_to_server(test_data)
