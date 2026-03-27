Use Case No. 18
Number: UC18
Name: Deletes Cashiers and Waiters Profiles
Description: The administrator or supervisor can delete cashier and waiter user profiles, removing their access to the system.
Actor(s): Administrator, Supervisor
Preconditions:
The user must be logged into the system. The target user profile must exist.
Postconditions:
The user profile is deactivated or deleted, and the user can no longer access the system.
Special Requirements: None
Extension Points: None

### **Flow: Deletes Cashiers and Waiters Profiles**

1. **Start**
2. Administrator/Supervisor navigates to user management
3. System validates authentication token and role
4. System retrieves list of cashier and waiter profiles
5. System displays user profiles with management options
6. Administrator/Supervisor selects a user to delete
7. System displays user details and deletion confirmation
8. System checks for active orders assigned to user
9. System displays confirmation dialog with warnings
10. Administrator/Supervisor confirms deletion
11. System deactivates user profile (soft-delete)
12. System reassigns active orders (if any)
13. System logs deletion in audit trail
14. System displays confirmation message
15. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks administrator or supervisor privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: User Has Active Orders**

* At step 8 or 12:

  * If user has active orders:

    * System displays warning about active orders
    * System requires order reassignment before deletion
    * Administrator/Supervisor must reassign orders first
    * Resume flow at step 10

**A3: User Cancels Deletion**

* At step 10:

  * If administrator/supervisor cancels:

    * System discards deletion request
    * End flow

**A4: Database Error**

* At step 11:

  * If deactivation fails:

    * System displays error message
    * Option to retry
    * End flow
