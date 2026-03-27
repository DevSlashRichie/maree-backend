Use Case No. 15
Number: UC15
Name: Create Profiles Supervisors
Description: The administrator can create new supervisor profiles, assigning elevated privileges for managing staff, operations, and specific branches.
Actor(s): Administrator
Preconditions:
The user must be logged into the system with administrator privileges. The system must be operational.
Postconditions:
A new supervisor profile is created with the assigned privileges and can access the system with elevated permissions.
Special Requirements: None
Extension Points: None

### **Flow: Create Profiles Supervisors**

1. **Start**
2. Administrator navigates to user management
3. System validates authentication token and administrator role
4. System displays supervisor creation form
5. Administrator enters supervisor details:

   * Name
   * Email
   * Phone number
   * Branch assignment(s)
   * Permission level
6. System validates input fields
7. System checks email uniqueness
8. System generates temporary password
9. System creates user account with supervisor role
10. System assigns specified permissions and branches
11. System sends welcome email with temporary credentials
12. System displays confirmation with supervisor details
13. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user is not an administrator:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Duplicate Email**

* At step 7:

  * If email already exists in the system:

    * System displays "Email already registered" message
    * Administrator must enter a different email
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
    * Flow continues (supervisor is created successfully)
