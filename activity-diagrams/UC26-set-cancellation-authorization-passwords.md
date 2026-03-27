Use Case No. 26
Number: UC26
Name: Set Cancellation Authorization Passwords
Description: The administrator can set and manage authorization passwords required for order cancellations, providing an additional security layer for sensitive operations.
Actor(s): Administrator
Preconditions: The user must be logged into the system. 
Postconditions: None
Special Requirements: None
Extension Points: None

### **Flow: Set Cancellation Authorization Passwords**

1. **Start**
2. Administrator navigates to security settings
3. System validates authentication token and administrator role
4. System displays cancellation authorization configuration
5. Administrator selects "Set Cancellation Password"
6. System displays password creation form
7. Administrator enters new password
8. System validates password strength requirements
9. System checks password against history
10. System hashes password with Argon2id
11. System stores hashed password
12. System updates configuration
13. System logs change in audit trail
14. System displays confirmation message
15. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user is not an administrator:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Password Too Weak**

* At step 8:

  * If password does not meet strength requirements:

    * System displays password requirements
    * Administrator must enter a stronger password
    * Resume flow at step 7

**A3: Password Previously Used**

* At step 9:

  * If password matches a previous password:

    * System displays "Password was previously used" message
    * Administrator must enter a different password
    * Resume flow at step 7

**A4: Database Save Error**

* At step 11 or 12:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow

**A5: Cancel Operation**

* At step 5 or 7:

  * If administrator cancels:

    * System discards changes
    * End flow
