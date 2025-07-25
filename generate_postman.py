import re
import json
import os

# Use forward slashes for the path to avoid escape sequence issues
ROOT_DIR = 'H:/Rural_Share/rural-share-server'

controller_files = [
    "src/modules/addresses/addresses.controller.ts",
    "src/modules/auth/auth.controller.ts",
    "src/modules/catalogue/catalogue.controller.ts",
    "src/modules/chat/chat.controller.ts",
    "src/modules/commissions/commissions.controller.ts",
    "src/modules/disputes/disputes.controller.ts",
    "src/modules/escrow/escrow.controller.ts",
    "src/modules/kyc/kyc.controller.ts",
    "src/modules/listings/availabilities.controller.ts",
    "src/modules/listings/listings.controller.ts",
    "src/modules/messages/messages.controller.ts",
    "src/modules/orders/orders.controller.ts",
    "src/modules/providers/providers.controller.ts",
    "src/modules/ratings/ratings.controller.ts",
    "src/modules/users/users.controller.ts"
]

postman_collection = {
  "info": {
    "name": "Rural Share API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [],
  "variable": [
      {
          "key": "base_url",
          "value": "http://localhost:3000",
          "type": "string"
      }
  ]
}

# Regex to find the base path from the @Controller decorator
controller_base_path_regex = re.compile(r'@Controller\(\'([\w/-]+)\'\)')

# A more robust regex to capture routes
route_regex = re.compile(
    r"""@(Get|Post|Patch|Delete|Put)\s*\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)\s*
        (?:@UseGuards\([^)]*\)\s*)?
        (?:public\s+)?(?:async\s+)?
        (\w+)\s*\(([^)]*)\)""", re.VERBOSE)

for file_path in controller_files:
    absolute_file_path = os.path.join(ROOT_DIR, file_path.replace('/', os.sep))
    try:
        with open(absolute_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Warning: File not found at {absolute_file_path}")
        continue

    base_path_match = controller_base_path_regex.search(content)
    if not base_path_match:
        print(f"Warning: No @Controller base path found in {file_path}")
        base_path = file_path.split('/')[-2]
    else:
        base_path = base_path_match.group(1)

    folder = {
        "name": base_path.replace('/', '-').capitalize(),
        "item": []
    }

    for match in route_regex.finditer(content):
        method, path, func_name, params = match.groups()
        path = path or ""

        full_path = f"{base_path}/{path}".strip('/')

        name = f"{func_name}"

        item = {
            "name": name,
            "request": {
                "method": method.upper(),
                "header": [],
                "url": {
                    "raw": f"{{{{base_url}}}}/{full_path}",
                    "host": [
                        "{{base_url}}"
                    ],
                    "path": full_path.split('/')
                },
                "description": f"Endpoint for {func_name} in {base_path} controller."
            },
            "response": []
        }

        if method.upper() in ["POST", "PATCH", "PUT"]:
            dto_match = re.search(r'@Body\(\)\s+\w+:\s+(\w+)', params)
            dto_name = dto_match.group(1) if dto_match else "object"
            item["request"]["body"] = {
                "mode": "raw",
                "raw": f"// Request body for {dto_name}\n" + "{\n  \"key\": \"value\"\n}",
                "options": {
                    "raw": {
                        "language": "json"
                    }
                }
            }

        folder["item"].append(item)

    if folder["item"]:
        postman_collection["item"].append(folder)

output_path = os.path.join(ROOT_DIR, "postman_collection.json")

try:
    with open(output_path, "w") as f:
        json.dump(postman_collection, f, indent=2)
    print(f"Postman collection generated successfully at {output_path}")
except IOError as e:
    print(f"Error writing to file: {e}")