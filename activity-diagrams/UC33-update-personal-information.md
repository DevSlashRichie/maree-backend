Use Case No. 33
Number: UC33
Name: Update Personal Information
Description: The authenticated user can update their personal information including name, email, phone number, and password.
Actor(s): Customer, Cashier, Waiter, Supervisor, Administrator
Preconditions:
The user must be logged into the system with a valid authenticated session.
Postconditions:
The user's personal information is updated in the system.
Special Requirements: None
Extension Points: None

### **Flow: Update Personal Information**

1. **Start**
2. User navigates to profile settings
3. System validates authentication token
4. System retrieves current user profile
5. System displays profile edit form with current values
6. User modifies personal information:

   * Name
   * Email
   * Phone number
   * Password (requires current password)
7. System validates each field
8. System checks email uniqueness (if changed)
9. System displays updated information preview
10. User confirms changes
11. System saves updated profile to database
12. System logs changes in audit trail
13. System updates session data (if needed)
14. System displays confirmation message
15. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: Email Already Exists**

* At step 8:

  * If new email is already registered:

    * System displays "Email already in use" message
    * User must enter a different email
    * Resume flow at step 6

**A3: Invalid Input**

* At step 7:

  * If validation fails:

    * System displays specific validation error messages
    * User must correct input
    * Resume flow at step 6

**A4: Invalid Current Password**

* At step 7 (password change):

  * If current password is incorrect:

    * System displays "Current password is incorrect" message
    * User must enter correct current password
    * Resume flow at step 6

**A5: Password Too Weak**

* At step 7 (password change):

  * If new password does not meet strength requirements:

    * System displays password requirements
    * User must enter a stronger password
    * Resume flow at step 6

**A6: Cancel Changes**

* At step 10:

  * If user cancels:

    * System discards unsaved changes
    * End flow

**A7: Database Save Error**

* At step 11:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow
