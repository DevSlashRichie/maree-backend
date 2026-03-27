Use Case No. 19
Number: UC19
Name: Delete Profiles for Supervisors
Description: The administrator can delete supervisor profiles, removing their elevated access privileges from the system.
Actor(s): Administrator
Preconditions:
The user must be logged into the system. The target supervisor profile must exist.
Postconditions:
The supervisor profile is deactivated or deleted, and the user can no longer access the system with supervisor privileges.
Special Requirements: None
Extension Points: None

### **Flow: Delete Profiles for Supervisors**

1. **Start**
2. Administrator navigates to user management
3. System validates authentication token and administrator role
4. System retrieves list of supervisor profiles
5. System displays supervisor profiles with management options
6. Administrator selects a supervisor to delete
7. System displays supervisor details and deletion confirmation
8. System checks for active operations or assigned branches
9. System displays confirmation dialog with warnings
10. Administrator confirms deletion
11. System deactivates supervisor profile (soft-delete)
12. System reassigns active operations (if any)
13. System logs deletion in audit trail
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

**A2: Supervisor Has Active Operations**

* At step 8 or 12:

  * If supervisor has active operations or branches:

    * System displays warning about active operations
    * System requires reassignment before deletion
    * Administrator must reassign operations first
    * Resume flow at step 10

**A3: Administrator Cancels Deletion**

* At step 10:

  * If administrator cancels:

    * System discards deletion request
    * End flow

**A4: Database Error**

* At step 11:

  * If deactivation fails:

    * System displays error message
    * Option to retry
    * End flow
