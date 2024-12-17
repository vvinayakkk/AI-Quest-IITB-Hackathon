from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# Connect to MongoDB
client = MongoClient("mongodb+srv://Hackathon:lksFV2nrUudC4Ukl@cluster0.o9n03.mongodb.net/AI-Quest?retryWrites=true&w=majority&appName=Cluster0")
db = client["AI-Quest"]

# Collections
users = db["users"]
posts = db["posts"]
comments = db["comments"]

# Clear existing data
users.delete_many({})
posts.delete_many({})
comments.delete_many({})

# Helper function to create timestamps
def now():
    return datetime.now()

# ---------------------- USERS -------------------------
user_ids = [ObjectId() for _ in range(10)]
user_list = []

user_data = [
    ("Arjun", "Sharma", "arjun@example.com", "IT", "Member"),
    ("Priya", "Patel", "priya@example.com", "Marketing", "Member"),
    ("Amit", "Verma", "amit@example.com", "Finance", "Admin"),
    ("Neha", "Kulkarni", "neha@example.com", "HR", "Member"),
    ("Rohit", "Rao", "rohit@example.com", "IT", "Member"),
    ("Sneha", "Jain", "sneha@example.com", "Sales", "Member"),
    ("Vikram", "Singh", "vikram@example.com", "IT", "Admin"),
    ("Meena", "Reddy", "meena@example.com", "Operations", "Member"),
    ("Karan", "Thakur", "karan@example.com", "Support", "Member"),
    ("Pooja", "Gupta", "pooja@example.com", "IT", "Member"),
]

for i, (first, last, email, dept, role) in enumerate(user_data):
    user = {
        "_id": user_ids[i],
        "firstName": first,
        "lastName": last,
        "email": email,
        "password": "hashed_password",
        "role": role,
        "department": dept,
        "verified": True,
        "reputation": 10 * (i + 1),
        "posts": [],
        "comments": [],
        "notifications": [],
        "createdAt": now(),
        "updatedAt": now()
    }
    user_list.append(user)

users.insert_many(user_list)

# ---------------------- POSTS -------------------------
post_ids = [ObjectId() for _ in range(10)]
post_list = []

tags = ["MongoDB", "Database", "India", "Startup", "Technology", "AI", "GenAI", "Bharat", "Innovation", "Cloud"]
categories = ["IT", "Finance", "Marketing", "Tech", "HR"]

for i in range(10):
    post = {
        "_id": post_ids[i],
        "title": f"Post {i+1}: Insights on {tags[i % len(tags)]}",
        "content": f"This is an in-depth article about {tags[i % len(tags)]} and its applications in {categories[i % len(categories)]}.",
        "tags": tags[i:] + tags[:i],  # Circular rotation of tags
        "categories": [categories[i % len(categories)]],
        "images": [{"id": str(ObjectId()), "url": f"https://example.com/image{i}.jpg", "uploadedAt": now()}],
        "author": user_ids[i % 10],
        "likes": [user_ids[(i + j) % 10] for j in range(3)],
        "comments": [],
        "views": 100 + i * 10,
        "createdAt": now(),
        "updatedAt": now()
    }
    post_list.append(post)

posts.insert_many(post_list)

# ---------------------- COMMENTS WITH NESTING -------------------------
comment_list = []

for i in range(10):  # 10 comments
    parent_comment_id = ObjectId()
    parent_comment = {
        "_id": parent_comment_id,
        "author": user_ids[i % 10],
        "content": f"This is comment {i+1} on Post {i+1}.",
        "type": "user",
        "upvotes": [user_ids[(i + j) % 10] for j in range(2)],
        "replies": [],
        "flagged": {"status": False},
        "createdAt": now()
    }
    
    # 3 Levels of Nesting
    for j in range(3):
        reply_id = ObjectId()
        reply = {
            "_id": reply_id,
            "author": user_ids[(i + j) % 10],
            "content": f"Nested reply {j+1} to Comment {i+1}.",
            "type": "user",
            "upvotes": [user_ids[(i + j + 1) % 10]],
            "replies": [],
            "flagged": {"status": False},
            "createdAt": now()
        }
        parent_comment["replies"].append(reply_id)
        comment_list.append(reply)

    comment_list.append(parent_comment)

    # Link comment to a post
    posts.update_one({"_id": post_ids[i]}, {"$push": {"comments": parent_comment_id}})

comments.insert_many(comment_list)

# ---------------------- UPDATE USER DATA -------------------------
for i in range(10):
    users.update_one({"_id": user_ids[i]}, {
        "$push": {
            "posts": post_ids[i],
            "comments": comment_list[i]["_id"]
        }
    })

print("Seeding completed successfully!")
