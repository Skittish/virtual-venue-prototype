/*

need to restrict:

ensure users can only read event data if they're already inside the event

prevent users from reading / writing secureEventData unless they're an event admin

prevent users from writing any data that's not their own within an event unless they're an admin

prevent users from writing their userRole unless they're an admin




 */

const newRules = {
  "rules": {
    "temp": {
      ".read": "auth.uid != null",
      ".write": "auth.uid != null",
    },
    "data": {
      ".read": "auth.uid != null",
      ".write": "auth.uid != null", // todo - secure this so only overall admins can write such data
    },
    "secureEventData": {
      "$eventId": {
        ".read": "root.child('events').child($eventId).child('eventData/creator').val() == auth.uid || root.child('events').child($eventId).child('users').child(auth.uid).child('userRole').val() == 'admin'",
        ".write": "root.child('events').child($eventId).child('eventData/creator').val() == auth.uid || root.child('events').child($eventId).child('users').child(auth.uid).child('userRole').val() == 'admin'",
      }
    },
    "events": {
      "$eventId": {
        ".read": "root.child('secureEventData').child($eventId).child('usersWithAccess').child(auth.uid).exists()",
        "eventData": {
          ".write": "root.child('events').child($eventId).child('eventData/creator').val() == auth.uid || root.child('events').child($eventId).child('users').child(auth.uid).child('userRole').val() == 'admin'",
        },
        "users": {
          "$userId": {
            ".write": "$userId === auth.uid || root.child('events').child($eventId).child('eventData/creator').val() == auth.uid || root.child('events').child($eventId).child('users').child(auth.uid).child('userRole').val() == 'admin'",
          }
        },
        "usersData": {
          "$userId": {
            ".write": "$userId === auth.uid || root.child('events').child($eventId).child('eventData/creator').val() == auth.uid || root.child('events').child($eventId).child('users').child(auth.uid).child('userRole').val() == 'admin'",
          }
        },
        "$other": {
          ".write": "root.child('secureEventData').child($eventId).child('usersWithAccess').child(auth.uid).exists()",
        }
      },
    },
    "$other": {
      ".read": "auth.uid != null", // not sure if this will work as a fall-back, need to verify
    }
  }
}


const rules = {
  "rules": {
    ".read": "auth.uid != null",
    "data": {
      ".write": "auth != null"
    },
    "secureEventData": {
      ".write": "auth != null"
    },
    "events": {
      "$uid": {
        "users": {
          ".write": "auth != null"
        },
        "usersData": {
          ".write": "auth != null"
        },
        "sessionData": {
          ".write": "auth != null"
        },
        "roomsData": {
          ".write": "auth != null"
        },
        "eventData": {
          ".write": "auth != null"
        },
        "channels": {
          ".write": "auth != null"
        }
      }
    },
    "$event": {
      ".read": "auth.uid != null",
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    }
  }
}
