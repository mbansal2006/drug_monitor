import requests

# API key and docket ID
API_KEY = "lQ7uj8RTzhCFHHNKZ3EFLEqBh0vvIvJku69OFKWD"
DOCKET_ID = "CMS-2024-0345"
BASE_URL = "https://api.regulations.gov/v4/comments"

# Headers for the API request
headers = {
    "X-Api-Key": API_KEY
}

# Function to fetch comments for a single page
def fetch_comments(docket_id, page_number):
    params = {
        "filter[docketId]": docket_id,
        "page[size]": 250,  # Max items per page
        "page[number]": page_number,
        "include": "attachments"  # Include attachment details
    }
    response = requests.get(BASE_URL, headers=headers, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Main debugging script
def debug_fetch():
    print(f"Fetching comments for docket {DOCKET_ID}, page 1...")
    data = fetch_comments(DOCKET_ID, 1)
    
    if data:
        print("Raw API Response:")
        print(data)  # Print the full response for inspection
        
        # Check if there are comments
        comments = data.get("data", [])
        print(f"Number of comments on page 1: {len(comments)}")
        
        if comments:
            print("First comment details:")
            print(comments[0])  # Show the first comment
        else:
            print("No comments found in the response.")
    else:
        print("No data retrieved from the API.")

if __name__ == "__main__":
    debug_fetch()