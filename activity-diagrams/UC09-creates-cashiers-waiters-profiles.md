Use Case No. 09
Number: UC09
Name: Creates Cashiers and Waiters Profiles
Description: The administrator or supervisor can create new user profiles for cashiers and waiters, assigning appropriate roles and access permissions.
Actor(s): Administrator, Supervisor
Preconditions:
The user must be logged into the system. The system must be operational.
Postconditions:
A new user profile is created with the assigned role (cashier or waiter) and can access the system with the provided credentials.
Special Requirements: None
Extension Points: None

### **Flow: Creates Cashiers and Waiters Profiles**

1. **Start**
2. Administrator/Supervisor navigates to user management
3. System validates authentication token and role
4. System displays user creation form
5. Administrator/Supervisor enters user details:

   * Name
   * Email
   * Phone number
   * Role (cashier or waiter)
   * Branch assignment (if applicable)
6. System validates input fields
7. System checks email uniqueness
8. System generates temporary password
9. System creates user account
10. System assigns specified role
11. System sends welcome email with temporary credentials
12. System displays confirmation with user details
13. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks administrator or supervisor privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Duplicate Email**

* At step 7:

  * If email already exists in the system:

    * System displays "Email already registered" message
    * Administrator/Supervisor must enter a different email
    * Resume flow at step 5

**A3: Invalid Input**

* At step 6:

  * If validation fails:

    * System displays specific validation error messages
    * Resume flow at step 5

**A4: Email Delivery Failure**

* At step 11:

  * If welcome email fails to send:

    * System displays warning message
    * System provides option to manually copy credentials
    * Flow continues (user is created successfully)
