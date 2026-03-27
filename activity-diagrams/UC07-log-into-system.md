Use Case No. 07
Number: UC07
Name: Log into the System
Description: The registered user authenticates into the system by providing valid credentials to access protected features and personalized content.
Actor(s): Customer, Cashier, Waiter, Supervisor, Administrator
Preconditions:
The system must be operational. The user must have a registered account.
Postconditions:
The user is authenticated and has an active session with a valid token for accessing protected resources.
Special Requirements: None
Extension Points: None

### **Flow: Log into the System**

1. **Start**
2. User navigates to login page
3. System displays login form
4. User enters email and password
5. User submits credentials
6. System validates input fields
7. System retrieves user account from database
8. System verifies password against stored hash
9. System validates account status (active, not blocked)
10. System generates authentication token
11. System creates active session
12. System returns token and user profile
13. System redirects to appropriate dashboard based on user role
14. **End**

---

### **Optional Alternative**

**A1: Invalid Credentials**

* At step 8:

  * If password does not match:

    * System displays "Invalid email or password" message
    * System increments failed login counter
    * Resume flow at step 4

**A2: Account Not Found**

* At step 7:

  * If no account exists with provided email:

    * System displays "Invalid email or password" message (same as A1 for security)
    * Resume flow at step 4

**A3: Account Blocked or Inactive**

* At step 9:

  * If account status is blocked or inactive:

    * System displays "Account is not active" message
    * System suggests contacting support
    * End flow

**A4: Too Many Failed Attempts**

* At step 6:

  * If rate limit exceeded:

    * System displays "Too many login attempts" message
    * System enforces temporary lockout period
    * End flow

**A5: Invalid Input Format**

* At step 6:

  * If email format is invalid or fields are empty:

    * System displays validation error messages
    * Resume flow at step 4
