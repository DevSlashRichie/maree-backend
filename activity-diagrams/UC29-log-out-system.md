Use Case No. 29
Number: UC29
Name: Log out of the System
Description: The authenticated user can log out of the system, terminating their active session and removing access to protected resources.
Actor(s): Customer, Cashier, Waiter, Supervisor, Administrator
Preconditions:
The user must be logged into the system with an active session.
Postconditions:
The user's session is terminated, authentication token is invalidated, and the user is redirected to the login page.
Special Requirements: None
Extension Points: None

### **Flow: Log out of the System**

1. **Start**
2. User selects logout option
3. System confirms logout intention
4. User confirms logout
5. System invalidates authentication token
6. System terminates active session
7. System clears session data from client
8. System logs logout event
9. System redirects to login page
10. System displays login interface
11. **End**

---

### **Optional Alternative**

**A1: User Cancels Logout**

* At step 4:

  * If user cancels:

    * System discards logout request
    * User remains on current page
    * End flow

**A2: Token Invalidation Error**

* At step 5:

  * If token invalidation fails:

    * System attempts session termination
    * System clears client-side data
    * System logs error
    * Flow continues to step 9

**A3: Session Already Expired**

* At step 5 or 6:

  * If session has already expired:

    * System clears any remaining client data
    * System redirects to login page
    * End flow

**A4: Automatic Logout (Session Timeout)**

* At any step:

  * If session timeout occurs:

    * System automatically invalidates token
    * System clears session data
    * System displays "Session expired" message
    * System redirects to login page
    * End flow
