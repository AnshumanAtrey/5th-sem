#!/usr/bin/env python3
"""Proves firestore.rules allow and deny the right things, using real
requests against the Auth + Firestore emulators. Standard library only.

    firebase emulators:exec --only auth,firestore "python3 tool/rules_smoke_test.py"
"""
import json
import sys
import urllib.error
import urllib.request

PROJECT = "demo-hotstar-clone"
AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1"
DB = f"http://127.0.0.1:8080/v1/projects/{PROJECT}/databases/(default)/documents"
failures = 0


def call(method, url, body=None, token=None):
    req = urllib.request.Request(url, method=method, data=None if body is None else json.dumps(body).encode())
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def sign_up(email):
    status, body = call("POST", f"{AUTH}/accounts:signUp?key=demo", {"email": email, "password": "passw0rd!", "returnSecureToken": True})
    assert status == 200, body
    return body["localId"], body["idToken"]


def value(v):
    if isinstance(v, bool):
        return {"booleanValue": v}
    if isinstance(v, int):
        return {"integerValue": str(v)}
    if isinstance(v, list):
        return {"arrayValue": {"values": [value(x) for x in v]}}
    return {"stringValue": v}


def write(token, path, fields, server_time=None):
    """Commit one document; server_time names a field set to request.time."""
    w = {"update": {"name": f"projects/{PROJECT}/databases/(default)/documents/{path}",
                    "fields": {k: value(v) for k, v in fields.items()}}}
    if server_time:
        w["updateTransforms"] = [{"fieldPath": server_time, "setToServerValue": "REQUEST_TIME"}]
    status, _ = call("POST", f"{DB}:commit", {"writes": [w]}, token)
    return status


def expect(name, ok, detail=""):
    global failures
    print(f"  {'PASS' if ok else 'FAIL'}  {name} {detail}")
    failures += 0 if ok else 1


owner, owner_t = sign_up("owner@hotstarclone.test")
kid, kid_t = sign_up("kid@hotstarclone.test")
stranger, stranger_t = sign_up("stranger@hotstarclone.test")

print("profiles")
expect("owner can create a Premium profile with family",
       write(owner_t, f"users/{owner}", {"displayName": "Owner", "email": "owner@hotstarclone.test", "plan": "premium",
                                         "familyEmails": ["kid@hotstarclone.test"]}) == 200)
expect("unknown plan id is rejected",
       write(owner_t, f"users/{owner}", {"displayName": "Owner", "plan": "superPlan", "familyEmails": []}) == 403)
expect("family on a non-Premium plan is rejected",
       write(owner_t, f"users/{owner}", {"displayName": "Owner", "plan": "super", "familyEmails": ["x@y.z"]}) == 403)
expect("cannot write someone else's profile",
       write(stranger_t, f"users/{owner}", {"displayName": "Hacked", "plan": "premium", "familyEmails": []}) == 403)

print("family sharing")
query = {"structuredQuery": {"from": [{"collectionId": "users"}],
                             "where": {"fieldFilter": {"field": {"fieldPath": "familyEmails"}, "op": "ARRAY_CONTAINS",
                                                       "value": {"stringValue": "kid@hotstarclone.test"}}}}}
status, rows = call("POST", f"{DB}:runQuery", query, kid_t)
found = [r for r in rows if "document" in r] if isinstance(rows, list) else []
expect("family member's array-contains query is allowed and finds the owner", status == 200 and len(found) == 1,
       f"(status {status}, {len(found)} docs)")
status, _ = call("GET", f"{DB}/users/{owner}", token=stranger_t)
expect("a stranger cannot read the owner's profile", status == 403, f"(status {status})")

print("reviews")
review = {"uid": kid, "author": "Kid", "stars": 5, "text": "Loved the dragon!", "spoiler": False}
expect("valid review with server timestamp is accepted",
       write(kid_t, f"titles/sintel/reviews/{kid}", review, server_time="createdAt") == 200)
expect("review shorter than 10 characters is rejected",
       write(kid_t, f"titles/sintel/reviews/{kid}", {**review, "text": "meh"}, server_time="createdAt") == 403)
expect("6 stars is rejected",
       write(kid_t, f"titles/sintel/reviews/{kid}", {**review, "stars": 6}, server_time="createdAt") == 403)
expect("cannot post a review as someone else",
       write(stranger_t, f"titles/sintel/reviews/{kid}", review, server_time="createdAt") == 403)

print("live")
expect("allowed reaction is accepted",
       write(kid_t, "live/shaka-live/reactions/r1", {"uid": kid, "emoji": "🔥"}, server_time="sentAt") == 200)
expect("emoji outside the allow-list is rejected",
       write(kid_t, "live/shaka-live/reactions/r2", {"uid": kid, "emoji": "💩"}, server_time="sentAt") == 403)
expect("chat over 200 characters is rejected",
       write(kid_t, "live/shaka-live/messages/m1", {"uid": kid, "author": "Kid", "text": "x" * 201}, server_time="sentAt") == 403)

print(f"\n{'ALL RULES BEHAVE' if failures == 0 else f'{failures} FAILURE(S)'}")
sys.exit(1 if failures else 0)
