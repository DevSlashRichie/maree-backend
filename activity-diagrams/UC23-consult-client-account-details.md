Use Case No. 23
Number: UC23
Name: Consult Client Account Details
Description: The administrator, supervisor, or the customer themselves can view account details including personal information, order history, loyalty status, and preferences.
Actor(s): Administrator, Supervisor, Customer
Preconditions:
The user must be logged into the system. The target customer account must exist.
Postconditions:
The system displays the client account details based on the viewer's access level.
Special Requirements: None
Extension Points: None

### **Flow: Consult Client Account Details**

1. **Start**
2. User navigates to account section
3. System validates authentication token
4. System determines user role and access level
5. System identifies target customer account:

   * For customers: own account
   * For admin/supervisor: searched or selected account
6. System retrieves customer account data:

   * Personal information
   * Contact details
   * Loyalty status
   * Order history
   * Preferences
7. System applies data masking based on viewer role
8. System returns formatted account details
9. System renders account interface
10. User views client account details
11. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: Account Not Found**

* At step 6:

  * If customer account does not exist:

    * System displays "Account not found" message
    * End flow

**A3: Insufficient Permissions**

* At step 4:

  * If user tries to access another customer's data without privileges:

    * System displays "Access denied" message
    * End flow

**A4: Backend Error**

* At step 6 or 7:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow
