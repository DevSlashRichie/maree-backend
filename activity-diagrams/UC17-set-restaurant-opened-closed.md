Use Case No. 17
Number: UC17
Name: Sets Restaurant as Opened or Closed
Description: The administrator or supervisor can set the restaurant's operational status to open or closed, controlling whether new orders can be placed.
Actor(s): Administrator, Supervisor
Preconditions:
The user must be logged into the system. The system must be operational.
Postconditions:
The restaurant's operational status is updated, and new orders are accepted or rejected based on the new status.
Special Requirements: None
Extension Points: None

### **Flow: Sets Restaurant as Opened or Closed**

1. **Start**
2. Administrator/Supervisor navigates to restaurant settings
3. System validates authentication token and role
4. System retrieves current restaurant status
5. System displays status interface with current state
6. Administrator/Supervisor selects new status:

   * Open
   * Closed
7. System validates the status change
8. System checks for active orders (if closing)
9. System updates restaurant status
10. System logs status change in audit trail
11. System updates order acceptance configuration
12. System displays confirmation message
13. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks administrator or supervisor privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: Active Orders Exist When Closing**

* At step 8:

  * If active orders exist when attempting to close:

    * System displays warning about active orders
    * Option to close after orders complete or force close
    * If force close -> no new orders accepted, existing orders continue
    * Resume flow at step 9

**A3: Status Already Set**

* At step 7:

  * If selected status matches current status:

    * System displays "Status already set" message
    * End flow

**A4: Database Update Error**

* At step 9:

  * If update fails:

    * System displays error message
    * Option to retry
    * End flow
