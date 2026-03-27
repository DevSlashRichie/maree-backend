Use Case No. 27
Number: UC27
Name: Manages Restaurant Operating Schedule
Description: The administrator or supervisor can configure the restaurant's operating hours, including opening times, closing times, and special schedules for holidays or events.
Actor(s): Administrator, Supervisor
Preconditions: The user must be logged into the system. The system must be operational.
Postconditions: The restaurant's operating schedule is updated and affects order acceptance during configured hours.
Special Requirements: None
Extension Points: None

### **Flow: Manages Restaurant Operating Schedule**

1. **Start**
2. Administrator/Supervisor navigates to restaurant settings
3. System validates authentication token and role
4. System retrieves current operating schedule
5. System displays schedule interface with current configuration
6. Administrator/Supervisor modifies schedule:

   * Opening times
   * Closing times
   * Day-specific schedules
   * Special event schedules
   * Holiday configurations
7. System validates each schedule entry
8. System checks for conflicts with existing orders
9. System displays updated schedule preview
10. Administrator/Supervisor confirms changes
11. System saves schedule to database
12. System logs changes in audit trail
13. System updates order acceptance rules
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

**A2: Invalid Schedule Entry**

* At step 7:

  * If schedule entry is invalid:

    * System displays validation error messages
    * Administrator/Supervisor must correct values
    * Resume flow at step 6

**A3: Schedule Conflict**

* At step 8:

  * If new schedule conflicts with existing orders:

    * System displays warning about conflicts
    * Option to adjust schedule or proceed with warning
    * Resume flow at step 9 or step 6

**A4: Cancel Changes**

* At step 10:

  * If administrator/supervisor cancels:

    * System discards unsaved changes
    * End flow

**A5: Database Save Error**

* At step 11:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow
